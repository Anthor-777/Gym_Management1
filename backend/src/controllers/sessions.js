import { pool } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { likeTerm, parseListParams, quoteIdent, sendList } from '../utils/dateHelpers.js';

const SORT = ['Session_ID', 'Member_ID', 'Trainer_ID', 'Slot_DateTime', 'Focus_Area', 'Member_Name', 'Trainer_Name'];

const FROM = `
  FROM Session sess
  INNER JOIN Member m ON m.Member_ID = sess.Member_ID
  INNER JOIN Trainer t ON t.Trainer_ID = sess.Trainer_ID
`;

const SELECT = `
  SELECT sess.Session_ID, sess.Member_ID, sess.Trainer_ID, sess.Slot_DateTime, sess.Focus_Area,
         m.Name AS Member_Name, t.Name AS Trainer_Name
  ${FROM}
`;

function orderExpr(sortBy) {
  if (sortBy === 'Member_Name') return 'm.Name';
  if (sortBy === 'Trainer_Name') return 't.Name';
  return `sess.${quoteIdent(sortBy)}`;
}

async function findById(id) {
  const [rows] = await pool.query(`${SELECT} WHERE sess.Session_ID = ?`, [id]);
  return rows[0] || null;
}

async function assertTrainerFree(Trainer_ID, Slot_DateTime, exceptId = null) {
  const params = [Trainer_ID, Slot_DateTime];
  let sql = `SELECT Session_ID FROM Session WHERE Trainer_ID = ? AND Slot_DateTime = ?`;
  if (exceptId) {
    sql += ` AND Session_ID <> ?`;
    params.push(exceptId);
  }
  const [rows] = await pool.query(sql, params);
  if (rows.length) {
    throw new AppError('This trainer already has a session at that Slot_DateTime.', 409);
  }
}

export const listSessions = asyncHandler(async (req, res) => {
  const { page, limit, search, sortBy, order, offset } = parseListParams(req.query, SORT, 'Session_ID');
  const params = [];
  let where = '';
  if (search) {
    where = `WHERE (m.Name LIKE ? OR t.Name LIKE ? OR sess.Focus_Area LIKE ?)`;
    params.push(likeTerm(search), likeTerm(search), likeTerm(search));
  }
  const [countRows] = await pool.query(`SELECT COUNT(*) AS total ${FROM} ${where}`, params);
  const [rows] = await pool.query(
    `${SELECT} ${where} ORDER BY ${orderExpr(sortBy)} ${order} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  sendList(res, rows, countRows[0].total, page, limit);
});

export const getSession = asyncHandler(async (req, res) => {
  const row = await findById(req.params.id);
  if (!row) throw new AppError('Session not found.', 404);
  res.json({ success: true, data: row });
});

export const createSession = asyncHandler(async (req, res) => {
  const { Member_ID, Trainer_ID, Slot_DateTime, Focus_Area } = req.body;
  await assertTrainerFree(Trainer_ID, Slot_DateTime);
  const [result] = await pool.query(
    `INSERT INTO Session (Member_ID, Trainer_ID, Slot_DateTime, Focus_Area) VALUES (?, ?, ?, ?)`,
    [Member_ID, Trainer_ID, Slot_DateTime, Focus_Area]
  );
  const row = await findById(result.insertId);
  res.status(201).json({ success: true, data: row });
});

export const updateSession = asyncHandler(async (req, res) => {
  const existing = await findById(req.params.id);
  if (!existing) throw new AppError('Session not found.', 404);
  const { Member_ID, Trainer_ID, Slot_DateTime, Focus_Area } = req.body;
  await assertTrainerFree(Trainer_ID, Slot_DateTime, req.params.id);
  await pool.query(
    `UPDATE Session SET Member_ID = ?, Trainer_ID = ?, Slot_DateTime = ?, Focus_Area = ? WHERE Session_ID = ?`,
    [Member_ID, Trainer_ID, Slot_DateTime, Focus_Area, req.params.id]
  );
  const row = await findById(req.params.id);
  res.json({ success: true, data: row });
});

export const deleteSession = asyncHandler(async (req, res) => {
  const existing = await findById(req.params.id);
  if (!existing) throw new AppError('Session not found.', 404);
  await pool.query(`DELETE FROM Session WHERE Session_ID = ?`, [req.params.id]);
  res.json({ success: true, data: { message: 'Session deleted successfully.' } });
});
