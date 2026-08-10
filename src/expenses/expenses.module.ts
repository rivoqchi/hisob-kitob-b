import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { ExpenseCategoriesModule } from '../expense-categories/expense-categories.module';
import { FamilyMembersModule } from '../family-members/family-members.module';
import { OutflowsModule } from '../outflows/outflows.module';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { Expense, ExpenseSchema } from './schemas/expense.schema';

@Module({
  imports: [
    AuthModule,
    ExpenseCategoriesModule,
    FamilyMembersModule,
    OutflowsModule,
    MongooseModule.forFeature([{ name: Expense.name, schema: ExpenseSchema }]),
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}
