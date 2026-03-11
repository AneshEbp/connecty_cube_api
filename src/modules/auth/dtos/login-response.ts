import { ObjectType, Field } from '@nestjs/graphql';
import { UserType } from './user-register.response';

@ObjectType()
export class LoginResponse {
  @Field()
  message: string;

  @Field({ nullable: true })
  token?: string;

  @Field({ nullable: true })
  connectySession?: String;

  @Field({ nullable: true })
  ccUserId?: number;

  @Field(() => UserType, { nullable: true })
  user?: UserType;
}
