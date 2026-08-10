import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { FamilyMembersController } from './family-members.controller';
import { FamilyMembersService } from './family-members.service';
import {
  FamilyMember,
  FamilyMemberSchema,
} from './schemas/family-member.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: FamilyMember.name, schema: FamilyMemberSchema },
    ]),
  ],
  controllers: [FamilyMembersController],
  providers: [FamilyMembersService],
  exports: [FamilyMembersService],
})
export class FamilyMembersModule {}
