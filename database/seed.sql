USE gym_management;

INSERT INTO `Membership_Plan` (`Plan_ID`, `Plan_Name`, `Duration_Months`, `Fee`) VALUES
  (1, 'Monthly Fit', 1, 1499.00),
  (2, 'Quarterly Strength', 3, 3999.00),
  (3, 'Half Yearly Elite', 6, 7499.00),
  (4, 'Annual Premium', 12, 13999.00);

INSERT INTO `Member` (`Member_ID`, `Name`, `DOB`, `Gender`, `Phone`, `Email`, `Join_Date`) VALUES
  (1,  'Aarav Sharma',      '1996-04-12', 'Male',   '9876543210', 'aarav.sharma@gmail.com',      DATE_SUB(CURDATE(), INTERVAL 400 DAY)),
  (2,  'Priya Iyer',        '1998-11-03', 'Female', '9812345678', 'priya.iyer@gmail.com',        DATE_SUB(CURDATE(), INTERVAL 80 DAY)),
  (3,  'Rohan Mehta',       '1994-07-21', 'Male',   '9823456789', 'rohan.mehta@yahoo.com',       DATE_SUB(CURDATE(), INTERVAL 90 DAY)),
  (4,  'Ananya Reddy',      '2000-02-18', 'Female', '9834567890', 'ananya.reddy@gmail.com',      DATE_SUB(CURDATE(), INTERVAL 30 DAY)),
  (5,  'Vikram Singh',      '1992-09-09', 'Male',   '9845678901', 'vikram.singh@outlook.com',    DATE_SUB(CURDATE(), INTERVAL 28 DAY)),
  (6,  'Sneha Patil',       '1997-12-25', 'Female', '9856789012', 'sneha.patil@gmail.com',       DATE_SUB(CURDATE(), INTERVAL 85 DAY)),
  (7,  'Arjun Nair',        '1991-01-30', 'Male',   '9867890123', 'arjun.nair@gmail.com',        DATE_SUB(CURDATE(), INTERVAL 420 DAY)),
  (8,  'Kavya Gupta',       '1999-06-14', 'Female', '9878901234', 'kavya.gupta@hotmail.com',     DATE_SUB(CURDATE(), INTERVAL 70 DAY)),
  (9,  'Aditya Joshi',      '1995-03-08', 'Male',   '9889012345', 'aditya.joshi@gmail.com',      DATE_SUB(CURDATE(), INTERVAL 210 DAY)),
  (10, 'Meera Krishnan',    '1993-08-22', 'Female', '9890123456', 'meera.krishnan@gmail.com',    DATE_SUB(CURDATE(), INTERVAL 70 DAY)),
  (11, 'Kabir Khan',        '2001-05-05', 'Male',   '9901234567', 'kabir.khan@gmail.com',        DATE_SUB(CURDATE(), INTERVAL 15 DAY)),
  (12, 'Ishita Banerjee',   '1996-10-17', 'Female', '9912345678', 'ishita.banerjee@yahoo.com',   DATE_SUB(CURDATE(), INTERVAL 100 DAY));

INSERT INTO `Trainer` (`Trainer_ID`, `Name`, `Specialization`, `Phone`, `Salary`) VALUES
  (1, 'Rajesh Kumar',    'Strength Training',     '9923456789', 45000.00),
  (2, 'Neha Desai',      'Yoga and Flexibility',  '9934567890', 38000.00),
  (3, 'Suresh Pillai',   'HIIT and Cardio',       '9945678901', 42000.00),
  (4, 'Pooja Malhotra',  'Weight Loss Coaching',  '9956789012', 40000.00),
  (5, 'Farhan Ali',      'Sports Conditioning',   '9967890123', 48000.00);

INSERT INTO `Equipment` (`Equip_ID`, `Name`, `Category`, `Purchase_Date`, `Condition`) VALUES
  (1,  'Olympic Barbell 20kg',     'Free Weights',     DATE_SUB(CURDATE(), INTERVAL 900 DAY),  'Excellent'),
  (2,  'Adjustable Dumbbell Pair', 'Free Weights',     DATE_SUB(CURDATE(), INTERVAL 700 DAY),  'Good'),
  (3,  'Treadmill T900',           'Cardio',           DATE_SUB(CURDATE(), INTERVAL 1100 DAY), 'Fair'),
  (4,  'Spin Bike S200',           'Cardio',           DATE_SUB(CURDATE(), INTERVAL 500 DAY),  'Good'),
  (5,  'Lat Pulldown Machine',     'Strength Machine', DATE_SUB(CURDATE(), INTERVAL 800 DAY),  'Excellent'),
  (6,  'Leg Press 45 Degree',      'Strength Machine', DATE_SUB(CURDATE(), INTERVAL 950 DAY),  'Good'),
  (7,  'Cable Crossover Station',  'Strength Machine', DATE_SUB(CURDATE(), INTERVAL 1200 DAY), 'Poor'),
  (8,  'Rowing Machine R1',        'Cardio',           DATE_SUB(CURDATE(), INTERVAL 600 DAY),  'Out of Order'),
  (9,  'Kettlebell Set 8-32kg',    'Free Weights',     DATE_SUB(CURDATE(), INTERVAL 400 DAY),  'Excellent'),
  (10, 'Smith Machine Pro',        'Strength Machine', DATE_SUB(CURDATE(), INTERVAL 1300 DAY), 'Poor');

INSERT INTO `Subscription` (`Sub_ID`, `Member_ID`, `Plan_ID`, `Start_Date`, `End_Date`, `Status`) VALUES
  (1,  1,  4, DATE_SUB(CURDATE(), INTERVAL 180 DAY), DATE_ADD(CURDATE(), INTERVAL 185 DAY), 'Active'),
  (2,  2,  1, DATE_SUB(CURDATE(), INTERVAL 20 DAY),  DATE_ADD(CURDATE(), INTERVAL 10 DAY),  'Active'),
  (3,  3,  2, DATE_SUB(CURDATE(), INTERVAL 60 DAY),  DATE_ADD(CURDATE(), INTERVAL 31 DAY),  'Active'),
  (4,  4,  1, DATE_SUB(CURDATE(), INTERVAL 27 DAY),  DATE_ADD(CURDATE(), INTERVAL 3 DAY),   'Active'),
  (5,  5,  1, DATE_SUB(CURDATE(), INTERVAL 25 DAY),  DATE_ADD(CURDATE(), INTERVAL 5 DAY),   'Active'),
  (6,  6,  2, DATE_SUB(CURDATE(), INTERVAL 84 DAY),  DATE_ADD(CURDATE(), INTERVAL 6 DAY),   'Active'),
  (7,  7,  4, DATE_SUB(CURDATE(), INTERVAL 400 DAY), DATE_SUB(CURDATE(), INTERVAL 35 DAY),  'Expired'),
  (8,  8,  1, DATE_SUB(CURDATE(), INTERVAL 60 DAY),  DATE_SUB(CURDATE(), INTERVAL 30 DAY),  'Expired'),
  (9,  9,  3, DATE_SUB(CURDATE(), INTERVAL 200 DAY), DATE_SUB(CURDATE(), INTERVAL 20 DAY),  'Expired'),
  (10, 10, 2, DATE_SUB(CURDATE(), INTERVAL 60 DAY),  DATE_ADD(CURDATE(), INTERVAL 31 DAY),  'Cancelled'),
  (11, 11, 1, DATE_SUB(CURDATE(), INTERVAL 10 DAY),  DATE_ADD(CURDATE(), INTERVAL 20 DAY),  'Cancelled'),
  (12, 12, 3, DATE_SUB(CURDATE(), INTERVAL 90 DAY),  DATE_ADD(CURDATE(), INTERVAL 90 DAY),  'Active');

INSERT INTO `Payment` (`Payment_ID`, `Sub_ID`, `Amount`, `Paid_On`, `Mode`) VALUES
  (1,  1,  7000.00, DATE_SUB(CURDATE(), INTERVAL 180 DAY), 'Net Banking'),
  (2,  1,  6999.00, DATE_SUB(CURDATE(), INTERVAL 179 DAY), 'UPI'),
  (3,  2,  1499.00, DATE_SUB(CURDATE(), INTERVAL 20 DAY),  'UPI'),
  (4,  3,  3999.00, DATE_SUB(CURDATE(), INTERVAL 60 DAY),  'Card'),
  (5,  4,  1499.00, DATE_SUB(CURDATE(), INTERVAL 27 DAY),  'Cash'),
  (6,  5,  1499.00, DATE_SUB(CURDATE(), INTERVAL 25 DAY),  'UPI'),
  (7,  6,  3999.00, DATE_SUB(CURDATE(), INTERVAL 84 DAY),  'Net Banking'),
  (8,  7, 13999.00, DATE_SUB(CURDATE(), INTERVAL 400 DAY), 'Card'),
  (9,  8,  1499.00, DATE_SUB(CURDATE(), INTERVAL 60 DAY),  'Cash'),
  (10, 9,  4000.00, DATE_SUB(CURDATE(), INTERVAL 200 DAY), 'UPI'),
  (11, 9,  3499.00, DATE_SUB(CURDATE(), INTERVAL 199 DAY), 'Card'),
  (12, 12, 7499.00, DATE_SUB(CURDATE(), INTERVAL 90 DAY),  'Net Banking'),
  (13, 3,  3999.00, DATE_SUB(CURDATE(), INTERVAL 150 DAY), 'Card'),
  (14, 2,  1499.00, DATE_SUB(CURDATE(), INTERVAL 50 DAY),  'Cash'),
  (15, 12, 500.00,  DATE_SUB(CURDATE(), INTERVAL 88 DAY),  'UPI');

INSERT INTO `Session` (`Session_ID`, `Member_ID`, `Trainer_ID`, `Slot_DateTime`, `Focus_Area`) VALUES
  (1,  1,  1, DATE_SUB(NOW(), INTERVAL 10 DAY) + INTERVAL 7 HOUR,  'Compound Lifts'),
  (2,  2,  2, DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 8 HOUR,   'Vinyasa Flow'),
  (3,  3,  3, DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 18 HOUR,  'HIIT Circuits'),
  (4,  4,  4, DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 9 HOUR,   'Fat Loss Plan'),
  (5,  5,  5, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 17 HOUR,  'Athletic Conditioning'),
  (6,  6,  1, DATE_ADD(NOW(), INTERVAL 2 DAY),                     'Upper Body Strength'),
  (7,  12, 2, DATE_ADD(NOW(), INTERVAL 3 DAY),                     'Mobility and Core'),
  (8,  1,  3, DATE_ADD(NOW(), INTERVAL 4 DAY),                     'Cardio Endurance'),
  (9,  3,  4, DATE_ADD(NOW(), INTERVAL 5 DAY),                     'Nutrition-linked Training'),
  (10, 5,  5, DATE_ADD(NOW(), INTERVAL 6 DAY),                     'Speed and Agility'),
  (11, 2,  1, DATE_ADD(NOW(), INTERVAL 8 DAY),                     'Deadlift Technique'),
  (12, 4,  2, DATE_ADD(NOW(), INTERVAL 10 DAY),                    'Restorative Yoga');

INSERT INTO `Attendance` (`Att_ID`, `Member_ID`, `Visit_Date`, `Check_In`, `Check_Out`) VALUES
  (1,  1,  DATE_SUB(CURDATE(), INTERVAL 12 DAY), '06:32:00', '08:05:00'),
  (2,  1,  DATE_SUB(CURDATE(), INTERVAL 8 DAY),  '06:40:00', '07:55:00'),
  (3,  1,  DATE_SUB(CURDATE(), INTERVAL 3 DAY),  '07:10:00', '08:20:00'),
  (4,  2,  DATE_SUB(CURDATE(), INTERVAL 6 DAY),  '08:00:00', '09:15:00'),
  (5,  2,  DATE_SUB(CURDATE(), INTERVAL 2 DAY),  '08:12:00', '09:30:00'),
  (6,  2,  CURDATE(),                            '08:05:00', NULL),
  (7,  3,  DATE_SUB(CURDATE(), INTERVAL 9 DAY),  '18:10:00', '19:40:00'),
  (8,  3,  DATE_SUB(CURDATE(), INTERVAL 4 DAY),  '18:00:00', '19:25:00'),
  (9,  3,  CURDATE(),                            '17:50:00', NULL),
  (10, 4,  DATE_SUB(CURDATE(), INTERVAL 5 DAY),  '07:00:00', '08:10:00'),
  (11, 4,  DATE_SUB(CURDATE(), INTERVAL 1 DAY),  '07:05:00', '08:00:00'),
  (12, 5,  DATE_SUB(CURDATE(), INTERVAL 7 DAY),  '19:00:00', '20:20:00'),
  (13, 5,  CURDATE(),                            '19:10:00', NULL),
  (14, 6,  DATE_SUB(CURDATE(), INTERVAL 11 DAY), '06:50:00', '08:00:00'),
  (15, 6,  DATE_SUB(CURDATE(), INTERVAL 4 DAY),  '06:55:00', '08:05:00'),
  (16, 7,  DATE_SUB(CURDATE(), INTERVAL 50 DAY), '07:20:00', '08:45:00'),
  (17, 7,  DATE_SUB(CURDATE(), INTERVAL 40 DAY), '07:15:00', '08:30:00'),
  (18, 8,  DATE_SUB(CURDATE(), INTERVAL 45 DAY), '09:00:00', '10:10:00'),
  (19, 8,  DATE_SUB(CURDATE(), INTERVAL 35 DAY), '09:05:00', '10:00:00'),
  (20, 9,  DATE_SUB(CURDATE(), INTERVAL 30 DAY), '17:30:00', '18:50:00'),
  (21, 9,  DATE_SUB(CURDATE(), INTERVAL 22 DAY), '17:40:00', '19:00:00'),
  (22, 10, DATE_SUB(CURDATE(), INTERVAL 20 DAY), '08:30:00', '09:45:00'),
  (23, 12, DATE_SUB(CURDATE(), INTERVAL 6 DAY),  '06:45:00', '08:00:00'),
  (24, 12, DATE_SUB(CURDATE(), INTERVAL 1 DAY),  '06:50:00', '07:55:00'),
  (25, 12, CURDATE(),                            '06:48:00', NULL);

INSERT INTO `Maintenance_Log` (`Log_ID`, `Equip_ID`, `Service_Date`, `Cost`, `Technician`) VALUES
  (1,  3,  DATE_SUB(CURDATE(), INTERVAL 200 DAY), 4500.00, 'Ramesh Electricals'),
  (2,  3,  DATE_SUB(CURDATE(), INTERVAL 40 DAY),  2800.00, 'FitTech Services'),
  (3,  7,  DATE_SUB(CURDATE(), INTERVAL 90 DAY),  6200.00, 'Metro Gym Repairs'),
  (4,  7,  DATE_SUB(CURDATE(), INTERVAL 15 DAY),  3500.00, 'Metro Gym Repairs'),
  (5,  8,  DATE_SUB(CURDATE(), INTERVAL 10 DAY),  8900.00, 'CardioCare India'),
  (6,  10, DATE_SUB(CURDATE(), INTERVAL 120 DAY), 5100.00, 'IronWorks Maintenance'),
  (7,  10, DATE_SUB(CURDATE(), INTERVAL 8 DAY),   2400.00, 'IronWorks Maintenance'),
  (8,  4,  DATE_SUB(CURDATE(), INTERVAL 60 DAY),  1800.00, 'FitTech Services'),
  (9,  6,  DATE_SUB(CURDATE(), INTERVAL 75 DAY),  2200.00, 'Ramesh Electricals'),
  (10, 1,  DATE_SUB(CURDATE(), INTERVAL 30 DAY),  900.00,  'Olympic Bar Recalibration');
