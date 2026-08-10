import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import configuration from './config/configuration';
import { CreditsModule } from './credits/credits.module';
import { ExpenseCategoriesModule } from './expense-categories/expense-categories.module';
import { ExpensesModule } from './expenses/expenses.module';
import { FamilyMembersModule } from './family-members/family-members.module';
import { HealthModule } from './health/health.module';
import { IncomesModule } from './incomes/incomes.module';
import { OutflowsModule } from './outflows/outflows.module';
import { RealtimeModule } from './realtime/realtime.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('mongodbUri'),
      }),
    }),
    HealthModule,
    RealtimeModule,
    AuthModule,
    CreditsModule,
    IncomesModule,
    OutflowsModule,
    FamilyMembersModule,
    ExpenseCategoriesModule,
    ExpensesModule,
  ],
})
export class AppModule {}
