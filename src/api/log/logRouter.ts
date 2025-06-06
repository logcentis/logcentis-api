import requireAuth from '@/common/middleware/requireAuth';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Router } from 'express';

export const logRegistry = new OpenAPIRegistry();
export const logRouter: Router = express.Router();

logRouter.get('/', requireAuth, (req, res) => {
  res.status(200).json({
    message: 'Log endpoint is working',
    user: req.user, // Assuming req.user is set by requireAuth middleware
    session: req.session,
  });
});
