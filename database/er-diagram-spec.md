# Gym Management System — ER Diagram Specification

Database: `gym_management`  
Engine: InnoDB  
Charset: utf8mb4  
MySQL: 8.0.16 or newer (CHECK constraints are enforced)

This document is the canonical schema for later backend and frontend parts. Table names, column names, types, and relationships must be used exactly as written here.

## Normalization

The schema is in Third Normal Form (3NF):

- Each table has a single-column surrogate primary key.
- There are no repeating groups.
- Non-key attributes depend on the whole primary key (no partial dependence).
- Non-key attributes do not depend on other non-key attributes (no transitive dependence).
- Related data is not duplicated across tables; relationships are expressed only by foreign keys.

There is **no** users/admin table. Authentication is out of band (a single admin from environment variables in the backend).

---

## Entities (9 tables)

Primary keys are `INT AUTO_INCREMENT`. Foreign key columns have the **same name** as the primary key they reference.

### 1. Membership_Plan

| Column           | Type           | Constraints                                      |
|------------------|----------------|--------------------------------------------------|
| Plan_ID          | INT            | AUTO_INCREMENT PRIMARY KEY                       |
| Plan_Name        | VARCHAR(100)   | NOT NULL UNIQUE                                  |
| Duration_Months  | INT            | NOT NULL, CHECK (Duration_Months > 0)            |
| Fee              | DECIMAL(10,2)  | NOT NULL, CHECK (Fee >= 0)                       |

### 2. Member

| Column    | Type                         | Constraints        |
|-----------|------------------------------|--------------------|
| Member_ID | INT                          | AUTO_INCREMENT PK  |
| Name      | VARCHAR(100)                 | NOT NULL           |
| DOB       | DATE                         | NOT NULL           |
| Gender    | ENUM('Male','Female','Other')| NOT NULL           |
| Phone     | VARCHAR(20)                  | NOT NULL           |
| Email     | VARCHAR(150)                 | NOT NULL UNIQUE    |
| Join_Date | DATE                         | NOT NULL           |

### 3. Subscription

| Column     | Type                                     | Constraints                                      |
|------------|------------------------------------------|--------------------------------------------------|
| Sub_ID     | INT                                      | AUTO_INCREMENT PRIMARY KEY                       |
| Member_ID  | INT                                      | NOT NULL, FK → Member(Member_ID)  ("takes")      |
| Plan_ID    | INT                                      | NOT NULL, FK → Membership_Plan(Plan_ID) ("defines") |
| Start_Date | DATE                                     | NOT NULL                                         |
| End_Date   | DATE                                     | NOT NULL, CHECK (End_Date >= Start_Date)         |
| Status     | ENUM('Active','Expired','Cancelled')     | NOT NULL DEFAULT 'Active'                        |

### 4. Payment

| Column     | Type                                     | Constraints                                      |
|------------|------------------------------------------|--------------------------------------------------|
| Payment_ID | INT                                      | AUTO_INCREMENT PRIMARY KEY                       |
| Sub_ID     | INT                                      | NOT NULL, FK → Subscription(Sub_ID) ("settled_by") |
| Amount     | DECIMAL(10,2)                            | NOT NULL, CHECK (Amount > 0)                     |
| Paid_On    | DATE                                     | NOT NULL                                         |
| Mode       | ENUM('Cash','Card','UPI','Net Banking')  | NOT NULL                                         |

### 5. Trainer

| Column         | Type          | Constraints                         |
|----------------|---------------|-------------------------------------|
| Trainer_ID     | INT           | AUTO_INCREMENT PRIMARY KEY          |
| Name           | VARCHAR(100)  | NOT NULL                            |
| Specialization | VARCHAR(100)  | NOT NULL                            |
| Phone          | VARCHAR(20)   | NOT NULL                            |
| Salary         | DECIMAL(10,2) | NOT NULL, CHECK (Salary >= 0)       |

### 6. Session

| Column        | Type         | Constraints                                              |
|---------------|--------------|----------------------------------------------------------|
| Session_ID    | INT          | AUTO_INCREMENT PRIMARY KEY                               |
| Member_ID     | INT          | NOT NULL, FK → Member(Member_ID) ("books")               |
| Trainer_ID    | INT          | NOT NULL, FK → Trainer(Trainer_ID) ("conducts")          |
| Slot_DateTime | DATETIME     | NOT NULL                                                 |
| Focus_Area    | VARCHAR(100) | NOT NULL                                                 |

Additional constraint (not a column): `UNIQUE (Trainer_ID, Slot_DateTime)` — a trainer cannot be double-booked in the same slot.

### 7. Attendance

| Column     | Type | Constraints                                      |
|------------|------|--------------------------------------------------|
| Att_ID     | INT  | AUTO_INCREMENT PRIMARY KEY                       |
| Member_ID  | INT  | NOT NULL, FK → Member(Member_ID) ("records")     |
| Visit_Date | DATE | NOT NULL                                         |
| Check_In   | TIME | NOT NULL                                         |
| Check_Out  | TIME | NULL until the member checks out                 |

### 8. Equipment

| Column        | Type                                                      | Constraints             |
|---------------|-----------------------------------------------------------|-------------------------|
| Equip_ID      | INT                                                       | AUTO_INCREMENT PK       |
| Name          | VARCHAR(100)                                              | NOT NULL                |
| Category      | VARCHAR(100)                                              | NOT NULL                |
| Purchase_Date | DATE                                                      | NOT NULL                |
| `Condition`   | ENUM('Excellent','Good','Fair','Poor','Out of Order')     | NOT NULL                |

`Condition` is a MySQL reserved word and must be backtick-quoted in SQL.

### 9. Maintenance_Log

| Column       | Type          | Constraints                                      |
|--------------|---------------|--------------------------------------------------|
| Log_ID       | INT           | AUTO_INCREMENT PRIMARY KEY                       |
| Equip_ID     | INT           | NOT NULL, FK → Equipment(Equip_ID) ("undergoes") |
| Service_Date | DATE          | NOT NULL                                         |
| Cost         | DECIMAL(10,2) | NOT NULL, CHECK (Cost >= 0)                      |
| Technician   | VARCHAR(100)  | NOT NULL                                         |

---

## Relationships (7, all One-to-Many; "one" side listed first)

1. **Membership_Plan 1 --defines--> N Subscription**  
   Implemented by `Subscription.Plan_ID` → `Membership_Plan.Plan_ID`

2. **Member 1 --takes--> N Subscription**  
   Implemented by `Subscription.Member_ID` → `Member.Member_ID`

3. **Subscription 1 --settled_by--> N Payment**  
   Implemented by `Payment.Sub_ID` → `Subscription.Sub_ID`

4. **Member 1 --records--> N Attendance**  
   Implemented by `Attendance.Member_ID` → `Member.Member_ID`

5. **Member 1 --books--> N Session**  
   Implemented by `Session.Member_ID` → `Member.Member_ID`

6. **Trainer 1 --conducts--> N Session**  
   Implemented by `Session.Trainer_ID` → `Trainer.Trainer_ID`

7. **Equipment 1 --undergoes--> N Maintenance_Log**  
   Implemented by `Maintenance_Log.Equip_ID` → `Equipment.Equip_ID`

All foreign keys use **ON DELETE RESTRICT** and **ON UPDATE CASCADE**.

MySQL InnoDB automatically indexes foreign key columns.

The **only** columns that are not attributes shown as entity fields on the ER diagram are these seven foreign key columns:

- `Subscription.Member_ID`
- `Subscription.Plan_ID`
- `Payment.Sub_ID`
- `Session.Member_ID`
- `Session.Trainer_ID`
- `Attendance.Member_ID`
- `Maintenance_Log.Equip_ID`

No other extra columns, tables, junction tables, auth tables, logs, or settings tables are allowed.
