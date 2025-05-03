import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { PatientModule } from './modules/patient/patient.module';
import config from '../ormconfig';

@Module({
  imports: [TypeOrmModule.forRoot(config), PatientModule, AuthModule],
})
export class AppModule {}
