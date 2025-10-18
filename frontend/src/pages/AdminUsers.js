import React, { useState, useEffect } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import { useAuthStore } from '../hooks/useAuth';
import { UserPlus, Pencil, Trash2, Search } from 'lucide-react';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [modalError, setModalError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user'
    });

    const { getAllUsers, createUser, updateUser, deleteUser, isLoading } = useAuthStore();

    const fetchUsers = async () => {
        try {
            const usersData = await getAllUsers();
            setUsers(usersData);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setModalError(null);
        try {
            await createUser(formData);
            setIsCreateModalOpen(false);
            setFormData({ name: '', email: '', password: '', role: 'user' });
            fetchUsers();
        } catch (err) {
            setModalError(err.message);
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            await updateUser(selectedUser._id, formData);
            setIsEditModalOpen(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(userId);
                fetchUsers();
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role
        });
        setIsEditModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-gray-50 to-gray-100 flex">
            <AdminNavbar />
            <div className="flex-1 p-4 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-teal-600 hover:to-teal-700 transition duration-200 shadow-lg"
                    >
                        <UserPlus size={20} />
                        Add User
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
                        placeholder="Search users..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        className="w-full px-3 py-2 outline-none rounded-lg bg-transparent"
                    />
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                            <tr>
                                <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Name</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Email</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Role</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Status</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition duration-200">
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-800">{user.name}</td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-800">{user.email}</td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-800 capitalize">{user.role}</td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {user.isVerified ? 'Verified' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-2">
                                                <button 
                                                    onClick={() => openEditModal(user)}
                                                    className="text-teal-600 hover:text-teal-900 transition duration-200"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteUser(user._id)}
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
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Create User Modal */}
                {isCreateModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-2xl">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800">Create New User</h2>
                            {modalError && (
                                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                                    {modalError}
                                </div>
                            )}
                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                >
                                    <option value="" disabled>Select Role</option>
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
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
                                        Create User
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit User Modal */}
                {isEditModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-2xl">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit User</h2>
                            <form onSubmit={handleUpdateUser} className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                <input
                                    type="password"
                                    placeholder="New Password (leave blank to keep current)"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                >
                                    <option value="" disabled>Select Role</option>
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
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
                                        Update User
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

export default AdminUsers;