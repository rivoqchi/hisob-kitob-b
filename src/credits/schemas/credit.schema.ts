import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CreditDocument = HydratedDocument<Credit>;

@Schema({ timestamps: true, collection: 'credits' })
export class Credit {
  @Prop({ required: true, index: true, trim: true })
  userId!: string;

  @Prop({ required: true, trim: true })
  bankName!: string;

  /** Kredit summasi (so‘m). */
  @Prop({ required: true, min: 0 })
  principalAmount!: number;

  /** Joriy to‘langan summa (so‘m). */
  @Prop({ required: true, min: 0, default: 0 })
  paidAmount!: number;

  /** Oylik to‘lov (so‘m). */
  @Prop({ required: true, min: 0 })
  monthlyPayment!: number;

  /** Necha oy to‘lanadi. */
  @Prop({ required: true, min: 1 })
  termMonths!: number;

  /** Yillik foiz (%). */
  @Prop({ required: true, min: 0, max: 100 })
  interestRatePercent!: number;
}

export const CreditSchema = SchemaFactory.createForClass(Credit);
