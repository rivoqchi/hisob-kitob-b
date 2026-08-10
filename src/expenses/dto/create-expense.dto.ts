import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @MinLength(1)
  categoryId!: string;

  @IsOptional()
  @ValidateIf((o: CreateExpenseDto) => o.familyMemberId != null)
  @IsString()
  @MinLength(1)
  familyMemberId?: string | null;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;

  @IsOptional()
  @IsDateString()
  spentAt?: string;
}
