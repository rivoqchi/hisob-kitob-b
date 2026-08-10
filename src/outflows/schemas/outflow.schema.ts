import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OutflowDocument = HydratedDocument<Outflow>;

export type OutflowKind = 'credit_payment' | 'expense';

@Schema({ timestamps: true, collection: 'outflows' })
export class Outflow {
  @Prop({ required: true, index: true, trim: true })
  userId!: string;

  @Prop({ required: true, min: 0 })
  amount!: number;

  @Prop({
    required: true,
    enum: ['credit_payment', 'expense'],
    default: 'credit_payment',
  })
  kind!: OutflowKind;

  @Prop({ trim: true })
  creditId?: string;

  @Prop({ trim: true })
  expenseId?: string;

  /** Ko‘rsatish uchun: bank nomi va h.k. */
  @Prop({ required: true, trim: true })
  label!: string;
}

export const OutflowSchema = SchemaFactory.createForClass(Outflow);
