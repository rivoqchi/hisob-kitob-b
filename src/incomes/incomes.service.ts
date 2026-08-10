import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateIncomeDto } from './dto/create-income.dto';
import { Income, IncomeDocument } from './schemas/income.schema';

export type IncomeResponse = {
  id: string;
  amount: number;
  sourceType: Income['sourceType'];
  sourceLabel: string | null;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class IncomesService {
  constructor(
    @InjectModel(Income.name)
    private readonly incomeModel: Model<IncomeDocument>,
  ) {}

  async list(userId: string): Promise<IncomeResponse[]> {
    const docs = await this.incomeModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
    return docs.map((doc) => this.toResponse(doc));
  }

  async create(userId: string, dto: CreateIncomeDto): Promise<IncomeResponse> {
    const comment = dto.comment?.trim() || undefined;
    const sourceLabel = dto.sourceLabel?.trim() || undefined;

    if (dto.sourceType === 'boshqa' && !comment) {
      throw new BadRequestException('comment is required for boshqa');
    }
    if (dto.sourceType === 'custom' && !sourceLabel) {
      throw new BadRequestException('sourceLabel is required for custom');
    }

    const doc = await this.incomeModel.create({
      userId,
      amount: dto.amount,
      sourceType: dto.sourceType,
      sourceLabel: dto.sourceType === 'custom' ? sourceLabel : undefined,
      comment,
    });

    return this.toResponse(doc);
  }

  private toResponse(doc: IncomeDocument): IncomeResponse {
    const createdAt = doc.get('createdAt') as Date;
    const updatedAt = doc.get('updatedAt') as Date;

    return {
      id: String(doc._id),
      amount: doc.amount,
      sourceType: doc.sourceType,
      sourceLabel: doc.sourceLabel ?? null,
      comment: doc.comment ?? null,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    };
  }
}
