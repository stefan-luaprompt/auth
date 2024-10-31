import { Controller, Get, Param, Headers, UnauthorizedException } from '@nestjs/common';
import * as jose from 'node-jose';
import * as crypto from 'crypto'; // Import crypto for generating a hash for kid
import * as fs from 'fs';
import { TokenBlacklistService } from 'src/services/blacklist.servive';

@Controller('auth')
export class JwksController {
    constructor(private tokenBlacklistService: TokenBlacklistService) { }
    private publicKey = process.env.AUTH_PUBLIC_KEY;
    private readonly MIN_CACHE_TTL = 60;
    private readonly DEFAULT_CACHE_TTL = 300; // 5 minutes default

    // Define the JWKS endpoint
    @Get('/.well-known/jwks.json')
    async getJwks() {
        // console.log('Generating JWKS');
        const keyStore = jose.JWK.createKeyStore();

        // Import the PEM-formatted public key
        const key = await keyStore.add(this.publicKey, 'pem', { alg: 'RS256', use: 'sig' });

        // Generate the `kid` (Key ID) by hashing the public key (base64url encoded)
        const pubKey = key.toPEM(false); // Get the PEM-formatted public key (false means public key)
        const kid = crypto.createHash('sha256').update(pubKey).digest('base64url'); // Generate kid
        // console.log('kid:', kid);
        // Export the key in JWK format and include the dynamically generated kid
        const jwkKey = key.toJSON();
        jwkKey.kid = kid; // Set the dynamically generated kid

        // Return the key in JWKS format
        return {
            keys: [jwkKey],
        };
    }


    @Get('token/status/:jti')
    async checkTokenStatus(
        @Param('jti') jti: string,
        @Headers('X-Token-Exp') expHeader: string
    ) {
        const isBlacklisted = await this.tokenBlacklistService.isTokenBlacklisted(jti);
        if (isBlacklisted) {
            throw new UnauthorizedException('User Signed Out');
        }

        return {

        };
    }







}
