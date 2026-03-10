import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigProvider } from './providers/config.provider';
import { GraphQLProvider } from './providers/graphql.provider';
import { MongooseProvider } from './providers/database.provider';
import { ApiResolver } from './app.resolver';
import { AuthModule } from './modules/auth/auth.module';
@Module({
  imports: [ConfigProvider, GraphQLProvider, MongooseProvider, AuthModule],
  controllers: [AppController],
  providers: [AppService, ApiResolver],
})
export class AppModule {}
