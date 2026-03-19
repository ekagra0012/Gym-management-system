import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MembershipPlansService } from './membership-plans.service';
import { CreateMembershipPlanDto } from './dto/create-membership-plan.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Membership Plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('membership-plans')
export class MembershipPlansController {
  constructor(private readonly plansService: MembershipPlansService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createMembershipPlanDto: CreateMembershipPlanDto) {
    return this.plansService.create(createMembershipPlanDto);
  }

  @Get()
  findAll() {
    return this.plansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: Partial<CreateMembershipPlanDto>) {
    return this.plansService.update(id, updateData);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.plansService.remove(id);
  }
}
