import React, { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa"; // Import heart icons from react-icons

const allWorkouts = [
    { id: 1, title: "Push-ups", description: "Great for upper body strength.", imageUrl: "/images/pushUp.jpeg" },
    { id: 2, title: "Squats", description: "Excellent for lower body and core.", imageUrl: "/images/squats.png" },
    { id: 3, title: "Plank", description: "A core exercise for stability.", imageUrl: "/images/plank.jpg" },
    { id: 4, title: "Jumping Jacks", description: "Full body workout for cardio.", imageUrl: "/images/JumpingJacks.jpg" },
    { id: 5, title: "Lunges", description: "Target your legs and glutes.", imageUrl: "/images/Lunges.jpg" },
    { id: 6, title: "Burpees", description: "A full-body exercise for endurance.", imageUrl: "/images/Burpees.png" },
    // Limit to 6 workouts for display
];

const WorkoutPart = () => {
    const [favorites, setFavorites] = useState([]);
    const [showNotification, setShowNotification] = useState(false);
  
    const workouts = [
      { id: 1, title: "Push-ups", description: "Great for upper body strength.", imageUrl: "/images/pushUp.jpeg" },
      { id: 2, title: "Squats", description: "Excellent for lower body and core.", imageUrl: "/images/squats.png" },
      { id: 3, title: "Plank", description: "A core exercise for stability.", imageUrl: "/images/plank.jpg" },
      { id: 4, title: "Jumping Jacks", description: "Full body workout for cardio.", imageUrl: "/images/JumpingJacks.jpg" },
      { id: 5, title: "Lunges", description: "Target your legs and glutes.", imageUrl: "/images/Lunges.jpg" },
      { id: 6, title: "Burpees", description: "A full-body exercise for endurance.", imageUrl: "/images/Burpees.png" }
    ];
  
    const toggleFavorite = (id) => {
      setFavorites(prev => 
        prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
      );
    };
  
    const handleStartWorkout = () => {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };
  
    return (
      <div id="Workouts" className="py-24 ">
        <div className="container mx-auto px-6">
          <h2 className="text-5xl font-bold text-teal-600 text-center mb-16">Workouts</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {workouts.map(workout => (
              <div key={workout.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all">
                <div className="relative">
                  <img src={workout.imageUrl} alt={workout.title} className="w-full h-48 object-cover" />
                  <button
                    onClick={() => toggleFavorite(workout.id)}
                    className="absolute top-4 right-4 text-2xl"
                  >
                    {favorites.includes(workout.id) ? 
                      <FaHeart className="text-red-500" /> : 
                      <FaRegHeart className="text-gray" />
                    }
                  </button>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-teal-700 mb-2">{workout.title}</h3>
                  <p className="text-gray-600">{workout.description}</p>
                </div>
              </div>
            ))}
          </div>
  
          <div className="text-center mt-16">
            <button
              onClick={handleStartWorkout}
              className="bg-teal-600 text-white px-12 py-4 rounded-full hover:bg-teal-700 transition-all transform hover:scale-105"
            >
              Start Workout
            </button>
          </div>
  
          {showNotification && (
            <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-teal-500 text-white px-8 py-4 rounded-full shadow-lg animate-fade-in-out">
              Sign up to start your workout journey!
            </div>
          )}
        </div>
      </div>
    );
  };
  
export default WorkoutPart;
