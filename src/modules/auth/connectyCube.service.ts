import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import connectyCube from 'connectycube';

@Injectable()
export class ConnectyCubeService {
  private readonly sdk;
  constructor(private configService: ConfigService) {
    const CREDENTIALS = {
      appId: Number(this.configService.get<number>('APP_ID')),
      authKey: this.configService.get<string>('AUTH_KEY'),
    };

    this.sdk = connectyCube.init(CREDENTIALS);
  }

  async registerConnecty(data) {
    console.log('i m at connecty:', data);
    try {
      const user = await connectyCube.users.signup(data);
      return { success: true, user };
    } catch (error) {
      console.log(error.info.errors);
      return { success: false, error };
    }
  }

  async createSession(data) {
    try {
      const session = await connectyCube.createSession(data);
      console.log('session fetched');
      return {
        session,
      };
    } catch (error) {
      console.log('err:' + error.info.errors);
      return { error };
    }
  }

  async CreateCCSession_by_System_token(systemJwt: string) {
    const cube = new connectyCube.ConnectyCube();
    cube.init({
      appId: Number(this.configService.get<number>('APP_ID')),
      authKey: this.configService.get<string>('AUTH_KEY'),
    });
    try {
      const session = await cube.createSession({
        login: systemJwt,
        password: 'cidp-temporary-password',
      });
      const connectyId = session.user_id;

      return {
        sessionToken: session.token,
        connectyId: connectyId,
      };
    } catch (error) {
      console.error(
        'ConnectyCube Session Error:',
        JSON.stringify(error?.info?.errors || error, null, 2),
      );

      throw new Error(`ConnectyCube Session failed: ${error.message}`);
    }
  }
}
