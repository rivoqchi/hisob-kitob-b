import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ExpenseCategoryDocument = HydratedDocument<ExpenseCategory>;

@Schema({ timestamps: true, collection: 'expense_categories' })
export class ExpenseCategory {
  @Prop({ required: true, index: true, trim: true })
  userId!: string;

  @Prop({ required: true, trim: true })
  name!: string;
}

export const ExpenseCategorySchema =
  SchemaFactory.createForClass(ExpenseCategory);

ExpenseCategorySchema.index({ userId: 1, name: 1 }, { unique: true });
