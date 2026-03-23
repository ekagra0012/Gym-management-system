import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Availability } from './entities/availability.entity';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private readonly availabilityRepo: Repository<Availability>,
  ) {}

  async create(createDto: CreateAvailabilityDto, user: User) {
    if (user.role !== UserRole.PT && user.role !== UserRole.OWNER) {
      throw new ForbiddenException('Only trainers can set availability');
    }

    const { date, startTime, endTime, sessionName, isRepeat, repeatDates } =
      createDto;

    const datesToCreate = [date];

    if (isRepeat && repeatDates && repeatDates.length > 0) {
      datesToCreate.push(...repeatDates);
    }

    const createdSlots = [];

    // Loop logic to ensure transaction and conflict throwing natively
    for (const d of datesToCreate) {
      const existing = await this.availabilityRepo.findOne({
        where: { trainerId: user.id, date: d, startTime },
      });

      if (existing) {
        throw new ConflictException(
          `Slot already exists for ${d} at ${startTime}`,
        );
      }

      const slot = this.availabilityRepo.create({
        trainerId: user.id,
        date: d,
        startTime,
        endTime,
        sessionName,
        status: 'OPEN',
      });
      createdSlots.push(slot);
    }

    return this.availabilityRepo.save(createdSlots);
  }

  async findAll(user: User) {
    if (user.role === UserRole.OWNER) {
      return this.availabilityRepo.find({
        order: { date: 'ASC', startTime: 'ASC' },
      });
    }

    return this.availabilityRepo.find({
      where: { trainerId: user.id },
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }

  async remove(id: string, user: User) {
    const slot = await this.availabilityRepo.findOne({ where: { id } });
    if (!slot) throw new NotFoundException('Slot not found');

    if (slot.trainerId !== user.id && user.role !== UserRole.OWNER) {
      throw new ForbiddenException('Cannot delete slots of other trainers');
    }

    if (slot.status === 'BOOKED') {
      throw new ForbiddenException('Cannot delete an already booked slot');
    }

    await this.availabilityRepo.remove(slot);
  }
}
