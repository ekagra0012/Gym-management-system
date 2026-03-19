import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Roles(UserRole.ADMIN, UserRole.TRAINER)
  @Post()
  create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  @Get()
  findAll() {
    return this.subscriptionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subscriptionsService.findOne(id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.subscriptionsService.cancel(id);
  }
}
