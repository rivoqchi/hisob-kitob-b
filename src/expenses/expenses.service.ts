import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { ExpenseCategoriesService } from '../expense-categories/expense-categories.service';
import { FamilyMembersService } from '../family-members/family-members.service';
import { OutflowsService } from '../outflows/outflows.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ListExpensesDto } from './dto/list-expenses.dto';
import { Expense, ExpenseDocument } from './schemas/expense.schema';

export type ExpenseResponse = {
  id: string;
  categoryId: string;
  categoryName: string;
  familyMemberId: string | null;
  familyMemberName: string | null;
  amount: number;
  comment: string | null;
  spentAt: string;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name)
    private readonly expenseModel: Model<ExpenseDocument>,
    private readonly categoriesService: ExpenseCategoriesService,
    private readonly familyMembersService: FamilyMembersService,
    private readonly outflowsService: OutflowsService,
  ) {}

  async list(
    userId: string,
    query: ListExpensesDto,
  ): Promise<ExpenseResponse[]> {
    const filter: Record<string, unknown> = { userId };

    if (query.q?.trim()) {
      const q = query.q.trim();
      filter.categoryName = { $regex: escapeRegex(q), $options: 'i' };
    }

    if (query.familyMemberId === 'none') {
      filter.familyMemberId = { $exists: false };
    } else if (query.familyMemberId?.trim()) {
      filter.familyMemberId = query.familyMemberId.trim();
    }

    if (query.from || query.to) {
      const spentAt: Record<string, Date> = {};
      if (query.from) {
        spentAt.$gte = startOfDay(new Date(query.from));
      }
      if (query.to) {
        spentAt.$lte = endOfDay(new Date(query.to));
      }
      filter.spentAt = spentAt;
    }

    const docs = await this.expenseModel
      .find(filter)
      .sort({ spentAt: -1, createdAt: -1 })
      .exec();
    return docs.map((doc) => this.toResponse(doc));
  }

  async create(
    userId: string,
    dto: CreateExpenseDto,
  ): Promise<ExpenseResponse> {
    if (!isValidObjectId(dto.categoryId)) {
      throw new BadRequestException('categoryId noto‘g‘ri');
    }

    const category = await this.categoriesService.findOwned(
      userId,
      dto.categoryId,
    );
    if (!category) {
      throw new NotFoundException('Rasxod nomi topilmadi');
    }

    let familyMemberId: string | undefined;
    let familyMemberName: string | undefined;

    if (dto.familyMemberId) {
      if (!isValidObjectId(dto.familyMemberId)) {
        throw new BadRequestException('familyMemberId noto‘g‘ri');
      }
      const member = await this.familyMembersService.findOwned(
        userId,
        dto.familyMemberId,
      );
      if (!member) {
        throw new NotFoundException('Oila a’zosi topilmadi');
      }
      familyMemberId = String(member._id);
      familyMemberName = member.name;
    }

    const spentAt = dto.spentAt ? new Date(dto.spentAt) : new Date();
    if (Number.isNaN(spentAt.getTime())) {
      throw new BadRequestException('spentAt noto‘g‘ri');
    }

    const comment = dto.comment?.trim() || undefined;

    const doc = await this.expenseModel.create({
      userId,
      categoryId: String(category._id),
      categoryName: category.name,
      familyMemberId,
      familyMemberName,
      amount: dto.amount,
      comment,
      spentAt,
    });

    try {
      await this.outflowsService.spendOnExpense(userId, {
        amount: dto.amount,
        expenseId: String(doc._id),
        label: category.name,
      });
    } catch (err) {
      await this.expenseModel.deleteOne({ _id: doc._id }).exec();
      throw err;
    }

    return this.toResponse(doc);
  }

  private toResponse(doc: ExpenseDocument): ExpenseResponse {
    const createdAt = doc.get('createdAt') as Date;
    const updatedAt = doc.get('updatedAt') as Date;
    return {
      id: String(doc._id),
      categoryId: doc.categoryId,
      categoryName: doc.categoryName,
      familyMemberId: doc.familyMemberId ?? null,
      familyMemberName: doc.familyMemberName ?? null,
      amount: doc.amount,
      comment: doc.comment ?? null,
      spentAt: doc.spentAt.toISOString(),
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    };
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}
