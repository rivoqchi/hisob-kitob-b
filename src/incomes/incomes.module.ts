import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { IncomesController } from './incomes.controller';
import { IncomesService } from './incomes.service';
import { Income, IncomeSchema } from './schemas/income.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: Income.name, schema: IncomeSchema }]),
  ],
  controllers: [IncomesController],
  providers: [IncomesService],
})
export class IncomesModule {}
