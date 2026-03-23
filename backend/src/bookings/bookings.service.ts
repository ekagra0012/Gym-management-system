import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Availability } from '../availability/entities/availability.entity';
import { Client } from '../clients/entities/client.entity';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(Availability)
    private readonly availabilityRepo: Repository<Availability>,
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createDto: CreateBookingDto, user: User) {
    if (user.role !== UserRole.PT && user.role !== UserRole.OWNER) {
      throw new ForbiddenException('Only trainers can book slots');
    }

    const client = await this.clientRepo.findOne({
      where: { id: createDto.clientId },
    });
    if (!client) throw new NotFoundException('Client not found');

    if (client.trainerId !== user.id && user.role !== UserRole.OWNER) {
      throw new ForbiddenException(
        'You can only book slots for your own clients',
      );
    }

    // Use explicit QueryRunner for pessimistic_write lock to prevent race conditions
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // pessimistic_write locks this row — any concurrent request will WAIT here
      // until this transaction commits or rolls back. Prevents double-booking.
      const slot = await queryRunner.manager.findOne(Availability, {
        where: { id: createDto.availabilityId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!slot) throw new NotFoundException('Slot not found');

      if (slot.trainerId !== user.id && user.role !== UserRole.OWNER) {
        throw new ForbiddenException(
          'You can only book your own availability slots',
        );
      }

      if (slot.status !== 'OPEN')
        throw new ConflictException('Slot is already booked');

      // Mark slot as booked
      slot.status = 'BOOKED';
      await queryRunner.manager.save(slot);

      // Create booking
      const booking = queryRunner.manager.create(Booking, {
        clientId: client.id,
        availabilityId: slot.id,
        trainerId: slot.trainerId,
        status: 'CONFIRMED',
      });
      const savedBooking = await queryRunner.manager.save(booking);

      await queryRunner.commitTransaction();
      return savedBooking;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(user: User) {
    if (user.role === UserRole.OWNER) {
      return this.bookingRepo.find({ relations: ['availability', 'client'] });
    }
    return this.bookingRepo.find({
      where: { trainerId: user.id },
      relations: ['availability', 'client'],
      order: { createdAt: 'DESC' },
    });
  }

  async cancel(id: string, user: User) {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: ['availability'],
    });

    if (!booking) throw new NotFoundException('Booking not found');

    if (booking.trainerId !== user.id && user.role !== UserRole.OWNER) {
      throw new ForbiddenException('You do not own this resource');
    }

    return this.bookingRepo.manager.transaction(async (manager) => {
      booking.status = 'CANCELLED';
      await manager.save(booking);

      if (booking.availability) {
        booking.availability.status = 'OPEN';
        await manager.save(booking.availability);
      }
      return booking;
    });
  }
}
