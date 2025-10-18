import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
//admin
import adminRoutes from "./routes/admin.js"
//contact
import { contactRoutes } from './routes/contact.js';

import { verifyToken } from './middleware/verifyToken.js';
//workouts
import {workoutRoutes} from './routes/workouts.js';
//user
import {UserRoutes} from './routes/User.js';
//notif
import {notificationsRoutes} from './routes/notifications.js';
//files
import path from 'path';
import { fileURLToPath } from 'url';
import { upload } from './middleware/uploadMiddleware.js';
//gemini api
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



dotenv.config();
//express app
const app = express();

app.use(cors({origin: "http://localhost:3000", credentials:true }));

//middlware : allows us to parse incoming requests:req.body
app.use(express.json());
//allows us to parse incoming cookies
app.use(cookieParser());

app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});

//routes
app.use('/api/workouts',workoutRoutes);
app.use('/api/user',UserRoutes);
//admin 
app.use("/api/user/admin",verifyToken, adminRoutes);

app.use("/api/user",notificationsRoutes);

app.use('/api/contact', contactRoutes);

// Static files middleware
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

 
// Add the upload middleware to the profile update route
app.put('/api/user/profile', upload.single('profilePicture'), async (req, res) => {
    try {
        // Get the user ID from the authenticated request
        const userId = req.user.id; // Assuming you have authentication middleware
        
        // Get the file path if a file was uploaded
        const profilePicture = req.file ? `/uploads/profiles/${req.file.filename}` : undefined;
        
        // Update the user in the database with the new profile picture path
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { 
                ...(profilePicture && { profilePicture }), // Only update if a new file was uploaded
                ...req.body // Other profile fields
            },
            { new: true }
        );

        res.json({ user: updatedUser });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
});

//connect to db
mongoose.connect(process.env.MONGO_URI)
    .then(()=>{  
    //listen for requestes
    app.listen(process.env.PORT,() =>{
    console.log(' connected to db & listening on port ',process.env.PORT);
    });
    })
    .catch((error) =>{
        console.log('MongoDB Connection Error:', error);
    })

    // Add global error handler
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something broke!');
    });

 
    const genAi = new GoogleGenerativeAI(process.env.API_KEY);

    app.post("/api/generate-workout", async (req, res) => {
    const { muscleGroup, difficulty } = req.body;

    try {
        
        const model = genAi.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-01-21" });

        const prompt = `
         Create a detailed, structured workout plan with the following specifications:
        - Muscle group: ${muscleGroup}
        - Difficulty level: ${difficulty}
        PROVIDE THE WORKOUT PLAN IN THIS EXACT FORMAT:
        ## Title avec specifications de :
        ${muscleGroup} et  ${difficulty}
        ## Warm-up (5-10 minutes)
         [List 3-4 specific warm-up exercises targeting the muscle group]
         Include duration or reps for each
        
        ## Main Workout
        1. [Exercise Name]
            Sets: [number]
            Reps: [number]
            Weight: [appropriate weight range in kg based on difficulty]
            Rest: [seconds between sets]
            Technique tips: [1-2 specific form cues]
        
        [Repeat this exact format for 5-7 exercises, varying the exercise types]
        
        ## Cool-down (5-10 minutes)
         [List 2-3 specific stretches for the targeted muscles]
         Include duration for each stretch
        
        ## Additional Notes
         [Include 3-4 specific tips relevant to this muscle group]
         [Include progression advice]
         [Include safety precautions]
        
        Important: For each exercise, provide realistic weights in kg based on the difficulty level. 
        Be specific with all numbers (reps, sets, weights, rest times).
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const workoutPlan = text; 
        
        res.json({ workoutPlan });
        //console.log({workoutPlan});
    } catch (error) {
        console.error("Error generating workout:", error);
        res.status(500).json({ message: "Failed to generate workout plan." });
    }
});

/*
app.get('/',(req,res) =>{
    res.json({mssg:'Welcome to the app'});

});
*/


process.env