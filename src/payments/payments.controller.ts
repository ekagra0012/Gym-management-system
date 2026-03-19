import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get('member/:memberId')
  @Roles(UserRole.ADMIN, UserRole.TRAINER)
  findByMember(@Param('memberId') memberId: string) {
    return this.paymentsService.findByMemberId(memberId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }
}
