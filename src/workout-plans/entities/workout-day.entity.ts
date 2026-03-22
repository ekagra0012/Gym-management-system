import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { WorkoutPlan } from './workout-plan.entity';
import { Exercise } from './exercise.entity';

@Entity('workout_days')
export class WorkoutDay {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => WorkoutPlan, (plan) => plan.days, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workout_plan_id' })
  workoutPlan: WorkoutPlan;

  @Column({ name: 'workout_plan_id' })
  workoutPlanId: string;

  @Column({ name: 'day_number' })
  dayNumber: number;

  @Column({ nullable: true })
  label: string;

  @OneToMany(() => Exercise, (exercise: Exercise) => exercise.workoutDay, {
    cascade: true,
  })
  exercises: Exercise[];
}
