import { Type } from 'class-transformer';
import {
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateCreditDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  bankName!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  principalAmount!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  paidAmount!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  monthlyPayment!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(600)
  termMonths!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  interestRatePercent!: number;
}
