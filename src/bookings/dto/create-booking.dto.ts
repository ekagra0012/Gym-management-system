import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ example: 'uuid-of-availability-slot' })
  @IsNotEmpty()
  @IsUUID()
  availabilityId: string;

  @ApiProperty({ example: 'uuid-of-client' })
  @IsNotEmpty()
  @IsUUID()
  clientId: string;
}
