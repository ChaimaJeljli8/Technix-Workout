import express from 'express';
import {verifyToken} from '../middleware/verifyToken.js'
//controller functions
import {
    signupUser,
    loginUser,
    logoutUser,
    verifyEmail,
    forgotPassword,
    resetPassword,
    checkAuth,
    updateProfile, 
    getProfile 
  } from '../controllers/userController.js';
  import { upload } from '../middleware/uploadMiddleware.js';
const router = express.Router();
//authentificatin check
router.get('/check-auth',verifyToken, checkAuth)
//verification
router.post('/verify-email', verifyEmail);
//signup route
router.post('/signup', signupUser);
//login route
router.post('/login', loginUser);
//forgot password
router.post('/forgot-password', forgotPassword);
//reset password
router.post('/reset-password/:token', resetPassword);
//logout route
router.post('/logout', logoutUser);


// profile
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, upload.single('profilePicture'), updateProfile);


export { router as UserRoutes }; 