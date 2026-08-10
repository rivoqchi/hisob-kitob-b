import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateExpensePlanDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsDateString()
  plannedAt!: string;
}
