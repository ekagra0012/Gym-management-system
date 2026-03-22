import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { Availability } from '../../availability/entities/availability.entity';
import { User } from '../../users/entities/user.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Client, undefined, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ name: 'client_id' })
  clientId: string;

  @ManyToOne(() => Availability, undefined, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'availability_id' })
  availability: Availability;

  @Column({ name: 'availability_id' })
  availabilityId: string;

  @Column({ name: 'trainer_id' })
  trainerId: string;

  @ManyToOne(() => User, undefined, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trainer_id' })
  trainer: User;

  @Column({ default: 'CONFIRMED' })
  status: string; // CONFIRMED, CANCELLED

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
