import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { PatientRecord } from 'src/entities/patient-record.entity';
import { AccessControlService } from 'src/modules/rbac/access-control.service';
import { Repository } from 'typeorm';
import { Action } from './constants/rbac.enums';

/**
 * RBAC-guard that:
 * 1. Reads the desired Action from route metadata (@SetMetadata('action', …))
 * 2. Extracts current user from request (already set by a preceding JwtAuthGuard)
 * 3. Loads the PatientRecord (if :id is present)
 * 4. Delegates decision-making to AccessControlService.can()
 */
@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly acs: AccessControlService,

    /* used to fetch the record for detail routes */
    @InjectRepository(PatientRecord)
    private readonly recordRepo: Repository<PatientRecord>,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx?.switchToHttp()?.getRequest();

    /* 1️  no action metadata → route is public from RBAC standpoint */
    const action = this.reflector.get<Action>('action', ctx.getHandler());
    if (!action) return true;

    /* 2️  user should already be attached by JwtAuthGuard (moc-login) */
    const user = req?.user;
    if (!user) throw new ForbiddenException('No user in request');

    /* 3️  For list routes we don’t need a single record,
             for detail routes (`/patient-records/:id`) we do */
    const idParam = req.params?.id;
    if (!idParam) return true; // list endpoints will be scope-filtered inside service

    const record = await this.recordRepo.findOne({
      where: { id: +idParam },
      relations: ['owner', 'organization'],
    });
    if (!record)
      throw new ForbiddenException(`PatientRecord #${idParam} not found`);

    /* 4️  Ask AccessControlService */
    const allowed = this.acs.can(user, action, record);
    if (!allowed)
      throw new ForbiddenException(
        `Forbidden: ${action} PatientRecord#${record.id}`,
      );

    return true;
  }
}
