import { Controller, Get, Query } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(private readonly jwtService: JwtService) {}

  @Get('verify-connectycube') // This is the URL configured in CC Dashboard
  async verify(@Query('token') token: string) {
    const payload = await this.jwtService.verifyAsync(token);
    return {
      user: {
        id: payload.id, // Your internal ID -> becomes external_id in CC [3]
        email: payload.email,
      },
    };
  }
}
