import { NewUserDTO, UserDTO } from '@/api/user/userModel';
import { UserRepository } from '@/api/user/userRepository';
import { ResourceConflictError } from '@/common/exceptions/resourceConflictError';
import bcrypt from 'bcryptjs';

export class UserService {
  private userRepository: UserRepository;

  constructor(userRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  async createUser(userData: NewUserDTO): Promise<UserDTO> {
    const { name, email, password } = userData;
    const existingUser = await this.userRepository.getUserByEmail(email);

    if (existingUser) {
      throw new ResourceConflictError(
        'User with this email already exists',
        'UNQ_EMAIL'
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.userRepository.createUser({
      name,
      email,
      passwordHash: hashedPassword,
    });

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    };
  }
}

export const userService = new UserService();
