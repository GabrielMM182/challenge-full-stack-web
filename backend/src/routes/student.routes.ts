import { Router } from 'express';
import {
  createStudentHandler,
  getStudentsHandler,
  getStudentByIdHandler,
  updateStudentHandler,
  deleteStudentHandler,
} from '../controllers/student.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getStudentsHandler);
router.get('/:id', getStudentByIdHandler);

router.post('/', authenticateToken, createStudentHandler);
router.put('/:id', authenticateToken, updateStudentHandler);
router.delete('/:id', authenticateToken, deleteStudentHandler);

export default router;