import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './entities/member.entity';
import { CreateMemberDto } from './dto/create-member.dto';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  async create(userId: string, createMemberDto: CreateMemberDto): Promise<Member> {
    const member = this.memberRepository.create({
      ...createMemberDto,
      userId,
    });
    return this.memberRepository.save(member);
  }

  async findAll(): Promise<Member[]> {
    return this.memberRepository.find({ relations: ['user'] });
  }

  async findOne(id: string): Promise<Member> {
    const member = await this.memberRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }
    return member;
  }

  async update(id: string, updateData: Partial<CreateMemberDto>): Promise<Member> {
    await this.findOne(id);
    await this.memberRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const member = await this.findOne(id);
    await this.memberRepository.remove(member);
  }
}
