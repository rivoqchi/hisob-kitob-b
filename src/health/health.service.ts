import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class HealthService {
  private readonly startedAt = Date.now();

  constructor(@InjectConnection() private readonly connection: Connection) {}

  /** Engil keep-alive (cron-job.org / UptimeRobot). Mongo tekshirmaydi. */
  ping() {
    return {
      ok: true,
      timestamp: new Date().toISOString(),
    };
  }

  check() {
    const mongoReady = this.connection.readyState === 1;

    return {
      status: mongoReady ? 'ok' : 'degraded',
      uptimeSec: Math.floor((Date.now() - this.startedAt) / 1000),
      mongo: mongoReady ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };
  }
}
