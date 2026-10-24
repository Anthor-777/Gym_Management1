import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const [[members]] = await pool.query(`SELECT COUNT(*) AS totalMembers FROM Member`);
  const [[active]] = await pool.query(
    `SELECT COUNT(*) AS activeSubscriptions FROM Subscription WHERE Status = 'Active'`
  );
  const [[revMonth]] = await pool.query(
    `SELECT COALESCE(SUM(Amount), 0) AS revenueThisMonth
     FROM Payment
     WHERE YEAR(Paid_On) = YEAR(CURDATE()) AND MONTH(Paid_On) = MONTH(CURDATE())`
  );
  const [revRows] = await pool.query(
    `SELECT DATE_FORMAT(Paid_On, '%Y-%m') AS month, COALESCE(SUM(Amount), 0) AS revenue
     FROM Payment
     WHERE Paid_On >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 5 MONTH), '%Y-%m-01')
     GROUP BY DATE_FORMAT(Paid_On, '%Y-%m')`
  );
  const revMap = new Map(revRows.map((r) => [r.month, Number(r.revenue)]));
  const [monthRows] = await pool.query(`
    SELECT DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL seq MONTH), '%Y-%m') AS month
    FROM (
      SELECT 5 AS seq UNION ALL SELECT 4 UNION ALL SELECT 3
      UNION ALL SELECT 2 UNION ALL SELECT 1 UNION ALL SELECT 0
    ) months
    ORDER BY month ASC
  `);
  const revenueLast6Months = monthRows.map((row) => ({
    month: row.month,
    revenue: revMap.has(row.month) ? revMap.get(row.month) : 0
  }));

  const [expiringSubscriptions] = await pool.query(
    `SELECT s.Sub_ID, m.Name AS Member_Name, p.Plan_Name, s.End_Date
     FROM Subscription s
     INNER JOIN Member m ON m.Member_ID = s.Member_ID
     INNER JOIN Membership_Plan p ON p.Plan_ID = s.Plan_ID
     WHERE s.Status = 'Active'
       AND s.End_Date >= CURDATE()
       AND s.End_Date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
     ORDER BY s.End_Date ASC`
  );

  const [[todayAtt]] = await pool.query(
    `SELECT COUNT(*) AS todaysAttendance FROM Attendance WHERE Visit_Date = CURDATE()`
  );

  const [upcomingSessions] = await pool.query(
    `SELECT sess.Session_ID, m.Name AS Member_Name, t.Name AS Trainer_Name,
            sess.Slot_DateTime, sess.Focus_Area
     FROM Session sess
     INNER JOIN Member m ON m.Member_ID = sess.Member_ID
     INNER JOIN Trainer t ON t.Trainer_ID = sess.Trainer_ID
     WHERE sess.Slot_DateTime >= NOW()
     ORDER BY sess.Slot_DateTime ASC
     LIMIT 5`
  );

  const [equipmentAlerts] = await pool.query(
    `SELECT Equip_ID, Name, Category, \`Condition\`
     FROM Equipment
     WHERE \`Condition\` IN ('Poor', 'Out of Order')
     ORDER BY Equip_ID ASC`
  );

  const [[maint]] = await pool.query(
    `SELECT COALESCE(SUM(Cost), 0) AS maintenanceCostThisYear
     FROM Maintenance_Log
     WHERE YEAR(Service_Date) = YEAR(CURDATE())`
  );

  res.json({
    success: true,
    data: {
      totalMembers: members.totalMembers,
      activeSubscriptions: active.activeSubscriptions,
      revenueThisMonth: Number(revMonth.revenueThisMonth),
      revenueLast6Months,
      expiringSubscriptions,
      todaysAttendance: todayAtt.todaysAttendance,
      upcomingSessions,
      equipmentAlerts,
      maintenanceCostThisYear: Number(maint.maintenanceCostThisYear)
    }
  });
});
