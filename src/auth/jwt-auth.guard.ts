import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Kelajakdagi himoyalangan route’lar uchun. Hozir UI yo‘q. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
