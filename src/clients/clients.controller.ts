import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new client record' })
  @ApiResponse({ status: 201, description: 'Client successfully created' })
  create(@CurrentUser() user: User, @Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(user, createClientDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all clients for the logged-in trainer' })
  @ApiResponse({ status: 200, description: 'Return array of clients' })
  findAll(@CurrentUser() user: User) {
    return this.clientsService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get client details' })
  @ApiResponse({ status: 200, description: 'Return single client' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.clientsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a client' })
  @ApiResponse({ status: 200, description: 'Client successfully updated' })
  update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
    @CurrentUser() user: User,
  ) {
    return this.clientsService.update(id, updateClientDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a client' })
  @ApiResponse({ status: 200, description: 'Client successfully deleted' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.clientsService.remove(id, user);
  }
}
