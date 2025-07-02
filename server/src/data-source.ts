import "reflect-metadata";
import { DataSource } from "typeorm";
import { Document } from "./entities/document.entity";
import { SnakeNamingStrategy } from "./utils/snake-naming.strategy";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "admin",
  password: "password",
  database: "ai_assistant",
  synchronize: true,
  logging: true,
  entities: [Document],
  subscribers: [],
  migrations: [__dirname + "/migrations/*.ts"], // Додаємо шлях до міграцій
  migrationsRun: true, // Автоматичний запуск міграцій
  namingStrategy: new SnakeNamingStrategy(), // Для зіставлення camelCase <> snake_case
});