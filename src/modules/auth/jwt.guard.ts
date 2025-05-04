import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    console.log('JWT Guard - Headers:', req.headers); // Log headers
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      console.log('JWT Guard - Error:', err, 'Info:', info); // Log errors
      throw err || new UnauthorizedException('Invalid token');
    }
    console.log('JWT Guard - User:', user); // Log the user object
    return user;
  }
}
