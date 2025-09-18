export {
  createStudent,
  findStudentById,
  updateStudent,
  deleteStudent,
  findStudents,
  findStudentByRA,
  findStudentByCPF,
  findStudentByEmail,
} from './student.repository';

export {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByIdWithPassword,
  updateUser,
  deleteUser,
  checkEmailExists,
  findAllUsers,
  updateUserRole,
} from './user.repository';

export {
  createStudentUserRelation,
} from './studentUser.repository';