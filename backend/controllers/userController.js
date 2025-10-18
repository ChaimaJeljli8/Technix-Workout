import {User} from '../models/userModel.js';
import {Notification} from'../models/notificationsModel.js'
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';

import { sendVerificationEmail,sendWelcomeEmail,sendPasswordResetEmail,sendResetSuccessEmail } from '../mailtrap/emails.js';
import {generateTokenAndSetCookie} from '../utils/generateTokenAndSetCookie.js';

import { isAdmin } from '../middleware/adminMiddleware.js'

// Signup user
export const signupUser = async (req, res) => {
  const { email, password, name, role } = req.body;

  try {
      if (!email || !password || !name) {
          throw new Error("All fields are required");
      }

      const userAlreadyExists = await User.findOne({ email });
      if (userAlreadyExists) {
          return res.status(400).json({ success: false, message: "User already exists" });
      }

      const hashedPassword = await bcryptjs.hash(password, 10);
      const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

      const user = new User({
          email,
          password: hashedPassword,
          name,
          verificationToken,
          verificationTokenExpiersAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
          role: role || "user", // Default to "user"
      });

      await user.save();
      // Generate token
      const token = generateTokenAndSetCookie(res, user);  

      await sendVerificationEmail(user.email, verificationToken);

      res.status(201).json({
          success: true,
          message: "User created successfully",
          user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              
              profilePicture:user.profilePicture,
              token 
          },
      });

      // Create a notification
        const notification = new Notification({
          userId: user._id, // Add userId
          title: "New User SignedUp", // Add title
          message: `New User SignedUp : ${user.email}`,
          type: "signup",
        });
        await notification.save();


  } catch (error) {
        res.status(400).json({ success: false, message: error.message });
  }
};

  // Verify email
  export const verifyEmail = async (req, res) => {
    const { code } = req.body;
  
    try {
      const user = await User.findOne({
        verificationToken: code,
        verificationTokenExpiersAt: { $gt: Date.now() },
      });

      if (!user) {
        console.error(`User not found for verification`);
        return res.status(400).json({ success: false, message: "Invalid credentials" });
      }

      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpiersAt = undefined;
      await user.save();

      await sendWelcomeEmail(user.email, user.name);

      res.status(200).json({
        success: true,
        message: "Email verified successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role, 
        },
      });
    } catch (error) {
      console.error("Error in verifyEmail:", error);
      res.status(400).json({ success: false, message: "Server error" });
    }
};

//logout user
export const logoutUser = async (req,res) => {
  res.clearCookie("token");
  res.status(200).json({success: true, message: "Logged out successfully"});

};
//login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  // Check for missing fields
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(400).json({ success: false, message: "Invalid credentials" });
      }
      if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const isPasswordValid = await bcryptjs.compare(password, user.password);
      if (!isPasswordValid) {
          return res.status(400).json({ success: false, message: "Invalid credentials" });
      }
      // Create a token
      const token = generateTokenAndSetCookie(res, user);   // Pass the whole user, not just user._id
      user.lastLogin = new Date();
      await user.save();

      res.status(200).json({
        success: true,
        message: "Logged In successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token,
        },
      });
      // Create a notification
        const notification = new Notification({
          userId: user._id, // Add userId
          title: "User loged in", // Add title
          message: ` user loged in: ${user.email}`,
          type: "login",
        });
        await notification.save();
  } catch (error) {
      console.log("ERROR in login", error);
      res.status(400).json({ success: false, message: error.message });
       
  }
};

//forgotPassword
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}
        //// Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

		user.resetPasswordToken = resetToken;
		user.resetPasswordExpiersAt = resetTokenExpiresAt;

		await user.save();
        // send email
        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

        res.status(200).json({ success: true, message: "Password reset link sent to your email" });
    } catch (error) {
        console.log("Error in forgotPassword ", error);
        res.status(400).json({ success: false, message: error.message });
    }
};
export const resetPassword = async (req,res) => {
    try {
		const { token } = req.params;
		const { password } = req.body;

		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpiersAt: { $gt: Date.now() },
		});
		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
		}
		// update the password
		const hashedPassword = await bcryptjs.hash(password, 10);

		user.password = hashedPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpiersAt = undefined;
		await user.save();

		await sendResetSuccessEmail(user.email);

		res.status(200).json({ success: true, message: "Password reset successful" });
	} catch (error) {
		console.log("Error in resetPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const checkAuth = async (req, res) => {
	try {
		const user = await User.findById(req.userId).select("-password");//unselect the password field
		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}
		res.status(200).json({ success: true, user });
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const getProfile = async (req, res) => {
  try {
      const user = await User.findById(req.user._id).select('-password');

      if (!user) {
          return res.status(404).json({
              success: false,
              message: "User not found"
          });
      }

      res.status(200).json({
          success: true,
          user: {
              id: user._id,
              name: user.name,
              email: user.email,
              profilePicture: user.profilePicture,
              isVerified: user.isVerified,
              role: user.role 
          }
      });
  } catch (error) {
      console.error('Error in getProfile:', error);
      res.status(500).json({
          success: false,
          message: "Error fetching user profile"
      });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
      const updates = { ...req.body };

       // If password is being updated, hash it
       if (updates.password) {
        updates.password = await bcryptjs.hash(updates.password, 10);
      }
      // If updating profile picture
      
      if (req.file) {
          updates.profilePicture = `/uploads/profiles/${req.file.filename}`;
      }

      const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true }).select('-password');

      if (!user) {
          return res.status(404).json({ success: false, message: "User not found" });
      }

      res.status(200).json({
          success: true,
          message: "Profile updated successfully",
          user,
      });


       // Create a notification
    const notification = new Notification({
      userId: user._id,
      title: "Profile Updated", 
      message: `user updated his account: ${user.email}`,
      type: "update",
    });
    await notification.save();
  } catch (error) {
      console.error("Error in updateProfile:", error);
      res.status(400).json({ success: false, message: error.message });
       // Log error notification
       const notification = new Notification({
        userId: req.user._id, // Ensure userId is present
        title: "Update Error", // Provide a title
        message: `update error: ${error.message}`,
        type: "error",
      });
      await notification.save();
  }
};

//admin
export const getAllUsers =  [
  isAdmin,
  async (req, res) => {
  try {
      if (!req.user || req.user.role !== 'admin') {
          return res.status(403).json({ success: false, message: "Access denied" });
      }

      const users = await User.find().select("-password"); // Exclude password
      res.status(200).json(users);
  } catch (error) {
      res.status(500).json({ success: false, message: "Error fetching users" });
  }
}];

export const deleteUser = [
  isAdmin,
  async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Access denied" });
      }

      const { id } = req.params;
      const deletedUser = await User.findByIdAndDelete(id);

      if (!deletedUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      const notification = new Notification({
        userId: req.user._id,
        title: "User Deleted",
        message: `User ${deletedUser.email} was deleted`,
        type: "update"
      });
      await notification.save();
      res.status(200).json({ success: true, message: "User deleted successfully" });

    } catch (error) {
      res.status(500).json({ success: false, message: "Error deleting user" });
    }
  }
];

export const createUser = [
  isAdmin,
  async (req, res) => {
    try {
      const { email, password, name, role } = req.body;
      
      if (!email || !password || !name) {
        return res.status(400).json({ success: false, message: "All fields are required" });
      }

      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ success: false, message: "User already exists" });
      }

      const hashedPassword = await bcryptjs.hash(password, 10);
      
      const user = new User({
        email,
        password: hashedPassword,
        name,
        role: role || "user",
        isVerified: true // Admin-created users are automatically verified
      });

      await user.save();

      res.status(201).json({
        success: true,
        message: "User created successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
];

// Update user (Admin only)
export const updateUser = [
  isAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = { ...req.body };
      
      // If password is being updated, hash it
      if (updates.password) {
        updates.password = await bcryptjs.hash(updates.password, 10);
      }

      // If updating profile picture
      if (req.file) {
        updates.profilePicture = `/uploads/profiles/${req.file.filename}`;
      }

      const user = await User.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      const notification = new Notification({
        userId: user._id,
        title: "User Updated by Admin",
        message: `User ${user.email} was updated by admin`,
        type: "update"
      });
      await notification.save();

      res.status(200).json({
        success: true,
        message: "User updated successfully",
        user
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
];




