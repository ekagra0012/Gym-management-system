import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Member } from '../../members/entities/member.entity';

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @Column({ name: 'member_id' })
  memberId: string;

  @Column({ type: 'timestamp', name: 'check_in' })
  checkIn: Date;

  @Column({ type: 'timestamp', name: 'check_out', nullable: true })
  checkOut: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
