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
   * Logs in a user with email and password.
   * @param email - The user's email.
   * @param password - The user's password.
   * @param ipAddress - The IP address of the user.
   * @param userAgent - The user agent of the user's device.
   * @returns An object containing access and refresh tokens, and session information.
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

  /**
   * Generates access and refresh tokens for a user.
   * @param user - The user for whom the tokens are generated.
   * @param ipAddress - The IP address of the user.
   * @param userAgent - The user agent of the user's device.
   * @param session - Optional session ID or session object.
   * @returns An object containing the generated tokens and session information.
   */
  async generateTokens(
    user: UserDTO,
    ipAddress: string,
    userAgent: string,
    session?: string | Selectable<Session>
  ) {
    let userSession = typeof session == 'object' ? session : null;

    if (typeof session == 'string') {
      userSession = this.validateSession(
        await sessionRepository.getSession(session)
      );
    } else {
      session = crypto.randomUUID();
    }

    const secret = jose.base64url.decode(env.JWT_SECRET);

    const expiresAt = userSession?.expiresAt
      ? new Date(userSession.expiresAt.getTime() + 7 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const refreshTokenPromise = new jose.EncryptJWT({
      sessionId: userSession?.id || session,
    })
      .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
      .setIssuedAt()
      .setIssuer('logcentis')
      .setAudience('logcentis-api')
      .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
      .encrypt(secret);

    const accessTokenPromise = new jose.EncryptJWT({
      sessionId: userSession?.id || session,
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
        id: session,
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

  /**
   * Refreshes the access and refresh tokens for a user.
   * @param refreshToken - The refresh token provided by the user.
   * @param sessionId - The session ID associated with the user.
   * @param ipAddress - The IP address of the user.
   * @param userAgent - The user agent of the user's device.
   */
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
      session
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
