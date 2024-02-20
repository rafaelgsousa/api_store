import { IsString, IsInt } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateProductDTO {
  @IsInt()
  readonly id: number;
  @IsString()
  readonly name: string;
  @IsString()
  readonly description: string;
  @IsString({ each: true })
  readonly picture: string[];
  @IsInt()
  readonly value: number;
}

export class UpdateProductDTO extends PartialType(CreateProductDTO) {}
