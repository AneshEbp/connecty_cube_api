import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UserRegisterInput } from './dtos/user-register.input';
import { UserResgisterResponse } from './dtos/user-register.response';
import { LoginResponse } from './dtos/login-response';
import { LoginUserDto } from './dtos/login-input';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => UserResgisterResponse)
  async register(@Args('body') body: UserRegisterInput) {
    const result = await this.authService.registerUser(body);
    return result;
  }

  @Mutation(() => LoginResponse)
  async login(@Args('body') body: LoginUserDto) {
    const result = await this.authService.login(body);
    console.log(result);
    return result;
  }
}
