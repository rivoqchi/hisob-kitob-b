import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateFamilyMemberDto } from './dto/create-family-member.dto';
import { FamilyMembersService } from './family-members.service';

type AuthRequest = {
  user: { userId: string; phone: string };
};

@Controller('family-members')
@UseGuards(JwtAuthGuard)
export class FamilyMembersController {
  constructor(private readonly familyMembersService: FamilyMembersService) {}

  @Get()
  list(@Req() req: AuthRequest) {
    return this.familyMembersService.list(req.user.userId);
  }

  @Post()
  create(@Req() req: AuthRequest, @Body() dto: CreateFamilyMemberDto) {
    return this.familyMembersService.create(req.user.userId, dto);
  }
}
