import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ExpenseDocument = HydratedDocument<Expense>;

@Schema({ timestamps: true, collection: 'expenses' })
export class Expense {
  @Prop({ required: true, index: true, trim: true })
  userId!: string;

  @Prop({ required: true, trim: true })
  categoryId!: string;

  @Prop({ required: true, trim: true })
  categoryName!: string;

  @Prop({ trim: true })
  familyMemberId?: string;

  @Prop({ trim: true })
  familyMemberName?: string;

  @Prop({ required: true, min: 0 })
  amount!: number;

  @Prop({ trim: true })
  comment?: string;

  /** Rasxod sanasi (kun filtrlari uchun). */
  @Prop({ required: true, index: true, type: Date })
  spentAt!: Date;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);

ExpenseSchema.index({ userId: 1, spentAt: -1 });
