import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ExpensePlanDocument = HydratedDocument<ExpensePlan>;

@Schema({ timestamps: true, collection: 'expense_plans' })
export class ExpensePlan {
  @Prop({ required: true, index: true, trim: true })
  userId!: string;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, min: 0 })
  amount!: number;

  /** Rejalashtirilgan rasxod sanasi. */
  @Prop({ required: true, index: true, type: Date })
  plannedAt!: Date;
}

export const ExpensePlanSchema = SchemaFactory.createForClass(ExpensePlan);

ExpensePlanSchema.index({ userId: 1, plannedAt: 1 });
