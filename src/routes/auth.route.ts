import express from 'express';

import {
  forgotPassword,
  lookUpEmail,
  register,
  resentOTP,
  session,
  setNewPassword,
  setTransactionPin,
  signInWithPassword,
  signInWithPin,
  verifyEmail,
  verifyOtp,
  changePassword,
  deleteAccount,
  logOut,
  changePin,
} from '../controllers/Auth';

import { protect } from '../middlewares';

const router = express.Router();

router.post('/look-up', lookUpEmail);
router.post('/register', register);

router.post('/forgot-password', forgotPassword);
router.post('/set-new-password', setNewPassword);
router.post('/signin-with-password', signInWithPassword);
router.post('/signin-with-pin', signInWithPin);
router.post('/resend-otp', resentOTP);
router.post('/verify-otp', verifyOtp);

router.use(protect);
router.post('/verify-email', verifyEmail);
router.post('/set-transaction-pin', setTransactionPin);
router.get('/session', session);
router.put('/change-password', changePassword);
router.put('/change-pin', changePin);
router.delete('/delete-account', deleteAccount);
router.post('/logout', logOut);

export default router;
