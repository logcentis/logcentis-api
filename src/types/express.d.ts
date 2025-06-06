import { Session } from '@/types/db';
import { Selectable } from 'kysely';

declare global {
  namespace Express {
    interface Request {
      session?: Selectable<Session>;
      user?: UserDTO;
    }
  }
}
