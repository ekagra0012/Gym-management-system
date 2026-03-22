import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WorkoutPlansService } from './workout-plans.service';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, User } from '../users/entities/user.entity';

@ApiTags('Workout Plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('workout-plans')
export class WorkoutPlansController {
  constructor(private readonly workoutPlansService: WorkoutPlansService) {}

  @Post()
  @Roles(UserRole.PT, UserRole.OWNER)
  @ApiOperation({ summary: 'Create custom workout plan with nested exercises' })
  @ApiResponse({ status: 201, description: 'Plan created' })
  create(@Body() createDto: CreateWorkoutPlanDto, @CurrentUser() user: User) {
    return this.workoutPlansService.create(createDto, user);
  }

  @Get()
  @Roles(UserRole.PT, UserRole.OWNER)
  @ApiOperation({ summary: 'List all workout plans for the logged-in trainer' })
  findAll(@CurrentUser() user: User) {
    return this.workoutPlansService.findAll(user);
  }

  @Get(':id')
  @Roles(UserRole.PT, UserRole.OWNER)
  @ApiOperation({ summary: 'Get workout plan details' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.workoutPlansService.findOne(id, user);
  }

  @Delete(':id')
  @Roles(UserRole.PT, UserRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a workout plan' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.workoutPlansService.remove(id, user);
  }
}
