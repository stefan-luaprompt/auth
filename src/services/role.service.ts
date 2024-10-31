import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from '../schemas/role.schema';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) {}

  async create(role: Role): Promise<Role> {
    const createdRole = new this.roleModel(role);
    return createdRole.save();
  }

  async assignScopes(roleName: string, scopes: string[]): Promise<Role | undefined> {
    return this.roleModel.findOneAndUpdate({ name: roleName }, { $set: { scopes } }, { new: true }).exec();
  }
}