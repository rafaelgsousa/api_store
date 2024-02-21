import { Product } from 'src/products/products.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as S } from 'mongoose';

export type SaleDocument = HydratedDocument<Sale>;

@Schema()
export class Sale {
  @Prop({ type: [{ type: S.Types.ObjectId, ref: 'Product' }] })
  products: Product[];

  @Prop()
  total: number;

  @Prop()
  paymenteMethod: string;

  @Prop()
  client: string;
}

export const SaleSchema = SchemaFactory.createForClass(Sale);
