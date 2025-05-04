import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { User } from '../../entities/user.entity';
import { PatientRecord } from '../../entities/patient-record.entity';
import { AccessControlService } from './access-control.service';
import { Action } from 'src/common/constants/rbac.enums';
import { IsInt, IsString, IsEnum, Min } from 'class-validator';

class CheckDto {
  @ApiProperty({ example: 1, description: 'ID of the user' })
  @IsInt({ message: 'userId must be an integer' })
  @Min(1, { message: 'userId must be greater than 0' })
  userId: number;

  @ApiProperty({
    example: 'READ',
    description: 'Action to perform (e.g., READ, WRITE, DELETE)',
  })
  @IsEnum(Action, { message: 'action must be a valid Action enum value' })
  action: Action;

  @ApiProperty({
    example: 'PatientRecord',
    description: 'Type of the resource',
  })
  @IsString({ message: 'resourceType must be a string' })
  resourceType: string;

  @ApiProperty({ example: 42, description: 'ID of the resource' })
  @IsInt({ message: 'resourceId must be an integer' })
  @Min(1, { message: 'resourceId must be greater than 0' })
  resourceId: number;
}

class CheckResponse {
  @ApiProperty({ example: true, description: 'Whether the action is allowed' })
  allowed: boolean;

  @ApiProperty({
    example: 'USER_OR_RECORD_NOT_FOUND',
    description: 'Reason for denial (if any)',
    required: false,
  })
  reason?: string;
}

@ApiTags('Permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(PatientRecord)
    private readonly recRepo: Repository<PatientRecord>,
    private readonly acs: AccessControlService,
  ) {}

  @Post('check')
  @ApiOperation({
    summary:
      'Check if a user has permission to perform an action on a resource',
  })
  @ApiResponse({
    status: 200,
    description: 'Permission check result',
    type: CheckResponse,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(200)
  async check(@Body() dto: CheckDto): Promise<CheckResponse> {
    const user = await this.userRepo.findOne({
      where: { id: dto.userId },
      relations: ['roles', 'roles.permissions', 'organization'],
    });

    const rec = await this.recRepo.findOne({
      where: { id: dto.resourceId },
      relations: ['owner', 'organization'],
    });

    if (!user || !rec)
      return { allowed: false, reason: 'USER_OR_RECORD_NOT_FOUND' };

    const allowed = this.acs.can(user, dto.action, rec);
    return { allowed, reason: allowed ? 'Whether the action is allowed' : 'FORBIDDEN' };
  }
}
