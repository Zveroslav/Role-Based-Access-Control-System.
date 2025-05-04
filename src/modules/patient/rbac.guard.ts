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
import { Action } from '../../common/constants/rbac.enums';


@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly acs: AccessControlService,

    @InjectRepository(PatientRecord)
    private readonly recordRepo: Repository<PatientRecord>,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx?.switchToHttp()?.getRequest();

    const action = this.reflector.get<Action>('action', ctx.getHandler());
    if (!action) return true;

    const user = req?.user;
    if (!user) throw new ForbiddenException('No user in request');

    const idParam = req.params?.id;
    if (!idParam) return true; // list endpoints will be scope-filtered inside service

    const record = await this.recordRepo.findOne({
      where: { id: +idParam },
      relations: ['owner', 'organization'],
    });
    if (!record)
      throw new ForbiddenException(`PatientRecord #${idParam} not found`);

    const allowed = this.acs.can(user, action, record);
    if (!allowed)
      throw new ForbiddenException(
        `Forbidden: ${action} PatientRecord#${record.id}`,
      );

    return true;
  }
}
