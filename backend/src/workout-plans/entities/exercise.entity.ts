import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WorkoutDay } from './workout-day.entity';

@Entity('exercises')
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => WorkoutDay, (day) => day.exercises, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workout_day_id' })
  workoutDay: WorkoutDay;

  @Column({ name: 'workout_day_id' })
  workoutDayId: string;

  @Column()
  name: string;

  @Column({ type: 'int', nullable: true })
  sets: number;

  @Column({ type: 'varchar', nullable: true })
  reps: string;

  @Column({ name: 'order_index', default: 1 })
  orderIndex: number;
}
