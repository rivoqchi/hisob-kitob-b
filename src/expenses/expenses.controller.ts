import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ListExpensesDto } from './dto/list-expenses.dto';
import { ExpensesService } from './expenses.service';

type AuthRequest = {
  user: { userId: string; phone: string };
};

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  list(@Req() req: AuthRequest, @Query() query: ListExpensesDto) {
    return this.expensesService.list(req.user.userId, query);
  }

  @Post()
  create(@Req() req: AuthRequest, @Body() dto: CreateExpenseDto) {
    return this.expensesService.create(req.user.userId, dto);
  }
}
