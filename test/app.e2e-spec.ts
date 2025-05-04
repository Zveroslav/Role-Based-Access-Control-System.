import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { SeedRunner } from '../seed/seed'; // if you export run() as SeedRunner

const api = '/patient-records';

describe('RBAC (e2e)', () => {
  let app: INestApplication;
  let dataSource;

  /* helpers */
  const login = async (email: string, password: string) => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201); // Nest's default for POST

    return res.body.accessToken as string;
  };

  beforeAll(async () => {
    /* 1️⃣  create testing module */
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    /* 2️⃣  re-seed a fresh in-memory db */
    dataSource = app.get(DataSource);
    await SeedRunner(dataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  /* --------  Scenarios  -------- */

  it('Owner can read their own record', async () => {
    const token = await login('owner@a.com', 'pass1');

    await request(app.getHttpServer())
      .get(`${api}/1`) // record owned by owner
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.id).toBe(1);
        expect(body.owner.email).toBe('owner@a.com');
      });
  });

  it('Viewer in same organisation can read', async () => {
    const token = await login('viewer@a.com', 'pass3'); // deptA1 under ClinicA

    await request(app.getHttpServer())
      .get(`${api}/4`) // record in ClinicA
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('Viewer from other organisation is denied', async () => {
    const token = await login('viewer@b.com', 'pass4'); // ClinicB

    await request(app.getHttpServer())
      .get(`${api}/1`) // record in ClinicA
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  describe('Permissions (e2e)', () => {
    it('Admin can check permissions for a resource', async () => {
      const token = await login('admin@a.com', 'pass2'); // Admin in ClinicA

      await request(app.getHttpServer())
        .post('/permissions/check')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: 2, // Admin's ID
          action: 'READ',
          resourceType: 'PatientRecord',
          resourceId: 1, // Record in ClinicA
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.allowed).toBe(true);
        });
    });

    it('Viewer cannot check permissions for a resource they do not own', async () => {
      const token = await login('viewer@b.com', 'pass4'); // Viewer in ClinicB

      await request(app.getHttpServer())
        .post('/permissions/check')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: 4, // Viewer's ID
          action: 'READ',
          resourceType: 'PatientRecord',
          resourceId: 1, // Record in ClinicA
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.allowed).toBe(false);
          expect(body.reason).toBe('FORBIDDEN');
        });
    });

    it('Owner can check permissions for their own resource', async () => {
      const token = await login('owner@a.com', 'pass1'); // Owner in ClinicA

      await request(app.getHttpServer())
        .post('/permissions/check')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: 1, // Owner's ID
          action: 'READ',
          resourceType: 'PatientRecord',
          resourceId: 1, // Record owned by Owner
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.allowed).toBe(true);
        });
    });

    it('Viewer in the same organization can check permissions for a resource', async () => {
      const token = await login('viewer@a.com', 'pass3'); // Viewer in DeptA1 under ClinicA

      await request(app.getHttpServer())
        .post('/permissions/check')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: 3, // Viewer's ID
          action: 'READ',
          resourceType: 'PatientRecord',
          resourceId: 4, // Record in DeptA1 under ClinicA
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.allowed).toBe(true);
        });
    });

    it('Viewer from another organization cannot check permissions for a resource', async () => {
      const token = await login('viewer@b.com', 'pass4'); // Viewer in ClinicB

      await request(app.getHttpServer())
        .post('/permissions/check')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: 4, // Viewer's ID
          action: 'READ',
          resourceType: 'PatientRecord',
          resourceId: 1, // Record in ClinicA
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.allowed).toBe(false);
          expect(body.reason).toBe('FORBIDDEN');
        });
    });
  });
});