import { Controller, Body, Post, Get, Param, Headers, UnauthorizedException, Render } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { UsersService } from 'src/services/users.service';
import { RolesService } from 'src/services/role.service';
import { User } from 'src/schemas/user.schema';
import { Role } from 'src/schemas/role.schema';

@Controller()
export class ViewController {
  constructor(private authService: AuthService, private usersService: UsersService,
    private rolesService: RolesService) {}

  @Get('')
  @Render('login')
  async loginPage() {
    return { message: 'Hello world!' };
  }

  @Get('/register')
  @Render('register')
  async registerPage() {
    return { message: 'Hello world!' };
  }

}