import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateIncomeDto } from './dto/create-income.dto';
import { IncomesService } from './incomes.service';

type AuthRequest = {
  user: { userId: string; phone: string };
};

@Controller('incomes')
@UseGuards(JwtAuthGuard)
export class IncomesController {
  constructor(private readonly incomesService: IncomesService) {}

  @Get()
  list(@Req() req: AuthRequest) {
    return this.incomesService.list(req.user.userId);
  }

  @Post()
  create(@Req() req: AuthRequest, @Body() dto: CreateIncomeDto) {
    return this.incomesService.create(req.user.userId, dto);
  }
}
