import React, { useState, useEffect } from "react";
import { useAuthStore } from "../hooks/useAuth";
import AdminNavbar from "../components/AdminNavbar";
import { Camera, Loader2, Shield, Mail, User } from "lucide-react";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons
import toast from "react-hot-toast";

const AdminProfile = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "Administrator",
    password: "", // New password field
    confirmPassword: "", // Confirm password field
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Toggle confirm password visibility

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { getProfile } = useAuthStore.getState();
        const profileData = await getProfile();
        setFormData({
          ...formData,
          ...profileData,
        });
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
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
      }
    };

    const storedImage = localStorage.getItem(`profileImage_${user?.id}`);
    if (storedImage) {
      setImagePreview(storedImage);
    } else if (user) {
      fetchProfile();
    }
  }, [user, isAuthenticated, formData]);

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
      toast.error("Please log in to update your profile");
      return;
    }

    // Check if passwords match
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== "") {
          formDataToSend.append(key, formData[key]);
        }
      });
      if (profileImage) {
        formDataToSend.append("profilePicture", profileImage);
      }

      const { updateProfile } = useAuthStore.getState();
      const updatedProfile = await updateProfile(formDataToSend);

      if (updatedProfile.profilePicture) {
        const updatedImageUrl = `http://localhost:4000${updatedProfile.profilePicture}`;
        setImagePreview(updatedImageUrl);
        localStorage.setItem(`profileImage_${user.id}`, updatedImageUrl);
      }

      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <AdminNavbar />
      <main className="flex-1 p-4 md:p-8 ml-0 lg:ml-1 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Main Profile Section */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Admin Profile</h2>
                    <p className="text-teal-100">Manage your account settings</p>
                  </div>
                  <Shield className="w-8 h-8 text-teal-100" />
                </div>
              </div>

              <div className="p-6">
                {!isEditing ? (
                  <div className="space-y-8">
                    <div className="flex flex-col md:flex-row items-center md:space-x-8">
                      <div className="relative group">
                        <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-teal-100 shadow-lg transition-all duration-300 group-hover:scale-105">
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                              <User className="w-16 h-16 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-6 md:mt-0 space-y-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800">{formData.name}</h3>
                          <p className="text-gray-600">{formData.role}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center text-gray-600">
                            <Mail className="w-4 h-4 mr-2" />
                            {formData.email}
                          </div>
                        </div>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-6 py-2 bg-teal-600 text-white font-medium rounded-lg 
                                   hover:bg-teal-700 transition-all duration-300"
                        >
                          Edit Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col items-center">
                      <div className="relative group cursor-pointer">
                        <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-teal-100 shadow-lg">
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Profile preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                              <User className="w-16 h-16 text-white" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Camera className="text-white w-8 h-8" />
                          </div>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-teal-500 
                                   focus:ring-2 focus:ring-teal-200 transition-colors duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-teal-500 
                                   focus:ring-2 focus:ring-teal-200 transition-colors duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) =>
                              setFormData({ ...formData, password: e.target.value })
                            }
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-teal-500 
                                     focus:ring-2 focus:ring-teal-200 transition-colors duration-300 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                          >
                            {showPassword ? (
                              <FaEyeSlash className="h-5 w-5 text-gray-500" />
                            ) : (
                              <FaEye className="h-5 w-5 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={(e) =>
                              setFormData({ ...formData, confirmPassword: e.target.value })
                            }
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-teal-500 
                                     focus:ring-2 focus:ring-teal-200 transition-colors duration-300 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                          >
                            {showConfirmPassword ? (
                              <FaEyeSlash className="h-5 w-5 text-gray-500" />
                            ) : (
                              <FaEye className="h-5 w-5 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center px-6 py-2 bg-teal-600 text-white 
                                 font-medium rounded-lg hover:bg-teal-700 transition-all duration-300 
                                 disabled:opacity-70 disabled:cursor-not-allowed min-w-[120px]"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg 
                                 hover:bg-gray-300 transition-all duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminProfile;