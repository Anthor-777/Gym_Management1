import { pool } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { addMonths, likeTerm, parseListParams, quoteIdent, sendList } from '../utils/dateHelpers.js';

const SORT = ['Sub_ID', 'Member_ID', 'Plan_ID', 'Start_Date', 'End_Date', 'Status', 'Member_Name', 'Plan_Name'];

const FROM = `
  FROM Subscription s
  INNER JOIN Member m ON m.Member_ID = s.Member_ID
  INNER JOIN Membership_Plan p ON p.Plan_ID = s.Plan_ID
`;

const SELECT = `
  SELECT s.Sub_ID, s.Member_ID, s.Plan_ID, s.Start_Date, s.End_Date, s.Status,
         m.Name AS Member_Name, p.Plan_Name
  ${FROM}
`;

function orderExpr(sortBy) {
  if (sortBy === 'Member_Name') return 'm.Name';
  if (sortBy === 'Plan_Name') return 'p.Plan_Name';
  return `s.${quoteIdent(sortBy)}`;
}

async function findById(id) {
  const [rows] = await pool.query(`${SELECT} WHERE s.Sub_ID = ?`, [id]);
  return rows[0] || null;
}

function searchClause(search, params) {
  if (!search) return '';
  params.push(likeTerm(search), likeTerm(search), likeTerm(search), likeTerm(search));
  return `WHERE (m.Name LIKE ? OR p.Plan_Name LIKE ? OR s.Status LIKE ? OR CAST(s.Sub_ID AS CHAR) LIKE ?)`;
}

export const listSubscriptions = asyncHandler(async (req, res) => {
  const { page, limit, search, sortBy, order, offset } = parseListParams(req.query, SORT, 'Sub_ID');
  const params = [];
  const where = searchClause(search, params);
  const [countRows] = await pool.query(`SELECT COUNT(*) AS total ${FROM} ${where}`, params);
  const [rows] = await pool.query(
    `${SELECT} ${where} ORDER BY ${orderExpr(sortBy)} ${order} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  sendList(res, rows, countRows[0].total, page, limit);
});

export const getSubscription = asyncHandler(async (req, res) => {
  const row = await findById(req.params.id);
  if (!row) throw new AppError('Subscription not found.', 404);
  res.json({ success: true, data: row });
});

async function resolveEndDate(Plan_ID, Start_Date, End_Date) {
  if (End_Date) return End_Date;
  const [plans] = await pool.query(
    `SELECT Duration_Months FROM Membership_Plan WHERE Plan_ID = ?`,
    [Plan_ID]
  );
  if (!plans.length) throw new AppError('Invalid Plan_ID: that membership plan does not exist.', 400);
  return addMonths(Start_Date, plans[0].Duration_Months);
}

export const createSubscription = asyncHandler(async (req, res) => {
  const { Member_ID, Plan_ID, Start_Date, Status } = req.body;
  const End_Date = await resolveEndDate(Plan_ID, Start_Date, req.body.End_Date);

  if (Start_Date > End_Date) {
    throw new AppError('Start_Date cannot be after End_Date.', 400);
  }

  const [result] = await pool.query(
    `INSERT INTO Subscription (Member_ID, Plan_ID, Start_Date, End_Date, Status) VALUES (?, ?, ?, ?, ?)`,
    [Member_ID, Plan_ID, Start_Date, End_Date, Status || 'Active']
  );
  const row = await findById(result.insertId);
  res.status(201).json({ success: true, data: row });
});

export const updateSubscription = asyncHandler(async (req, res) => {
  const existing = await findById(req.params.id);
  if (!existing) throw new AppError('Subscription not found.', 404);

  const { Member_ID, Plan_ID, Start_Date, Status } = req.body;
  const End_Date = await resolveEndDate(Plan_ID, Start_Date, req.body.End_Date);

  if (Start_Date > End_Date) {
    throw new AppError('Start_Date cannot be after End_Date.', 400);
  }

  await pool.query(
    `UPDATE Subscription SET Member_ID = ?, Plan_ID = ?, Start_Date = ?, End_Date = ?, Status = ? WHERE Sub_ID = ?`,
    [Member_ID, Plan_ID, Start_Date, End_Date, Status, req.params.id]
  );
  const row = await findById(req.params.id);
  res.json({ success: true, data: row });
});

export const deleteSubscription = asyncHandler(async (req, res) => {
  const existing = await findById(req.params.id);
  if (!existing) throw new AppError('Subscription not found.', 404);
  await pool.query(`DELETE FROM Subscription WHERE Sub_ID = ?`, [req.params.id]);
  res.json({ success: true, data: { message: 'Subscription deleted successfully.' } });
});

export const refreshStatus = asyncHandler(async (req, res) => {
  const [result] = await pool.query(
    `UPDATE Subscription SET Status = 'Expired' WHERE Status = 'Active' AND End_Date < CURDATE()`
  );
  res.json({
    success: true,
    data: { updated: result.affectedRows, message: `${result.affectedRows} subscription(s) marked Expired.` }
  });
});
