jest.mock('bcryptjs', () => ({
  hash: jest.fn(() => Promise.resolve('mocked_hash')),
  compare: jest.fn((password) => Promise.resolve(password === 'mocked_hash')),
}));

import { UserRepository } from '@/api/user/userRepository';
import { UserService } from '@/api/user/userService';
import { ResourceConflictError } from '@/common/exceptions/resourceConflictError';
import bcrypt from 'bcryptjs';

describe('userService', () => {
  let userServiceInstance: UserService;
  let userRepositoryInstance: UserRepository;

  beforeEach(() => {
    userRepositoryInstance = new UserRepository();
    userServiceInstance = new UserService(userRepositoryInstance);
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const newUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'mocked_hash',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userRepositoryInstance.getUserByEmail = jest.fn().mockResolvedValue(null);

      userRepositoryInstance.createUser = jest.fn().mockResolvedValue(newUser);

      const result = await userServiceInstance.createUser({
        name: newUser.name,
        email: newUser.email,
        password: 'testPassword',
      });

      expect(result).toEqual({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      });

      expect(userRepositoryInstance.getUserByEmail).toHaveBeenCalledWith(
        newUser.email
      );
      expect(bcrypt.hash).toHaveBeenCalledTimes(1);
      expect(userRepositoryInstance.createUser).toHaveBeenCalledWith({
        name: newUser.name,
        email: newUser.email,
        passwordHash: 'mocked_hash',
      });
    });

    it('should throw ResourceConflictError if user already exists', async () => {
      const existingUser = {
        id: '1',
        name: 'Existing User',
        email: 'test@example.com',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      userRepositoryInstance.getUserByEmail = jest
        .fn()
        .mockResolvedValue(existingUser);

      await expect(
        userServiceInstance.createUser({
          name: existingUser.name,
          email: existingUser.email,
          password: 'testPassword',
        })
      ).rejects.toThrow(ResourceConflictError);

      expect(userRepositoryInstance.getUserByEmail).toHaveBeenCalledWith(
        existingUser.email
      );

      expect(userRepositoryInstance.createUser).not.toHaveBeenCalled();
    });
    // end of describe
  });
});
