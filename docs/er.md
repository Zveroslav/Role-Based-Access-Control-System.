# Entity Relationship Diagram

```mermaid
erDiagram
  Organization ||--o{ User : "has"
  Organization ||--o{ PatientRecord : "owns"
  User ||--o{ PatientRecord : "created"
  User }o--o{ Role : "user_roles"
  Role }o--o{ Permission : "role_permissions"

  Organization {
    int id PK
    string name
    int parentId FK
  }
  User {
    int id PK
    string email
    string name
    string passwordHash
    int organizationId FK
  }
  Role {
    int id PK
    enum name
    string description
  }
  Permission {
    int id PK
    enum resource
    enum action
    enum scope
  }
  PatientRecord {
    int id PK
    string patientName
    string diagnosis
    int ownerId FK
    int organizationId FK
    datetime createdAt
    datetime updatedAt
  }
```

> **Legend**  
> - `PK` — Primary Key  
> - `FK` — Foreign Key  
> - `enum` — restricted value set  

This diagram reflects the simplified RBAC system required for the TurboVets test assignment.
