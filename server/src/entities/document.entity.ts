import { Entity, PrimaryGeneratedColumn, Column, Index, Unique } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";

@Entity()
@ObjectType()
@Index("search_vector_idx", { synchronize: false }) // Індекс для full-text search
@Unique(["source"]) // Add unique constraint for source column
export class Document {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column()
  @Field()
  title: string;

  @Column("text")
  @Field()
  content: string;

  @Column({ unique: true })
  @Field()
  source: string;

  @Field()
  @Column()
  type: string; // 'documentation' | 'issue'

  @Field()
  @Column()
  technology: string; // 'vue' | 'node' | 'typescript' | 'grapesjs'

  // Додаємо вектор для семантичного пошуку
  @Column("tsvector", { nullable: true, select: false })
  embedding: any;

  @Column({
    name: "created_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  @Field()
  createdAt: Date;
}
