import { IsString } from 'class-validator';

export class IdParamDTO {
  @IsString()
  readonly id: string;
}
