import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { ExpenseCategoriesController } from './expense-categories.controller';
import { ExpenseCategoriesService } from './expense-categories.service';
import {
  ExpenseCategory,
  ExpenseCategorySchema,
} from './schemas/expense-category.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: ExpenseCategory.name, schema: ExpenseCategorySchema },
    ]),
  ],
  controllers: [ExpenseCategoriesController],
  providers: [ExpenseCategoriesService],
  exports: [ExpenseCategoriesService],
})
export class ExpenseCategoriesModule {}
