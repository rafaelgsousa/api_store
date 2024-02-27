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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  FileFieldsInterceptor,
  // FileInterceptor,
} from '@nestjs/platform-express';
import { CreateProductDTO, UpdateProductDTO } from './dto/product-body.dto';
import { IdParamDTO } from './dto/product-params.dto';

@Controller('product')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}
  @Post('')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'picture', maxCount: 5 },
      { name: 'cover', maxCount: 1 },
    ]),
  )
  create(
    @Body() body: CreateProductDTO,
    @Response() res,
    @UploadedFiles() file: { picture?: File[]; cover?: File },
  ) {
    return this.productService.create(body, file, res);
  }

  @Get('')
  list(@Response() res) {
    return this.productService.list(res);
  }

  @Get(':id')
  retrieve(@Param() id: IdParamDTO, @Response() res) {
    return this.productService.retrieve(id.id, res);
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'picture', maxCount: 5 },
      { name: 'cover', maxCount: 1 },
    ]),
  )
  partialUpdate(
    @Param() params: IdParamDTO,
    @Body() body: UpdateProductDTO,
    @UploadedFile() files: { picture?: File[]; cover?: File[] },
    @Response() response,
  ) {
    return this.productService.partialUpdate(params.id, body, files, response);
  }

  @Delete(':id')
  remove(@Param() params: IdParamDTO, @Response() res) {
    return this.productService.remove(params.id, res);
  }
}

@Controller('uploads')
export class UploadsController {
  constructor(private readonly productService: ProductsService) {}
  @Get(':filename')
  serveImage(@Param('filename') filename: string, @Response() res) {
    return this.productService.serveImage(filename, res);
  }
  @Delete(':id/picture/:filename')
  removePicture(
    @Param() params: { id: string; filename: string },
    @Response() response,
  ) {
    return this.productService.removePicture(
      params.id,
      params.filename,
      response,
    );
  }

  @Delete(':id/cover')
  removeCover(@Param() params: IdParamDTO, @Response() response) {
    return this.productService.removeCover(params.id, response);
  }
}
