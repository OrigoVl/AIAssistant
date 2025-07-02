import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFullTextSearch1751384973457 implements MigrationInterface {
    name = 'AddFullTextSearch1751384973457'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "document" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "content" text NOT NULL, "source" character varying NOT NULL, "search_vector" tsvector, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e57d3357f83f3cdc0acffc3d777" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "document"`);
    }

}
