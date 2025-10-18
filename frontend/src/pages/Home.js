import { useEffect, useCallback, useState } from "react";
import { useWorkoutsContext } from "../hooks/useWorkoutsContext";
import { useAuthStore } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import "../tailwind.css";

// Components
import WorkoutDetails from "../components/WorkoutDetails";
import WorkoutForm from "../components/WorkoutForm";
import UserNavbar from "../components/UserNavbar";

const Home = () => {
    const { user, isAuthenticated, isCheckingAuth } = useAuthStore();
    const { workouts, dispatch } = useWorkoutsContext();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [shouldRedirect, setShouldRedirect] = useState(false);

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

    // Effect for initial load and focus-based refresh
    useEffect(() => {
        if (!isCheckingAuth && isAuthenticated && user?.token) {
            // Initial fetch
            fetchWorkouts();

            // Add visibility change listener
            const handleVisibilityChange = () => {
                if (document.visibilityState === 'visible') {
                    fetchWorkouts();
                }
            };

            document.addEventListener('visibilitychange', handleVisibilityChange);

            // Add focus listener
            window.addEventListener('focus', fetchWorkouts);

            // Cleanup
            return () => {
                document.removeEventListener('visibilitychange', handleVisibilityChange);
                window.removeEventListener('focus', fetchWorkouts);
            };
        } else if (!isCheckingAuth && !isAuthenticated) {
            setShouldRedirect(true);
        }
    }, [isCheckingAuth, isAuthenticated, user, fetchWorkouts]);

    // Handle loading state
    if (isCheckingAuth) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    // Handle redirect
    if (shouldRedirect) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className="w-64 bg-gray-50 text-gray-900 h-full fixed left-0 top-0 p-4 shadow-lg">
                <UserNavbar />
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-64 p-2 overflow-y-auto">
                <div className="Userhome flex flex-wrap lg:flex-nowrap gap-6">
                    {/* Form Section */}
                    <div className="w-full lg:w-1/3">
                        <WorkoutForm refreshWorkouts={fetchWorkouts} />
                    </div>

                    {/* Workouts Section */}
                    <div className="flex-1 mt-1">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Your Workouts
                        </h2>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
                                <span className="block sm:inline">{error}</span>
                                <button 
                                    onClick={() => setError(null)}
                                    className="absolute top-0 bottom-0 right-0 px-4 py-3"
                                >
                                    <span className="text-xl">&times;</span>
                                </button>
                            </div>
                        )}

                        {/* Loading State */}
                        {isLoading ? (
                            <div className="flex justify-center items-center h-48">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            </div>
                        ) : (
                            /* Workouts Grid */
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {workouts?.map((workout) => (
                                    <WorkoutDetails
                                        key={workout._id}
                                        workout={workout}
                                        refreshWorkouts={fetchWorkouts}
                                    />
                                ))}
                                {(!workouts || workouts.length === 0) && !error && (
                                    <p className="text-gray-500">No workouts found. Create one to get started!</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;