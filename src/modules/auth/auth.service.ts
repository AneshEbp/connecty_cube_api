import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './model/user.model';
import { Model } from 'mongoose';
import { UserRegisterInput } from './dtos/user-register.input';
import * as bcrypt from 'bcrypt';
import { ConnectyCubeService } from './connectyCube.service';
import { LoginUserDto } from './dtos/login-input';
import { JwtService } from '@nestjs/jwt';
import { waitForDebugger } from 'inspector';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private connectySdk: ConnectyCubeService,
    private jwtService: JwtService,
  ) {}

  async registerUser(body: UserRegisterInput) {
    const session = await this.userModel.db.startSession();
    session.startTransaction();

    try {
      const existingUser = await this.userModel.findOne({ email: body.email });
      if (existingUser) {
        throw new ConflictException('Email already exists'); // Use NestJS exception
      }

      console.log('i m at register Service');
      const hashedPassword = await bcrypt.hash(body.password, 10);

      const createdUser = new this.userModel({
        ...body,
        password: hashedPassword,
      });

      const savedUser = await createdUser.save({ session });

      //uncomment this if you are using email password login to connecty cube

      const userProfile = {
        email: savedUser.email,
        password: body.password,
        full_name: `${savedUser.firstName} ${savedUser.lastName}`,
      };
      const result = await this.connectySdk.registerConnecty(userProfile);

      // ❌ if connectycube fails -> rollback
      if (!result.success) {
        throw new Error('ConnectyCube registration failed');
      }

      // ✅ save ConnectyCube id
      savedUser.connectyCubeId = result?.user?.user.id!;
      await savedUser.save({ session });

      // ✅ commit transaction
      await session.commitTransaction();

      return {
        message: 'user register successfully',
        user: {
          id: savedUser._id,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          email: savedUser.email,
        },
      };
    } catch (error) {
      await session.abortTransaction();
      console.error('Registration error:', error);

      // Use instanceof check for NestJS exceptions
      if (error instanceof ConflictException) {
        return { message: error.message };
      }
      return { message: 'Failed to register user' };
    } finally {
      session.endSession();
    }
  }

  async login(body: LoginUserDto) {
    const user = await this.userModel.findOne({ email: body.email });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    // 2️⃣ Compare password
    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 3️⃣ Generate JWT token
    const payload = { id: user._id, email: user.email };
    const token = this.jwtService.sign(payload);
    console.log('token:' + token);
    // session from ConnectyCube

    const session = await this.connectySdk.createSession(body);
    if (session.session) {
      console.log(session.session);
    }

    // 4️⃣ Return user info + token
    return {
      message: 'Login successful',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      token,
      connectySession: session.session?.token,
    };
  }

  async login_with_Connecty_by_token(body: LoginUserDto) {
    const user = await this.userModel.findOne({ email: body.email });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 2️⃣ Compare password
    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 3️⃣ Generate JWT token
    const payload = { id: user._id, email: user.email };
    const token = this.jwtService.sign(payload);
    // session from ConnectyCube

    const session =
      await this.connectySdk.CreateCCSession_by_System_token(token);

    if (!user.connectyCubeId) {
      console.log('connecty cube is saved');
      user.connectyCubeId = session.connectyId;
      await user.save();
    }

    return {
      message: 'Login successful',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      token,
      connectySession: session.sessionToken,
      ccUserId: Number(session.connectyId)
    };
  }
}
