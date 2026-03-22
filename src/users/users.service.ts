import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async create(registerDto: RegisterDto, passwordHash: string): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const user = this.userRepository.create({
      email: registerDto.email,
      passwordHash,
      role: registerDto.role,
    });

    return this.userRepository.save(user);
  }

  async createOAuthUser(email: string, role: UserRole): Promise<User> {
    const user = this.userRepository.create({
      email,
      passwordHash: null,
      role,
    });
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(id);

    if (dto.email && dto.email !== user.email) {
      const existing = await this.findByEmail(dto.email);
      if (existing) {
        throw new ConflictException('Email already in use');
      }
      user.email = dto.email;
    }

    return this.userRepository.save(user);
  }

  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findById(id);

    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'Cannot change password for OAuth accounts',
      );
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await this.userRepository.save(user);
  }

  async deactivate(id: string): Promise<{ message: string }> {
    const user = await this.findById(id);
    // Soft-mark: append _DEACTIVATED suffix to email so slot is freed
    user.email = `${user.email}_DEACTIVATED_${Date.now()}`;
    await this.userRepository.save(user);
    return { message: 'User account deactivated successfully' };
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({ order: { createdAt: 'DESC' } });
  }
}
