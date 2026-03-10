import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserType {
  @Field()
  id: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;
}

@ObjectType()
export class UserResgisterResponse {
  @Field()
  message: string;

  @Field(() => UserType)
  user?: UserType;
}
