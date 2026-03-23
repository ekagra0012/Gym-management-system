import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MaxWords } from '../../common/validators/max-words.validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExerciseDto {
  @ApiProperty({ example: 'Bench Press' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  sets?: number;

  @ApiPropertyOptional({ example: '8' })
  @IsOptional()
  @IsString()
  reps?: string;
}

export class CreateWorkoutDayDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  dayNumber: number;

  @ApiPropertyOptional({ example: 'Chest' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ type: [CreateExerciseDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExerciseDto)
  exercises?: CreateExerciseDto[];
}

export class CreateWorkoutPlanDto {
  @ApiProperty({ example: "Beginner's Workout - 3 Days" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 3 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  totalDays: number;

  @ApiPropertyOptional({
    example: 'Bench Press: www.benchpress.com \nEat Oats',
  })
  @IsOptional()
  @IsString()
  @MaxWords(50)
  notes?: string;

  @ApiPropertyOptional({ type: [CreateWorkoutDayDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkoutDayDto)
  days?: CreateWorkoutDayDto[];
}
