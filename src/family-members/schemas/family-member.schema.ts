import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FamilyMemberDocument = HydratedDocument<FamilyMember>;

@Schema({ timestamps: true, collection: 'family_members' })
export class FamilyMember {
  @Prop({ required: true, index: true, trim: true })
  userId!: string;

  @Prop({ required: true, trim: true })
  name!: string;
}

export const FamilyMemberSchema = SchemaFactory.createForClass(FamilyMember);

FamilyMemberSchema.index({ userId: 1, name: 1 }, { unique: true });
