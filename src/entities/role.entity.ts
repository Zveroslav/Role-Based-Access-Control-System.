import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Permission } from './permission.entity';
import { RoleName } from 'src/common/constants/rbac.enums';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', enum: RoleName, unique: true })
  name: RoleName;

  @Column({ nullable: true })
  description?: string;

  @ManyToMany(() => Permission, { eager: true, cascade: true, nullable: true })
  @JoinTable()
  permissions: Permission[];
}
