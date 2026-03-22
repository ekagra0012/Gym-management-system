import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(user: User, createClientDto: CreateClientDto): Promise<Client> {
    const client = this.clientRepository.create({
      ...createClientDto,
      trainerId: user.id,
    });
    return this.clientRepository.save(client);
  }

  async findAll(user: User): Promise<Client[]> {
    if (user.role === UserRole.OWNER) {
      return this.clientRepository.find();
    }
    return this.clientRepository.find({ where: { trainerId: user.id } });
  }

  async findOne(id: string, user: User): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { id } });
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    if (client.trainerId !== user.id && user.role !== UserRole.OWNER) {
      throw new ForbiddenException('You do not own this resource');
    }
    return client;
  }

  async update(
    id: string,
    updateClientDto: UpdateClientDto,
    user: User,
  ): Promise<Client> {
    const client = await this.findOne(id, user);
    await this.clientRepository.update(id, updateClientDto);
    return this.findOne(id, user);
  }

  async remove(id: string, user: User): Promise<void> {
    const client = await this.findOne(id, user);
    await this.clientRepository.remove(client);
  }
}
