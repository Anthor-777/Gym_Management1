import { pool } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { likeTerm, parseListParams, quoteIdent, sendList } from '../utils/dateHelpers.js';

const SORT = ['Att_ID', 'Member_ID', 'Visit_Date', 'Check_In', 'Check_Out', 'Member_Name'];

const FROM = `
  FROM Attendance a
  INNER JOIN Member m ON m.Member_ID = a.Member_ID
`;

const SELECT = `
  SELECT a.Att_ID, a.Member_ID, a.Visit_Date, a.Check_In, a.Check_Out, m.Name AS Member_Name
  ${FROM}
`;

function orderExpr(sortBy) {
  if (sortBy === 'Member_Name') return 'm.Name';
  return `a.${quoteIdent(sortBy)}`;
}

async function findById(id) {
  const [rows] = await pool.query(`${SELECT} WHERE a.Att_ID = ?`, [id]);
  return rows[0] || null;
}

function assertCheckoutAfterCheckin(checkIn, checkOut) {
  if (checkOut == null || checkOut === '') return;
  if (checkOut <= checkIn) {
    throw new AppError('Check_Out must be later than Check_In.', 400);
  }
}

export const listAttendance = asyncHandler(async (req, res) => {
  const { page, limit, search, sortBy, order, offset } = parseListParams(req.query, SORT, 'Att_ID');
  const params = [];
  let where = '';
  if (search) {
    where = `WHERE (m.Name LIKE ? OR CAST(a.Visit_Date AS CHAR) LIKE ?)`;
    params.push(likeTerm(search), likeTerm(search));
  }
  const [countRows] = await pool.query(`SELECT COUNT(*) AS total ${FROM} ${where}`, params);
  const [rows] = await pool.query(
    `${SELECT} ${where} ORDER BY ${orderExpr(sortBy)} ${order} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  sendList(res, rows, countRows[0].total, page, limit);
});

export const getAttendance = asyncHandler(async (req, res) => {
  const row = await findById(req.params.id);
  if (!row) throw new AppError('Attendance record not found.', 404);
  res.json({ success: true, data: row });
});

export const createAttendance = asyncHandler(async (req, res) => {
  const { Member_ID } = req.body;
  let { Visit_Date, Check_In, Check_Out } = req.body;

  if (!Visit_Date || !Check_In) {
    const [nowRows] = await pool.query(`SELECT CURDATE() AS d, CURTIME() AS t`);
    if (!Visit_Date) Visit_Date = nowRows[0].d;
    if (!Check_In) Check_In = nowRows[0].t;
  }

  const checkOut = Check_Out === undefined || Check_Out === '' ? null : Check_Out;
  assertCheckoutAfterCheckin(Check_In, checkOut);

  const [result] = await pool.query(
    `INSERT INTO Attendance (Member_ID, Visit_Date, Check_In, Check_Out) VALUES (?, ?, ?, ?)`,
    [Member_ID, Visit_Date, Check_In, checkOut]
  );
  const row = await findById(result.insertId);
  res.status(201).json({ success: true, data: row });
});

export const updateAttendance = asyncHandler(async (req, res) => {
  const existing = await findById(req.params.id);
  if (!existing) throw new AppError('Attendance record not found.', 404);
  const { Member_ID, Visit_Date, Check_In } = req.body;
  const Check_Out = req.body.Check_Out === undefined || req.body.Check_Out === '' ? null : req.body.Check_Out;
  assertCheckoutAfterCheckin(Check_In, Check_Out);
  await pool.query(
    `UPDATE Attendance SET Member_ID = ?, Visit_Date = ?, Check_In = ?, Check_Out = ? WHERE Att_ID = ?`,
    [Member_ID, Visit_Date, Check_In, Check_Out, req.params.id]
  );
  const row = await findById(req.params.id);
  res.json({ success: true, data: row });
});

export const checkoutAttendance = asyncHandler(async (req, res) => {
  const existing = await findById(req.params.id);
  if (!existing) throw new AppError('Attendance record not found.', 404);
  if (existing.Check_Out) {
    throw new AppError('This visit is already checked out.', 400);
  }

  const [nowRows] = await pool.query(`SELECT CURTIME() AS t`);
  const checkOut = nowRows[0].t;
  assertCheckoutAfterCheckin(existing.Check_In, checkOut);

  await pool.query(`UPDATE Attendance SET Check_Out = ? WHERE Att_ID = ?`, [checkOut, req.params.id]);
  const row = await findById(req.params.id);
  res.json({ success: true, data: row });
});

export const deleteAttendance = asyncHandler(async (req, res) => {
  const existing = await findById(req.params.id);
  if (!existing) throw new AppError('Attendance record not found.', 404);
  await pool.query(`DELETE FROM Attendance WHERE Att_ID = ?`, [req.params.id]);
  res.json({ success: true, data: { message: 'Attendance record deleted successfully.' } });
});
