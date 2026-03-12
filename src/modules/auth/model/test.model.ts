import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CallbackWithoutResult, Document, Types } from 'mongoose';

@Schema({ timestamps: true })
class User extends Document {
  @Prop({ required: true, unique: true, index: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  profilePicture: string;

  @Prop({ required: true, unique: true, index: true })
  connectyCubeId: number;

  @Prop({ default: 0 })
  friendsCount: number;

  @Prop({ default: 0 })
  pendingRequestsCount: number;
}

const UserSchema = SchemaFactory.createForClass(User);

export enum RelationshipStatus {
  PENDING = 'PENDING',
  FRIENDS = 'FRIENDS',
  BLOCKED = 'BLOCKED',
}

@Schema()
class UserSnapshot {
  @Prop({ required: true })
  username: string;

  @Prop()
  profilePicture: string;

  @Prop({ required: true })
  connectyCubeId: number;
}

@Schema({ timestamps: true })
export class Relationship extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userA: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userB: Types.ObjectId;

  @Prop({ type: UserSnapshot, required: true })
  userASnapshot: UserSnapshot;

  @Prop({ type: UserSnapshot, required: true })
  userBSnapshot: UserSnapshot;

  @Prop({
    type: String,
    enum: RelationshipStatus,
    default: RelationshipStatus.PENDING,
    index: true,
  })
  status: RelationshipStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  actionUser: Types.ObjectId;

  @Prop({ default: null })
  connectyCubeDialogId: string;
}

const RelationshipSchema = SchemaFactory.createForClass(Relationship);

// --- CRITICAL SENIOR LOGIC: COMPOUND INDEX & ID SORTING ---

// Ensure unique relationship between two users regardless of who sent it
RelationshipSchema.index({ userA: 1, userB: 1 }, { unique: true });

// Pre-save middleware to enforce userA < userB
// RelationshipSchema.pre('save', function (next: CallbackWithoutResult) {
//   if (this.userA.toString() > this.userB.toString()) {
//     const tempId = this.userA;
//     const tempSnapshot = this.userASnapshot;

//     this.userA = this.userB;
//     this.userASnapshot = this.userBSnapshot;

//     this.userB = tempId;
//     this.userBSnapshot = tempSnapshot;
//   }
//   next();
// });
