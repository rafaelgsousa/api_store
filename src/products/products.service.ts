import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { Product } from './products.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'express';
import { File } from 'multer';
import * as fs from 'fs';
import * as path from 'path';

interface ProductWithImagePaths extends Product {
  picturePaths: string[];
}

@Injectable()
export class ProductsService {
  constructor(
    // eslint-disable-next-line prettier/prettier
    @InjectModel(Product.name) private productModel: Model<Product>
  ) {}

  async create(body: any, file: any, res: Response) {
    let filepath: string;
    body.value = parseInt(body.value);

    if (file) {
      filepath = await this.saveImage(file);
    }

    const product = new this.productModel({
      ...body,
      picture: file ? [filepath] : [],
    });

    product.save();

    return res.status(HttpStatus.CREATED).json({ product: product });
  }

  async list(res: Response) {
    const list = await this.productModel.find().exec();
    const productsWithImagePaths: ProductWithImagePaths[] = list.map(
      (product) => {
        const productData = product.toJSON() as ProductWithImagePaths;
        if (product.picture && product.picture.length > 0) {
          productData.picturePaths = product.picture.map((filename) => {
            return `${process.env.BASE_URL}/${filename}`;
          });
        } else {
          productData.picturePaths = [];
        }
        return productData;
      },
    );
    return res.status(HttpStatus.OK).json({ products: productsWithImagePaths });
  }

  async retrieve(id: string, res: Response) {
    const product = await this.productModel.findOne({ _id: id }).exec();
    if (!product) {
      throw new NotFoundException('Product not found.');
    }
    const productData = product.toJSON() as ProductWithImagePaths;
    if (product.picture && product.picture.length > 0) {
      productData.picturePaths = product.picture.map((filename) => {
        return `${process.env.BASE_URL}/${filename}`;
      });
    } else {
      productData.picturePaths = [];
    }
    return res.status(HttpStatus.OK).json({ product: productData });
  }

  async partialUpdate(id: string, body: any, file: File, res: Response) {
    const product = await this.productModel.findById(id).exec();

    if (!product) {
      throw new NotFoundException('Sale not found.');
    }

    Object.assign(product, body);

    if (file) {
      await this.saveImage(file);
      if (product.picture) {
        this.deleteFile(product.picture[0]);
      }
      product.picture = [file.filename];
    }

    product.save();
    return res.status(HttpStatus.OK).json({ product });
  }

  remove(id: string, res: Response) {
    this.productModel.deleteOne({ id: id });
    return res.status(HttpStatus.NO_CONTENT).json();
  }

  async saveImage(file: File): Promise<string> {
    const uploadDir = 'uploads';

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, file.buffer);

    return filePath;
  }

  private async deleteFile(filename: string): Promise<void> {
    const filePath = path.join('uploads', filename);
    fs.unlinkSync(filePath);
  }

  serveImage(filename: string, res: Response) {
    let imagePath = path.join(__dirname, '..', 'uploads', filename);
    imagePath =
      process.env.NODE_ENV === 'production'
        ? imagePath
        : imagePath.replace('/dist', '');
    console.log(imagePath);
    if (fs.existsSync(imagePath)) {
      return res.sendFile(imagePath);
    } else {
      return res.status(404).send('Imagem não encontrada');
    }
  }
}
