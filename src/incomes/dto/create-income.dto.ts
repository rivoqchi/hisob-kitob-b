import { Type } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

export const INCOME_SOURCE_TYPES = [
  'maosh',
  'qoshimcha_maosh',
  'bonus',
  'boshqa',
  'custom',
] as const;

export type IncomeSourceTypeDto = (typeof INCOME_SOURCE_TYPES)[number];

export class CreateIncomeDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsIn(INCOME_SOURCE_TYPES)
  sourceType!: IncomeSourceTypeDto;

  @ValidateIf((o: CreateIncomeDto) => o.sourceType === 'custom')
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  sourceLabel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}
