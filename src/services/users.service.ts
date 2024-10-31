import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findOne(username: string): Promise<User | undefined> {
    return this.userModel.findOne({ username }).exec();
  }

  async create(user: User): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(user.password, salt);
    const createdUser = new this.userModel({ ...user, password: hashedPassword });
    return createdUser.save();
  }

  async assignRoles(username: string, roles: string[]): Promise<User | undefined> {
    return this.userModel.findOneAndUpdate({ username }, { $set: { roles } }, { new: true }).exec();
  }
}