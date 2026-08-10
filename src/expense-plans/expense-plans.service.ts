import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreateExpensePlanDto } from './dto/create-expense-plan.dto';
import {
  ExpensePlan,
  ExpensePlanDocument,
} from './schemas/expense-plan.schema';

export type ExpensePlanResponse = {
  id: string;
  title: string;
  amount: number;
  plannedAt: string;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class ExpensePlansService {
  constructor(
    @InjectModel(ExpensePlan.name)
    private readonly expensePlanModel: Model<ExpensePlanDocument>,
  ) {}

  async list(userId: string): Promise<ExpensePlanResponse[]> {
    const docs = await this.expensePlanModel
      .find({ userId })
      .sort({ plannedAt: 1, createdAt: -1 })
      .exec();
    return docs.map((doc) => this.toResponse(doc));
  }

  async create(
    userId: string,
    dto: CreateExpensePlanDto,
  ): Promise<ExpensePlanResponse> {
    const title = dto.title.trim();
    if (!title) {
      throw new BadRequestException('title is required');
    }

    const plannedAt = new Date(dto.plannedAt);
    if (Number.isNaN(plannedAt.getTime())) {
      throw new BadRequestException('plannedAt noto‘g‘ri');
    }

    const doc = await this.expensePlanModel.create({
      userId,
      title,
      amount: dto.amount,
      plannedAt,
    });
    return this.toResponse(doc);
  }

  async remove(userId: string, id: string): Promise<{ ok: true }> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('id noto‘g‘ri');
    }

    const result = await this.expensePlanModel
      .deleteOne({ _id: id, userId })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Reja topilmadi');
    }
    return { ok: true };
  }

  private toResponse(doc: ExpensePlanDocument): ExpensePlanResponse {
    const createdAt = doc.get('createdAt') as Date;
    const updatedAt = doc.get('updatedAt') as Date;
    return {
      id: String(doc._id),
      title: doc.title,
      amount: doc.amount,
      plannedAt: doc.plannedAt.toISOString(),
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    };
  }
}
