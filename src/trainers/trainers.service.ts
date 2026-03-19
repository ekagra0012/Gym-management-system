import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trainer } from './entities/trainer.entity';
import { CreateTrainerDto } from './dto/create-trainer.dto';

@Injectable()
export class TrainersService {
  constructor(
    @InjectRepository(Trainer)
    private readonly trainerRepository: Repository<Trainer>,
  ) {}

  async create(userId: string, createTrainerDto: CreateTrainerDto): Promise<Trainer> {
    const trainer = this.trainerRepository.create({
      ...createTrainerDto,
      userId,
    });
    return this.trainerRepository.save(trainer);
  }

  async findAll(): Promise<Trainer[]> {
    return this.trainerRepository.find({ relations: ['user'] });
  }

  async findOne(id: string): Promise<Trainer> {
    const trainer = await this.trainerRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${id} not found`);
    }
    return trainer;
  }

  async update(id: string, updateData: Partial<CreateTrainerDto>): Promise<Trainer> {
    await this.findOne(id);
    await this.trainerRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const trainer = await this.findOne(id);
    await this.trainerRepository.remove(trainer);
  }
}
