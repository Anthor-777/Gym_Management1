/**
 * Date / list helpers. DATE values are ISO strings 'YYYY-MM-DD' (no timezone shift).
 */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}:\d{2}$/;
const DATETIME_RE = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

export function isDateString(value) {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function isTimeString(value) {
  if (typeof value !== 'string' || !TIME_RE.test(value)) return false;
  const [h, min, s] = value.split(':').map(Number);
  return h <= 23 && min <= 59 && s <= 59;
}

export function isDateTimeString(value) {
  if (typeof value !== 'string' || !DATETIME_RE.test(value)) return false;
  const [datePart, timePart] = value.split(' ');
  return isDateString(datePart) && isTimeString(timePart);
}

/**
 * Add calendar months, clamping the day (matches MySQL DATE_ADD month behaviour).
 */
export function addMonths(dateStr, months) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const total = y * 12 + (m - 1) + Number(months);
  const ny = Math.floor(total / 12);
  const nm = total % 12;
  const lastDay = new Date(Date.UTC(ny, nm + 1, 0)).getUTCDate();
  const day = Math.min(d, lastDay);
  return `${String(ny).padStart(4, '0')}-${String(nm + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function parseListParams(query, allowedSort, defaultSort) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  let limit = parseInt(query.limit, 10);
  if (Number.isNaN(limit) || limit < 1) limit = 10;
  if (limit > 1000) limit = 1000;

  const search = typeof query.search === 'string' ? query.search.trim() : '';
  const sortBy = allowedSort.includes(query.sortBy) ? query.sortBy : defaultSort;
  const order = String(query.order || 'asc').toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  const offset = (page - 1) * limit;

  return { page, limit, search, sortBy, order, offset };
}

/** Quote a whitelisted identifier. `Condition` must always be backticked. */
export function quoteIdent(column) {
  return `\`${String(column).replace(/`/g, '')}\``;
}

export function sendList(res, rows, total, page, limit) {
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  return res.json({
    success: true,
    data: rows,
    pagination: { total, page, limit, totalPages }
  });
}

export function likeTerm(search) {
  return `%${search}%`;
}

/** Last 6 calendar months as YYYY-MM, oldest first, including the current month. */
export function lastSixMonths(today = new Date()) {
  const months = [];
  const y = today.getFullYear();
  const m = today.getMonth();
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(y, m - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push(ym);
  }
  return months;
}
