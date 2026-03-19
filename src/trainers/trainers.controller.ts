import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TrainersService } from './trainers.service';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, User } from '../users/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Trainers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('trainers')
export class TrainersController {
  constructor(private readonly trainersService: TrainersService) {}

  @Roles(UserRole.ADMIN, UserRole.TRAINER)
  @Post()
  create(@CurrentUser() user: User, @Body() createTrainerDto: CreateTrainerDto) {
    return this.trainersService.create(user.id, createTrainerDto);
  }

  @Get()
  findAll() {
    return this.trainersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trainersService.findOne(id);
  }

  @Roles(UserRole.ADMIN, UserRole.TRAINER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: Partial<CreateTrainerDto>) {
    return this.trainersService.update(id, updateData);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trainersService.remove(id);
  }
}
