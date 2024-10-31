// user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type UserDocument = User & Document;

@Schema()
export class User {

    @Prop({ unique: true })
    userid: string;

    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true })
    password: string;

    @Prop({ type: [String], default: [] })
    roles: string[];

    @Prop({ })
    realm: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', function(next) {
    if (!this.userid) {
        this.userid = uuidv4();
    }
    next();
});

export const UserModel = model<UserDocument>('User', UserSchema);