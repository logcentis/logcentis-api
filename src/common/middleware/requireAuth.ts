import { SessionPayload, SessionPayloadSchema } from '@/api/auth/authModel';
import authService from '@/api/auth/authService';
import sessionRepository from '@/api/auth/sessionRepository';
import { ServiceResponse } from '@/common/models/serviceResponse';
import { env } from '@/common/utils/envConfig';
import logger from '@/common/utils/logger';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as jose from 'jose';

const invalidResponse = (res: Response) => {
  return res
    .status(StatusCodes.UNAUTHORIZED)
    .json(
      ServiceResponse.failure(
        'Invalid or expired token',
        null,
        StatusCodes.UNAUTHORIZED,
        'AUTH_FAILD'
      )
    );
};

const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.cookies.accessToken;
  const secret = jose.base64url.decode(env.JWT_SECRET);

  try {
    if (!accessToken) {
      logger.debug('Access token not found in cookies');
      throw new Error();
    }

    const { payload: accessPayload } = await jose.jwtDecrypt(
      accessToken,
      secret
    );

    if (SessionPayloadSchema.safeParse(accessPayload).success === false) {
      logger.debug('Access token payload validation failed');
      invalidResponse(res);
      return;
    }

    logger.debug('Access token payload validated successfully');

    const sessionPayload = accessPayload as SessionPayload;

    req.session = authService.validateSession(
      await sessionRepository.getSession(sessionPayload.sessionId as string)
    );

    req.user = {
      id: sessionPayload.user.id,
      name: sessionPayload.user.name,
      email: sessionPayload.user.email,
    };
  } catch {
    // If access token is invalid or expired we try to validate the refresh token
    try {
      logger.debug('Access token validation failed, checking refresh token');
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        logger.debug('Refresh token not found in cookies');
        throw new Error();
      }

      const { payload } = await jose.jwtDecrypt(refreshToken, secret);

      if (!payload.sessionId) {
        logger.debug('Refresh token payload does not contain sessionId');
        throw new Error();
      }

      const renewedContent = await authService.refreshTokens(
        refreshToken,
        payload.sessionId as string,
        req.ip as string,
        req.headers['user-agent'] as string
      );

      res.cookie('refreshToken', renewedContent.refreshToken, {
        httpOnly: true,
        secure: env.isProduction,
        expires: new Date(renewedContent.session.expiresAt),
      });

      res.cookie('accessToken', renewedContent.accessToken, {
        httpOnly: true,
        secure: env.isProduction,
        expires: new Date(Date.now() + 60 * 60 * 1000),
      });

      // defining session
      req.session = renewedContent.session;
      req.user = {
        id: renewedContent.user.id,
        name: renewedContent.user.name,
        email: renewedContent.user.email,
      };
    } catch (err) {
      logger.error(err);
      invalidResponse(res);
      return;
    }
  }

  next();
};

export default requireAuth;
