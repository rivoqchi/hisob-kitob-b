import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreditsService } from './credits.service';
import { CreateCreditDto } from './dto/create-credit.dto';
import { UpdatePaidDto } from './dto/update-paid.dto';

type AuthRequest = {
  user: { userId: string; phone: string };
};

@Controller('credits')
@UseGuards(JwtAuthGuard)
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Get()
  list(@Req() req: AuthRequest) {
    return this.creditsService.list(req.user.userId);
  }

  @Post()
  create(@Req() req: AuthRequest, @Body() dto: CreateCreditDto) {
    return this.creditsService.create(req.user.userId, dto);
  }

  @Patch(':id/paid')
  updatePaid(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdatePaidDto,
  ) {
    return this.creditsService.applyPayment(
      req.user.userId,
      id,
      dto.paymentAmount,
    );
  }

  @Patch(':id/close')
  close(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdatePaidDto,
  ) {
    return this.creditsService.closeCredit(
      req.user.userId,
      id,
      dto.paymentAmount,
    );
  }

  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.creditsService.remove(req.user.userId, id);
  }
}
