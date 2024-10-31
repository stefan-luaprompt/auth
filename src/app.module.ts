import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './services/auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersService } from './services/users.service';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './controllers/auth.controllers';
import { JwksController } from './controllers/jwks.controller';
import { Role, RoleSchema } from './schemas/role.schema';
import { RolesService } from './services/role.service';
import { TokenBlacklistService } from './services/blacklist.servive';
import { ViewController } from './controllers/view.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule,
    JwtModule.register({
      publicKey: process.env.AUTH_PUBLIC_KEY,
      privateKey: process.env.AUTH_PRIVATE_KEY,
      signOptions: { expiresIn: '60s', algorithm: 'RS256' },
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }])
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, UsersService, RolesService, TokenBlacklistService],
  controllers: [AuthController, JwksController, ViewController],
})
export class AppModule {}
