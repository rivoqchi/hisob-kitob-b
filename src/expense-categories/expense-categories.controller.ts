import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { ExpenseCategoriesService } from './expense-categories.service';

type AuthRequest = {
  user: { userId: string; phone: string };
};

@Controller('expense-categories')
@UseGuards(JwtAuthGuard)
export class ExpenseCategoriesController {
  constructor(
    private readonly expenseCategoriesService: ExpenseCategoriesService,
  ) {}

  @Get()
  list(@Req() req: AuthRequest) {
    return this.expenseCategoriesService.list(req.user.userId);
  }

  @Post()
  create(@Req() req: AuthRequest, @Body() dto: CreateExpenseCategoryDto) {
    return this.expenseCategoriesService.create(req.user.userId, dto);
  }
}
