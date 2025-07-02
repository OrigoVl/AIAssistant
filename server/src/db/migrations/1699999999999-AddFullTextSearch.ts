import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFullTextSearch1699999999999 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- Додаємо GIN індекс для швидкого пошуку
      CREATE INDEX document_search_vector_idx ON document USING gin(search_vector);
      
      -- Створюємо тригер для автоматичного оновлення search_vector
      CREATE OR REPLACE FUNCTION update_document_search_vector() RETURNS trigger AS $$
      BEGIN
        NEW.search_vector := 
          to_tsvector('english', COALESCE(NEW.title, '')) || 
          to_tsvector('english', COALESCE(NEW.content, ''));
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER document_search_vector_update
      BEFORE INSERT OR UPDATE ON document
      FOR EACH ROW EXECUTE FUNCTION update_document_search_vector();
      
      -- Оновлюємо існуючі записи
      UPDATE document SET id = id;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS document_search_vector_update ON document;
      DROP FUNCTION IF EXISTS update_document_search_vector;
      DROP INDEX IF EXISTS document_search_vector_idx;
    `);
  }
}
