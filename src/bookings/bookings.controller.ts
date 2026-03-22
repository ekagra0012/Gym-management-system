import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @Roles(UserRole.PT, UserRole.OWNER)
  @ApiOperation({ summary: 'Book an available trainer slot for a client' })
  @ApiResponse({ status: 201, description: 'Slot successfully booked' })
  create(@Body() createDto: CreateBookingDto, @CurrentUser() user: User) {
    return this.bookingsService.create(createDto, user);
  }

  @Get()
  @Roles(UserRole.PT, UserRole.OWNER)
  @ApiOperation({ summary: 'View all your bookings' })
  findAll(@CurrentUser() user: User) {
    return this.bookingsService.findAll(user);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.PT, UserRole.OWNER)
  @ApiOperation({ summary: 'Cancel a booking and reopen the slot' })
  @ApiResponse({ status: 200, description: 'Booking successfully cancelled' })
  cancel(@Param('id') id: string, @CurrentUser() user: User) {
    return this.bookingsService.cancel(id, user);
  }
}
