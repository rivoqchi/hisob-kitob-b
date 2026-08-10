import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateExpensePlanDto } from './dto/create-expense-plan.dto';
import { ExpensePlansService } from './expense-plans.service';

type AuthRequest = {
  user: { userId: string; phone: string };
};

@Controller('expense-plans')
@UseGuards(JwtAuthGuard)
export class ExpensePlansController {
  constructor(private readonly expensePlansService: ExpensePlansService) {}

  @Get()
  list(@Req() req: AuthRequest) {
    return this.expensePlansService.list(req.user.userId);
  }

  @Post()
  create(@Req() req: AuthRequest, @Body() dto: CreateExpensePlanDto) {
    return this.expensePlansService.create(req.user.userId, dto);
  }

  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.expensePlansService.remove(req.user.userId, id);
  }
}
