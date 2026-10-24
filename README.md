# Gym Management System

Admin web app for running a gym: members, membership plans, subscriptions, payments, attendance, personal training sessions, trainers, equipment, and maintenance logs, plus a dashboard of key stats.

There is **no users table**. A single admin is authenticated from environment variables (`ADMIN_USERNAME` + `ADMIN_PASSWORD_HASH`).

## Tech stack

| Layer | Stack |
| --- | --- |
| Database | MySQL 8.0.16+ (InnoDB, utf8mb4, CHECK constraints) |
| Backend | Node.js 18+, Express 5, mysql2, JWT, bcryptjs |
| Frontend | React 18, Vite, React Router v6, Axios, Tailwind CSS 3.4, Framer Motion, Lucide React, Recharts |

## Prerequisites

- **Node.js 18+** and npm
- **MySQL 8.0.16+** (CHECK constraints are enforced)
- A MySQL user that can create the `gym_management` database (or create it yourself, then grant access)

## Step-by-step setup

### 1. Create the database

From the project root, run the schema then the seed data:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

On Windows (PowerShell), if the `mysql` client is on your PATH:

```powershell
Get-Content database\schema.sql | mysql -u root -p
Get-Content database\seed.sql | mysql -u root -p
```

`schema.sql` creates `gym_management` and the 9 tables. `seed.sql` inserts sample plans, members, trainers, equipment, subscriptions, payments, sessions, attendance, and maintenance logs.

### 2. Configure the backend

```bash
cd backend
copy .env.example .env
```

On macOS/Linux use `cp .env.example .env`.

Edit `backend/.env`:

```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=gym_management
JWT_SECRET=replace_with_a_long_random_string
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=replace_with_output_of_npm_run_hash-password
CLIENT_URL=http://localhost:5173
```

`CLIENT_URL` must match the Vite origin so CORS allows the frontend.

### 3. Generate the admin password hash

```bash
cd backend
npm install
npm run hash-password -- YourPasswordHere
```

Copy the printed bcrypt hash into `ADMIN_PASSWORD_HASH` in `backend/.env`.

### 4. Run the backend

```bash
cd backend
npm install
npm run dev
```

The API listens on **http://localhost:5000**. Health check: `GET http://localhost:5000/api/health`.

### 5. Configure and run the frontend

```bash
cd frontend
copy .env.example .env
```

`frontend/.env.example` is:

```
VITE_API_URL=http://localhost:5000/api
```

Then:

```bash
cd frontend
npm install
npm run dev
```

The UI is at **http://localhost:5173**.

## Default login

Use the username from `ADMIN_USERNAME` (example file: `admin`) and the **plain password** you hashed in step 3 — not the hash itself.

JWT tokens expire after 12 hours. The frontend stores the token in memory and `localStorage`, sends `Authorization: Bearer <token>` on every request except login, and redirects to `/login` on HTTP 401.

## Project structure

```
gym-management-system/
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── er-diagram-spec.md
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── scripts/hash-password.js
│   └── src/
│       ├── server.js
│       ├── app.js
│       ├── config/db.js
│       ├── routes/
│       ├── controllers/
│       ├── middleware/
│       └── utils/
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── src/
│       ├── api/axios.js
│       ├── context/AuthContext.jsx
│       ├── components/
│       └── pages/
├── README.md
└── .gitignore
```

## API endpoints

Base URL: `http://localhost:5000/api`

Success: `{ success: true, data }`. List success also includes `pagination: { total, page, limit, totalPages }`. Error: `{ success: false, message, errors? }`.

All routes except `POST /auth/login` and `GET /health` require `Authorization: Bearer <token>`.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/health` | Liveness probe `{ status: "ok" }` (no auth) |
| POST | `/auth/login` | Body `{ username, password }` → `{ token, username }` |
| GET | `/members` | List members (`search`, `page`, `limit`, `sortBy`, `order`) |
| GET | `/members/:id` | Get member |
| POST | `/members` | Create member (`Name`, `DOB`, `Gender`, `Phone`, `Email`, `Join_Date`) |
| PUT | `/members/:id` | Update member |
| DELETE | `/members/:id` | Delete member |
| GET | `/plans` | List membership plans |
| GET | `/plans/:id` | Get plan |
| POST | `/plans` | Create plan (`Plan_Name`, `Duration_Months`, `Fee`) |
| PUT | `/plans/:id` | Update plan |
| DELETE | `/plans/:id` | Delete plan |
| POST | `/subscriptions/refresh-status` | Mark Active rows with `End_Date < today` as Expired |
| GET | `/subscriptions` | List (join `Member_Name`, `Plan_Name`) |
| GET | `/subscriptions/:id` | Get subscription |
| POST | `/subscriptions` | Create (`Member_ID`, `Plan_ID`, `Start_Date`, optional `End_Date`, optional `Status`) |
| PUT | `/subscriptions/:id` | Update (Status required; End_Date optional — computed from plan duration if omitted) |
| DELETE | `/subscriptions/:id` | Delete subscription |
| GET | `/payments` | List (join `Member_Name`, `Plan_Name`) |
| GET | `/payments/:id` | Get payment |
| POST | `/payments` | Create (`Sub_ID`, `Amount`, `Paid_On`, `Mode`) |
| PUT | `/payments/:id` | Update payment |
| DELETE | `/payments/:id` | Delete payment |
| GET | `/attendance` | List (join `Member_Name`) |
| GET | `/attendance/:id` | Get attendance |
| POST | `/attendance` | Create (`Member_ID`; `Visit_Date` / `Check_In` optional — server uses today/now; `Check_Out` optional) |
| PUT | `/attendance/:id` | Update (`Member_ID`, `Visit_Date`, `Check_In`, optional `Check_Out`) |
| PATCH | `/attendance/:id/checkout` | Set `Check_Out` to current time |
| DELETE | `/attendance/:id` | Delete attendance |
| GET | `/sessions` | List (join `Member_Name`, `Trainer_Name`) |
| GET | `/sessions/:id` | Get session |
| POST | `/sessions` | Create (`Member_ID`, `Trainer_ID`, `Slot_DateTime`, `Focus_Area`) |
| PUT | `/sessions/:id` | Update session |
| DELETE | `/sessions/:id` | Delete session |
| GET | `/trainers` | List trainers |
| GET | `/trainers/:id` | Get trainer |
| POST | `/trainers` | Create (`Name`, `Specialization`, `Phone`, `Salary`) |
| PUT | `/trainers/:id` | Update trainer |
| DELETE | `/trainers/:id` | Delete trainer |
| GET | `/equipment` | List equipment |
| GET | `/equipment/:id` | Get equipment |
| POST | `/equipment` | Create (`Name`, `Category`, `Purchase_Date`, `Condition`) |
| PUT | `/equipment/:id` | Update equipment |
| DELETE | `/equipment/:id` | Delete equipment |
| GET | `/maintenance` | List (join `Equip_Name`) |
| GET | `/maintenance/:id` | Get log |
| POST | `/maintenance` | Create (`Equip_ID`, `Service_Date`, `Cost`, `Technician`) |
| PUT | `/maintenance/:id` | Update log |
| DELETE | `/maintenance/:id` | Delete log |
| GET | `/dashboard` | Aggregates for the home page |

List query parameters (all list endpoints): `search`, `page` (default 1), `limit` (default 10, max 1000), `sortBy` (whitelisted column), `order` (`asc` or `desc`). Use `limit=1000` to fill dropdowns.

Dates are plain strings: `YYYY-MM-DD`, `HH:MM:SS`, `YYYY-MM-DD HH:MM:SS`. The MySQL pool uses `dateStrings: true` so the API does not shift timezones.

HTTP **409** is returned for unique violations and for foreign-key deletes (RESTRICT). Show `message` in the UI.

## Schema verification checklist

Matches `database/er-diagram-spec.md` and `database/schema.sql`.

| Table | Columns | Match |
| --- | --- | --- |
| Membership_Plan | Plan_ID INT PK AI, Plan_Name VARCHAR(100) NOT NULL UNIQUE, Duration_Months INT NOT NULL CHECK > 0, Fee DECIMAL(10,2) NOT NULL CHECK >= 0 | Yes |
| Member | Member_ID INT PK AI, Name VARCHAR(100) NOT NULL, DOB DATE NOT NULL, Gender ENUM(Male,Female,Other) NOT NULL, Phone VARCHAR(20) NOT NULL, Email VARCHAR(150) NOT NULL UNIQUE, Join_Date DATE NOT NULL | Yes |
| Subscription | Sub_ID INT PK AI, Member_ID INT NOT NULL FK, Plan_ID INT NOT NULL FK, Start_Date DATE NOT NULL, End_Date DATE NOT NULL CHECK >= Start_Date, Status ENUM(Active,Expired,Cancelled) NOT NULL DEFAULT Active | Yes |
| Payment | Payment_ID INT PK AI, Sub_ID INT NOT NULL FK, Amount DECIMAL(10,2) NOT NULL CHECK > 0, Paid_On DATE NOT NULL, Mode ENUM(Cash,Card,UPI,Net Banking) NOT NULL | Yes |
| Trainer | Trainer_ID INT PK AI, Name VARCHAR(100) NOT NULL, Specialization VARCHAR(100) NOT NULL, Phone VARCHAR(20) NOT NULL, Salary DECIMAL(10,2) NOT NULL CHECK >= 0 | Yes |
| Session | Session_ID INT PK AI, Member_ID INT NOT NULL FK, Trainer_ID INT NOT NULL FK, Slot_DateTime DATETIME NOT NULL, Focus_Area VARCHAR(100) NOT NULL; UNIQUE (Trainer_ID, Slot_DateTime) | Yes |
| Attendance | Att_ID INT PK AI, Member_ID INT NOT NULL FK, Visit_Date DATE NOT NULL, Check_In TIME NOT NULL, Check_Out TIME NULL | Yes |
| Equipment | Equip_ID INT PK AI, Name VARCHAR(100) NOT NULL, Category VARCHAR(100) NOT NULL, Purchase_Date DATE NOT NULL, Condition ENUM(Excellent,Good,Fair,Poor,Out of Order) NOT NULL | Yes |
| Maintenance_Log | Log_ID INT PK AI, Equip_ID INT NOT NULL FK, Service_Date DATE NOT NULL, Cost DECIMAL(10,2) NOT NULL CHECK >= 0, Technician VARCHAR(100) NOT NULL | Yes |

Relationships (all 1:N, ON DELETE RESTRICT, ON UPDATE CASCADE):

1. Membership_Plan defines Subscription (`Subscription.Plan_ID`)
2. Member takes Subscription (`Subscription.Member_ID`)
3. Subscription settled_by Payment (`Payment.Sub_ID`)
4. Member records Attendance (`Attendance.Member_ID`)
5. Member books Session (`Session.Member_ID`)
6. Trainer conducts Session (`Session.Trainer_ID`)
7. Equipment undergoes Maintenance_Log (`Maintenance_Log.Equip_ID`)

The only columns that are not entity attributes on the ER diagram are those seven foreign keys. There are exactly 9 tables; no auth/users/junction extras.
