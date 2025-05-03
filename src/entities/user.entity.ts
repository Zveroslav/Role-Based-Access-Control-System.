import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinTable,
} from 'typeorm';
import { Organization } from './organization.entity';
import { Role } from './role.entity';
import { PatientRecord } from './patient-record.entity';
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @ManyToOne(() => Organization, (org) => org.users, { eager: true })
  organization: Organization;

  @ManyToMany(() => Role, { eager: true, cascade: true, nullable: true })
  @JoinTable()
  roles: Role[];

  @OneToMany(() => PatientRecord, (rec) => rec.owner)
  patientRecords: PatientRecord[];
}
