import { IsUUID, IsNotEmpty, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from '../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ example: 'uuid-of-member' })
  @IsUUID()
  @IsNotEmpty()
  memberId: string;

  @ApiProperty({ example: 'uuid-of-subscription' })
  @IsUUID()
  @IsNotEmpty()
  subscriptionId: string;

  @ApiProperty({ example: 49.99 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CARD })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiPropertyOptional({ enum: PaymentStatus, default: PaymentStatus.COMPLETED })
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
}
