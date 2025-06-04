import { Request, Response } from 'express';
import { ServiceResponse } from '@/common/models/serviceResponse';
import userService from '@/api/user/userService';

class UserController {
  async findCurrentUser(req: Request, res: Response) {
    res.json('Doido');
  }

  async createUser(req: Request, res: Response) {
    const newUser = await userService.createUser(req.body);
    res.status(201).json(ServiceResponse.success('User created successfully', newUser, 201));
  }
}

export default new UserController();