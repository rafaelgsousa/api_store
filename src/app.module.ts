import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { SalesModule } from './sales/sales.module';
import { MongooseModule } from '@nestjs/mongoose';
import { EnvModule } from './config/env.module';

const DB_URL =
  process.env.DB_URL_HOST_IP ||
  process.env.DB_URL ||
  'mongodb://localhost/Store_test';

console.log(`You are connected to the bank via url ${DB_URL}`);

const DbModuleMongoose = MongooseModule.forRoot(DB_URL, {
  directConnection: true,
  serverSelectionTimeoutMS: 3000,
});

@Module({
  imports: [EnvModule, DbModuleMongoose, ProductsModule, SalesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
