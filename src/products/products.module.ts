import { Module } from '@nestjs/common';
import { ProductsController, UploadsController } from './products.controller';
import { ProductsService } from './products.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductSchema } from './products.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
  ],
  controllers: [ProductsController, UploadsController],
  providers: [ProductsService],
})
export class ProductsModule {}
