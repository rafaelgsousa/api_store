import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Response,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { FileInterceptor } from '@nestjs/platform-express';
// import { diskStorage } from 'multer';
// import { extname } from 'path';
import { CreateProductDTO, UpdateProductDTO } from './dto/product-body.dto';
import { response } from 'express';

@Controller('product')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}
  @Get('list')
  list(@Response() res) {
    return this.productService.list(res);
  }

  @Get(':id')
  retrieve(@Param('id') id: number, @Response() res) {
    return this.productService.retrieve(id, res);
  }

  @Post('')
  @UseInterceptors(FileInterceptor('picture'))
  create(
    @Body() body: CreateProductDTO,
    @Response() res,
    @UploadedFile() file,
  ) {
    return this.productService.create(body, file, res);
  }

  @Patch(':id')
  remove(@Param('id') id, @Body() body: UpdateProductDTO) {
    return this.productService.partialUpdate(id, body, response);
  }

  @Delete(':id')
  partialUpdate(@Param('id') id, @Response() res) {
    return this.productService.remove(id, res);
  }
}
