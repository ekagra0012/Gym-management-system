import * as crypto from 'crypto';
if (!globalThis.crypto) {
  Object.assign(globalThis, { crypto: { randomUUID: crypto.randomUUID } });
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { WorkoutPlan } from '../workout-plans/entities/workout-plan.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';

async function bootstrap() {
  console.log('🌱 Starting database seed for Beginner prebuilt plans...');
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const planRepo: Repository<WorkoutPlan> = app.get(
    getRepositoryToken(WorkoutPlan),
  );

  // 1. Ensure system OWNER exists to own the prebuilt plans
  let user = await usersService.findByEmail('system@owner.com');
  if (!user) {
    user = await usersService.createOAuthUser(
      'system@owner.com',
      UserRole.OWNER,
    );
  }

  // 2. Check if predefined plans already exist
  const existingPlan1 = await planRepo.findOne({
    where: { name: "Beginner's Workout - 3 Days", isPrebuilt: true },
  });

  if (!existingPlan1) {
    console.log('📝 Inserting prebuilt workout plans...');

    const plan1 = planRepo.create({
      name: "Beginner's Workout - 3 Days",
      totalDays: 3,
      notes:
        'A great starter plan focusing on compound movements to build foundational strength.',
      trainerId: user.id,
      isPrebuilt: true,
      days: [
        {
          dayNumber: 1,
          label: 'Chest & Triceps',
          exercises: [{ name: 'Bench Press', sets: 3, reps: '10' }],
        },
        {
          dayNumber: 2,
          label: 'Back & Biceps',
          exercises: [{ name: 'Lat Pulldown', sets: 3, reps: '10' }],
        },
        {
          dayNumber: 3,
          label: 'Legs & Shoulders',
          exercises: [{ name: 'Squats', sets: 3, reps: '10' }],
        },
      ],
    });
    await planRepo.save(plan1);

    const plan2 = planRepo.create({
      name: "Beginner's Full Body - 1 Day",
      totalDays: 1,
      notes: 'A quick full body blast targeting all major muscle groups.',
      trainerId: user.id,
      isPrebuilt: true,
      days: [
        {
          dayNumber: 1,
          label: 'Full Body',
          exercises: [
            { name: 'Squats', sets: 3, reps: '10' },
            { name: 'Pushups', sets: 3, reps: 'Failure' },
          ],
        },
      ],
    });
    await planRepo.save(plan2);

    console.log('✅ Seed completed: Beginner plans added successfully.');
  } else {
    console.log(
      'ℹ️ Seed skipped: Prebuilt plans already exist in the database.',
    );
  }

  await app.close();
}
bootstrap();
