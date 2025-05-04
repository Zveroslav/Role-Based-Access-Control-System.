# 🏥 RBAC Patient Records Demo (NestJS)

This project demonstrates a simple Role-Based Access Control (RBAC) system using **NestJS**, **TypeORM**, and **SQLite**.  
It simulates a medical record system where access to patient records is controlled by user roles and permissions.

---

## 🚀 Features

- Organizations & nested departments
- Users with roles:
  - Owner (access to own records)
  - Admin (access to entire organization)
  - Viewer (read-only access to org)
- Permissions:
  - `READ`, `WRITE`, `DELETE`
  - Scopes: `OWN`, `ORG`
- JWT-based mock auth
- Access control service + guard
- Swagger API explorer
- Full test data via seed script

---

## 📦 Seed Script

The seed script will populate the database with:

- ✅ Organizations (`Clinic A`, `Clinic B`, `Dept A-1`)
- ✅ Roles: `Owner`, `Admin`, `Viewer`
- ✅ Permissions: `READ`, `WRITE`, `DELETE` (scoped as `OWN` and `ORG`)
- ✅ Users:
  - Olivia Owner
  - Adam Admin
  - Vicky Viewer (same org)
  - Otto Outsider (different org)
- ✅ Patient Records (linked to users/orgs)


| **Role** | **Email**        | **Password** |
|----------|------------------|--------------|
| Owner    | owner@a.com      | pass1        |
| Admin    | admin@a.com      | pass2        |
| Viewer   | viewer@a.com     | pass3        |
| Viewer   | viewer@b.com     | pass4        |


---

## Project Setup

### 1. Clone the Repository
```bash
cd rbac-challenge/app
```

### 2. Install Dependencies
```npm install```

### 3. Configure Environment Variables
Create a .env file in the app directory based on the provided .env.example file:
```cp [.env.example](http://_vscodecontentref_/2) .env```

### 4. Set envs 
```JWT_SECRET='your-secret-key'```

## Running the Project

### Start the Application
```npm run start:dev```

### Seed the Database with Initial Data
```npm run seed```

### Access Swagger API Documentation
```http://localhost:3334/api```

