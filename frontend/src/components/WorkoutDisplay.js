import React from 'react';
import { Dumbbell, Clock, Info, Star, Flame, Snowflake } from 'lucide-react';

const WorkoutDisplay = ({ workout }) => {
  const parseWorkout = (text) => {
    if (!text) return { 
      title: '', 
      difficulty: '', 
      warmup: [],
      exercises: [], 
      cooldown: [],
      tips: [],
      additionalInfo: [] 
    };
    
    const sections = text.split('\n\n');
    const exercises = [];
    const warmup = [];
    const cooldown = [];
    const tips = [];
    const additionalInfo = [];
    let title = '';
    let difficulty = '';
    let currentSection = '';
    
    sections.forEach(section => {
      const lines = section.split('\n').map(line => line.replace(/\*/g, '').trim()).filter(Boolean);
      
      if (lines[0]?.includes('Plan')) {
        title = lines[0];
      } else if (lines[0]?.includes('Difficulty:')) {
        difficulty = lines[0].replace('Difficulty:', '').trim();
      } else if (lines[0]?.toLowerCase().includes('warm-up')) {
        currentSection = 'warmup';
        warmup.push(...lines.slice(1));
      } else if (lines[0]?.toLowerCase().includes('cool-down')) {
        currentSection = 'cooldown';
        cooldown.push(...lines.slice(1));
      } else if (lines[0]?.toLowerCase() === 'tips:') {
        currentSection = 'tips';
        tips.push(...lines.slice(1));
      } else if (lines[0]?.match(/^\d+\./)) {
        let currentExercise = { 
          name: '', 
          load: '', 
          reps: '', 
          tips: [] 
        };
        
        lines.forEach(line => {
          if (line.match(/^\d+\./)) {
            currentExercise.name = line.replace(/^\d+\.\s*/, '').replace(':', '');
          } else if (line.includes('Load:') || line.includes('1RM')) {
            currentExercise.load = line.trim();
          } else if (line.match(/^\d+\s+sets/) || line.includes('reps')) {
            currentExercise.reps = line.trim();
          } else if (!line.includes('Tips:')) {
            currentExercise.tips.push(line);
          }
        });
        
        if (currentExercise.name) {
          exercises.push(currentExercise);
        }
      } else if (lines[0]?.toLowerCase().includes('additional information')) {
        currentSection = 'additional';
        additionalInfo.push(...lines.slice(1));
      } else if (currentSection === 'additional') {
        additionalInfo.push(...lines);
      }
    });

    return { title, difficulty, warmup, exercises, cooldown, tips, additionalInfo };
  };

  const workoutData = parseWorkout(workout);

  const renderSection = (icon, title, items, className = '') => {
    if (!items || items.length === 0) return null;
    
    return (
      <div className={`mb-8 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          {icon}
          <h3 className="text-xl font-semibold text-teal-700">{title}</h3>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li key={index} className="text-gray-600 flex items-start">
                <span className="mr-2">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
      {/* Title and Difficulty */}
      <h1 className="text-3xl font-bold text-teal-800 mb-2 text-center">{workoutData.title}</h1>
      {workoutData.difficulty && (
        <div className="flex items-center justify-center gap-2 mb-6">
          <Star className="w-5 h-5 text-teal-600" />
          <span className="text-lg font-semibold text-teal-700">Difficulty: {workoutData.difficulty}</span>
        </div>
      )}

      {/* Warm-up Section */}
      {renderSection(
        <Flame className="w-6 h-6 text-orange-500" />,
        "Warm-up",
        workoutData.warmup
      )}

      {/* Exercises */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Dumbbell className="w-6 h-6 text-teal-600" />
          <h3 className="text-xl font-semibold text-teal-700">Exercises</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {workoutData.exercises.map((exercise, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg border-l-4 border-teal-500">
              <h4 className="font-semibold text-teal-800 mb-2">{exercise.name}</h4>
              <div className="space-y-2">
                {exercise.reps && (
                  <p className="text-gray-600"><strong>Sets/Reps:</strong> {exercise.reps}</p>
                )}
                {exercise.load && (
                  <p className="text-gray-600"><strong>Load:</strong> {exercise.load}</p>
                )}
                {exercise.tips.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-gray-700">Tips:</p>
                    <ul className="list-disc pl-5 text-gray-600 space-y-1">
                      {exercise.tips.map((tip, tipIndex) => (
                        <li key={tipIndex}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cool-down Section */}
      {renderSection(
        <Snowflake className="w-6 h-6 text-blue-500" />,
        "Cool-down",
        workoutData.cooldown
      )}

      {/* Tips Section */}
      {renderSection(
        <Info className="w-6 h-6 text-teal-600" />,
        "Tips",
        workoutData.tips
      )}

      {/* Additional Information */}
      {renderSection(
        <Info className="w-6 h-6 text-teal-600" />,
        "Additional Information",
        workoutData.additionalInfo
      )}
    </div>
  );
};

export default WorkoutDisplay;