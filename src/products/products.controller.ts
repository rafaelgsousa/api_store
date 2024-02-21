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
import { CreateProductDTO, UpdateProductDTO } from './dto/product-body.dto';
import { IdParamDTO } from './dto/product-params.dto';

@Controller('product')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}
  @Post('')
  @UseInterceptors(FileInterceptor('picture'))
  create(
    @Body() body: CreateProductDTO,
    @Response() res,
    @UploadedFile() file,
  ) {
    return this.productService.create(body, file, res);
  }

  @Get('')
  list(@Response() res) {
    return this.productService.list(res);
  }

  @Get(':id')
  retrieve(@Param() id: IdParamDTO, @Response() res) {
    console.log(`${id}`);
    return this.productService.retrieve(id.id, res);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('picture'))
  partialUpdate(
    @Param() id: IdParamDTO,
    @Body() body: UpdateProductDTO,
    @UploadedFile() file,
    @Response() response,
  ) {
    return this.productService.partialUpdate(id.id, body, file, response);
  }

  @Delete(':id')
  remove(@Param() id: IdParamDTO, @Response() res) {
    return this.productService.remove(id.id, res);
  }
}

@Controller('uploads')
export class UploadsController {
  constructor(private readonly productService: ProductsService) {}
  @Get(':filename')
  serveImage(@Param('filename') filename: string, @Response() res) {
    return this.productService.serveImage(filename,res);
  }
}
