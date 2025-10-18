import React, { useState, useEffect } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import { useAuthStore } from '../hooks/useAuth';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

const AdminWorkouts = () => {
    const [workouts, setWorkouts] = useState([]);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        load: '',
        reps: '',
        user_id: ''
    });

    const { getAllWorkouts, getAllUsers, createWorkout, updateWorkout, deleteWorkout, isLoading } = useAuthStore();

    const fetchWorkouts = async () => {
        try {
            const workoutsData = await getAllWorkouts();
            setWorkouts(workoutsData);
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchUsers = async () => {
        try {
            const usersData = await getAllUsers();
            setUsers(usersData);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchWorkouts();
        fetchUsers();
    }, []);

    const getUserNameById = (userId) => {
        const foundUser = users.find(u => u._id === userId);
        return foundUser ? foundUser.name : 'Unknown User';
    };

    const filteredWorkouts = workouts.filter(workout =>
        workout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getUserNameById(workout.user_id).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateWorkout = async (e) => {
        e.preventDefault();
        try {
            await createWorkout({
                ...formData,
                load: Number(formData.load),
                reps: Number(formData.reps)
            });
            setIsCreateModalOpen(false);
            setFormData({ title: '', load: '', reps: '', user_id: '' });
            fetchWorkouts();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUpdateWorkout = async (e) => {
        e.preventDefault();
        try {
            await updateWorkout(selectedWorkout._id, {
                ...formData,
                load: Number(formData.load),
                reps: Number(formData.reps)
            });
            setIsEditModalOpen(false);
            setSelectedWorkout(null);
            fetchWorkouts();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteWorkout = async (workoutId) => {
        if (window.confirm('Are you sure you want to delete this workout?')) {
            try {
                await deleteWorkout(workoutId);
                fetchWorkouts();
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const openEditModal = (workout) => {
        setSelectedWorkout(workout);
        setFormData({
            title: workout.title,
            load: workout.load.toString(),
            reps: workout.reps.toString(),
            user_id: workout.user_id
        });
        setIsEditModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-gray-50 to-gray-100 flex">
            <AdminNavbar />
            <div className="flex-1 p-4 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Workout Management</h1>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-teal-600 hover:to-teal-700 transition duration-200 shadow-lg"
                    >
                        <Plus size={20} />
                        Add Workout
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 shadow-sm" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <div className="mb-6 flex items-center bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                    <Search className="text-gray-500 mr-2" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search workouts..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        className="w-full px-3 py-2 outline-none rounded-lg bg-transparent"
                    />
                </div>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                            <tr>
                                <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Title</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Load (kg)</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Reps</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Owner</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredWorkouts.length > 0 ? (
                                filteredWorkouts.map((workout) => (
                                    <tr key={workout._id} className="hover:bg-gray-50 transition duration-200">
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-800">{workout.title}</td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-800">{workout.load}</td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-800">{workout.reps}</td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-800">{getUserNameById(workout.user_id)}</td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => openEditModal(workout)}
                                                    className="text-teal-600 hover:text-teal-900 transition duration-200"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteWorkout(workout._id)}
                                                    className="text-red-600 hover:text-red-900 transition duration-200"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-4 sm:px-6 py-4 text-center text-sm text-gray-500">
                                        No workouts found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Create Workout Modal */}
                {isCreateModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-2xl">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800">Create New Workout</h2>
                            <form onSubmit={handleCreateWorkout} className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                <input
                                    type="number"
                                    placeholder="Load (kg)"
                                    value={formData.load}
                                    onChange={(e) => setFormData({ ...formData, load: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                <input
                                    type="number"
                                    placeholder="Reps"
                                    value={formData.reps}
                                    onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                <select
                                    value={formData.user_id}
                                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                >
                                    <option value="" disabled>Select Owner</option>
                                    {users.map(user => (
                                        <option key={user._id} value={user._id}>{user.name}</option>
                                    ))}
                                </select>
                                <div className="flex justify-end space-x-2">
                                    <button 
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={isLoading}
                                        className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition duration-200 shadow-lg"
                                    >
                                        Create Workout
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Workout Modal */}
                {isEditModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-2xl">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit Workout</h2>
                            <form onSubmit={handleUpdateWorkout} className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                <input
                                    type="number"
                                    placeholder="Load (kg)"
                                    value={formData.load}
                                    onChange={(e) => setFormData({ ...formData, load: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                <input
                                    type="number"
                                    placeholder="Reps"
                                    value={formData.reps}
                                    onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                <select
                                    value={formData.user_id}
                                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                >
                                    <option value="" disabled>Select User</option>
                                    {users.map(user => (
                                        <option key={user._id} value={user._id}>{user.name}</option>
                                    ))}
                                </select>
                                <div className="flex justify-end space-x-2">
                                    <button 
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={isLoading}
                                        className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition duration-200 shadow-lg"
                                    >
                                        Update Workout
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminWorkouts;