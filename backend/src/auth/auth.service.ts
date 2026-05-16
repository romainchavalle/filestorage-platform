import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,   // accès BDD
    private jwtService: JwtService,  // signer les tokens
  ) {}

  // ── Register ────────────────────────────────────────────
  async register(email: string, password: string) {
    // 1. Vérifie si l'email est déjà pris
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // 2. Hash le mot de passe (10 salt rounds = standard bcrypt)
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Crée le user en BDD
    const user = await this.prisma.user.create({
      data: {
        email,
        password_hash: passwordHash,
      },
    });

    // 4. Renvoie le user sans le hash (jamais exposer le hash)
    return { id: user.id, email: user.email };
  }

  // ── Login ───────────────────────────────────────────────
  async login(email: string, password: string) {
    // 1. Cherche le user par email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // 2. Si pas trouvé → message générique (sécurité)
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // 3. Compare le mot de passe saisi avec le hash en BDD
    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // 4. Signe un JWT avec le userId dans le payload
    const payload = { sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    return { access_token: accessToken };
  }
}
