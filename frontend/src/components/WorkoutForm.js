import { useState, useEffect, useCallback } from "react";
import { useWorkoutsContext } from '../hooks/useWorkoutsContext';
import { useAuthStore } from "../hooks/useAuth";
import { useNavigate } from 'react-router-dom';

const InputField = ({ label, type, value, onChange, placeholder, error }) => (
    <div className="space-y-2">
        <label className="block text-base font-medium text-gray-700">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full px-3 py-2 bg-white border-2 ${
                error ? 'border-red-300 bg-red-50' : 'border-blue-100'
            } rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none text-gray-700 placeholder-gray-400 transition-all duration-200`}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
);

const WorkoutForm = () => {
    const { dispatch } = useWorkoutsContext();
    const [title, setTitle] = useState('');
    const [load, setLoad] = useState('');
    const [reps, setReps] = useState('');
    const [error, setError] = useState(null);
    const [emptyFields, setEmptyFields] = useState([]);
    const [loading, setLoading] = useState(false);
     
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // Redirect to login if user is not authenticated (only runs once)
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
        if (token) {
            console.log("Token:", token);
        }
    }, [user, navigate,token]);

    // Prevent unnecessary re-renders by memoizing event handlers
    const handleTitleChange = useCallback((e) => setTitle(e.target.value), []);
    const handleLoadChange = useCallback((e) => setLoad(e.target.value), []);
    const handleRepsChange = useCallback((e) => setReps(e.target.value), []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Sending Payload:', { 
            title, 
            load: Number(load), 
            reps: Number(reps) 
        });

        setError(null);
        setEmptyFields([]);
        if (!title || !load || !reps) {
            setError('All fields are required');
            return;
        }

        const workout = { title, load: Number(load), reps: Number(reps) };

        setLoading(true);
        try {
            const response = await fetch('/api/workouts', {
                method: 'POST',
                body: JSON.stringify(workout),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`, // Ensure the token is added here
                },
                credentials: 'include',
            });

            const json = await response.json();
            setLoading(false);

            if (!response.ok) {
                setError(json.error || 'Something went wrong');
                setEmptyFields(json.emptyFields || []);
            } else {
                setTitle('');
                setReps('');
                setLoad('');
                setError(null);
                setEmptyFields([]);
                dispatch({ type: 'CREATE_WORKOUT', payload: json });
                
            }
        } catch (error) {
            
            setError('Failed to add workout. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md w-full mx-auto bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-lg p-5 mb-6 border border-blue-100 relative overflow-hidden">
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800 bg-white/50 px-3 py-2 rounded-xl inline-block">
                        Add a New Workout
                    </h3>
                </div>

                <InputField
                    label="Exercise Title"
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="e.g., Bench Press"
                    error={emptyFields.includes('title') ? 'This field is required' : null}
                />
                <div className="grid grid-cols-2 gap-4">
                    <InputField
                        label="Load"
                        type="number"
                        value={load}
                        onChange={handleLoadChange}
                        placeholder="0"
                        error={emptyFields.includes('load') ? 'This field is required' : null}
                    />
                    <InputField
                        label="Reps"
                        type="number"
                        value={reps}
                        onChange={handleRepsChange}
                        placeholder="0"
                        error={emptyFields.includes('reps') ? 'This field is required' : null}
                    />
                </div>

                <button 
                    type="submit"
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-400 to-teal-500 text-white rounded-xl hover:from-teal-500 hover:to-teal-600 transition-all duration-200 font-semibold shadow-md hover:shadow-lg mt-6"
                    disabled={loading}
                >
                    {loading ? (
                        <span className="material-symbols-outlined text-sm animate-spin">hourglass_empty</span>
                    ) : (
                        <span className="material-symbols-outlined text-sm">add_circle</span>
                    )}
                    <span>{loading ? 'Adding...' : 'Add Workout'}</span>
                </button>

                {error && (
                    <div className="bg-red-50 border-2 border-red-200 text-red-600 rounded-xl p-3 text-sm">
                        {error}
                    </div>
                )}
            </form>
        </div>
    );
};

export default WorkoutForm;
