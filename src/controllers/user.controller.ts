import { Context } from 'hono';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { 
  createUser, 
  getUsers, 
  getUser, 
  updateUser, 
  deleteUser,
  CreateUserDto,
  UpdateUserDto 
} from '../validations/user.validation';
import { 
  register, 
  login, 
  refreshTokens, 
  forgotPassword, 
  resetPassword, 
  verifyEmail, 
  changePassword 
} from '../validations/auth.validation';
import { BaseController } from '../commons/base.interface';
import { User } from '@prisma/client';
import httpStatus from 'http-status';
import { Id, Page, Limit } from '../commons/base.types';

export class UserController implements BaseController<User, CreateUserDto> {
  private userService = new UserService();
  private authService = new AuthService();

  public createEntity = async (c: Context) => {
    const body = await c.req.json();
    const validatedData = createUser.parse(body);
    
    const user = await this.userService.create(validatedData);
    const { password, ...userWithoutPassword } = user;
    
    return c.json({
      statusCode: httpStatus.CREATED,
      message: 'User created successfully',
      data: userWithoutPassword,
    }, httpStatus.CREATED);
  };

  public fetchAllEntity = async (c: Context) => {
    const query = c.req.query();
    const { limit, page } = getUsers.parse(query);
    
    const users = await this.userService.findAll({}, page as Page, limit as Limit);
    
    return c.json({
      statusCode: httpStatus.OK,
      message: 'Users fetched successfully',
      data: users,
    });
  };

  public fetchOneEntity = async (c: Context) => {
    const { id } = getUser.parse({ id: c.req.param('id') });
    
    const user = await this.userService.findOne(id as Id);
    
    return c.json({
      statusCode: httpStatus.OK,
      message: 'User fetched successfully',
      data: user,
    });
  };

  public updateOneEntity = async (c: Context) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const validatedData = updateUser.parse({ params: { id }, body });
    
    const user = await this.userService.updateOne(
      validatedData.params.id as Id, 
      validatedData.body
    );
    
    return c.json({
      statusCode: httpStatus.OK,
      message: 'User updated successfully',
      data: user,
    });
  };

  public deleteOneEntity = async (c: Context) => {
    const { id } = deleteUser.parse({ id: c.req.param('id') });
    
    await this.userService.deleteOne(id as Id);
    
    return c.json({
      statusCode: httpStatus.OK,
      message: 'User deleted successfully',
    });
  };

  public deactivateUser = async (c: Context) => {
    const { id } = deleteUser.parse({ id: c.req.param('id') });
    
    const user = await this.userService.deactivateUser(id as Id);
    
    return c.json({
      statusCode: httpStatus.OK,
      message: 'User deactivated successfully',
      data: user,
    });
  };

  public activateUser = async (c: Context) => {
    const { id } = deleteUser.parse({ id: c.req.param('id') });
    
    const user = await this.userService.activateUser(id as Id);
    
    return c.json({
      statusCode: httpStatus.OK,
      message: 'User activated successfully',
      data: user,
    });
  };

  // Auth related methods
  public registerUser = async (c: Context) => {
    const body = await c.req.json();
    const validatedData = register.parse(body);
    
    const result = await this.authService.register(validatedData);
    
    return c.json({
      statusCode: httpStatus.CREATED,
      message: 'User registered successfully',
      data: result,
    }, httpStatus.CREATED);
  };

  public loginUser = async (c: Context) => {
    const body = await c.req.json();
    const { email, password } = login.parse(body);
    
    const result = await this.authService.login(email, password);
    
    return c.json({
      statusCode: httpStatus.OK,
      message: 'Login successful',
      data: result,
    });
  };

  public logoutUser = async (c: Context) => {
    const body = await c.req.json();
    const { refreshToken } = refreshTokens.parse(body);
    
    await this.authService.logout(refreshToken);
    
    return c.json({
      statusCode: httpStatus.OK,
      message: 'Logout successful',
    });
  };

  public refreshTokens = async (c: Context) => {
    const body = await c.req.json();
    const { refreshToken } = refreshTokens.parse(body);
    
    const tokens = await this.authService.refreshTokens(refreshToken);
    
    return c.json({
      statusCode: httpStatus.OK,
      message: 'Tokens refreshed successfully',
      data: tokens,
    });
  };

  public forgotPassword = async (c: Context) => {
    const body = await c.req.json();
    const { email } = forgotPassword.parse(body);
    
    const resetToken = await this.authService.forgotPassword(email);
    
    return c.json({
      statusCode: httpStatus.OK,
      message: 'Password reset token generated successfully',
      data: { resetToken },
    });
  };

  public resetPassword = async (c: Context) => {
    const query = c.req.query();
    const body = await c.req.json();
    const validatedData = resetPassword.parse({ query, body });
    
    await this.authService.resetPassword(
      validatedData.query.token,
      validatedData.body.password
    );
    
    return c.json({
      statusCode: httpStatus.OK,
      message: 'Password reset successfully',
    });
  };

  public verifyEmail = async (c: Context) => {
    const { token } = verifyEmail.parse({ token: c.req.query('token') });
    
    await this.authService.verifyEmail(token);
    
    return c.json({
      statusCode: httpStatus.OK,
      message: 'Email verified successfully',
    });
  };

  public changePassword = async (c: Context) => {
    const user = c.get('user');
    const body = await c.req.json();
    const { oldPassword, newPassword } = changePassword.parse(body);
    
    await this.authService.changePassword(user.id, oldPassword, newPassword);
    
    return c.json({
      statusCode: httpStatus.OK,
      message: 'Password changed successfully',
    });
  };
}