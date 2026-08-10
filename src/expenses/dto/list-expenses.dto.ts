import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class ListExpensesDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  q?: string;

  @IsOptional()
  @IsString()
  familyMemberId?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
