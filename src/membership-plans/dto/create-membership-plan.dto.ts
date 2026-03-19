import { IsString, IsOptional, IsBoolean, IsNumber, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMembershipPlanDto {
  @ApiProperty({ example: 'Monthly Premium' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Full access to all facilities' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 49.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 30 })
  @IsInt()
  @Min(1)
  durationDays: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
