import { useEffect, useCallback, useState, useRef } from "react";
import { useWorkoutsContext } from "../hooks/useWorkoutsContext";
import { useAuthStore } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import Chart from "chart.js/auto";
import { 
    Dumbbell, 
    Clock, 
    Filter, 
    Activity, 
    Search, 
    TrendingUp, 
    Loader2, 
    Plus, 
    ChartLine, 
    Library 
} from "lucide-react";
import AdminNavbar from "../components/AdminNavbar";
import WorkoutDetails from "../components/WorkoutDetails";
import WorkoutForm from "../components/WorkoutForm";
import WorkoutDisplay from "../components/WorkoutDisplay";

const AdminFeatures = () => {
    const { user, isAuthenticated, isCheckingAuth } = useAuthStore();
    const { workouts, dispatch } = useWorkoutsContext();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [shouldRedirect, setShouldRedirect] = useState(false);
    const chartRef = useRef(null);
    const [chartInstance, setChartInstance] = useState(null);
    
    // Library States
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("All");
    const [selectedDifficulty, setSelectedDifficulty] = useState("Intermediate");
    const [generatedWorkout, setGeneratedWorkout] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [activeTab, setActiveTab] = useState('add');

    const muscleGroups = ["All", "chest", "back", "shoulders", "biceps", "triceps", "legs", "abs"];
    const difficulties = ["All","Beginner", "Intermediate", "Advanced"];

    const fetchWorkouts = useCallback(async () => {
        if (!user?.token) {
            setIsLoading(false);
            setShouldRedirect(true);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("http://localhost:4000/api/workouts", {
                headers: {
                    "Authorization": `Bearer ${user.token}`,
                    "Content-Type": "application/json"
                },
                credentials: "include",
            });

            const json = await response.json();
            
            if (!response.ok) {
                throw new Error(json.error || 'Failed to fetch workouts');
            }

            dispatch({ type: "SET_WORKOUTS", payload: json });
        } catch (error) {
            console.error("Error fetching workouts:", error);
            setError(error.message);
            
            if (error.message.toLowerCase().includes('unauthorized')) {
                setShouldRedirect(true);
            }
        } finally {
            setIsLoading(false);
        }
    }, [dispatch, user?.token]);

    const processData = () => {
        if (!workouts || workouts.length === 0) {
            return { labels: [], data: [] };
        }

        const workoutCounts = {};
        workouts.forEach((workout) => {
            const date = new Date(workout.createdAt);
            const hour = date.getHours();
            workoutCounts[hour] = (workoutCounts[hour] || 0) + 1;
        });

        const labels = Array.from({ length: 24 }, (_, index) => `${index}:00`);
        const data = labels.map((label, index) => workoutCounts[index] || 0);

        return { labels, data };
    };

    useEffect(() => {
        if (!chartRef.current || !workouts || workouts.length === 0 || activeTab !== 'progress') return;

        if (chartInstance) {
            chartInstance.destroy();
        }

        const { labels, data } = processData();
        const ctx = chartRef.current.getContext("2d");
        const gradientBg = ctx.createLinearGradient(0, 0, 0, 400);
        gradientBg.addColorStop(0, 'rgba(79, 209, 197, 0.7)');
        gradientBg.addColorStop(1, 'rgba(79, 209, 197, 0.2)');

        const newChart = new Chart(ctx, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "Workouts Per Hour",
                    data,
                    backgroundColor: gradientBg,
                    borderColor: '#4FD1C5',
                    tension: 0.4,
                    fill: true,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0,0,0,0.05)' },
                    },
                    x: {
                        grid: { display: false },
                    }
                }
            },
        });

        setChartInstance(newChart);

        return () => {
            if (newChart) {
                newChart.destroy();
            }
        };
    }, [workouts, activeTab]);

    useEffect(() => {
        if (!isCheckingAuth && isAuthenticated && user?.token) {
            fetchWorkouts();

            const handleVisibilityChange = () => {
                if (document.visibilityState === 'visible') {
                    fetchWorkouts();
                }
            };

            document.addEventListener('visibilitychange', handleVisibilityChange);
            window.addEventListener('focus', fetchWorkouts);

            return () => {
                document.removeEventListener('visibilitychange', handleVisibilityChange);
                window.removeEventListener('focus', fetchWorkouts);
            };
        } else if (!isCheckingAuth && !isAuthenticated) {
            setShouldRedirect(true);
        }
    }, [isCheckingAuth, isAuthenticated, user, fetchWorkouts]);

    const generateWorkout = async () => {
        if (selectedMuscleGroup === "All") {
            setError("Please select a specific muscle group");
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:4000/api/generate-workout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    muscleGroup: selectedMuscleGroup.toLowerCase(),
                    difficulty: selectedDifficulty
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to generate workout.");
            }

            const data = await response.json();
            setGeneratedWorkout(data.workoutPlan);
            setError(null);
        } catch (error) {
            console.error("Error generating workout:", error);
            setError("Failed to generate workout.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isCheckingAuth) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
            </div>
        );
    }

    if (shouldRedirect) {
        return <Navigate to="/login" replace />;
    }

    const workouts_library =[
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
    ];
    const difficultyRanges = {

        Beginner: { minLoad: 0, maxLoad: 15 },
        Intermediate: { minLoad: 16, maxLoad: 30 },
        Advanced: { minLoad: 31, maxLoad: Infinity },
    };

    const filteredWorkouts = workouts_library.filter((workout) => {
        // Filter by search term (first word of the workout name)
        const firstWord = workout.name.split(' ')[0].toLowerCase();
        const matchesSearch = firstWord.includes(searchTerm.toLowerCase());
    
        // Filter by muscle group
        const matchesMuscleGroup =
            selectedMuscleGroup === "All" || workout.muscleGroup.toLowerCase() === selectedMuscleGroup.toLowerCase();
    
        // Filter by difficulty
        let matchesDifficulty = true;
        if (selectedDifficulty !== "All") {
            const { minLoad, maxLoad } = difficultyRanges[selectedDifficulty];
            const workoutLoad = parseInt(workout.load, 10); // Parse load as an integer
            matchesDifficulty = workoutLoad >= minLoad && workoutLoad <= maxLoad;
        }
    
        // Return workouts that match all filters
        return matchesSearch && matchesMuscleGroup && matchesDifficulty;
    });

    // Sort workouts by name
    const sortedFilteredWorkouts = [...filteredWorkouts].sort((a, b) => 
        a.name.localeCompare(b.name)
    );

    return (
        <div className="flex md:flex-row min-h-screen bg-gray-50">
            {/* Sidebar */}
            <AdminNavbar />
            {/* Main Content */}
            <div className="flex-1 min-w-0 flex flex-col p-4">
                {/* Header with Tabs */}
                <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
                    <div className="max-w-7xl mx-auto ">
                        <div className="flex flex-wrap gap-2 items-center">
                            
                            {[
                                { id: 'add', icon: Plus, label: 'Add Workout' },
                                { id: 'progress', icon: ChartLine, label: 'Progress' },
                                { id: 'library', icon: Library, label: 'Library' }
                            ].map(({ id, icon: Icon, label }) => (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                                        activeTab === id
                                            ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20 scale-105'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-4 md:p-6 max-w-7xl mx-auto">
                        {activeTab === 'add' && (
                            <div className="grid lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-1">
                                    <div className="bg-white rounded-2xl shadow-xl p-6">
                                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                            <Plus className="w-5 h-5 text-teal-500" />
                                            Add Workout
                                        </h2>
                                        <WorkoutForm refreshWorkouts={fetchWorkouts} />
                                    </div>
                                </div>
                                <div className="lg:col-span-2">
                                    <div className="bg-white rounded-2xl shadow-xl p-6">
                                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                            <Activity className="w-5 h-5 text-teal-500" />
                                            Your Workouts
                                        </h2>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            {workouts?.map((workout) => (
                                                <WorkoutDetails
                                                    key={workout._id}
                                                    workout={workout}
                                                    refreshWorkouts={fetchWorkouts}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'progress' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow">
                                        <div className="flex items-center gap-4">
                                            <div className="p-4 bg-teal-500/10 rounded-2xl">
                                                <Clock className="text-teal-500 w-8 h-8" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Total Workouts</p>
                                                <p className="text-3xl font-bold text-gray-800">{workouts?.length || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow">
                                        <div className="flex items-center gap-4">
                                            <div className="p-4 bg-teal-500/10 rounded-2xl">
                                                <TrendingUp className="text-teal-500 w-8 h-8" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Average per Hour</p>
                                                <p className="text-3xl font-bold text-gray-800">
                                                    {workouts ? (workouts.length / 24).toFixed(1) : '0'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl shadow-xl p-6">
                                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        <ChartLine className="w-5 h-5 text-teal-500" />
                                        Workout Distribution
                                    </h2>
                                    <div className="h-[400px]">
                                        <canvas ref={chartRef}></canvas>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'library' && (
                            <div className="space-y-6">
                                {/* Search and Filters */}
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
                                                value={selectedDifficulty} // Ensure this is bound to the state
                                                onChange={(e) => setSelectedDifficulty(e.target.value)}
                                            >
                                                {difficulties.map((difficulty) => (
                                                    <option key={difficulty} value={difficulty}>
                                                        {difficulty}
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
                                            onClick={generateWorkout}
                                            className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
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
                                            {sortedFilteredWorkouts.map((workout) => (
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
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminFeatures;