import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, User } from '../users/entities/user.entity';

@ApiTags('Availability')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  @Roles(UserRole.PT, UserRole.OWNER)
  @ApiOperation({ summary: 'Create availability slot(s)' })
  @ApiResponse({ status: 201, description: 'Created slot(s)' })
  create(@Body() createDto: CreateAvailabilityDto, @CurrentUser() user: User) {
    return this.availabilityService.create(createDto, user);
  }

  @Get()
  @Roles(UserRole.PT, UserRole.OWNER)
  @ApiOperation({ summary: 'Get availability slots' })
  findAll(@CurrentUser() user: User) {
    return this.availabilityService.findAll(user);
  }

  @Delete(':id')
  @Roles(UserRole.PT, UserRole.OWNER)
  @ApiOperation({ summary: 'Delete an open availability slot' })
  @ApiResponse({ status: 200, description: 'Slot successfully deleted' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.availabilityService.remove(id, user);
  }
}
