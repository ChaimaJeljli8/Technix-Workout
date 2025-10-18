import { useState } from "react";
import UserNavbar from "../components/UserNavbar";
import WorkoutDisplay from "../components/WorkoutDisplay";
import { Search, Dumbbell, Filter, Activity, Loader2 } from "lucide-react";

const WorkoutsLibrary = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("All");
    const [selectedDifficulty, setSelectedDifficulty] = useState("All");
    const [generatedWorkout, setGeneratedWorkout] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    const difficultyRanges = {
        Beginner: { minLoad: 0, maxLoad: 15 },
        Intermediate: { minLoad: 16, maxLoad: 30 },
        Advanced: { minLoad: 31, maxLoad: Infinity },
    };

    const workouts = [
        // Chest Exercises
        {
            id: 1,
            name: "Ball Dumbbell Chest Press",
            load: "20",
            reps: "15",
            muscleGroup: "chest",
            difficulty: "Intermediate",
            description: "Lie back on a stability ball with dumbbells in both hands. Press weights up from chest level, maintaining balance on the ball. Great for core stability and chest development.",
            image: "/images/BallDumbbellChestPress.jpg"
        },
        {
            id: 2,
            name: "Bench Press",
            load: "40",
            reps: "15",
            muscleGroup: "chest",
            difficulty: "Advanced",
            description: "Lie on a flat bench, lower barbell to chest level, then press up. Primary chest exercise that also engages shoulders and triceps.",
            image: "/images/BenchPress.jpg"
        },
        {
            id: 3,
            name: "Incline Dumbbell Press",
            load: "15",
            reps: "12",
            muscleGroup: "chest",
            difficulty: "Beginner",
            description: "Perform chest press on an inclined bench to target upper chest muscles. Great for developing upper chest definition.",
            image: "/images/InclineDumbbellPress.jpg"
        },
        {
            id: 4,
            name: "Push-Ups",
            load: "0",
            reps: "20",
            muscleGroup: "chest",
            difficulty: "Beginner",
            description: "Classic bodyweight exercise. Keep body straight, lower chest to ground, then push back up. Engages chest, shoulders, and core.",
            image: "/images/PushUp.jpeg"
        },
    
        // Back Exercises
        {
            id: 5,
            name: "Standing Dumbbell Bent Over Row",
            load: "25",
            reps: "15",
            muscleGroup: "back",
            difficulty: "Intermediate",
            description: "Bend at hips, keeping back straight, and row dumbbells to chest. Excellent for mid-back development and posture.",
            image: "/images/StandingDumbbellBentOverRow.png"
        },
        {
            id: 6,
            name: "Lat Pulldowns",
            load: "35",
            reps: "12",
            muscleGroup: "back",
            difficulty: "Advanced",
            description: "Pull cable bar down to chest while seated. Focus on engaging lats and maintaining good posture.",
            image: "/images/LatPulldowns.jpg"
        },
        {
            id: 7,
            name: "Assisted Pull-Ups",
            load: "10",
            reps: "8",
            muscleGroup: "back",
            difficulty: "Beginner",
            description: "Use assisted pull-up machine to perform pull-ups with partial weight support. Great for building pull-up strength.",
            image: "/images/AssistedPullUps.jpg"
        },
        {
            id: 8,
            name: "Single-Arm Dumbbell Row",
            load: "15",
            reps: "12",
            muscleGroup: "back",
            difficulty: "Beginner",
            description: "Support on bench with one knee and hand, row dumbbell with free arm. Excellent for targeting each side independently.",
            image: "/images/SingleArmRow.jpg"
        },
    
        // Shoulder Exercises
        {
            id: 9,
            name: "Seated Stability Ball Military Press",
            load: "15",
            reps: "15",
            muscleGroup: "shoulders",
            difficulty: "Beginner",
            description: "Press dumbbells overhead while seated on stability ball. Engages core while building shoulder strength.",
            image: "/images/SeatedStabilityBallMilitaryPress.png"
        },
        {
            id: 10,
            name: "Lateral Raises",
            load: "8",
            reps: "12",
            muscleGroup: "shoulders",
            difficulty: "Beginner",
            description: "Raise dumbbells to side until parallel with ground. Targets lateral deltoids for broader shoulders.",
            image: "/images/LateralRaises.jpg"
        },
        {
            id: 11,
            name: "Front Raises",
            load: "10",
            reps: "12",
            muscleGroup: "shoulders",
            difficulty: "Beginner",
            description: "Raise dumbbells in front of body to shoulder height. Focuses on front deltoids.",
            image: "/images/FrontRaises.jpg"
        },
        {
            id: 12,
            name: "Arnold Press",
            load: "32",
            reps: "10",
            muscleGroup: "shoulders",
            difficulty: "Advanced",
            description: "Complex shoulder press with rotation movement. Targets all three heads of the deltoid muscle.",
            image: "/images/ArnoldPress.jpg"
        },
    
        // Biceps Exercises
        {
            id: 13,
            name: "Single Leg Dumbbell Curl",
            load: "12",
            reps: "15",
            muscleGroup: "biceps",
            difficulty: "Beginner",
            description: "Perform bicep curls while standing on one leg. Adds balance challenge and core engagement.",
            image: "/images/SingleLegDumbbellCurl.jpg"
        },
        {
            id: 14,
            name: "Concentration Curls",
            load: "10",
            reps: "12",
            muscleGroup: "biceps",
            difficulty: "Beginner",
            description: "Seated curl focusing on one arm at a time. Excellent for peak contraction and form.",
            image: "/images/ConcentrationCurls.jpg"
        },
        {
            id: 15,
            name: "Hammer Curls",
            load: "12",
            reps: "12",
            muscleGroup: "biceps",
            difficulty: "Beginner",
            description: "Curl with palms facing each other. Targets brachialis and brachioradialis muscles.",
            image: "/images/HammerCurls.jpg"
        },
        {
            id: 16,
            name: "Preacher Curls",
            load: "35",
            reps: "10",
            muscleGroup: "biceps",
            difficulty: "Advanced",
            description: "Perform curls with arms supported on preacher bench. Isolates biceps and prevents swinging.",
            image: "/images/PreacherCurls.jpg"
        },
    
        // Triceps Exercises
        {
            id: 17,
            name: "Prone Ball Dumbbell Tricep Extensions",
            load: "18",
            reps: "15",
            muscleGroup: "triceps",
            difficulty: "Intermediate",
            description: "Lie on stability ball, extend weights overhead. Engages core while isolating triceps.",
            image: "/images/ProneBallDumbbellTricepExtensions.jpg"
        },
        {
            id: 18,
            name: "Tricep Pushdowns",
            load: "25",
            reps: "12",
            muscleGroup: "triceps",
            difficulty: "Intermediate",
            description: "Using cable machine, push bar down while keeping elbows at sides. Basic but effective tricep isolation.",
            image: "/images/TricepPushdowns.jpg"
        },
        {
            id: 19,
            name: "Overhead Tricep Extensions",
            load: "35",
            reps: "10",
            muscleGroup: "triceps",
            difficulty: "Advanced",
            description: "Hold weight overhead and lower behind head, then extend. Targets long head of triceps.",
            image: "/images/OverheadTricepExtensions.jpg"
        },
        {
            id: 20,
            name: "Diamond Push-Ups",
            load: "0",
            reps: "15",
            muscleGroup: "triceps",
            difficulty: "Beginner",
            description: "Push-ups with hands close together forming diamond shape. Emphasizes triceps engagement.",
            image: "/images/DiamondPushUps.jpg"
        },
    
        // Legs Exercises
        {
            id: 21,
            name: "Ball Squat",
            load: "30",
            reps: "15",
            muscleGroup: "legs",
            difficulty: "Intermediate",
            description: "Perform squat with stability ball between back and wall. Helps maintain proper form and balance.",
            image: "/images/BallSquat.jpg"
        },
        {
            id: 22,
            name: "Walking Lunges",
            load: "12",
            reps: "20",
            muscleGroup: "legs",
            difficulty: "Beginner",
            description: "Step forward into lunge position, alternating legs. Great for balance and leg development.",
            image: "/images/WalkingLunges.png"
        },
        {
            id: 23,
            name: "Bulgarian Split Squats",
            load: "40",
            reps: "10",
            muscleGroup: "legs",
            difficulty: "Advanced",
            description: "Single-leg squat with rear foot elevated. Excellent for leg development and balance.",
            image: "/images/BulgarianSplitSquats.jpg"
        },
        {
            id: 24,
            name: "Goblet Squats",
            load: "15",
            reps: "15",
            muscleGroup: "legs",
            difficulty: "Beginner",
            description: "Hold dumbbell at chest, perform squat. Great for learning proper squat form.",
            image: "/images/GobletSquats.jpg"
        },
    
        // Abs Exercises
        {
            id: 25,
            name: "Stability Ball Crunch",
            load: "0",
            reps: "15",
            muscleGroup: "abs",
            difficulty: "Beginner",
            description: "Perform crunches while lying on stability ball. Increases range of motion and engagement.",
            image: "/images/StabilityBallCrunch.jpg"
        },
        {
            id: 26,
            name: "Leg Raises with Stability Ball",
            load: "0",
            reps: "15",
            muscleGroup: "abs",
            difficulty: "Beginner",
            description: "Raise legs while squeezing ball between feet. Targets lower abs and hip flexors.",
            image: "/images/LegRaiseswithStabilityBall.jpg"
        },
        {
            id: 27,
            name: "Plank with Ball Transfer",
            load: "0",
            reps: "12",
            muscleGroup: "abs",
            difficulty: "Beginner",
            description: "Hold plank position while moving ball between hands. Challenges core stability and strength.",
            image: "/images/PlankBallTransfer.jpg"
        },
        {
            id: 28,
            name: "Russian Twists",
            load: "5",
            reps: "20",
            muscleGroup: "abs",
            difficulty: "Beginner",
            description: "Seated with feet off ground, rotate torso side to side. Great for obliques and core rotation.",
            image: "/images/RussianTwists.jpg"
        }
    ].map(workout => {
        // Automatically set difficulty based on load
        const load = parseInt(workout.load);
        let difficulty;
        if (load <= difficultyRanges.Beginner.maxLoad) {
            difficulty = "Beginner";
        } else if (load <= difficultyRanges.Intermediate.maxLoad) {
            difficulty = "Intermediate";
        } else {
            difficulty = "Advanced";
        }
        return { ...workout, difficulty };
    });

    const muscleGroups = ["All", "chest", "back", "shoulders", "biceps", "triceps", "legs", "abs"];
    const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

    const filteredWorkouts = workouts.filter((workout) => {
        // Case-insensitive search term matching
        const matchesSearch = workout.name.toLowerCase().includes(searchTerm.toLowerCase());

        // Case-insensitive muscle group matching
        const matchesMuscleGroup = 
            selectedMuscleGroup === "All" || 
            workout.muscleGroup.toLowerCase() === selectedMuscleGroup.toLowerCase();

        // Difficulty matching
        let matchesDifficulty = true;
        if (selectedDifficulty !== "All") {
            const { minLoad, maxLoad } = difficultyRanges[selectedDifficulty];
            const workoutLoad = parseInt(workout.load);
            matchesDifficulty = workoutLoad >= minLoad && workoutLoad <= maxLoad;
        }

        return matchesSearch && matchesMuscleGroup && matchesDifficulty;
    });

    const generateWorkout = async (muscleGroup, difficulty) => {
        if (selectedMuscleGroup === "All") {
            setError("Please select a specific muscle group");
            return;
        }

        // Reset any previous errors
        setError("");

        try {
            setLoading(true);
            const response = await fetch("http://localhost:4000/api/generate-workout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    muscleGroup: selectedMuscleGroup.toLowerCase(),
                    difficulty: selectedDifficulty === "All" ? "Intermediate" : selectedDifficulty
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to generate workout.");
            }

            const data = await response.json();
            setGeneratedWorkout(data.workoutPlan);
        } catch (error) {
            console.error("Error generating workout:", error);
            setError("Failed to generate workout. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateWorkout = (event) => {
        event.preventDefault();
        generateWorkout(selectedMuscleGroup, selectedDifficulty);
    };

    // Sort workouts by name for better organization
    const sortedFilteredWorkouts = [...filteredWorkouts].sort((a, b) => 
        a.name.localeCompare(b.name)
    );

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 min-h-screen fixed left-0 top-0 p-4 shadow-lg ">
                <UserNavbar />
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-64 p-8">
                {/* Header Section */}
                <div className="mb-8">
                <h1 className="text-4xl font-extrabold text-teal-800 mb-2">Workouts Library</h1>
                    <p className="text-gray-600">Discover and generate personalized workout plans</p>
                </div>

                  {/* Search and Filters Section */}
                  <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex flex-wrap gap-4 items-center mb-4">
                        <div className="flex-grow">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    placeholder="Search workouts..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-3 text-teal-600 hover:bg-teal-50 rounded-xl transition-colors"
                        >
                            <Filter className="w-5 h-5" />
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </button>
                    </div>

                    {/* Expandable Filters */}
                    {showFilters && (
                        <div className="flex flex-wrap gap-4 items-center pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                <Dumbbell className="w-5 h-5 text-teal-600" />
                                <select
                                    className="p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    value={selectedMuscleGroup}
                                    onChange={(e) => setSelectedMuscleGroup(e.target.value)}
                                >
                                    {muscleGroups.map((group) => (
                                        <option key={group} value={group}>
                                            {group === "All" ? "All Muscle Groups" : group.charAt(0).toUpperCase() + group.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-teal-600" />
                                <select
                                    className="p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    value={selectedDifficulty}
                                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                                >
                                    {difficulties.map((difficulty) => (
                                        <option key={difficulty} value={difficulty}>
                                            {difficulty === "All" ? "All Difficulties" : difficulty}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="ml-auto">
                                <button
                                    onClick={() => {
                                        setSearchTerm("");
                                        setSelectedMuscleGroup("All");
                                        setSelectedDifficulty("All");
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:text-teal-600 transition-colors"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                {/* Generate Workout Section */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-teal-800 mb-6 flex items-center gap-2">
                        <Activity className="w-6 h-6" />
                        Generate Custom Workout
                    </h2>
                    <div className="flex flex-wrap gap-4 items-center mb-6">
                        <button
                            onClick={handleGenerateWorkout}
                            className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Activity className="w-5 h-5" />
                                    Generate Workout
                                </>
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
                            {error}
                        </div>
                    )}

                    {generatedWorkout && (
                        <div className="mt-6">
                            <WorkoutDisplay workout={generatedWorkout} />
                        </div>
                    )}
                </div>

               {/* Workout Cards Grid */}
               <div className="mt-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-teal-800 flex items-center gap-2">
                            <Dumbbell className="w-6 h-6" />
                            Browse Pre-made Workouts
                        </h2>
                        <span className="text-gray-600">
                            {sortedFilteredWorkouts.length} {sortedFilteredWorkouts.length === 1 ? 'workout' : 'workouts'} found
                        </span>
                    </div>
                    {sortedFilteredWorkouts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                           
                            {filteredWorkouts.map((workout) => (
                                <div
                                    key={workout.id}
                                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
                                >
                                    <div className="relative overflow-hidden">
                                        <img
                                            src={workout.image}
                                            alt={workout.name}
                                            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                    <div className="p-5">
                                        <h3 className="text-xl font-bold text-teal-800 mb-3">{workout.name}</h3>
                                        <div className="space-y-2 text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Load:</span>
                                                <span className="bg-teal-50 px-2 py-1 rounded-md">{workout.load} kg</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Reps:</span>
                                                <span className="bg-teal-50 px-2 py-1 rounded-md">{workout.reps}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Target:</span>
                                                <span className="bg-teal-50 px-2 py-1 rounded-md capitalize">{workout.muscleGroup}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Difficulty:</span>
                                                <span className={`px-2 py-1 rounded-md ${
                                                    workout.difficulty === 'Beginner' ? 'bg-green-50 text-green-700' :
                                                    workout.difficulty === 'Intermediate' ? 'bg-yellow-50 text-yellow-700' :
                                                    'bg-red-50 text-red-700'
                                                }`}>
                                                    {workout.difficulty}
                                                </span>
                                            </div>
                                            <div className="mt-4">
                                                <span className="font-medium block mb-2">Description:</span>
                                                <p className="text-sm text-gray-600 leading-relaxed">
                                                    {workout.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                            <p className="text-gray-600">No workouts match your search criteria.</p>
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setSelectedMuscleGroup("All");
                                    setSelectedDifficulty("All");
                                }}
                                className="mt-4 text-teal-600 hover:text-teal-700 underline"
                            >
                                Reset all filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkoutsLibrary;