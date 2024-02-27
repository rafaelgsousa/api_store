import { IsString, IsDefined, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateProductDTO {
  @IsDefined()
  @IsString()
  readonly name: string;

  @IsDefined()
  @IsString()
  readonly description: string;

  @IsDefined()
  @IsString()
  readonly value: string;

  @IsOptional()
  readonly picture?: Buffer;

  @IsOptional()
  readonly cover?: Buffer;
}

export class UpdateProductDTO extends PartialType(CreateProductDTO) {
  @IsString()
  readonly name: string;

  @IsString()
  readonly description: string;

  @IsString()
  readonly value: string;
}
