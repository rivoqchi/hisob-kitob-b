import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { Model } from 'mongoose';
import { RequestCodeDto } from './dto/request-code.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { normalizeUzPhone } from './phone.util';
import { User, UserDocument } from './schemas/user.schema';
import {
  VerificationCode,
  VerificationCodeDocument,
} from './schemas/verification-code.schema';
import { TelegramGatewayService } from './telegram-gateway.service';

const CODE_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(VerificationCode.name)
    private readonly codeModel: Model<VerificationCodeDocument>,
    private readonly gateway: TelegramGatewayService,
    private readonly jwt: JwtService,
  ) {}

  async requestCode(dto: RequestCodeDto) {
    const phone = this.requirePhone(dto.phone);
    const code = String(randomInt(100000, 1000000));
    const codeHash = await bcrypt.hash(code, BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + CODE_TTL_MS);

    await this.codeModel.updateMany(
      { phone, used: false },
      { $set: { used: true } },
    );

    let delivery: {
      delivered: boolean;
      mode: 'gateway' | 'mock';
      requestId?: string;
    };
    try {
      delivery = await this.gateway.sendVerificationCode(phone, code);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown';
      throw new BadRequestException(
        `Telegram Verification Codes ga kod yuborib bo‘lmadi (${msg}). ` +
          'Raqam Telegram akkauntiga bog‘langanligini tekshiring.',
      );
    }

    await this.codeModel.create({
      phone,
      codeHash,
      expiresAt,
      attempts: 0,
      used: false,
      ...(delivery.requestId
        ? { gatewayRequestId: delivery.requestId }
        : {}),
    });

    return {
      ok: true,
      expiresAt: expiresAt.toISOString(),
      deliveryMode: delivery.mode,
      ...(delivery.mode === 'mock' ? { devCode: code } : {}),
    };
  }

  async verifyCode(dto: VerifyCodeDto) {
    const phone = this.requirePhone(dto.phone);

    const record = await this.codeModel
      .findOne({ phone, used: false })
      .sort({ createdAt: -1 });

    if (!record) {
      throw new UnauthorizedException('Kod topilmadi. Yangi kod so‘rang.');
    }

    if (record.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Kod muddati tugagan.');
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      throw new UnauthorizedException(
        'Urinishlar soni tugadi. Yangi kod so‘rang.',
      );
    }

    const matches = await bcrypt.compare(dto.code, record.codeHash);
    if (!matches) {
      record.attempts += 1;
      await record.save();
      throw new UnauthorizedException('Kod noto‘g‘ri.');
    }

    record.used = true;
    await record.save();

    if (record.gatewayRequestId) {
      void this.gateway.reportCodeChecked(record.gatewayRequestId, dto.code);
    }

    const user = await this.userModel.findOneAndUpdate(
      { phone },
      { $setOnInsert: { phone } },
      { upsert: true, new: true },
    );

    const accessToken = await this.jwt.signAsync({
      sub: String(user._id),
      phone: user.phone,
    });

    return {
      ok: true,
      accessToken,
      user: {
        id: String(user._id),
        phone: user.phone,
        displayName: user.displayName ?? null,
      },
    };
  }

  private requirePhone(raw: string): string {
    const phone = normalizeUzPhone(raw);
    if (!phone) {
      throw new BadRequestException(
        'Telefon raqam noto‘g‘ri. Format: +998 90 123 45 67',
      );
    }
    return phone;
  }
}
