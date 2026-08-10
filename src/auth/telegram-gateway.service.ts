import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type GatewayResponse<T> = {
  ok: boolean;
  result?: T;
  error?: string;
};

type RequestStatus = {
  request_id: string;
  phone_number: string;
  request_cost: number;
  delivery_status?: { status: string; updated_at: number };
  verification_status?: {
    status: string;
    updated_at: number;
    code_entered?: string;
  };
};

/**
 * Telegram Gateway API — OTP rasmiy Verification Codes chatiga yuboriladi.
 * https://core.telegram.org/gateway/api
 */
@Injectable()
export class TelegramGatewayService {
  private readonly logger = new Logger(TelegramGatewayService.name);
  private readonly token: string;
  private readonly baseUrl = 'https://gatewayapi.telegram.org';

  constructor(private readonly config: ConfigService) {
    this.token = this.config.get<string>('telegramGatewayToken') ?? '';
  }

  get isConfigured(): boolean {
    return this.token.length > 0;
  }

  /**
   * Biz generatsiya qilgan 6 xonali kodni Gateway orqali yuboradi.
   * Token yo‘q bo‘lsa — mock.
   */
  async sendVerificationCode(
    phoneE164: string,
    code: string,
  ): Promise<{
    delivered: boolean;
    mode: 'gateway' | 'mock';
    requestId?: string;
  }> {
    if (!this.isConfigured) {
      this.logger.warn(`[mock] Gateway token yo‘q. phone=${phoneE164} code=${code}`);
      return { delivered: false, mode: 'mock' };
    }

    const result = await this.call<RequestStatus>('sendVerificationMessage', {
      phone_number: phoneE164,
      code,
      ttl: 300,
      payload: 'hisob-kitob-login',
    });

    this.logger.log(
      `Gateway code sent phone=${phoneE164} request_id=${result.request_id}`,
    );

    return {
      delivered: true,
      mode: 'gateway',
      requestId: result.request_id,
    };
  }

  /** Konversiya tracking + ixtiyoriy Telegram-side verify. */
  async reportCodeChecked(requestId: string, code: string): Promise<void> {
    if (!this.isConfigured || !requestId) {
      return;
    }
    try {
      await this.call<RequestStatus>('checkVerificationStatus', {
        request_id: requestId,
        code,
      });
    } catch (err) {
      this.logger.warn(`checkVerificationStatus: ${String(err)}`);
    }
  }

  private async call<T>(
    method: string,
    body: Record<string, unknown>,
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}/${method}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(body),
    });

    const data = (await response.json()) as GatewayResponse<T>;
    if (!response.ok || !data.ok || !data.result) {
      const err = data.error ?? `HTTP ${response.status}`;
      this.logger.error(`Gateway ${method} failed: ${err}`);
      throw new Error(err);
    }
    return data.result;
  }
}
