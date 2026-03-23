import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsArray,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAvailabilityDto {
  @ApiProperty({ example: '2026-03-25' })
  @IsNotEmpty()
  @IsString()
  date: string;

  @ApiProperty({ example: '11:30' })
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @ApiProperty({ example: '11:45' })
  @IsNotEmpty()
  @IsString()
  endTime: string;

  @ApiProperty({ example: 'PT' })
  @IsNotEmpty()
  @IsString()
  sessionName: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isRepeat?: boolean;

  @ApiProperty({ example: ['2026-03-26', '2026-03-27'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  repeatDates?: string[];
}
