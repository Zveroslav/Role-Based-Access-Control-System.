import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientRecord } from '../../entities/patient-record.entity';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(PatientRecord)
    private repo: Repository<PatientRecord>,
  ) {}

  findAllForOrg(orgId: number) {
    return this.repo.find({ where: { organization: { id: orgId } } });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }
}
