import { Injectable } from '@nestjs/common';
import connectyCube from 'connectycube';

@Injectable()
export class ConnectyCubeService {
  private readonly sdk;
  constructor() {
    const CREDENTIALS = {
      appId: 10701,
      authKey: 'B0B360B9-CAE4-42B3-B454-9A0C12343462',
    };

    this.sdk = connectyCube.init(CREDENTIALS);
    console.log('ConnectyCube initialized ✅');
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
}
