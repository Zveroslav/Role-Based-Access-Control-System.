import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userRepo.findOneOrFail({
      where: { email },
      relations: ['roles', 'roles.permissions', 'organization'],
    });

    if (!user || !bcrypt.compareSync(password, user.passwordHash))
      throw new UnauthorizedException('Bad credentials');

    const payload = { sub: user.id }; // keep it minimal
    return { accessToken: this.jwt.sign(payload) };
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions', 'organization'],
    });
  }
}
