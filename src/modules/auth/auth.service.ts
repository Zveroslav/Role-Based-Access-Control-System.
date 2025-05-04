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

    const payload = { sub: user.id };
    const accessToken = this.jwt.sign(payload);
    const refreshToken = this.jwt.sign(payload, { expiresIn: '7d' });

    user.refreshToken = refreshToken;
    await this.userRepo.save(user);

    console.log('Saved Refresh Token:', refreshToken); // Debugging
    return { accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string) {
    try {

      // Verify the refresh token
      const payload = this.jwt.verify(refreshToken);

      // Find the user with the matching refresh token
      const user = await this.userRepo.findOne({
        where: { id: payload.sub, refreshToken },
      });

      if (!user) throw new UnauthorizedException('Invalid refresh token');

      // Generate new tokens
      const newAccessToken = this.jwt.sign({ sub: user.id });
      const newRefreshToken = this.jwt.sign({ sub: user.id }, { expiresIn: '7d' });

      // Update the refresh token in the database
      user.refreshToken = newRefreshToken;
      await this.userRepo.save(user);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      console.error('Refresh Token Error:', error); // Debugging
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions', 'organization'],
    });
  }
}
