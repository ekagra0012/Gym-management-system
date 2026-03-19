import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual, Between } from 'typeorm';
import { Member } from '../members/entities/member.entity';
import { Subscription, SubscriptionStatus } from '../subscriptions/entities/subscription.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { Attendance } from '../attendance/entities/attendance.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
  ) {}

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalMembers = await this.memberRepository.count({ where: { isActive: true } });
    
    const activeSubscriptions = await this.subscriptionRepository.count({
      where: { status: SubscriptionStatus.ACTIVE },
    });

    const revenueResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .getRawOne();

    const revenue = revenueResult ? parseFloat(revenueResult.total || '0') : 0;

    const attendanceToday = await this.attendanceRepository.count({
      where: {
        checkIn: MoreThanOrEqual(today),
      },
    });

    return {
      totalMembers,
      activeSubscriptions,
      revenue,
      attendanceToday,
    };
  }

  async getExpiringSubscriptions() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return this.subscriptionRepository.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: Between(today, nextWeek),
      },
      relations: ['member', 'plan'],
      order: { endDate: 'ASC' },
    });
  }
}
