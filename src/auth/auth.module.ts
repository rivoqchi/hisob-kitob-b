import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import type { StringValue } from 'ms';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { User, UserSchema } from './schemas/user.schema';
import {
  VerificationCode,
  VerificationCodeSchema,
} from './schemas/verification-code.schema';
import { TelegramGatewayService } from './telegram-gateway.service';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('jwtSecret'),
        signOptions: {
          expiresIn: (config.get<string>('jwtExpiresIn') ??
            '365d') as StringValue,
        },
      }),
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: VerificationCode.name, schema: VerificationCodeSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, TelegramGatewayService, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, JwtModule, PassportModule, JwtAuthGuard, JwtStrategy],
})
export class AuthModule {}

