# 📅 Future Roadmap

This document outlines **what comes next** for the RBAC demo project delivered for the TurboVets assignment.
It is split into two parts:

* **Core Roadmap** – tasks required to fully satisfy the _baseline_ specification.  
* **Optional Enhancements** – improvements that are **not** mandatory but provide extra polish, security or scalability.

## Ⅰ. Core Roadmap (MVP Completion)

| Phase | Goal | Key Tasks | Expected Outcome |
|-------|------|-----------|------------------|
| **1 — Data Layer** | Solid relational model | * Finalise TypeORM entities for `User`, `Organization`, `Role`, `Permission`, `PatientRecord`.<br>* Add DB migrations and seed‑script (`npm run seed`). | Compilable schema + repeatable seed in CI. |
| **2 — Access Service** | Centralised permission checks | * Implement `AccessControlService.can()` and `scopeFilter()`.<br>* Unit‑test edge cases (own vs. org vs. global). | 100 % logic coverage. |
| **3 — API Surface** | Expose required endpoints | * `/patient-records` (list + detail).<br>* `/permissions/check`.<br>* Mock `/auth/login` to issue JWT.<br>* Global `ExceptionFilter` for 401/403. | Working REST API guarded by RBAC. |
| **4 — Testing & Docs** | Proof of correctness | * Jest integration tests (owner allow, outsider deny).<br>* Write README: setup, API, data model, access reasoning.<br>* Add `docs/er.md` + this file. | Reviewer can start app & run tests in < 5 min. |
| **5 — Submission** | Ship to GitHub | * Verify seed, scripts, docs on clean clone.<br>* Push to public repo.<br>* Send link to `chris.karam@turbovets.com`. | Assignment accepted. |

## Ⅱ. Optional Enhancements (Nice‑to‑Have Backlog)

1. **CI/CD Pipeline** – GitHub Actions running `lint`, `test`, and publishing coverage badge.  
2. **Audit Trail** – `AuditInterceptor` storing allow/deny decisions (PII redacted).  
3. **Security Hardening** – `helmet`, `throttler`, CSRF notes, secure cookies.  
4. **Database Feature Flag** – `.env DB=sqlite|postgres` with auto‑switch migrations.  
5. **Swagger / OpenAPI v3.1** – auto‑generated docs and live try‑out playground.  
6. **Mermaid Sequence Diagram** – request → guard → service → repo flow in docs.  
7. **ADR Folder** – short Architecture Decision Records (`docs/adr/*.md`).  
8. **Role & Permission CRUD** – minimal admin endpoints guarded by Admin role.  
9. **Caching Layer** – Redis to memoise permission matrices per user / org.  
10. **Delegated & Time‑bound Roles** – support temporary assignments (`expiresAt`).  
11. **Policy Engine Integration** – swap manual logic for CASL or Oso; or adapt for OPA/Rego.  
12. **Multi‑Resource Expansion** – add `LabResult`, `Invoice`, etc., driven purely by data, no code changes.  
13. **UI Prototype** – Swagger‑powered or simple React admin panel to visualise records and permissions.  
14. **Multi‑Tenant Scaling** – partitioning/sharding notes + Terraform scripts for cloud launch.  
15. **Observability** – Prometheus metrics, health checks, structured logging with Pino.

Each item can be tackled independently, making the project progressively more production‑ready while remaining faithful to clean‑code, security, and maintainability principles.
