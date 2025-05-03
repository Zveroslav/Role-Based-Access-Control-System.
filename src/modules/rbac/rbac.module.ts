import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessControlService } from './access-control.service';
import { Role } from '../../entities/role.entity';
import { Permission } from '../../entities/permission.entity';
import { PermissionsController } from './permissions.controller';
import { User } from 'src/entities/user.entity';
import { PatientRecord } from 'src/entities/patient-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, User, PatientRecord])],
  providers: [AccessControlService],
  controllers: [PermissionsController],
  exports: [AccessControlService],
})
export class RbacModule {}
