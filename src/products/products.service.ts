import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { Product } from './products.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'express';
import { File } from 'multer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProductsService {
  constructor(
    // eslint-disable-next-line prettier/prettier
    @InjectModel(Product.name) private productModel: Model<Product>
  ) {}

  async create(
    body: any,
    files: { picture?: File[]; cover?: File },
    res: Response,
  ) {
    const { picture, cover } = files;
    const picturePaths = await Promise.all(
      (picture || []).map((file) => this.saveImage(file)),
    );
    const coverPath = cover ? await this.saveImage(cover[0]) : '';
    const product = new this.productModel({
      ...body,
      picture: picturePaths,
      cover: coverPath,
    });
    await product.save();

    return res.status(HttpStatus.CREATED).json({ product });
  }

  async list(res: Response) {
    const products = await this.productModel.find().exec();
    return res.status(HttpStatus.OK).json({ products });
  }

  async retrieve(id: string, res: Response) {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found.');
    }
    return res.status(HttpStatus.OK).json({ product });
  }

  async partialUpdate(
    id: string,
    body: any,
    files: { picture?: File[]; cover?: File },
    res: Response,
  ) {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Produto não encontrado.');
    }

    if (files.picture) {
      const picturePaths = await Promise.all(
        (files.picture || []).map((file) => this.saveImage(file)),
      );
      product.picture = picturePaths;
    }

    if (files.cover) {
      const coverPath = await this.saveImage(files.cover[0]);
      product.cover = coverPath;
    }

    Object.assign(product, body);

    await product.save();
    return res.status(HttpStatus.OK).json({ product });
  }

  async remove(id: string, res: Response) {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    if (product.picture && product.picture.length > 0) {
      for (const filename of product.picture) {
        this.deleteFile(filename);
      }
    }
    if (product.cover) {
      this.deleteFile(product.cover);
    }

    await this.productModel.deleteOne({ _id: id }).exec();

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

  async removePicture(id: string, filename: string, response: Response) {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Produto não encontrado.');
    }
    const index = product.picture.indexOf(filename);
    if (index !== -1) {
      product.picture.splice(index, 1);
      await product.save();
      this.deleteFile(filename);
      return response.status(204).send();
    } else {
      throw new NotFoundException('Imagem não encontrada no produto.');
    }
  }

  async removeCover(id: string, response: Response) {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Produto não encontrado.');
    }
    if (product.cover) {
      this.deleteFile(product.cover);
      product.cover = '';
      await product.save();
    }
    return response.status(204).send();
  }
}
