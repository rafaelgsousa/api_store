import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    try {
      const { picture, cover } = files;
      const picturePaths = await this.saveImage(picture);
      const coverPath = cover ? await this.saveImage(cover[0]) : '';

      const productData = {
        ...body,
        picture: picturePaths,
        cover: coverPath,
      };

      const product = await this.productModel.create(productData);

      return res.status(HttpStatus.CREATED).json({ product });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: 'Erro ao criar o produto' });
    }
  }

  async list(res: Response) {
    try {
      const products = await this.productModel.find().exec();
      return res.status(HttpStatus.OK).json({ products });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: 'Error listing products' });
    }
  }

  async retrieve(id: string, res: Response) {
    try {
      const product = await this.productModel.findById(id).exec();
      if (!product) {
        throw new NotFoundException('Product not found.');
      }
      return res.status(HttpStatus.OK).json({ product });
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: error.message });
      } else {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ error: 'Error retrieving product' });
      }
    }
  }

  async partialUpdate(
    id: string,
    body: any,
    files: { picture?: File[]; cover?: File },
    res: Response,
  ) {
    try {
      const { picture, cover } = files;
      const product = await this.productModel.findById(id).exec();

      if (!product) {
        throw new NotFoundException('Product not found.');
      }

      if (picture) {
        const picturePaths = await this.saveImage(picture);
        if (product.picture.length + picturePaths.length > 8) {
          throw new BadRequestException(
            'The product already has the maximum number of linked images. Delete one to add another.',
          );
        }
        product.picture.push(...picturePaths);
      }

      if (cover) {
        const coverPath = await this.saveImage(cover);
        product.cover = coverPath;
      }

      Object.assign(product, body);

      await product.save();

      return res.status(HttpStatus.OK).json({ product });
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: error.message });
      } else if (error instanceof BadRequestException) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ error: error.message });
      } else {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ error: 'Erro ao atualizar o produto' });
      }
    }
  }

  async remove(id: string, res: Response) {
    try {
      const product = await this.productModel.findById(id).exec();
      if (!product) {
        throw new NotFoundException('Product not found.');
      }

      if (product.picture && product.picture.length > 0) {
        await Promise.all(
          product.picture.map((filename) => this.deleteFile(filename)),
        );
      }

      if (product.cover) {
        await this.deleteFile(product.cover);
      }

      await this.productModel.deleteOne({ _id: id }).exec();

      return res.status(HttpStatus.NO_CONTENT).json();
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: error.message });
      } else {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ error: 'Error deleting product' });
      }
    }
  }

  async saveImage(file: File): Promise<string> {
    const uploadDir = 'uploads';
    const filename = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadDir, filename);

    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      fs.writeFileSync(filePath, file.buffer);

      return filename;
    } catch (error) {
      throw new Error(`Error saving image: ${error}`);
    }
  }

  private async deleteFile(filename: string): Promise<void> {
    const filePath = path.join('uploads', filename);
    try {
      fs.unlinkSync(filePath);
      console.log(`File ${filePath} deleted successfully.`);
    } catch (error) {
      console.error(`Error when deleting file ${filePath}: ${error}`);
      throw new Error(`Error when deleting file ${filePath}`);
    }
  }

  serveImage(filename: string, res: Response) {
    try {
      const uploadDir = path.join(__dirname, '..', 'uploads');
      const imagePath = path.join(uploadDir, filename);

      if (!fs.existsSync(imagePath)) {
        return res.status(404).send('Image not found');
      }

      return res.sendFile(imagePath);
    } catch (error) {
      console.error('Error serving image:', error);
      return res.status(500).send('Error processing the request');
    }
  }

  async removePicture(id: string, filename: string, response: Response) {
    try {
      const product = await this.productModel.findById(id).exec();
      if (!product) {
        throw new NotFoundException('Product not found.');
      }
      const index = product.picture.indexOf(filename);

      if (index !== -1) {
        product.picture.splice(index, 1);
        await product.save();
        await this.deleteFile(filename);
        return response.status(204).send();
      } else {
        throw new NotFoundException('Image not found on product.');
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        return response
          .status(HttpStatus.NOT_FOUND)
          .json({ error: error.message });
      } else {
        return response
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ error: 'Error removing product image' });
      }
    }
  }

  async removeCover(id: string, response: Response) {
    try {
      const product = await this.productModel.findById(id).exec();
      if (!product) {
        throw new NotFoundException('Product not found.');
      }

      if (product.cover) {
        await this.deleteFile(product.cover);
        product.cover = '';
        await product.save();
      }

      return response.status(204).send();
    } catch (error) {
      if (error instanceof NotFoundException) {
        return response
          .status(HttpStatus.NOT_FOUND)
          .json({ error: error.message });
      } else {
        return response
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ error: 'Error removing product cover' });
      }
    }
  }
}
