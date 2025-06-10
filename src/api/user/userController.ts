import { userService } from '@/api/user/userService';
import { ServiceResponse } from '@/common/models/serviceResponse';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

class UserController {
  async findCurrentUser(req: Request, res: Response) {
    res.json('mó piroca dazideia');
  }

  async createUser(req: Request, res: Response) {
    const newUser = await userService.createUser(req.body);
    res
      .status(StatusCodes.CREATED)
      .json(ServiceResponse.success('User created successfully', newUser, 201));
  }
}

export default new UserController();
