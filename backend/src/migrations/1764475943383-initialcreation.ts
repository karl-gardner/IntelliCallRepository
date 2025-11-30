import { MigrationInterface, QueryRunner } from "typeorm";

export class Initialcreation1764475943383 implements MigrationInterface {
    name = 'Initialcreation1764475943383'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "customers" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_133ec679a801fab5e070f73d3ea" DEFAULT NEWSEQUENTIALID(), "name" varchar(255) NOT NULL, "email" varchar(255) NOT NULL, "password" varchar(255), CONSTRAINT "UQ_8536b8b85c06969f84f0c098b03" UNIQUE ("email"), CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "customers"`);
    }

}
