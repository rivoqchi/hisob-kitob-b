import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type IncomeSourceType =
  | 'maosh'
  | 'qoshimcha_maosh'
  | 'bonus'
  | 'boshqa'
  | 'custom';

export type IncomeDocument = HydratedDocument<Income>;

@Schema({ timestamps: true, collection: 'incomes' })
export class Income {
  @Prop({ required: true, index: true, trim: true })
  userId!: string;

  /** Kirim summasi (so‘m). */
  @Prop({ required: true, min: 0 })
  amount!: number;

  @Prop({
    required: true,
    enum: ['maosh', 'qoshimcha_maosh', 'bonus', 'boshqa', 'custom'],
  })
  sourceType!: IncomeSourceType;

  /** custom manba uchun foydalanuvchi yozgan nom. */
  @Prop({ trim: true })
  sourceLabel?: string;

  /** boshqa (va ixtiyoriy boshqa manbalar) uchun izoh. */
  @Prop({ trim: true })
  comment?: string;
}

export const IncomeSchema = SchemaFactory.createForClass(Income);
