import sessionRepository from '@/api/auth/sessionRepository';
import { UserDTO } from '@/api/user/userModel';
import userRepository from '@/api/user/userRepository';
import { AuthenticationError } from '@/common/exceptions/authenticationError';
import { InvalidCredentialsError } from '@/common/exceptions/invalidCredentialsError';
import ResourceNotFoundError from '@/common/exceptions/resourceNotFoundError';
import { env } from '@/common/utils/envConfig';
import { Session } from '@/types/db';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';
import { Selectable } from 'kysely';

class AuthService {
  /**
   * Logs in a user by validating their email and password.
   * @param email - The email of the user.
   * @param password - The password of the user.
   * @throws ResourceNotFoundError if the user is not found.
   * @throws Error if the credentials are invalid.
   */
  async login(
    email: string,
    password: string,
    ipAddress: string,
    userAgent: string
  ) {
    const user = await userRepository.getUserByEmail(email);

    if (!user) {
      throw new ResourceNotFoundError('User');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    return await this.generateTokens(user, ipAddress, userAgent);
  }

  async generateTokens(
    user: UserDTO,
    ipAddress: string,
    userAgent: string,
    sessionId?: string
  ) {
    let userSession: Selectable<Session> | null = null;

    if (sessionId) {
      userSession = this.validateSession(
        await sessionRepository.getSession(sessionId)
      );
    } else {
      sessionId = crypto.randomUUID();
    }

    const secret = jose.base64url.decode(env.JWT_SECRET);

    const expiresAt = userSession?.expiresAt
      ? new Date(userSession.expiresAt.getTime() + 7 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const refreshTokenPromise = new jose.EncryptJWT({
      sessionId: userSession?.id || sessionId,
    })
      .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
      .setIssuedAt()
      .setIssuer('logcentis')
      .setAudience('logcentis-api')
      .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
      .encrypt(secret);

    const accessTokenPromise = new jose.EncryptJWT({
      sessionId: userSession?.id || sessionId,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
      .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
      .setIssuedAt()
      .setIssuer('logcentis')
      .setAudience('logcentis-api')
      .setExpirationTime('1h')
      .encrypt(secret);

    const [refreshToken, accessToken] = await Promise.all([
      refreshTokenPromise,
      accessTokenPromise,
    ]);

    if (!userSession) {
      userSession = await sessionRepository.createSession({
        id: sessionId,
        userId: user.id,
        expiresAt,
        ipAddress,
        userAgent,
        refreshToken,
        accessToken,
      });
    } else {
      userSession = await sessionRepository.updateSessionToken(
        userSession.id,
        refreshToken
      );
    }

    return {
      refreshToken,
      accessToken,
      session: userSession as Selectable<Session>,
    };
  }

  async refreshTokens(
    refreshToken: string,
    sessionId: string,
    ipAddress: string,
    userAgent: string
  ) {
    const session = this.validateSession(
      await sessionRepository.getSession(sessionId)
    );

    if (session.refreshToken !== refreshToken) {
      await sessionRepository.logoutSession(session.id);
      throw new AuthenticationError('Invalid refresh token');
    }

    const user = await userRepository.getUserById(session.userId);

    if (!user) {
      throw new ResourceNotFoundError('User');
    }

    const generatedPayload = await this.generateTokens(
      user,
      ipAddress,
      userAgent,
      session.id
    );

    return {
      ...generatedPayload,
      user,
    };
  }

  validateSession(session: Selectable<Session> | null) {
    if (!session) {
      throw new ResourceNotFoundError('Session');
    }
    if (session.status !== 'active') {
      throw new AuthenticationError('Session is inactive');
    }
    if (session.expiresAt < new Date()) {
      sessionRepository.logoutSession(session.id);
      throw new AuthenticationError('Session expired');
    }

    return session;
  }
}

export default new AuthService();
