import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { Product } from './products.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'express';

@Injectable()
export class ProductsService {
  constructor(
    // eslint-disable-next-line prettier/prettier
    @InjectModel(Product.name) private productModel: Model<Product>
  ) {}

  list(res: Response) {
    const list = this.productModel.find().exec();

    return res.status(HttpStatus.OK).json({ products: list });
  }

  retrieve(id: number, res: Response) {
    const product = this.productModel.findOne({ id }).exec();
    return res.status(HttpStatus.OK).json({ product: product });
  }

  create(body: any, file: any, res: Response) {
    body.picture = file.path;
    const product = this.productModel.create(body);
    return res.status(HttpStatus.CREATED).json({ product: product });
  }

  async partialUpdate(id: number, body: any, res: Response) {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Venda não encontrada.');
    }
    for (const key in body) {
      if (Object.prototype.hasOwnProperty.call(product, key)) {
        product[key] = body[key];
      }
    }

    product.save();
    return res.status(HttpStatus.OK).json({ product });
  }

  remove(id: number, res: Response) {
    this.productModel.deleteOne({ id: id });
    return res.status(HttpStatus.NO_CONTENT).json();
  }
}
