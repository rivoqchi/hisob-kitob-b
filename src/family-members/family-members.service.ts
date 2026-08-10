import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateFamilyMemberDto } from './dto/create-family-member.dto';
import {
  FamilyMember,
  FamilyMemberDocument,
} from './schemas/family-member.schema';

export type FamilyMemberResponse = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class FamilyMembersService {
  constructor(
    @InjectModel(FamilyMember.name)
    private readonly familyMemberModel: Model<FamilyMemberDocument>,
  ) {}

  async list(userId: string): Promise<FamilyMemberResponse[]> {
    const docs = await this.familyMemberModel
      .find({ userId })
      .sort({ name: 1 })
      .exec();
    return docs.map((doc) => this.toResponse(doc));
  }

  async create(
    userId: string,
    dto: CreateFamilyMemberDto,
  ): Promise<FamilyMemberResponse> {
    const name = dto.name.trim();
    if (!name) {
      throw new BadRequestException('name is required');
    }

    try {
      const doc = await this.familyMemberModel.create({ userId, name });
      return this.toResponse(doc);
    } catch (err) {
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code?: number }).code === 11000
      ) {
        throw new ConflictException('Bu oila a’zosi allaqachon mavjud');
      }
      throw err;
    }
  }

  async findOwned(
    userId: string,
    id: string,
  ): Promise<FamilyMemberDocument | null> {
    return this.familyMemberModel.findOne({ _id: id, userId }).exec();
  }

  private toResponse(doc: FamilyMemberDocument): FamilyMemberResponse {
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
