import express from 'express';
import { protect, allowedTo } from '../controllers/AuthController.js';
import {
  addAddress,
  removeAddress,
  getLoggedUserAddresses,
  getAddressById,
  updateAddress,
} from '../controllers/AddressController.js';
import {
  addAddressValidator,
  removeAddressValidator,
} from '../utils/validators/addressesValidator.js';

const router = express.Router();

router.use(protect, allowedTo('user'));

router.route('/').get(getLoggedUserAddresses).post(addAddressValidator, addAddress);
router.route('/:addressId').get(getAddressById);
router.put('/:addressId', updateAddress);
router.delete('/:addressId', removeAddressValidator, removeAddress);

export default router;
