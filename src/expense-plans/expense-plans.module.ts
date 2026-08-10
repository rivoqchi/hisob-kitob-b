import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { ExpensePlansController } from './expense-plans.controller';
import { ExpensePlansService } from './expense-plans.service';
import { ExpensePlan, ExpensePlanSchema } from './schemas/expense-plan.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: ExpensePlan.name, schema: ExpensePlanSchema },
    ]),
  ],
  controllers: [ExpensePlansController],
  providers: [ExpensePlansService],
  exports: [ExpensePlansService],
})
export class ExpensePlansModule {}
