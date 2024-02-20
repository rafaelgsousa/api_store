import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { SalesModule } from './sales/sales.module';
import { MongooseModule } from '@nestjs/mongoose';

const DB_URL = process.env.DB_URL || 'mongodb://localhost/Store_test';

const DbModuleMongoose = MongooseModule.forRoot(DB_URL);

@Module({
  imports: [DbModuleMongoose, ProductsModule, SalesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
