import { Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

/** Kreditga qo‘shiladigan yangi to‘lov summasi (to‘plangan puldan ayiriladi). */
export class UpdatePaidDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  paymentAmount!: number;
}
