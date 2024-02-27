import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema()
export class Product {
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop()
  picture: string[];

  @Prop()
  value: number;

  @Prop()
  cover: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
