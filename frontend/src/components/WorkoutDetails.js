import { useWorkoutsContext } from "../hooks/useWorkoutsContext";
import {  useState } from "react";
import { useAuthStore } from "../hooks/useAuth";
import formatDistanceToNow from 'date-fns/formatDistanceToNow';

const WorkoutDetails = ({ workout, refreshWorkouts }) => {
    const { dispatch } = useWorkoutsContext();
    const [isEditing, setIsEditing] = useState(false);
    const { user } = useAuthStore();
    const [updatedWorkout, setUpdatedWorkout] = useState({
        title: workout.title,
        load: workout.load,
        reps: workout.reps,
    });
    const [deleting, setDeleting] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [updateError, setUpdateError] = useState(null);

    const handleClick = async () => {
        if (!user) return;
        setDeleting(true);
        try {
            const response = await fetch('/api/workouts/' + workout._id, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                },
                credentials: 'include',
            });
            const json = await response.json();

            if (response.ok) {
                dispatch({ type: 'DELETE_WORKOUT', payload: json });
                refreshWorkouts();
            } else {
                console.error("Failed to delete workout:", json.error);
            }
        } catch (err) {
            console.error("An error occurred while deleting the workout:", err);
        } finally {
            setDeleting(false);
        }
    };

    const handleUpdate = async () => {
        if (!user) return;
        setUpdating(true);
        setUpdateError(null);

        // Validate input
        if (!updatedWorkout.title || updatedWorkout.load <= 0 || updatedWorkout.reps <= 0) {
            setUpdateError("All fields must be filled with valid values.");
            setUpdating(false);
            return;
        }

        try {
            const response = await fetch('/api/workouts/' + workout._id, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                credentials: 'include',
                body: JSON.stringify(updatedWorkout),
            });
            const json = await response.json();

            if (response.ok) {
                dispatch({ type: 'UPDATE_WORKOUT', payload: json });
                setIsEditing(false);
                refreshWorkouts();
            } else {
                setUpdateError(json.error || "Failed to update workout.");
            }
        } catch (err) {
            setUpdateError("An error occurred. Please try again.");
        } finally {
            setUpdating(false);
        }
    };
    
    

    return (
        <div className="max-w-md w-full mx-auto bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-lg p-5 mb-6 border border-blue-100 relative overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-bl-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-100/30 to-blue-100/30 rounded-tr-3xl"></div>

            {isEditing ? (
                <div className="space-y-4 relative z-10">
                    <div className="space-y-2">
                        <label className="block text-base font-medium text-gray-700">Exercise Name</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 bg-white border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-gray-700 placeholder-gray-400 transition-all duration-200"
                            value={updatedWorkout.title}
                            onChange={(e) => setUpdatedWorkout({ ...updatedWorkout, title: e.target.value })}
                            placeholder="e.g., Bench Press"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-base font-medium text-gray-700">Weight</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 bg-white border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-gray-700 placeholder-gray-400 transition-all duration-200"
                                    value={updatedWorkout.load}
                                    onChange={(e) => setUpdatedWorkout({ ...updatedWorkout, load: e.target.value })}
                                    placeholder="0"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">kg</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-base font-medium text-gray-700">Reps</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 bg-white border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-gray-700 placeholder-gray-400 transition-all duration-200"
                                value={updatedWorkout.reps}
                                onChange={(e) => setUpdatedWorkout({ ...updatedWorkout, reps: e.target.value })}
                                placeholder="0"
                            />
                        </div>
                    </div>
                    {updateError && (
                        <p className="text-sm text-red-600">{updateError}</p>
                    )}
                    <div className="flex flex-col space-y-2 pt-4">
                        <button
                            onClick={handleUpdate}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-400 to-teal-500 text-white rounded-xl hover:from-teal-500 hover:to-teal-600 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                            disabled={updating}
                        >
                            {updating ? "Saving..." : (
                                <>
                                    <span className="material-symbols-outlined text-sm">save</span>
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold"
                        >
                            <span className="material-symbols-outlined text-sm">close</span>
                            <span>Cancel</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 relative z-10">
                    <div className="flex flex-col space-y-2">
                        <h3 className="text-xl font-bold text-gray-800 bg-white/50 px-3 py-2 rounded-xl">
                            {workout.title}
                        </h3>
                        <span className="text-xs text-gray-500 bg-white/50 px-3 py-1 rounded-lg self-start">
                            {formatDistanceToNow(new Date(workout.createdAt), { addSuffix: true })}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/70 rounded-xl p-3 border border-blue-100 shadow-sm">
                            <p className="text-xs text-gray-500 mb-1">Weight</p>
                            <div className="flex items-baseline">
                                <span className="text-2xl font-bold text-gray-800">{workout.load}</span>
                                <span className="text-base text-gray-500 ml-1">kg</span>
                            </div>
                        </div>
                        <div className="bg-white/70 rounded-xl p-3 border border-blue-100 shadow-sm">
                            <p className="text-xs text-gray-500 mb-1">Reps</p>
                            <span className="text-2xl font-bold text-gray-800">{workout.reps}</span>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2 pt-4">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-400 to-teal-500 text-white rounded-xl hover:from-teal-500 hover:to-teal-600 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                        >
                            <span className="material-symbols-outlined text-sm">edit</span>
                            <span>Edit Workout</span>
                        </button>
                        <button
                            onClick={handleClick}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-white text-red-500 rounded-xl hover:bg-red-50 transition-all duration-200 font-semibold border-2 border-red-200"
                            disabled={deleting}
                        >
                            {deleting ? "Deleting..." : (
                                <>
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                    <span>Delete</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkoutDetails;
