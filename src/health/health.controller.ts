import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('ping')
  ping() {
    return this.healthService.ping();
  }

  @Get('health')
  check() {
    return this.healthService.check();
  }
}
