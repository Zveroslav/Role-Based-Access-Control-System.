import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { RbacModule } from '../rbac/rbac.module';
import { PatientRecord } from 'src/entities/patient-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PatientRecord]), RbacModule],
  providers: [PatientService],
  controllers: [PatientController],
})
export class PatientModule {}
