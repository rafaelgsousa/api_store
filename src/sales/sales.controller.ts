import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Response,
} from '@nestjs/common';
import { SalesService } from './sales.service';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}
  @Get('list')
  list(@Response() response) {
    return this.salesService.list(response);
  }

  @Get(':id')
  retrieve(@Response() response, @Param('id') id: string) {
    return this.salesService.retrieve(id, response);
  }

  @Post('')
  create(@Response() response, @Body() body) {
    return this.salesService.create(body, response);
  }

  @Patch(':id')
  remove(@Response() response, @Param('id') id, @Body() body) {
    return this.salesService.partialUpdate(id, body, response);
  }

  @Delete(':id')
  partialUpdate(@Response() response, @Param('id') id) {
    return this.salesService.remove(id, response);
  }
}
