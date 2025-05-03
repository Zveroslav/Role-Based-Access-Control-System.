import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';

@Entity()
export class PatientRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  patientName: string;

  @Column('text')
  diagnosis: string;

  @ManyToOne(() => User, (user) => user.patientRecords, { eager: true })
  owner: User;

  @ManyToOne(() => Organization, (org) => org.patientRecords, { eager: true })
  organization: Organization;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
