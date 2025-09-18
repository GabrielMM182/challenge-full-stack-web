import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser } from '../services/auth.service';
import { UserRegisterInput, UserLoginInput } from '../types/auth.types';
import { AuthenticatedRequest } from '../types/express.types';
import { ApiResponse } from '../types/common.types';

export const registerHandler = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const userData: UserRegisterInput = req.body;
    if (!userData.name || !userData.email || !userData.password) {
       res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name, email, and password are required',
          details: [
            ...((!userData.name) ? [{ field: 'name', message: 'Name is required' }] : []),
            ...((!userData.email) ? [{ field: 'email', message: 'Email is required' }] : []),
            ...((!userData.password) ? [{ field: 'password', message: 'Password is required' }] : []),
          ],
        },
        timestamp: new Date().toISOString(),
      });
    }

    const result = await registerUser(userData);

    res.status(201).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const loginHandler = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const loginData: UserLoginInput = req.body;
    if (!loginData.email || !loginData.password) {
       res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required',
          details: [
            ...((!loginData.email) ? [{ field: 'email', message: 'Email is required' }] : []),
            ...((!loginData.password) ? [{ field: 'password', message: 'Password is required' }] : []),
          ],
        },
        timestamp: new Date().toISOString(),
      });
    }

    const result = await loginUser(loginData);

    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const getMeHandler = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
       res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'User not authenticated',
        },
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};