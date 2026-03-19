import { IsUUID, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({ example: 'uuid-of-member' })
  @IsUUID()
  @IsNotEmpty()
  memberId: string;

  @ApiProperty({ example: 'uuid-of-plan' })
  @IsUUID()
  @IsNotEmpty()
  planId: string;

  @ApiProperty({ example: '2026-03-20' })
  @IsString()
  @IsNotEmpty()
  startDate: string;
}
