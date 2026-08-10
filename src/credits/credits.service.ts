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
    const totalPayable = dto.monthlyPayment * dto.termMonths;
    if (dto.paidAmount > totalPayable) {
      throw new BadRequestException(
        'paidAmount cannot exceed total payable (monthly × months)',
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

    const remaining = this.computeRemaining(doc);
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

  /**
   * Istagan (qisman) summa bilan kreditni to‘liq yopadi:
   * faqat yozilgan summa to‘plangan puldan ayiriladi, qolgan qarz 0 bo‘ladi.
   */
  async closeCredit(
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

    const remaining = this.computeRemaining(doc);
    if (remaining <= 0) {
      throw new BadRequestException('Credit is already closed');
    }
    if (paymentAmount > remaining) {
      throw new BadRequestException(
        'paymentAmount cannot exceed remaining credit',
      );
    }

    const totalPayable = this.computeTotalPayable(doc);
    const previousPaid = doc.paidAmount;

    const updated = await this.creditModel
      .findOneAndUpdate(
        { _id: id, userId },
        { $set: { paidAmount: totalPayable } },
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
        label: `${updated.bankName} — kreditni tugatish`,
      });
    } catch (err) {
      await this.creditModel
        .findOneAndUpdate(
          { _id: id, userId },
          { $set: { paidAmount: previousPaid } },
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

  /** Qolgan = (oylik × oy) − to‘langan. Eski yozuvlarda muddat yo‘q bo‘lsa — asosiy summa. */
  private computeTotalPayable(doc: CreditDocument): number {
    const termMonths = doc.termMonths ?? 0;
    const fromSchedule = doc.monthlyPayment * termMonths;
    return fromSchedule > 0 ? fromSchedule : doc.principalAmount;
  }

  private computeRemaining(doc: CreditDocument): number {
    return Math.max(0, this.computeTotalPayable(doc) - doc.paidAmount);
  }

  private toResponse(doc: CreditDocument): CreditResponse {
    const principal = doc.principalAmount;
    const paid = doc.paidAmount;
    const termMonths = doc.termMonths ?? 0;
    const totalPayable = this.computeTotalPayable(doc);
    const remaining = this.computeRemaining(doc);
    const progress = totalPayable > 0 ? Math.min(1, paid / totalPayable) : 0;
    const createdAt = doc.get('createdAt') as Date;
    const updatedAt = doc.get('updatedAt') as Date;

    return {
      id: String(doc._id),
      bankName: doc.bankName,
      principalAmount: principal,
      paidAmount: paid,
      monthlyPayment: doc.monthlyPayment,
      termMonths,
      totalPayable,
      interestRatePercent: doc.interestRatePercent,
      remaining,
      progress,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    };
  }
}
