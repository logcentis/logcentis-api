import { NewUserDTO, UserDTO } from '@/api/user/userModel';
import userRepository from '@/api/user/userRepository';
import bcrypt from 'bcryptjs';
import { ResourceConflictError } from '@/common/exceptions/resourceConflictError';

class UserService {

  // async getUserById(userId: string): Promise<UserDTO> {
  //
  // }

  async createUser(userData: NewUserDTO): Promise<UserDTO> {
    const { name, email, password } = userData;
    const existingUser = await userRepository.getUserByEmail(email);

    if (existingUser) {
      throw new ResourceConflictError('User with this email already exists', 'UNQ_EMAIL');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userRepository.createUser({ name, email, password_hash: hashedPassword });

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    };
  }
}

export default new UserService();