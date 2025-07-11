import { Field, ObjectType } from "type-graphql";
import { Document } from "../entities/document.entity";

@ObjectType()
export class SourceDocument {
  @Field()
  content: string;

  @Field()
  source: string;

  @Field()
  score: number;
}

@ObjectType()
export class QAAnswer {
  @Field()
  answer: string;

  @Field(() => [SourceDocument])
  sources: SourceDocument[];

  @Field()
  generatedAt: string;

  // Додаємо поля валідації
  @Field({ nullable: true })
  warning?: string;

  @Field()
  isTechnical: boolean;

  @Field(() => [String], { nullable: true })
  suggestions?: string[];
}
