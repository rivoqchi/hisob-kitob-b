import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { OutflowsModule } from '../outflows/outflows.module';
import { CreditsController } from './credits.controller';
import { CreditsService } from './credits.service';
import { Credit, CreditSchema } from './schemas/credit.schema';

@Module({
  imports: [
    AuthModule,
    OutflowsModule,
    MongooseModule.forFeature([{ name: Credit.name, schema: CreditSchema }]),
  ],
  controllers: [CreditsController],
  providers: [CreditsService],
})
export class CreditsModule {}
