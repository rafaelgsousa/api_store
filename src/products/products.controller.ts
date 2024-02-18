import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';

@Controller('product')
export class ProductsController {
  @Get('list')
  list(@Res() response) {
    return response.status(HttpStatus.OK).json({ message: 'All products' });
  }

  @Get(':id')
  retrieve(@Res() response, @Param('id') id: string) {
    return response
      .status(HttpStatus.OK)
      .json({ message: `This is the product ${id}` });
  }

  @Post('')
  create(@Res() response, @Body() body) {
    return response.status(HttpStatus.CREATED).json(body);
  }

  @Patch(':id')
  remove(@Res() response, @Param('id') id, @Body() body) {
    return response.status(HttpStatus.OK).json({
      sales: id,
      body,
    });
  }

  @Delete(':id')
  partialUpdate(@Res() response, @Param('id') id) {
    return response
      .status(HttpStatus.NO_CONTENT)
      .json(`Sales ${id} was removed`);
  }
}
