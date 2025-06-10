import db from '@/common/db';

interface PartialSession {
  id?: string;
  userId: string;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
  refreshToken: string;
  accessToken: string;
}

export class SessionRepository {
  async getSession(sessionId: string) {
    return (
      (await db
        .selectFrom('session')
        .selectAll()
        .where('id', '=', sessionId)
        .executeTakeFirst()) || null
    );
  }

  async createSession(newSession: PartialSession) {
    return (
      (await db
        .insertInto('session')
        .values({
          id: newSession.id,
          userId: newSession.userId,
          expiresAt: newSession.expiresAt,
          ipAddress: newSession.ipAddress,
          userAgent: newSession.userAgent,
          refreshToken: newSession.refreshToken,
        })
        .returningAll()
        .executeTakeFirst()) || null
    );
  }

  async updateSessionToken(sessionId: string, refreshToken: string) {
    return (
      (await db
        .updateTable('session')
        .set({ refreshToken })
        .where('id', '=', sessionId)
        .returningAll()
        .executeTakeFirst()) || null
    );
  }

  async logoutSession(sessionId: string) {
    return await db
      .updateTable('session')
      .set({ status: 'inactive' })
      .where('id', '=', sessionId)
      .returningAll()
      .executeTakeFirst();
  }
}

export const sessionRepository = new SessionRepository();
