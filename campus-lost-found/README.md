# Campus Lost & Found — Full-Stack College Engineering Project
> **Tagline:** *“Lost something? Found something? Help your campus reconnect.”*

A modern, full-stack college web application built with **Java (Spring Boot)**, **Spring Data JPA / Hibernate**, **MySQL Database**, **HTML5/CSS3/JavaScript**, and **RESTful APIs**.

---

## 1. System Architecture & Tech Stack

```
   ┌─────────────────────────────────────────────────────────────┐
   │               Frontend Layer (Web UI)                       │
   │  HTML5 + TailwindCSS + JavaScript Fetch / AJAX / React      │
   └──────────────────────────────┬──────────────────────────────┘
                                  │ HTTP / JSON REST APIs
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │             Backend REST API Layer (Java)                   │
   │  Controllers: AuthController, ItemController, ClaimController│
   └──────────────────────────────┬──────────────────────────────┘
                                  │ Service & DTO validation
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │            Spring Data JPA / Hibernate Layer                │
   │  Repositories: UserRepository, ItemRepository, ClaimRepo   │
   │  Entities: User, Item, Claim                                │
   └──────────────────────────────┬──────────────────────────────┘
                                  │ JDBC / SQL Queries
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                 Relational Database                         │
   │          MySQL 8.0 (Tables: users, items, claims)           │
   └─────────────────────────────────────────────────────────────┘
```

### Components Breakdown:
1. **Frontend:**
   - Interactive UI with live dynamic item cards, search & category filtering.
   - JavaScript asynchronous `fetch()` API calls to backend endpoints.
   - Token-based authenticated session preservation.
2. **Backend (Java Spring Boot 3.2):**
   - `@RestController` handles JSON requests & responses.
   - Spring Security with BCrypt for password hashing (`BCryptPasswordEncoder`).
   - Clean layer separation: Controller ➔ Service ➔ Repository ➔ Entity.
3. **Database (MySQL):**
   - InnoDB storage engine with ACID transactions.
   - Foreign key constraints (`user_id`, `item_id`, `claimant_user_id`).
   - Indexes on search columns (`college_email`, `student_id`, `category`, `status`, `type`).

---

## 2. MySQL Database Schema

The database consists of 3 relational tables:

### Table: `users`
- `id` (BIGINT, PRIMARY KEY, AUTO_INCREMENT)
- `full_name` (VARCHAR(100), NOT NULL)
- `college_email` (VARCHAR(150), UNIQUE, NOT NULL)
- `student_id` (VARCHAR(50), UNIQUE, NOT NULL)
- `phone` (VARCHAR(20), NOT NULL)
- `password_hash` (VARCHAR(255), NOT NULL) - Secure BCrypt hash
- `role` (ENUM('STUDENT', 'FACULTY', 'ADMIN'))
- `created_at` (TIMESTAMP)

### Table: `items`
- `id` (BIGINT, PRIMARY KEY, AUTO_INCREMENT)
- `report_id` (VARCHAR(50), UNIQUE, NOT NULL) - e.g. `LOST-2026-1049`
- `user_id` (BIGINT, FOREIGN KEY -> `users(id)`)
- `item_name` (VARCHAR(150), NOT NULL)
- `type` (ENUM('LOST', 'FOUND'), NOT NULL)
- `category` (VARCHAR(50), NOT NULL)
- `description` (TEXT, NOT NULL)
- `event_date` (DATE, NOT NULL)
- `approx_time` (VARCHAR(50))
- `location` (VARCHAR(150), NOT NULL)
- `color` (VARCHAR(50))
- `brand` (VARCHAR(80))
- `identifying_details` (TEXT)
- `contact_preference` (ENUM('EMAIL', 'PHONE', 'PLATFORM'))
- `image_url` (TEXT)
- `status` (ENUM('OPEN', 'RESOLVED', 'CLAIMED'))
- `created_at`, `updated_at` (TIMESTAMP)

### Table: `claims`
- `id` (BIGINT, PRIMARY KEY, AUTO_INCREMENT)
- `item_id` (BIGINT, FOREIGN KEY -> `items(id)`)
- `claimant_user_id` (BIGINT, FOREIGN KEY -> `users(id)`)
- `owner_user_id` (BIGINT, FOREIGN KEY -> `users(id)`)
- `reason` (TEXT, NOT NULL)
- `additional_details` (TEXT)
- `proof_details` (TEXT)
- `status` (ENUM('PENDING', 'ACCEPTED', 'REJECTED'))
- `created_at`, `updated_at` (TIMESTAMP)

---

## 3. How to Run Locally with Java & MySQL

### Prerequisites:
1. Java JDK 17+ installed (`java -version`)
2. Maven 3.8+ installed (`mvn -version`)
3. MySQL Server running on port 3306 (`mysql -u root -p`)

### Step 1: Initialize MySQL Database
```bash
# Log in to MySQL
mysql -u root -p

# Run the provided schema script:
source /path/to/campus-lost-found/mysql/schema.sql;
```

### Step 2: Configure Database Credentials
Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/campus_lost_found?useSSL=false
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### Step 3: Run the Spring Boot Backend
```bash
cd backend
mvn clean spring-boot:run
```
The backend starts at `http://localhost:8080/api`.

---

## 4. REST API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new student/faculty | No |
| `POST` | `/api/auth/login` | Login with email and password | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes (Bearer Token) |
| `GET` | `/api/stats` | Real-time platform count metrics | No |
| `GET` | `/api/items` | Search & filter lost/found items | No |
| `GET` | `/api/items/{id}` | Get item details by ID | No |
| `POST` | `/api/items` | Report new Lost or Found item | Yes |
| `PUT` | `/api/items/{id}` | Edit item (author or admin) | Yes |
| `DELETE` | `/api/items/{id}` | Delete item (author or admin) | Yes |
| `POST` | `/api/items/{id}/claims` | Submit claim on a found item | Yes |
| `GET` | `/api/claims/my` | View my submitted & received claims | Yes |
| `PUT` | `/api/claims/{id}/accept` | Accept claim (marks item Resolved) | Yes |
| `PUT` | `/api/claims/{id}/reject` | Reject invalid claim | Yes |
| `GET` | `/api/admin/users` | List registered campus users | Yes (Admin) |

---

## 5. Sample Login Credentials for Testing

| Role | Email | Password | Student / Staff ID |
|---|---|---|---|
| **Campus Admin** | `admin@campus.edu` | `Admin@123` | `FAC-9901` |
| **Student 1** | `rahul.sharma@campus.edu` | `Pass@123` | `CS-2024-042` |
| **Student 2** | `priya.patel@campus.edu` | `Pass@123` | `IT-2024-088` |

---

## 6. Engineering Viva Questions & Answers

**Q1: Why did you choose Spring Boot for the backend?**
> Spring Boot provides embedded Tomcat, dependency injection, and Spring Data JPA out-of-the-box, eliminating boilerplate XML configurations and speeding up REST API development.

**Q2: What is the role of Spring Data JPA and Hibernate?**
> Hibernate is the Object-Relational Mapping (ORM) provider that maps Java objects (`@Entity`) to MySQL database tables. Spring Data JPA generates SQL queries dynamically from repository interfaces (`JpaRepository<User, Long>`).

**Q3: How is user password security handled?**
> Passwords are never saved in plain text. They are hashed using BCrypt (`BCryptPasswordEncoder`) with a salted key, preventing rainbow table attacks.

**Q4: How does the Claim / Match verification workflow operate?**
> When a user reports a FOUND item, another student who lost it can submit a claim with unique identifying details (serial number, lockscreen image, hidden mark). The founder reviews the claim in their dashboard and can Accept or Reject. Accepting automatically marks the item as RESOLVED and updates campus statistics.

---

## 7. Supabase Cloud Backend Integration

The system includes direct synchronization with your **Supabase Cloud Project**:

- **Project ID:** `nldzgkhjrhztwipecdnb`
- **Supabase URL:** `https://nldzgkhjrhztwipecdnb.supabase.co`
- **Publishable Key:** `sb_publishable_AbFAQJef63ZH5N27fym0sQ_HRU49Hf5`

### SQL Table Setup in Supabase
Run the following in your Supabase SQL Editor (`https://supabase.com/dashboard/project/nldzgkhjrhztwipecdnb/sql`):

```sql
CREATE TABLE IF NOT EXISTS public.items (
    id TEXT PRIMARY KEY,
    report_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    poster_name TEXT NOT NULL,
    poster_email TEXT NOT NULL,
    poster_phone TEXT,
    item_name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('LOST', 'FOUND')),
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT,
    location TEXT NOT NULL,
    color TEXT,
    brand TEXT,
    identifying_details TEXT,
    contact_preference TEXT DEFAULT 'PLATFORM',
    image_url TEXT,
    status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'RESOLVED', 'CLAIMED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public all on items" ON public.items FOR ALL USING (true) WITH CHECK (true);
```
Whenever a lost or found item is reported through the web interface, it is automatically written to both the persistent application database and your Supabase `items` table!
