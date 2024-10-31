import { Controller, Body, Post, Get, Param, Headers, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { UsersService } from 'src/services/users.service';
import { RolesService } from 'src/services/role.service';
import { User } from 'src/schemas/user.schema';
import { Role } from 'src/schemas/role.schema';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService, private usersService: UsersService,
    private rolesService: RolesService) {}

    private readonly logger = new Logger(AuthController.name);

  @Post('login')
  async login(@Body() user: User) {
    const { username, password } = user;
    return this.authService.login(username, password);
  }

  @Post('logout')
  async logout(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Invalid token');
    }
    return this.authService.logout(authHeader.split(' ')[1]);
  }

  @Get('validate')
  async validate(@Headers('authorization') authHeader: string) {
    this.logger.log('Validating token', authHeader);
    const token = authHeader.split(' ')[1];
    return this.authService.validate(token);
  }

  @Post('register')
  async registerUser(@Body() user: User): Promise<User> {
    return this.usersService.create(user);
  }

  @Post('roles')
  async createRole(@Body() role: Role): Promise<Role> {
    return this.rolesService.create(role);
  }

  @Post('roles/:roleName/scopes')
  async assignScopesToRole(@Param('roleName') roleName: string, @Body() scopes: string[]): Promise<Role> {
    return this.rolesService.assignScopes(roleName, scopes);
  }

  @Post('users/:username/roles')
  async assignRolesToUser(@Param('username') username: string, @Body() roles: string[]): Promise<User> {
    return this.usersService.assignRoles(username, roles);
  }




}