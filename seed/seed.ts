import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import {
  Action,
  ResourceType,
  RoleName,
  Scope,
} from '../src/common/constants/rbac.enums';
import { Organization } from 'src/entities/organization.entity';
import { Permission } from 'src/entities/permission.entity';
import { Role } from 'src/entities/role.entity';
import { User } from 'src/entities/user.entity';
import { PatientRecord } from 'src/entities/patient-record.entity';



/* ---------- datasource (CLI) --------- */
function defaultDS() {
  return new DataSource({
    type: 'sqlite',
    database: 'db.sqlite',         // или ':memory:' в тестах
    synchronize: true,
    dropSchema: true,
    logging: false,
    entities: [Organization, Permission, Role, User, PatientRecord],
  });
}

/* ---------- seed runner -------------- */
export async function SeedRunner(ds?: DataSource) {
  const dataSource = ds ?? defaultDS();
  if (!dataSource.isInitialized) await dataSource.initialize();

  const trx = dataSource.manager;

  /* 1. Orgs */
  const clinicA = trx.create(Organization, { name: 'Clinic A' });
  debugger;

  const clinicB = trx.create(Organization, { name: 'Clinic B' });

  const [clinic] = await trx.save([clinicA, clinicB]);
  const deptA1 = trx.create(Organization, { name: 'Dept A-1', parent: clinic });

  await trx.save([deptA1]);




  /* 2. Permissions */
  const mkPerm = (action: Action, scope: Scope) =>
    trx.create(Permission, {
      resource: ResourceType.PATIENT_RECORD,
      action,
      scope,
    });

  const perms = await trx.save([
    mkPerm(Action.READ, Scope.OWN),
    mkPerm(Action.WRITE, Scope.OWN),
    mkPerm(Action.READ, Scope.ORG),
    mkPerm(Action.WRITE, Scope.ORG),
    mkPerm(Action.DELETE, Scope.ORG),
  ]);

  const [ownRead, ownWrite, orgRead, orgWrite, orgDelete] = perms;

  /* 3. Roles — сразу с permissions */
  const roles = await trx.save([
    trx.create(Role, {
      name: RoleName.OWNER,
      permissions: [ownRead, ownWrite],
    }),
    trx.create(Role, {
      name: RoleName.ADMIN,
      permissions: [orgRead, orgWrite, orgDelete],
    }),
    trx.create(Role, {
      name: RoleName.VIEWER,
      permissions: [orgRead],
    }),
  ]);

  const [ownerRole, adminRole, viewerRole] = roles;

  /* 4. Users — сразу с roles */
  const hash = (p: string) => bcrypt.hashSync(p, 10);

  const users = await trx.save([
    trx.create(User, {
      name: 'Olivia Owner',
      email: 'owner@a.com',
      passwordHash: hash('pass1'),
      organization: clinicA,
      roles: [ownerRole],
    }),
    trx.create(User, {
      name: 'Adam Admin',
      email: 'admin@a.com',
      passwordHash: hash('pass2'),
      organization: clinicA,
      roles: [adminRole],
    }),
    trx.create(User, {
      name: 'Vicky Viewer',
      email: 'viewer@a.com',
      passwordHash: hash('pass3'),
      organization: deptA1,
      roles: [viewerRole],
    }),
    trx.create(User, {
      name: 'Otto Outsider',
      email: 'viewer@b.com',
      passwordHash: hash('pass4'),
      organization: clinicB,
      roles: [viewerRole],
    }),
  ]);

  const [owner, admin, viewer, outsider] = users;

  /* 5. Records */
  const mkRecord = (user: User, org = user.organization, name: string) =>
    trx.create(PatientRecord, {
      patientName: name,
      diagnosis: 'Lorem ipsum',
      owner: user,
      organization: org,
    });

  await trx.save([
    mkRecord(owner, clinicA, 'John Doe'),
    mkRecord(owner, clinicA, 'Jane Smith'),
    mkRecord(admin, clinicA, 'Hans Zimmer'),
    mkRecord(viewer, deptA1, 'Carlos Ortiz'),
    mkRecord(viewer, deptA1, 'Li Wei'),
    mkRecord(outsider, clinicB, 'Maria García'),
  ]);

  if (!ds) await dataSource.destroy();
}

/* ---------- CLI entrypoint ----------- */
if (require.main === module) {
  SeedRunner()
    .then(() => console.log('✅  Seed complete'))
    .catch((err) => {
      console.error('❌  Seed FAILED');
      console.error(err);
      process.exit(1);
    });
}
