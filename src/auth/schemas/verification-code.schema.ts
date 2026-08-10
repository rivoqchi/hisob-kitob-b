import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VerificationCodeDocument = HydratedDocument<VerificationCode>;

@Schema({ timestamps: true, collection: 'verification_codes' })
export class VerificationCode {
  /** E.164 phone — verify shu bilan qidiriladi. */
  @Prop({ required: true, index: true })
  phone!: string;

  /** Telegram Gateway request_id (mock da bo‘sh). */
  @Prop({ index: true })
  gatewayRequestId?: string;

  /** bcrypt hash — ochiq kod DB da saqlanmaydi. */
  @Prop({ required: true })
  codeHash!: string;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop({ default: 0 })
  attempts!: number;

  @Prop({ default: false })
  used!: boolean;
}

export const VerificationCodeSchema =
  SchemaFactory.createForClass(VerificationCode);

VerificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
