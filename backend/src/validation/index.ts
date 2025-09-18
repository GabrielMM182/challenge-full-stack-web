export {
  userRegisterSchema,
  userLoginSchema,
  changePasswordSchema,
  resetPasswordSchema,
  tokenSchema,
  validateUserRegister,
  validateUserLogin,
  validateChangePassword,
  validateResetPassword,
  validateToken,
  validateUserRegisterSafe,
  validateUserLoginSafe,
  type UserRegisterInput,
  type UserLoginInput,
  type ChangePasswordInput,
  type ResetPasswordInput,
  type TokenInput
} from './auth.validation';

export {
  studentCreateSchema,
  studentUpdateSchema,
  studentFiltersSchema,
  studentIdSchema,
  validateStudentCreate,
  validateStudentUpdate,
  validateStudentFilters,
  validateStudentId,
  validateStudentCreateSafe,
  validateStudentUpdateSafe,
  type StudentCreateInput,
  type StudentUpdateInput,
  type StudentFilters,
  type StudentIdParams
} from './student.validation';
