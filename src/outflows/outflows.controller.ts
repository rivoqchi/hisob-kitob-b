import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OutflowsService } from './outflows.service';

type AuthRequest = {
  user: { userId: string; phone: string };
};

@Controller('outflows')
@UseGuards(JwtAuthGuard)
export class OutflowsController {
  constructor(private readonly outflowsService: OutflowsService) {}

  @Get()
  list(@Req() req: AuthRequest) {
    return this.outflowsService.list(req.user.userId);
  }

  @Get('balance')
  balance(@Req() req: AuthRequest) {
    return this.outflowsService.getBalance(req.user.userId);
  }
}
