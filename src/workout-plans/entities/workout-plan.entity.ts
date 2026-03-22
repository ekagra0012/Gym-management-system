import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { WorkoutDay } from './workout-day.entity';

@Entity('workout_plans')
export class WorkoutPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, undefined, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trainer_id' })
  trainer: User;

  @Column({ name: 'trainer_id' })
  trainerId: string;

  @Column()
  name: string;

  @Column({ name: 'total_days', type: 'int', default: 1 })
  totalDays: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_prebuilt', default: false })
  isPrebuilt: boolean;

  @OneToMany(() => WorkoutDay, (day: WorkoutDay) => day.workoutPlan, {
    cascade: true,
  })
  days: WorkoutDay[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
