import { IsString, Matches } from 'class-validator';

export class RequestCodeDto {
  /**
   * E.164 yoki milliy format: +998901234567 / 901234567.
   * Service normalize qiladi.
   */
  @IsString()
  @Matches(/^[\d+\s-]{9,20}$/, {
    message: 'phone must be a valid Uzbekistan mobile number',
  })
  phone!: string;
}
