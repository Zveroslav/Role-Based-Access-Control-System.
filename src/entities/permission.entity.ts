import { Action, ResourceType, Scope } from 'src/common/constants/rbac.enums';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', enum: ResourceType })
  resource: ResourceType; // 'PatientRecord'

  @Column({ type: 'varchar', enum: Action })
  action: Action; // READ / WRITE / DELETE

  @Column({ type: 'varchar', enum: Scope })
  scope: Scope; // OWN / ORG / GLOBAL
}
