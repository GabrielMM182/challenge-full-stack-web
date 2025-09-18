import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { ApiResponse } from '../types/common.types';

export const authRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'RATE_LIMIT_ERROR',
        message: 'Too many authentication attempts. Please try again in 1 minute.'
      },
      timestamp: new Date().toISOString()
    };
    
    res.status(429).json(response);
  }
});