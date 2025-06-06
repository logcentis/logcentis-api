import authService from '@/api/auth/authService';
import sessionRepository from '@/api/auth/sessionRepository';
import { AuthenticationError } from '@/common/exceptions/authenticationError';
import { ServiceResponse } from '@/common/models/serviceResponse';
import { env } from '@/common/utils/envConfig';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    const { refreshToken, accessToken, session } = await authService.login(
      email,
      password,
      req.ip as string,
      req.headers['user-agent'] as string
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.isProduction,
      expires: new Date(session.expiresAt),
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: env.isProduction,
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    });

    res
      .status(StatusCodes.OK)
      .json(ServiceResponse.success('Login successful', null, StatusCodes.OK));
  }

  async logout(req: Request, res: Response) {
    const sessionId = req.session?.id;

    if (!sessionId) {
      throw new AuthenticationError('Session not found');
    }

    await sessionRepository.logoutSession(sessionId);

    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');

    res
      .status(StatusCodes.OK)
      .json(ServiceResponse.success('Logout successful', null, StatusCodes.OK));
  }
}

export default new AuthController();
