import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // 1. Înregistrare Securizată (Client sau Partener B2B)
  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new ConflictException('Există deja un cont înregistrat cu această adresă de email.');
    }

    if (dto.role === Role.PARTNER && (!dto.businessName || !dto.cui)) {
      throw new BadRequestException('Pentru partenerii afaceri, denumirea firmei și CUI-ul sunt obligatorii.');
    }

    // Hash parolei cu Argon2id
    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });

    // Tranzacție atomică pentru creare utilizator + magazin (dacă e partener)
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase().trim(),
          passwordHash,
          name: dto.name.trim(),
          role: dto.role,
          phone: dto.phone,
          neighborhood: dto.neighborhood || 'Centru, Iași',
        },
      });

      let storeId: string | undefined;

      if (dto.role === Role.PARTNER) {
        const store = await tx.store.create({
          data: {
            ownerId: user.id,
            name: dto.businessName!.trim(),
            businessName: dto.businessName!.trim(),
            cui: dto.cui!.trim().toUpperCase(),
            category: dto.category || 'bakery',
            categoryLabel: dto.categoryLabel || 'Brutărie locală',
            address: dto.address || 'Iași, România',
            city: dto.city || 'Iași',
            latitude: 47.1654,
            longitude: 27.5765,
            phone: dto.phone,
          },
        });
        storeId = store.id;
      }

      return { user, storeId };
    });

    const tokens = await this.generateTokens(result.user.id, result.user.email, result.user.role, result.storeId);
    return {
      user: this.sanitizeUser(result.user, result.storeId),
      ...tokens,
    };
  }

  // 2. Conectare Securizată
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: { store: true },
    });

    if (!user) {
      throw new UnauthorizedException('Email sau parolă incorectă.');
    }

    const isValidPassword = await argon2.verify(user.passwordHash, dto.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Email sau parolă incorectă.');
    }

    const storeId = user.store?.id;
    const tokens = await this.generateTokens(user.id, user.email, user.role, storeId);

    return {
      user: this.sanitizeUser(user, storeId),
      ...tokens,
    };
  }

  // 3. Rotație Refresh Token cu detecție de refolosire malițioasă
  async refreshToken(rawRefreshToken: string) {
    if (!rawRefreshToken) {
      throw new UnauthorizedException('Refresh token lipsă.');
    }

    const tokenHash = this.hashToken(rawRefreshToken);
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { include: { store: true } } },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token invalid.');
    }

    // Detecție de refolosire: Dacă tokenul este deja revocat, invalidăm TOATE sesiunile utilizatorului
    if (storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: storedToken.userId },
        data: { isRevoked: true },
      });
      throw new UnauthorizedException('Sesiune compromisă sau expirată. Te rugăm să te autentifici din nou.');
    }

    // Marcăm tokenul curent ca revocat (rotație)
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    const user = storedToken.user;
    const storeId = user.store?.id;
    const newTokens = await this.generateTokens(user.id, user.email, user.role, storeId);

    return {
      user: this.sanitizeUser(user, storeId),
      ...newTokens,
    };
  }

  // 4. Deconectare (Revocare token)
  async logout(rawRefreshToken?: string) {
    if (rawRefreshToken) {
      const tokenHash = this.hashToken(rawRefreshToken);
      await this.prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { isRevoked: true },
      });
    }
    return { success: true, message: 'Deconectare reușită.' };
  }

  // 5. Utilizator Curent
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { store: true },
    });

    if (!user) {
      throw new UnauthorizedException('Utilizatorul nu a fost găsit.');
    }

    return this.sanitizeUser(user, user.store?.id);
  }

  // Helper generare pereche Access Token + Refresh Token
  private async generateTokens(userId: string, email: string, role: string, storeId?: string) {
    const payload = { sub: userId, email, role, storeId };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: this.configService.get<string>('JWT_SECRET') || 'super_secret_jwt_key_savebite_at_least_32_chars!',
    });

    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = this.hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 zile

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private sanitizeUser(user: any, storeId?: string) {
    const { passwordHash, ...safe } = user;
    return {
      ...safe,
      storeId,
    };
  }
}
