import express from "express";
import { isAdmin } from "../middleware/adminMiddleware.js";
import { 
  getAllUsers, 
  deleteUser, 
  createUser, 
  updateUser 
} from "../controllers/userController.js";
import { 
  getAllWorkouts, 
  deleteAnyWorkout, 
  createWorkoutAdmin, 
  updateWorkoutAdmin 
} from "../controllers/workoutController.js";
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// User management routes
router.get("/users", isAdmin, getAllUsers);
router.post("/users", isAdmin, createUser);
router.put("/users/:id", isAdmin, upload.single('profilePicture'), updateUser);
router.delete("/users/:id", isAdmin, deleteUser);

// Workout management routes
router.get("/workouts", isAdmin, getAllWorkouts);
router.post("/workouts", isAdmin, createWorkoutAdmin);
router.put("/workouts/:id", isAdmin, updateWorkoutAdmin);
router.delete("/workouts/:id", isAdmin, deleteAnyWorkout);

export default router;
