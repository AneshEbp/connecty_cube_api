import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class JwtGqlStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          // For GraphQL, headers are in context
          const ctx = GqlExecutionContext.create(request);
          const req = ctx.getContext().req;
          if (req && req.headers)
            return req.headers.authorization?.replace('Bearer ', '');
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'defaultSecret',
    });
  }

  async validate(payload: any) {
    // This object will be available in @Context().req.user or @Context().user
    return { userId: payload.sub, email: payload.email };
  }
}
