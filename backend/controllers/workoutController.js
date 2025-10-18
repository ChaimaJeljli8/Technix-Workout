import Workout from '../models/workoutModel.js';
import mongoose from 'mongoose';
import {Notification} from'../models/notificationsModel.js'
import { isAdmin } from '../middleware/adminMiddleware.js'

//get all workouts
export const getWorkouts = async (req,res) =>{
    try {
    const user_id = req.user._id;
    const workouts = await  Workout.find({user_id}).sort({createdAt: -1});

    res.status(200).json(workouts);}
    catch(error){
        res.status(400).json({ success: false, message: error.message });
    }
}

//get a single workout
export const getWorkout = async (req,res) =>{
    const { id } = req.params
//to check if the id is valid (the return stops sthe code from continuing)
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'No such workout'})
    }
    const workout = await Workout.findById(id);

    if (!workout){
        return res.status(404).json({error: 'No such Workout'});
    }


    res.status(200).json(workout);
}


//create new workout
export const createWorkout = async (req,res) => {
    const  {title, load, reps} = req.body ;
    
    let emptyFields = []
    if(!title){
        emptyFields.push('title')
    }
    if(!load){
        emptyFields.push('load')
    }
    if(!reps){
        emptyFields.push('reps')
    }
    if(emptyFields.length > 0){
        return res.status(400).json({error: 'Please Fill In All The Fields ', emptyFields})
    }

    //add doc to db
    try{
        const user_id = req.user._id;
        const workout= await Workout.create({title, load, reps, user_id});
        res.status(200).json(workout);
        
         // Create a notification
         const notification = new Notification({
          userId: user_id, // Add userId
          title: "User added a workout", // Add title
          message: `User added a workout: ${user_id}`,
          type: "add",
      });
      await notification.save();

    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

//delete a workout
export const deleteWorkout = async (req,res) =>{
    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'No such workout'});
    }

    const workout = await Workout.findOneAndDelete({_id: id});

    if (!workout){
        return res.status(400).json({error: 'No such Workout'});
    }

    res.status(200).json(workout);

}

//update a workout changes for the admin ownership
export const updateWorkout = async (req,res) =>{
    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'No such workout'});
    };

    const workout = await Workout.findById(id);

    if (!workout) {
      return res.status(404).json({ error: 'No such Workout' });
    }
  
    // Check if the user is the owner of the workout or an admin
    if (workout.user_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this workout' });
    }
  
    const updatedWorkout = await Workout.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    );
    
    res.status(200).json(updatedWorkout);
  };

//admin

// Get all workouts (Admin Only)
export const getAllWorkouts =[
    isAdmin, async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        const workouts = await Workout.find().populate("user_id", "name email");
        res.status(200).json(workouts);
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching workouts" });
    }
}];

// Delete any workout (Admin Only)
export const deleteAnyWorkout = [
    isAdmin, async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        const { id } = req.params;
        const workout = await Workout.findById(id);
        
        if (!workout) {
            return res.status(404).json({ success: false, message: "Workout not found" });
        }

        await Workout.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Workout deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting workout" });
    }
}];


// Create workout for any user (Admin only)
export const createWorkoutAdmin = [
    isAdmin,
    async (req, res) => {
      try {
        const { title, load, reps, user_id } = req.body;
  
        if (!title || !load || !reps || !user_id) {
          return res.status(400).json({ 
            success: false, 
            message: "All fields are required including user_id" 
          });
        }
  
        const workout = new Workout({
          title,
          load,
          reps,
          user_id
        });
  
        await workout.save();
  
        res.status(201).json({
          success: true,
          message: "Workout created successfully",
          workout
        });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    }
  ];
  
  // Update any workout (Admin only)
  export const updateWorkoutAdmin = [
    isAdmin,
    async (req, res) => {
      try {
        const { id } = req.params;
        const updates = req.body;
  
        const workout = await Workout.findByIdAndUpdate(
          id,
          { $set: updates },
          { new: true, runValidators: true }
        );
  
        if (!workout) {
          return res.status(404).json({ success: false, message: "Workout not found" });
        }
  
        res.status(200).json({
          success: true,
          message: "Workout updated successfully",
          workout
        });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    }
  ];
  
