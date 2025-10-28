import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  uploadUserImage,
  resizeUserImage,
  changeUserPassword,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deleteLoggedUserData,
  requestActivationCode,
  activateLoggedUserData,
} from '../controllers/UserController.js';

import {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  updateLoggedUserValidator,
} from '../utils/validators/userValidator.js';
import { protect, allowedTo } from '../controllers/AuthController.js';
const router = express.Router();
/** -----------------------
 * 🔐 Password Management
 * ----------------------- **/
router.use(protect);
//normal logged user
router.get('/getMe', getLoggedUserData, getUser);
router.put('/changeMyPassword', updateLoggedUserPassword);
router.put('/updateMe', updateLoggedUserValidator, updateLoggedUserData);
router.delete('/deleteMe', deleteLoggedUserData);
router.post('/requestActivation', requestActivationCode);
router.patch('/activateMe', activateLoggedUserData);

/*********************/
router.use(allowedTo('admin, manager'));
router.put('/changePassword/:id', changeUserPasswordValidator, changeUserPassword);
/** -----------------------
 * 👤 User CRUD Routes
 * ----------------------- **/
router
  .route('/')
  .get(getUsers)
  .post(uploadUserImage, resizeUserImage, createUserValidator, createUser);

router
  .route('/:id')
  .get(getUserValidator, getUser)
  .put(uploadUserImage, resizeUserImage, updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);
/** -----------------------
 * 🧩 Export Router
 * ----------------------- **/
export default router;
