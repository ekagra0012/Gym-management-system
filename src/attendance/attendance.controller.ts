import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CheckInDto } from './dto/check-in.dto';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Roles(UserRole.ADMIN, UserRole.TRAINER)
  @Post('check-in')
  checkIn(@Body() checkInDto: CheckInDto) {
    return this.attendanceService.checkIn(checkInDto);
  }

  @Roles(UserRole.ADMIN, UserRole.TRAINER)
  @Post('check-out/:memberId')
  checkOut(@Param('memberId') memberId: string) {
    return this.attendanceService.checkOut(memberId);
  }

  @Get()
  @ApiQuery({ name: 'memberId', required: false, type: String })
  getHistory(@Query('memberId') memberId?: string) {
    return this.attendanceService.getAttendanceHistory(memberId);
  }
}
