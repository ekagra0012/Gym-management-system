import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { CheckInDto } from './dto/check-in.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
  ) {}

  async checkIn(checkInDto: CheckInDto): Promise<Attendance> {
    const activeSession = await this.attendanceRepository.findOne({
      where: {
        memberId: checkInDto.memberId,
        checkOut: IsNull(),
      },
    });

    if (activeSession) {
      throw new ConflictException('Member is already checked in');
    }

    const attendance = this.attendanceRepository.create({
      memberId: checkInDto.memberId,
      checkIn: new Date(),
    });

    return this.attendanceRepository.save(attendance);
  }

  async checkOut(memberId: string): Promise<Attendance> {
    const activeSession = await this.attendanceRepository.findOne({
      where: {
        memberId,
        checkOut: IsNull(),
      },
    });

    if (!activeSession) {
      throw new NotFoundException('No active check-in session found for this member');
    }

    activeSession.checkOut = new Date();
    return this.attendanceRepository.save(activeSession);
  }

  async getAttendanceHistory(memberId?: string): Promise<Attendance[]> {
    const whereClause = memberId ? { memberId } : {};
    return this.attendanceRepository.find({
      where: whereClause,
      relations: ['member'],
      order: { checkIn: 'DESC' },
    });
  }
}
