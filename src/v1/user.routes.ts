import { Hono } from 'hono';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireAdmin, requireUser } from '../middlewares/roleAssertion.middleware';

export const route = new Hono();
const userController = new UserController();

// Auth routes (public)
route.post('/auth/register', userController.registerUser);
route.post('/auth/login', userController.loginUser);
route.post('/auth/logout', userController.logoutUser);
route.post('/auth/refresh-tokens', userController.refreshTokens);
route.post('/auth/forgot-password', userController.forgotPassword);
route.post('/auth/reset-password', userController.resetPassword);
route.get('/auth/verify-email', userController.verifyEmail);

// Protected auth routes
route.post('/auth/change-password', authMiddleware, userController.changePassword);

// User management routes (admin only)
route.post('/', authMiddleware, requireAdmin, userController.createEntity);
route.get('/', authMiddleware, requireAdmin, userController.fetchAllEntity);
route.get('/:id', authMiddleware, requireUser, userController.fetchOneEntity);
route.patch('/:id', authMiddleware, requireAdmin, userController.updateOneEntity);
route.delete('/:id', authMiddleware, requireAdmin, userController.deleteOneEntity);

// User activation/deactivation (admin only)
route.patch('/:id/deactivate', authMiddleware, requireAdmin, userController.deactivateUser);
route.patch('/:id/activate', authMiddleware, requireAdmin, userController.activateUser);
