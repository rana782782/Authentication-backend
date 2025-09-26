import express from 'express';

const authRouter = express.Router();
import {register, login,logout,sendVerifyOtp,verifyEmail,resetPasswordOtp,resetPassword} from '../controllers/authController.js';
import {userAuth} from '../middleware/userAuth.js';

authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',logout);
authRouter.post('/send-verify-otp',userAuth,sendVerifyOtp);
authRouter.post('/verify-email',userAuth,verifyEmail);
authRouter.post('/reset-password-otp',userAuth,resetPasswordOtp);
authRouter.post('/reset-password',userAuth,resetPassword);

export default authRouter;