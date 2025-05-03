import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';

import { User } from '../../entities/user.entity';
import { PatientRecord } from '../../entities/patient-record.entity';
import { Permission } from '../../entities/permission.entity';
import { Action, ResourceType, Scope } from 'src/common/constants/rbac.enums';

@Injectable()
export class AccessControlService {
  constructor(
    @InjectRepository(Permission)
    private readonly permRepo: Repository<Permission>,
  ) {}

  can(user: User, action: Action, record: PatientRecord): boolean {
    const perms = this.collectPermissions(user);

    /* 1. Global */
    if (
      perms.some(
        (p) =>
          p.resource === ResourceType.PATIENT_RECORD &&
          p.action === action &&
          p.scope === Scope.GLOBAL,
      )
    ) {
      return true;
    }

    /* 2. Org-wide */
    if (
      perms.some(
        (p) =>
          p.resource === ResourceType.PATIENT_RECORD &&
          p.action === action &&
          p.scope === Scope.ORG,
      ) &&
      user.organization.id === record.organization.id
    ) {
      return true;
    }

    /* 3. Own */
    if (
      perms.some(
        (p) =>
          p.resource === ResourceType.PATIENT_RECORD &&
          p.action === action &&
          p.scope === Scope.OWN,
      ) &&
      user.id === record.owner.id
    ) {
      return true;
    }

    return false; // deny by default
  }

  scopeFilter(
    user: User,
    qb: SelectQueryBuilder<PatientRecord>,
    action: Action = Action.READ,
  ): SelectQueryBuilder<PatientRecord> {
    const perms = this.collectPermissions(user);

    const hasGlobal = perms.some(
      (p) =>
        p.resource === ResourceType.PATIENT_RECORD &&
        p.action === action &&
        p.scope === Scope.GLOBAL,
    );

    /* Global access → no WHERE needed */
    if (hasGlobal) return qb;

    const hasOrg = perms.some(
      (p) =>
        p.resource === ResourceType.PATIENT_RECORD &&
        p.action === action &&
        p.scope === Scope.ORG,
    );

    const hasOwn = perms.some(
      (p) =>
        p.resource === ResourceType.PATIENT_RECORD &&
        p.action === action &&
        p.scope === Scope.OWN,
    );

    /* Build dynamic WHERE */
    qb.andWhere(
      new Brackets((expr) => {
        if (hasOrg) {
          expr.orWhere('rec.organizationId = :orgId', {
            orgId: user.organization.id,
          });
        }
        if (hasOwn) {
          expr.orWhere('rec.ownerId = :userId', { userId: user.id });
        }
      }),
    );

    /* If neither ORG nor OWN perms, query becomes unsatisfiable and returns [] */
    return qb;
  }

  private collectPermissions(user: User): Permission[] {
    return user.roles.flatMap((role) => role.permissions);
  }
}
