import { pool } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { likeTerm, parseListParams, quoteIdent, sendList } from '../utils/dateHelpers.js';

const SORT = ['Payment_ID', 'Sub_ID', 'Amount', 'Paid_On', 'Mode', 'Member_Name', 'Plan_Name'];

const FROM = `
  FROM Payment pay
  INNER JOIN Subscription s ON s.Sub_ID = pay.Sub_ID
  INNER JOIN Member m ON m.Member_ID = s.Member_ID
  INNER JOIN Membership_Plan p ON p.Plan_ID = s.Plan_ID
`;

const SELECT = `
  SELECT pay.Payment_ID, pay.Sub_ID, pay.Amount, pay.Paid_On, pay.Mode,
         m.Name AS Member_Name, p.Plan_Name
  ${FROM}
`;

function orderExpr(sortBy) {
  if (sortBy === 'Member_Name') return 'm.Name';
  if (sortBy === 'Plan_Name') return 'p.Plan_Name';
  return `pay.${quoteIdent(sortBy)}`;
}

async function findById(id) {
  const [rows] = await pool.query(`${SELECT} WHERE pay.Payment_ID = ?`, [id]);
  return rows[0] || null;
}

async function assertPayable(Sub_ID) {
  const [subs] = await pool.query(
    `SELECT Sub_ID, Status FROM Subscription WHERE Sub_ID = ?`,
    [Sub_ID]
  );
  if (!subs.length) throw new AppError('Invalid Sub_ID: that subscription does not exist.', 400);
  if (subs[0].Status === 'Cancelled') {
    throw new AppError('Cannot record a payment on a Cancelled subscription.', 400);
  }
}

export const listPayments = asyncHandler(async (req, res) => {
  const { page, limit, search, sortBy, order, offset } = parseListParams(req.query, SORT, 'Payment_ID');
  const params = [];
  let where = '';
  if (search) {
    where = `WHERE (m.Name LIKE ? OR p.Plan_Name LIKE ? OR pay.Mode LIKE ?)`;
    params.push(likeTerm(search), likeTerm(search), likeTerm(search));
  }
  const [countRows] = await pool.query(`SELECT COUNT(*) AS total ${FROM} ${where}`, params);
  const [rows] = await pool.query(
    `${SELECT} ${where} ORDER BY ${orderExpr(sortBy)} ${order} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  sendList(res, rows, countRows[0].total, page, limit);
});

export const getPayment = asyncHandler(async (req, res) => {
  const row = await findById(req.params.id);
  if (!row) throw new AppError('Payment not found.', 404);
  res.json({ success: true, data: row });
});

export const createPayment = asyncHandler(async (req, res) => {
  const { Sub_ID, Amount, Paid_On, Mode } = req.body;
  await assertPayable(Sub_ID);
  const [result] = await pool.query(
    `INSERT INTO Payment (Sub_ID, Amount, Paid_On, Mode) VALUES (?, ?, ?, ?)`,
    [Sub_ID, Amount, Paid_On, Mode]
  );
  const row = await findById(result.insertId);
  res.status(201).json({ success: true, data: row });
});

export const updatePayment = asyncHandler(async (req, res) => {
  const existing = await findById(req.params.id);
  if (!existing) throw new AppError('Payment not found.', 404);
  const { Sub_ID, Amount, Paid_On, Mode } = req.body;
  await assertPayable(Sub_ID);
  await pool.query(
    `UPDATE Payment SET Sub_ID = ?, Amount = ?, Paid_On = ?, Mode = ? WHERE Payment_ID = ?`,
    [Sub_ID, Amount, Paid_On, Mode, req.params.id]
  );
  const row = await findById(req.params.id);
  res.json({ success: true, data: row });
});

export const deletePayment = asyncHandler(async (req, res) => {
  const existing = await findById(req.params.id);
  if (!existing) throw new AppError('Payment not found.', 404);
  await pool.query(`DELETE FROM Payment WHERE Payment_ID = ?`, [req.params.id]);
  res.json({ success: true, data: { message: 'Payment deleted successfully.' } });
});
