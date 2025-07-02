import { Field, Int, ObjectType } from "type-graphql";
import { Document } from "../entities/document.entity";

@ObjectType()
export class SearchResult {
  @Field(() => [Document])
  items: Document[];

  @Field(() => Int)
  total: number;

  constructor(items: Document[], total: number) {
    this.items = items;
    this.total = total;
  }
}