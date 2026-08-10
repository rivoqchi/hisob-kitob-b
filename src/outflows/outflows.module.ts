import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { Income, IncomeSchema } from '../incomes/schemas/income.schema';
import { OutflowsController } from './outflows.controller';
import { OutflowsService } from './outflows.service';
import { Outflow, OutflowSchema } from './schemas/outflow.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Outflow.name, schema: OutflowSchema },
      { name: Income.name, schema: IncomeSchema },
    ]),
  ],
  controllers: [OutflowsController],
  providers: [OutflowsService],
  exports: [OutflowsService],
})
export class OutflowsModule {}
