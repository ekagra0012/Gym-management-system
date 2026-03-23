import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1774197078279 implements MigrationInterface {
    name = 'InitialSchema1774197078279'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('OWNER', 'PT')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "passwordHash" character varying, "role" "public"."users_role_enum" NOT NULL DEFAULT 'PT', "refreshToken" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "exercises" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "workout_day_id" uuid NOT NULL, "name" character varying NOT NULL, "sets" integer, "reps" character varying, "order_index" integer NOT NULL DEFAULT '1', CONSTRAINT "PK_c4c46f5fa89a58ba7c2d894e3c3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "workout_days" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "workout_plan_id" uuid NOT NULL, "day_number" integer NOT NULL, "label" character varying, CONSTRAINT "PK_bc5724d5cb04625732f1bab0965" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "workout_plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "trainer_id" uuid NOT NULL, "name" character varying NOT NULL, "total_days" integer NOT NULL DEFAULT '1', "notes" text, "is_active" boolean NOT NULL DEFAULT true, "is_prebuilt" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9ae1bdd02db446a7541e2e5b161" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "clients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying, "phone" character varying, "trainerId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f1ab7cf3a5714dbc6bb4e1c28a4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "availability" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "trainer_id" uuid NOT NULL, "date" date NOT NULL, "start_time" character varying NOT NULL, "end_time" character varying NOT NULL, "session_name" character varying NOT NULL, "is_booked" character varying NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_05a8158cf1112294b1c86e7f1d3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "bookings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "client_id" uuid NOT NULL, "availability_id" uuid NOT NULL, "trainer_id" uuid NOT NULL, "status" character varying NOT NULL DEFAULT 'CONFIRMED', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "exercises" ADD CONSTRAINT "FK_af446695a3f98b2cc3bc3fe5bab" FOREIGN KEY ("workout_day_id") REFERENCES "workout_days"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workout_days" ADD CONSTRAINT "FK_0bf9441a5f06c3965b19b1d8e03" FOREIGN KEY ("workout_plan_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workout_plans" ADD CONSTRAINT "FK_1ec73ce1e3da6c59fa40f23c6eb" FOREIGN KEY ("trainer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "clients" ADD CONSTRAINT "FK_4cd3a4b00c6b01adde2f54bc021" FOREIGN KEY ("trainerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "availability" ADD CONSTRAINT "FK_03aa6bb74533e7cc730e2f79268" FOREIGN KEY ("trainer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_23096dca2f7a9d1505d0267d4c6" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_7c4a7fb9075e1411f3c20430a9c" FOREIGN KEY ("availability_id") REFERENCES "availability"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_2627d11ec25da695fefdc2a692b" FOREIGN KEY ("trainer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_2627d11ec25da695fefdc2a692b"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_7c4a7fb9075e1411f3c20430a9c"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_23096dca2f7a9d1505d0267d4c6"`);
        await queryRunner.query(`ALTER TABLE "availability" DROP CONSTRAINT "FK_03aa6bb74533e7cc730e2f79268"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP CONSTRAINT "FK_4cd3a4b00c6b01adde2f54bc021"`);
        await queryRunner.query(`ALTER TABLE "workout_plans" DROP CONSTRAINT "FK_1ec73ce1e3da6c59fa40f23c6eb"`);
        await queryRunner.query(`ALTER TABLE "workout_days" DROP CONSTRAINT "FK_0bf9441a5f06c3965b19b1d8e03"`);
        await queryRunner.query(`ALTER TABLE "exercises" DROP CONSTRAINT "FK_af446695a3f98b2cc3bc3fe5bab"`);
        await queryRunner.query(`DROP TABLE "bookings"`);
        await queryRunner.query(`DROP TABLE "availability"`);
        await queryRunner.query(`DROP TABLE "clients"`);
        await queryRunner.query(`DROP TABLE "workout_plans"`);
        await queryRunner.query(`DROP TABLE "workout_days"`);
        await queryRunner.query(`DROP TABLE "exercises"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
