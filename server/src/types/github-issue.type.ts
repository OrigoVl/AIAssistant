import { ObjectType, Field, ID } from 'type-graphql';

@ObjectType()
export class GitHubIssue {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  body: string;

  @Field()
  state: string;

  @Field()
  url: string;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;

  @Field(() => String, { nullable: true })
  assignee?: string;

  @Field(() => [String])
  labels: string[];
} 