import { IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateProductDTO {
  @IsString()
  readonly name: string;
  @IsString()
  readonly description: string;

  readonly picture?: Buffer;
  @IsString()
  readonly value: string;
}

export class UpdateProductDTO extends PartialType(CreateProductDTO) {}
