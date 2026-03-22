import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutPlan } from './entities/workout-plan.entity';
import { WorkoutDay } from './entities/workout-day.entity';
import { Exercise } from './entities/exercise.entity';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class WorkoutPlansService {
  constructor(
    @InjectRepository(WorkoutPlan)
    private readonly planRepository: Repository<WorkoutPlan>,
  ) {}

  async create(createDto: CreateWorkoutPlanDto, user: User) {
    if (user.role !== UserRole.PT && user.role !== UserRole.OWNER) {
      throw new ForbiddenException('Only trainers can create workout plans');
    }

    const plan = this.planRepository.create({
      name: createDto.name,
      notes: createDto.notes,
      totalDays: createDto.totalDays,
      trainerId: user.id,
      days:
        createDto.days?.map((dayDto) => ({
          dayNumber: dayDto.dayNumber,
          label: dayDto.label,
          exercises:
            dayDto.exercises?.map((ex, index) => ({
              name: ex.name,
              sets: ex.sets,
              reps: ex.reps,
              orderIndex: index,
            })) || [],
        })) || [],
    });

    return this.planRepository.save(plan);
  }

  async findAll(user: User) {
    if (user.role === UserRole.OWNER) {
      return this.planRepository.find({
        where: { isActive: true },
        order: { createdAt: 'DESC' },
      });
    }

    return this.planRepository.find({
      where: [
        { trainerId: user.id, isActive: true },
        { isPrebuilt: true, isActive: true }, // Let trainers see prebuilt templates
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, user: User) {
    const plan = await this.planRepository.findOne({
      where: { id, isActive: true },
      relations: ['days', 'days.exercises'],
    });

    if (!plan) throw new NotFoundException('Workout plan not found');
    if (
      plan.trainerId !== user.id &&
      user.role !== UserRole.OWNER &&
      !plan.isPrebuilt
    ) {
      throw new ForbiddenException('You can only view your own workout plans');
    }

    // Sort days and exercises
    if (plan.days) {
      plan.days.sort(
        (a: WorkoutDay, b: WorkoutDay) => a.dayNumber - b.dayNumber,
      );
      plan.days.forEach((day) => {
        if (day.exercises) {
          day.exercises.sort(
            (a: Exercise, b: Exercise) => a.orderIndex - b.orderIndex,
          );
        }
      });
    }

    return plan;
  }

  async remove(id: string, user: User) {
    const plan = await this.planRepository.findOne({ where: { id } });

    if (!plan) throw new NotFoundException('Workout plan not found');
    if (plan.trainerId !== user.id && user.role !== UserRole.OWNER) {
      throw new ForbiddenException(
        'You can only delete your own workout plans',
      );
    }
    if (plan.isPrebuilt && user.role !== UserRole.OWNER) {
      throw new ForbiddenException('Only owners can delete prebuilt plans');
    }

    await this.planRepository.remove(plan);
  }
}
