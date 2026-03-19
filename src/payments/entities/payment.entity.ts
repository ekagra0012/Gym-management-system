import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Member } from '../../members/entities/member.entity';
import { Subscription } from '../../subscriptions/entities/subscription.entity';

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  UPI = 'upi',
  BANK_TRANSFER = 'bank_transfer',
}

export enum PaymentStatus {
  COMPLETED = 'completed',
  PENDING = 'pending',
  FAILED = 'failed',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @Column({ name: 'member_id' })
  memberId: string;

  @ManyToOne(() => Subscription)
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;

  @Column({ name: 'subscription_id' })
  subscriptionId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: PaymentMethod })
  method: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'timestamp', name: 'payment_date', default: () => 'CURRENT_TIMESTAMP' })
  paymentDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
