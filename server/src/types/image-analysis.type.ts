import { ObjectType, Field } from "type-graphql";
import { SourceDocument } from "./qa-answer.type";

@ObjectType()
export class ImageAnalysis {
  @Field()
  answer: string;

  @Field()
  imageDescription: string;

  @Field()
  generatedAt: string;

  @Field(() => [SourceDocument])
  sources: SourceDocument[];

  @Field({ nullable: true })
  extractedText?: string;
}

@ObjectType()
export class ImageUploadResponse {
  @Field()
  success: boolean;

  @Field()
  imageUrl: string;

  @Field()
  filename: string;
} 