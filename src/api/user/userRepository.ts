import { NewUserDTO } from '@/api/user/userModel';
import db from '@/common/db';

type CreateUserParams = Omit<NewUserDTO, 'password'> & {
  passwordHash: string;
};

export class UserRepository {
  /**
   * Retrieves a user by their ID.
   * @param userId - The ID of the user to retrieve.
   * @returns A promise that resolves to the user object or null if not found.
   */
  async getUserById(userId: string) {
    const user = await db
      .selectFrom('user')
      .selectAll()
      .where('id', '=', userId)
      .executeTakeFirst();

    return user || null;
  }

  /**
   * Retrieves a user by their email.
   * @param email - The email of the user to retrieve.
   * @returns A promise that resolves to the user object or null if not found.
   */
  async getUserByEmail(email: string) {
    const result = await db
      .selectFrom('user')
      .where('email', '=', email)
      .selectAll()
      .executeTakeFirst();

    return result || null;
  }

  /***
   * Creates a new user in the database.
   * @param userData - The data of the user to create.
   * @returns A promise that resolves to the created user object.
   */
  async createUser(userData: CreateUserParams) {
    return db
      .insertInto('user')
      .values({
        name: userData.name,
        email: userData.email,
        passwordHash: userData.passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }
}

export const userRepository = new UserRepository();