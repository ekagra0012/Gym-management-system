import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutPlansController } from './workout-plans.controller';
import { WorkoutPlansService } from './workout-plans.service';
import { WorkoutPlan } from './entities/workout-plan.entity';
import { WorkoutDay } from './entities/workout-day.entity';
import { Exercise } from './entities/exercise.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkoutPlan, WorkoutDay, Exercise, User]),
  ],
  controllers: [WorkoutPlansController],
  providers: [WorkoutPlansService],
  exports: [WorkoutPlansService],
})
export class WorkoutPlansModule {}
