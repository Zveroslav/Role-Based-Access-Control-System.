import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';
import { PatientService } from './patient.service';
import { RbacGuard } from './rbac.guard';
import { SetMetadata } from '@nestjs/common';
import { Action } from 'src/common/constants/rbac.enums';
import { JwtGuard } from '../auth/jwt.guard';
import { IsInt, IsString, Min } from 'class-validator';
import { User } from 'src/entities/user.entity';

interface RequestWithUser extends Request {
  user: User;
}

class PatientRecord {
  @ApiProperty({ example: 1, description: 'ID of the patient record' })
  @IsInt({ message: 'id must be an integer' }) // Validate as an integer
  @Min(1, { message: 'id must be greater than 0' }) // Ensure id is positive
  id: number;

  @ApiProperty({ example: 'John Doe', description: 'Name of the patient' })
  @IsString({ message: 'name must be a string' }) // Validate as a string
  name: string;

  @ApiProperty({ example: 1, description: 'ID of the organization' })
  @IsInt({ message: 'organizationId must be an integer' }) // Validate as an integer
  @Min(1, { message: 'organizationId must be greater than 0' }) // Ensure organizationId is positive
  organizationId: number;
}

@ApiTags('Patient Records') // Group this controller under "Patient Records" in Swagger
@ApiBearerAuth() // Add Bearer token authentication
@Controller('patient-records')
@UseGuards(JwtGuard, RbacGuard)
export class PatientController {
  constructor(private svc: PatientService) {}

  @Get()
  @SetMetadata('action', Action.READ)
  @ApiOperation({
    summary: "List all patient records for the user's organization",
  })
  @ApiResponse({
    status: 200,
    description: 'List of patient records',
    type: [PatientRecord],
  })
  list(@Req() req: RequestWithUser) {
    const { organization } = req.user; // Properly typed user
    return this.svc.findAllForOrg(organization.id); // organization.id is now properly typed
  }

  @Get(':id')
  @SetMetadata('action', Action.READ)
  @ApiOperation({ summary: 'Get details of a specific patient record' })
  @ApiResponse({
    status: 200,
    description: 'Details of the patient record',
    type: PatientRecord,
  })
  @ApiResponse({ status: 404, description: 'Patient record not found' })
  detail(@Param('id') id: string) {
    return this.svc.findOne(+id);
  }
}
