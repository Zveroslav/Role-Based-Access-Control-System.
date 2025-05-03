import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { PatientRecord } from './patient-record.entity';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;

  /** self-reference (only 2 levels needed in assignment) */
  @ManyToOne(() => Organization, (org) => org.children, { nullable: true })
  parent?: Organization;

  @OneToMany(() => Organization, (org) => org.parent)
  children: Organization[];

  @OneToMany(() => User, (user) => user.organization)
  users: User[];

  @OneToMany(() => PatientRecord, (rec) => rec.organization)
  patientRecords: PatientRecord[];
}
