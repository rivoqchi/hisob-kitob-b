import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Income, IncomeDocument } from '../incomes/schemas/income.schema';
import { Outflow, OutflowDocument } from './schemas/outflow.schema';

export type OutflowResponse = {
  id: string;
  amount: number;
  kind: Outflow['kind'];
  creditId: string | null;
  expenseId: string | null;
  label: string;
  createdAt: string;
  updatedAt: string;
};

export type BalanceResponse = {
  incomeTotal: number;
  outflowTotal: number;
  available: number;
};

@Injectable()
export class OutflowsService {
  constructor(
    @InjectModel(Outflow.name)
    private readonly outflowModel: Model<OutflowDocument>,
    @InjectModel(Income.name)
    private readonly incomeModel: Model<IncomeDocument>,
  ) {}

  async list(userId: string): Promise<OutflowResponse[]> {
    const docs = await this.outflowModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
    return docs.map((doc) => this.toResponse(doc));
  }

  async getBalance(userId: string): Promise<BalanceResponse> {
    const [incomeAgg, outflowAgg] = await Promise.all([
      this.incomeModel
        .aggregate<{ total: number }>([
          { $match: { userId } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ])
        .exec(),
      this.outflowModel
        .aggregate<{ total: number }>([
          { $match: { userId } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ])
        .exec(),
    ]);

    const incomeTotal = incomeAgg[0]?.total ?? 0;
    const outflowTotal = outflowAgg[0]?.total ?? 0;
    return {
      incomeTotal,
      outflowTotal,
      available: Math.max(0, incomeTotal - outflowTotal),
    };
  }

  async spendOnCreditPayment(
    userId: string,
    input: { amount: number; creditId: string; label: string },
  ): Promise<OutflowResponse> {
    if (input.amount <= 0) {
      throw new BadRequestException('payment amount must be positive');
    }

    const balance = await this.getBalance(userId);
    if (input.amount > balance.available) {
      throw new BadRequestException(
        `Yetarli to‘plangan pul yo‘q. Mavjud: ${balance.available} so‘m`,
      );
    }

    const doc = await this.outflowModel.create({
      userId,
      amount: input.amount,
      kind: 'credit_payment',
      creditId: input.creditId,
      label: input.label.trim(),
    });

    return this.toResponse(doc);
  }

  async spendOnExpense(
    userId: string,
    input: { amount: number; expenseId: string; label: string },
  ): Promise<OutflowResponse> {
    if (input.amount <= 0) {
      throw new BadRequestException('expense amount must be positive');
    }

    const balance = await this.getBalance(userId);
    if (input.amount > balance.available) {
      throw new BadRequestException(
        `Yetarli to‘plangan pul yo‘q. Mavjud: ${balance.available} so‘m`,
      );
    }

    const doc = await this.outflowModel.create({
      userId,
      amount: input.amount,
      kind: 'expense',
      expenseId: input.expenseId,
      label: input.label.trim(),
    });

    return this.toResponse(doc);
  }

  private toResponse(doc: OutflowDocument): OutflowResponse {
    const createdAt = doc.get('createdAt') as Date;
    const updatedAt = doc.get('updatedAt') as Date;

    return {
      id: String(doc._id),
      amount: doc.amount,
      kind: doc.kind,
      creditId: doc.creditId ?? null,
      expenseId: doc.expenseId ?? null,
      label: doc.label,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    };
  }
}
