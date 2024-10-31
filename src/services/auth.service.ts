import { Injectable, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/schemas/user.schema';
import * as crypto from 'crypto';
import { Algorithm } from 'jsonwebtoken';
import * as jose from 'node-jose';
import { TokenBlacklistService } from './blacklist.servive';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private tokenBlacklistService: TokenBlacklistService,) { }

    async validateUser(username: string, pass: string): Promise<Omit<User, 'password'>> {
        const user = await this.usersService.findOne(username);
        if (user && await bcrypt.compare(pass, user.password)) {
            return user;
        }
        throw new HttpException('Invalid username or password', HttpStatus.UNAUTHORIZED);
    }

    async validate(token: string) {
        try {
            const payload = this.jwtService.verify(token, {
                publicKey: process.env.AUTH_PUBLIC_KEY,
                algorithms: ['RS256'],
            });
            const isBlacklisted = await this.tokenBlacklistService.isTokenBlacklisted(payload.jti);
            if (isBlacklisted) throw new Error('Token is blacklisted');
            console.log(payload)
            return payload;
        } catch (error) {
            throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED)
        }
    }

    async login(username: string, password: string) {
        const user = await this.validateUser(username, password);
        if (!user) {
            throw new Error('User not found');
        }

        // Step 1: Use the same key processing as in the JWKS endpoint to generate the kid
        const keyStore = jose.JWK.createKeyStore();
        const key = await keyStore.add(process.env.AUTH_PUBLIC_KEY, 'pem', { alg: 'RS256', use: 'sig' });


        const pubKey = key.toPEM(false); // Convert to PEM format (public key)
        const kid = crypto.createHash('sha256').update(pubKey).digest('base64url'); // Generate kid as a hash of public key
        const jti = crypto.randomUUID();

        console.log('jti:', jti);

        // Step 2: Define the payload
        const payload = { username: user.username, sub: user.userid, roles: user.roles, scopes: user.roles, jti };

        // Step 3: Add the generated kid and alg to the JWT header
        const options = {
            algorithm: 'RS256' as Algorithm, // Explicitly set the type for algorithm
            expiresIn: '1d',
            header: {
                alg: 'RS256', // The alg must be explicitly specified here in the header
                kid, // Use the dynamically generated kid
            },
        };

        // Step 4: Sign the token
        const access_token = this.jwtService.sign(payload, options);

        return {
            access_token,
        };

    }

    async logout(token: string) {
        try {
            const decoded = this.jwtService.decode(token, { complete: true });
            if (!decoded || !decoded.payload.jti) {
                throw new UnauthorizedException('Invalid token');
            }

            // Add token to blacklist
            await this.tokenBlacklistService.blacklistToken(
                decoded.payload.jti,
                decoded.payload.exp
            );

            return { message: 'Successfully logged out' };
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }

}