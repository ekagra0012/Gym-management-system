import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MembershipPlan } from './entities/membership-plan.entity';
import { CreateMembershipPlanDto } from './dto/create-membership-plan.dto';

@Injectable()
export class MembershipPlansService {
  constructor(
    @InjectRepository(MembershipPlan)
    private readonly planRepository: Repository<MembershipPlan>,
  ) {}

  async create(createMembershipPlanDto: CreateMembershipPlanDto): Promise<MembershipPlan> {
    const plan = this.planRepository.create(createMembershipPlanDto);
    return this.planRepository.save(plan);
  }

  async findAll(): Promise<MembershipPlan[]> {
    return this.planRepository.find();
  }

  async findOne(id: string): Promise<MembershipPlan> {
    const plan = await this.planRepository.findOne({ where: { id } });
    if (!plan) {
      throw new NotFoundException(`Membership Plan with ID ${id} not found`);
    }
    return plan;
  }

  async update(id: string, updateData: Partial<CreateMembershipPlanDto>): Promise<MembershipPlan> {
    await this.findOne(id);
    await this.planRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const plan = await this.findOne(id);
    await this.planRepository.remove(plan);
  }
}
