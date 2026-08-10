import { IsString, Matches } from 'class-validator';

export class VerifyCodeDto {
  @IsString()
  @Matches(/^[\d+\s-]{9,20}$/, {
    message: 'phone must be a valid Uzbekistan mobile number',
  })
  phone!: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'code must be a 6-digit number' })
  code!: string;
}
