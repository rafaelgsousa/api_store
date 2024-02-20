import { Injectable, NotFoundException, HttpStatus } from '@nestjs/common';
import { Sale } from './sales.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'express';

@Injectable()
export class SalesService {
  constructor(@InjectModel(Sale.name) private saleModel: Model<Sale>) {}
  async list(res: Response) {
    const sales = this.saleModel.find().exec();

    return res.status(HttpStatus.OK).json({ sales });
  }

  async retrieve(id: string, res: Response) {
    const sale = this.saleModel.findById(id).exec();
    return res.status(HttpStatus.OK).json({ sale });
  }

  async create(body: any, res: Response) {
    const sale = this.saleModel.create(body);
    return res.status(HttpStatus.CREATED).json({ sale });
  }

  async partialUpdate(id: string, body: any, res: Response) {
    const sale = await this.saleModel.findById(id).exec();
    if (!sale) {
      throw new NotFoundException('Venda não encontrada.');
    }

    for (const key in body) {
      if (Object.prototype.hasOwnProperty.call(sale, key)) {
        sale[key] = body[key];
      }
    }

    sale.save();
    return res.status(HttpStatus.OK).json({ sale });
  }

  async remove(id: string, res: Response) {
    await this.saleModel.deleteOne({ _id: id }).exec();
    return res.status(HttpStatus.NO_CONTENT).json();
  }
}
