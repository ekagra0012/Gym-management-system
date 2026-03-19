import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionStatus } from './entities/subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { MembershipPlansService } from '../membership-plans/membership-plans.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly membershipPlansService: MembershipPlansService,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    const plan = await this.membershipPlansService.findOne(createSubscriptionDto.planId);
    
    // Calculate end date based on plan duration
    const startDate = new Date(createSubscriptionDto.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + plan.durationDays);

    const subscription = this.subscriptionRepository.create({
      memberId: createSubscriptionDto.memberId,
      planId: createSubscriptionDto.planId,
      startDate,
      endDate,
      status: SubscriptionStatus.ACTIVE,
    });

    return this.subscriptionRepository.save(subscription);
  }

  async findAll(): Promise<Subscription[]> {
    return this.subscriptionRepository.find({ relations: ['member', 'plan'] });
  }

  async findOne(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
      relations: ['member', 'plan'],
    });
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
    return subscription;
  }

  async cancel(id: string): Promise<Subscription> {
    const subscription = await this.findOne(id);
    subscription.status = SubscriptionStatus.CANCELLED;
    return this.subscriptionRepository.save(subscription);
  }
}
