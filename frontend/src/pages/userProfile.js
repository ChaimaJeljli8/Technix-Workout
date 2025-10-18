import { useState, useEffect } from "react";
import UserNavbar from "../components/UserNavbar";
import { useAuthStore } from "../hooks/useAuth";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash, FaBell } from "react-icons/fa"; // Import the bell icon
import NotificationCenter from "../components/NotificationCenter";

const UserProfile = () => {
    const { user, isAuthenticated } = useAuthStore();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        confirmPassword: ''
    });
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false); // State to toggle notifications
    const [unreadCount, setUnreadCount] = useState(0); // State to track unread notifications

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { getProfile } = useAuthStore.getState();
                const profileData = await getProfile();
                setFormData((prev) => ({
                    ...prev,
                    name: profileData.name || '',
                    email: profileData.email || '',
                }));
                if (profileData.profilePicture) {
                    const imageUrl = `http://localhost:4000${profileData.profilePicture}`;
                    setImagePreview(imageUrl);
                    localStorage.setItem(`profileImage_${profileData.id}`, imageUrl);
                }
                if (!isAuthenticated) {
                    const { checkAuth } = useAuthStore.getState();
                    checkAuth();
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                toast.error('Failed to load profile data');
            }
        };

        const storedImage = localStorage.getItem(`profileImage_${user?.id}`);
        if (storedImage) {
            setImagePreview(storedImage);
        } else if (user) {
            fetchProfile();
        }
    }, [user, isAuthenticated]);

    // Fetch notifications and calculate unread count
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const { notifications } = useAuthStore.getState();
                const unread = notifications.filter((n) => !n.read).length;
                setUnreadCount(unread);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.error('Please log in to update your profile');
            return;
        }

        if (formData.password && formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('email', formData.email);
            if (profileImage) {
                formDataToSend.append('profilePicture', profileImage);
            }
            if (formData.password) {
                formDataToSend.append('password', formData.password);
            }

            const { updateProfile } = useAuthStore.getState();
            const updatedProfile = await updateProfile(formDataToSend);

            if (updatedProfile.profilePicture) {
                const updatedImageUrl = `http://localhost:4000${updatedProfile.profilePicture}`;
                setImagePreview(updatedImageUrl);
                localStorage.setItem(`profileImage_${user.id}`, updatedImageUrl);
            }

            toast.success('Profile updated successfully');
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            if (error.response?.status === 404) {
                const { checkAuth } = useAuthStore.getState();
                await checkAuth();
                toast.error('Session expired. Please log in again.');
                return;
            }
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Sidebar */}
            <div className="w-64 fixed inset-y-0 left-0 bg-white border-r border-gray-200 shadow-lg">
                <UserNavbar />
            </div>

            {/* Main Content */}
            <main className="ml-64 p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Notification Bell Icon with Badge */}
                    <div className="fixed top-4 right-4 z-50">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-all relative"
                        >
                            <FaBell className="text-2xl text-teal-600" />
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-96">
                                <NotificationCenter />
                            </div>
                        )}
                    </div>

                    {/* Profile Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-teal-100">
                        {/* Header */}
                        <div className="p-8 border-b border-gray-200">
                            <h2 className="text-4xl font-bold text-teal-800">Profile Settings</h2>
                            <p className="mt-2 text-lg text-gray-600">Update your profile information and account settings</p>
                        </div>

                        <div className="p-8">
                            {!isEditing ? (
                                <div className="space-y-8">
                                    {/* Profile Display */}
                                    <div className="flex items-center space-x-8">
                                        <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-teal-500 bg-gray-100 shadow-lg">
                                            {imagePreview ? (
                                                <img
                                                    src={imagePreview}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <span className="text-5xl font-bold text-gray-400">
                                                        {formData.name?.charAt(0)?.toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-bold text-teal-900">{formData.name}</h3>
                                            <p className="text-xl text-gray-700">{formData.email}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="mt-6 inline-flex items-center px-8 py-4 bg-teal-600 text-white text-xl font-semibold rounded-xl hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all"
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {/* Profile Picture Section */}
                                    <div className="flex flex-col items-center">
                                        <div className="relative">
                                            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-teal-500 bg-gray-100 shadow-lg">
                                                {imagePreview ? (
                                                    <img
                                                        src={imagePreview}
                                                        alt="Profile preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <span className="text-5xl font-bold text-gray-400">
                                                            {formData.name?.charAt(0)?.toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <label className="absolute bottom-0 right-0 bg-white rounded-full p-3 shadow-md cursor-pointer hover:bg-gray-50 transition-all">
                                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                        <p className="mt-4 text-sm text-gray-500">Click the camera icon to update your profile picture</p>
                                    </div>

                                    {/* Form Fields */}
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-xl font-medium text-gray-700 mb-3">
                                                Name
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-6 py-4 rounded-xl border border-teal-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
                                                placeholder="Enter your name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xl font-medium text-gray-700 mb-3">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full px-6 py-4 rounded-xl border border-teal-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
                                                placeholder="Enter your email"
                                            />
                                        </div>
                                    
                                        <div>
                                            <label className="block text-xl font-medium text-gray-700 mb-3">New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    className="w-full px-6 py-4 border border-teal-300 rounded-xl pr-14"
                                                    placeholder="Enter new password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-sm leading-5"
                                                > {showPassword ? <FaEyeSlash className="h-6 w-6 text-gray-500" /> : <FaEye className="h-6 w-6 text-gray-500" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xl font-medium text-gray-700 mb-3">Confirm Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={formData.confirmPassword}
                                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                    className="w-full px-6 py-4 border border-teal-300 rounded-xl pr-14"
                                                    placeholder="Confirm password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-sm leading-5"
                                                >
                                                    {showConfirmPassword ? <FaEyeSlash className="h-6 w-6 text-gray-500" /> : <FaEye className="h-6 w-6 text-gray-500" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                       
                                    {/* Action Buttons */}
                                    <div className="flex space-x-6 pt-8">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className={`px-8 py-4 bg-teal-600 text-white text-xl font-semibold rounded-xl hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all ${
                                                loading ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                        >
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="px-8 py-4 bg-gray-100 text-gray-700 text-xl font-semibold rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserProfile;