import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  /** E.164: +998XXXXXXXXX — asosiy identifikator. */
  @Prop({ required: true, unique: true, index: true, trim: true })
  phone!: string;

  @Prop({ trim: true })
  displayName?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
