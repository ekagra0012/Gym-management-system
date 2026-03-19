import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles(UserRole.ADMIN)
  @Get('stats')
  @ApiOperation({ summary: 'Get high level gym stats (Admin only)' })
  getStats() {
    return this.dashboardService.getStats();
  }

  @Roles(UserRole.ADMIN)
  @Get('expiring-soon')
  @ApiOperation({ summary: 'Get subscriptions expiring in the next 7 days' })
  getExpiringSubscriptions() {
    return this.dashboardService.getExpiringSubscriptions();
  }
}
