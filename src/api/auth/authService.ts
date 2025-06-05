import { UserDTO } from '@/api/user/userModel';
import userRepository from '@/api/user/userRepository';
import { InvalidCredentialsError } from '@/common/exceptions/invalidCredentialsError';
import ResourceNotFoundError from '@/common/exceptions/resourceNotFoundError';
import logger from '@/common/utils/logger';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';

class AuthService {
  /**
   * Logs in a user by validating their email and password.
   * @param email - The email of the user.
   * @param password - The password of the user.
   * @throws ResourceNotFoundError if the user is not found.
   * @throws Error if the credentials are invalid.
   */
  async login(email: string, password: string) {
    const user = await userRepository.getUserByEmail(email);

    if (!user) {
      throw new ResourceNotFoundError('User');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }
  }

  private async generateTokens(user: UserDTO, sessionId: string) {
    const secret = jose.base64url.decode(
      'zH4NRP1HMALxxCFnRZABFA7GOJtzU_gIj02alfL1lvI'
    );

    //TODO: Implement refresh token generation

    const jwt = await new jose.EncryptJWT({
      sessionId: '1234567890',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
      .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
      .setIssuedAt()
      .setIssuer('logcentis')
      .setAudience('logcentis')
      .setExpirationTime('1h')
      .encrypt(secret);

    logger.info(jwt);
  }
}

export default new AuthService();
