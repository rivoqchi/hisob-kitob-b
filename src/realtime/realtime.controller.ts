import { Body, Controller, Post } from '@nestjs/common';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { RealtimeGateway } from './realtime.gateway';

class BroadcastDto {
  @IsString()
  @MaxLength(280)
  message!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  type?: string;
}

/** HTTP orqali sync yuborish — frontend invalidate demo uchun. */
@Controller('realtime')
export class RealtimeController {
  constructor(private readonly gateway: RealtimeGateway) {}

  @Post('broadcast')
  broadcast(@Body() body: BroadcastDto) {
    const payload = {
      type: body.type ?? 'broadcast',
      message: body.message,
      at: new Date().toISOString(),
      from: 'api',
    };

    this.gateway.emitToFamily(payload);
    return { ok: true, payload };
  }
}
