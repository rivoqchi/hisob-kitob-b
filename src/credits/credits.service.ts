import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { OutflowsService } from '../outflows/outflows.service';
import { CreateCreditDto } from './dto/create-credit.dto';
import { Credit, CreditDocument } from './schemas/credit.schema';

export type CreditResponse = {
  id: string;
  bankName: string;
  principalAmount: number;
  paidAmount: number;
  monthlyPayment: number;
  termMonths: number;
  /** Oylik × oy = jami to‘lanadigan summa */
  totalPayable: number;
  interestRatePercent: number;
  remaining: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class CreditsService {
  constructor(
    @InjectModel(Credit.name)
    private readonly creditModel: Model<CreditDocument>,
    private readonly outflowsService: OutflowsService,
  ) {}

  async list(userId: string): Promise<CreditResponse[]> {
    const docs = await this.creditModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
    return docs.map((doc) => this.toResponse(doc));
  }

  async create(userId: string, dto: CreateCreditDto): Promise<CreditResponse> {
    if (dto.paidAmount > dto.principalAmount) {
      throw new BadRequestException(
        'paidAmount cannot exceed principalAmount',
      );
    }

    const doc = await this.creditModel.create({
      userId,
      bankName: dto.bankName.trim(),
      principalAmount: dto.principalAmount,
      paidAmount: dto.paidAmount,
      monthlyPayment: dto.monthlyPayment,
      termMonths: dto.termMonths,
      interestRatePercent: dto.interestRatePercent,
    });

    return this.toResponse(doc);
  }

  async applyPayment(
    userId: string,
    id: string,
    paymentAmount: number,
  ): Promise<CreditResponse> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Credit not found');
    }

    const doc = await this.creditModel.findOne({ _id: id, userId }).exec();
    if (!doc) {
      throw new NotFoundException('Credit not found');
    }

    const remaining = Math.max(0, doc.principalAmount - doc.paidAmount);
    if (paymentAmount > remaining) {
      throw new BadRequestException(
        'paymentAmount cannot exceed remaining credit',
      );
    }

    // $inc orqali yangilash — eski hujjatlarda yo‘q maydonlar (masalan termMonths)
    // uchun to‘liq document.save() validatsiyasi 500 bermasin.
    const updated = await this.creditModel
      .findOneAndUpdate(
        { _id: id, userId },
        { $inc: { paidAmount: paymentAmount } },
        { new: true },
      )
      .exec();
    if (!updated) {
      throw new NotFoundException('Credit not found');
    }

    try {
      await this.outflowsService.spendOnCreditPayment(userId, {
        amount: paymentAmount,
        creditId: String(updated._id),
        label: `${updated.bankName} — kredit to‘lovi`,
      });
    } catch (err) {
      await this.creditModel
        .findOneAndUpdate(
          { _id: id, userId },
          { $inc: { paidAmount: -paymentAmount } },
        )
        .exec();
      throw err;
    }

    return this.toResponse(updated);
  }

  async remove(userId: string, id: string): Promise<{ ok: true }> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Credit not found');
    }

    const result = await this.creditModel
      .deleteOne({ _id: id, userId })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Credit not found');
    }

    return { ok: true };
  }

  private toResponse(doc: CreditDocument): CreditResponse {
    const principal = doc.principalAmount;
    const paid = doc.paidAmount;
    const termMonths = doc.termMonths ?? 0;
    const remaining = Math.max(0, principal - paid);
    const progress = principal > 0 ? Math.min(1, paid / principal) : 0;
    const createdAt = doc.get('createdAt') as Date;
    const updatedAt = doc.get('updatedAt') as Date;

    return {
      id: String(doc._id),
      bankName: doc.bankName,
      principalAmount: principal,
      paidAmount: paid,
      monthlyPayment: doc.monthlyPayment,
      termMonths,
      totalPayable: doc.monthlyPayment * termMonths,
      interestRatePercent: doc.interestRatePercent,
      remaining,
      progress,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    };
  }
}
