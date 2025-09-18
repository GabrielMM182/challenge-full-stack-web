
import { Router } from 'express';
import studentRoutes from './student.routes';
import authRoutes from './auth.routes';

const router = Router();

router.use('/students', studentRoutes);
router.use('/auth', authRoutes);

router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Student Management API',
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;