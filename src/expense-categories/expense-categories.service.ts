import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import {
  ExpenseCategory,
  ExpenseCategoryDocument,
} from './schemas/expense-category.schema';

export const DEFAULT_EXPENSE_CATEGORIES = ['Ovqat', 'Kiyim', 'Yo‘lkira'] as const;

export type ExpenseCategoryResponse = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class ExpenseCategoriesService {
  constructor(
    @InjectModel(ExpenseCategory.name)
    private readonly categoryModel: Model<ExpenseCategoryDocument>,
  ) {}

  async list(userId: string): Promise<ExpenseCategoryResponse[]> {
    await this.ensureDefaults(userId);
    const docs = await this.categoryModel
      .find({ userId })
      .sort({ name: 1 })
      .exec();
    return docs.map((doc) => this.toResponse(doc));
  }

  async create(
    userId: string,
    dto: CreateExpenseCategoryDto,
  ): Promise<ExpenseCategoryResponse> {
    const name = dto.name.trim();
    if (!name) {
      throw new BadRequestException('name is required');
    }

    try {
      const doc = await this.categoryModel.create({ userId, name });
      return this.toResponse(doc);
    } catch (err) {
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code?: number }).code === 11000
      ) {
        throw new ConflictException('Bu rasxod nomi allaqachon mavjud');
      }
      throw err;
    }
  }

  async findOwned(
    userId: string,
    id: string,
  ): Promise<ExpenseCategoryDocument | null> {
    return this.categoryModel.findOne({ _id: id, userId }).exec();
  }

  private async ensureDefaults(userId: string): Promise<void> {
    const count = await this.categoryModel.countDocuments({ userId }).exec();
    if (count > 0) return;

    try {
      await this.categoryModel.insertMany(
        DEFAULT_EXPENSE_CATEGORIES.map((name) => ({ userId, name })),
        { ordered: false },
      );
    } catch {
      // parallel first lists may race on unique index — ignore
    }
  }

  private toResponse(doc: ExpenseCategoryDocument): ExpenseCategoryResponse {
    const createdAt = doc.get('createdAt') as Date;
    const updatedAt = doc.get('updatedAt') as Date;
    return {
      id: String(doc._id),
      name: doc.name,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    };
  }
}
