import { create } from "zustand";
import axios from "axios";

const API_URL = 'http://localhost:4000/api/user';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
  
});

// Add token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");  // Get token from localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;  // Set token in Authorization header
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  role: "user",
  error: null,
  isLoading: false,
  isCheckingAuth: true,
  message: null,
  notifications: [],


  initializeAuth: async () => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Set initial state from localStorage
        set({
          user: { ...parsedUser, token },
          isAuthenticated: true,
          isCheckingAuth: false
        });
        
        // Verify token validity with backend
        const response = await axios.get(`${API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.user) {
          // Update with fresh user data from server
          const updatedUser = {
            ...response.data.user,
            token
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          set({
            user: updatedUser,
            isAuthenticated: true,
            isCheckingAuth: false
          });
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({
          user: null,
          isAuthenticated: false,
          isCheckingAuth: false
        });
      }
    } else {
      set({
        user: null,
        isAuthenticated: false,
        isCheckingAuth: false
      });
    }
  },

  setNotifications: (notifications) => {
    set({ notifications });
  },


  signup: async (email, password, name, role) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post('/signup', { email, password, name, role });
      
      console.log("Signup Response:", response.data); 
  
      if (!response.data || !response.data.user || !response.data.user.token) {
        throw new Error("Invalid response from server");
      }
  
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.user.token); 
  
      set({ 
        user: response.data.user, 
        isAuthenticated: true, 
        isLoading: false, 
        role: response.data.user.role 
      });
  
    } catch (error) {
      console.error("Signup Error:", error.response?.data || error.message);
      set({ error: error.response?.data?.message || "Error signing up", isLoading: false });
      throw error;
    }
  },
  

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
        const response = await axiosInstance.post('/login', { email, password });

        console.log("Backend Response:", response.data); // Debugging

        const userWithRole = { 
            ...response.data.user, 
            role: response.data.user.role || "user" ,
        };

        localStorage.setItem("user", JSON.stringify(userWithRole));
        localStorage.setItem("token", response.data.user.token);

        set({
            user: userWithRole,
            isAuthenticated: true,
            isLoading: false,
            role: userWithRole.role 
        });

        console.log("Stored User after Login:", JSON.parse(localStorage.getItem("user"))); // Debugging

    } catch (error) {
        console.error("Login error:", error.response?.data?.message || error.message);
        set({ error: error.response?.data?.message || "Error logging in", isLoading: false });
        throw error;
    }
},


logout: async () => {
  console.log('Logout initiated');
  set({ isLoading: true, error: null });
  try {
      await axiosInstance.post('/logout');
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      console.log('Logout successful');
      set({ user: null, isAuthenticated: false, isLoading: false, role: "user" }); 
  } catch (error) {
      console.error('Logout error:', error);
      set({ error: "Error logging out", isLoading: false });
  }
},

  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            set({ isCheckingAuth: false, isAuthenticated: false });
            return;
        }

        const response = await axiosInstance.get('/profile');
        const user = response.data.user;

        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
            set({ 
                user, 
                isAuthenticated: true, 
                isCheckingAuth: false, 
                role: user.role || "user" 
            });
        } else {
            set({ isCheckingAuth: false, isAuthenticated: false });
        }

    } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({ user: null, isAuthenticated: false, isCheckingAuth: false });
    }
},


verifyEmail: async (code) => {
  set({ isLoading: true, error: null });
  try {
    const response = await axiosInstance.post('/verify-email', { code });

    console.log("Verify Email Response:", response.data); // Debugging
    
    const updatedUser = { 
        ...response.data.user, 
        role: response.data.user.role || "user" 
    };

    // Ensure updatedUser has the correct data
    localStorage.setItem("user", JSON.stringify(updatedUser));
    set({ user: updatedUser, isAuthenticated: true, isLoading: false });
  } catch (error) {
    set({ error: error.response?.data?.message || "Error verifying email", isLoading: false });
    throw error;
  }
},


  
  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post('/forgot-password', { email });
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || "Error sending reset email", isLoading: false });
      throw error;
    }
  },

  resetPassword: async (token, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post(`/reset-password/${token}`, { password });
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || "Error resetting password", isLoading: false });
      throw error;
    }
  },
  
  getProfile: async () => {
    set({ isLoading: true, error: null });
    try {
        const response = await axiosInstance.get('/profile');
        const user = response.data.user;

        const userWithRole = { ...user, role: user.role || "user" };

        set({ user: userWithRole, role: userWithRole.role });
        return userWithRole;
    } catch (error) {
        console.error("Profile fetch error:", error);
        set({ error: error.response?.data?.message || "Error fetching profile" });
        throw error;
    } finally {
        set({ isLoading: false });
    }
},

updateProfile: async (formData) => {
  if (!formData || !(formData instanceof FormData)) {
      set({ error: "Invalid profile data", isLoading: false });
      return;
  }

  set({ isLoading: true, error: null });
  
  try {
      // Get user ID from stored user data
      const currentUser = JSON.parse(localStorage.getItem("user"));
      if (!currentUser?.id) {
          throw new Error("User ID not found");
      }

      // Add user ID to form data
      formData.append('userId', currentUser.id);

      // Log request details
      console.log('Update Profile Request:', {
          userId: currentUser.id,
          formDataEntries: Array.from(formData.entries()),
          endpoint: `${API_URL}/profile`
      });

      const response = await axiosInstance.put('/profile', formData, {
          headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${localStorage.getItem("token")}`
          },
      });

      console.log('Server Response:', response.data);

      const updatedUser = { ...currentUser, ...response.data.user };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      set({ user: updatedUser });
      return updatedUser;

  } catch (error) {
      console.log('Update Profile Error:', {
          config: error.config,
          response: error.response?.data,
          status: error.response?.status
      });
      
      const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
      set({ error: errorMessage });
      throw new Error(errorMessage);
  } finally {
      set({ isLoading: false });
  }
},

 // Admin-specific actions
 getAllUsers: async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  
  if (user?.role !== 'admin') {
    set({ error: 'Unauthorized access, admin only', isLoading: false });
    throw new Error('Unauthorized access');
  }

  set({ isLoading: true, error: null });
  try {
    const response = await axiosInstance.get('/admin/users');
    const users = response.data;

    // Filter out the current user from the list
    const filteredUsers = users.filter(u => u._id !== user.id);

      set({ users: filteredUsers, isLoading: false });
      return filteredUsers;  // Return the filtered users data
  } catch (error) {
    console.error('Fetch Users Error:', {
      response: error.response?.data,
      status: error.response?.status
    });
    set({ 
      error: error.response?.data?.message || "Error fetching users", 
      isLoading: false 
    });
    throw error;
  }
},


deleteUser: async (userId) => {
  set({ isLoading: true, error: null });
  try {
    await axiosInstance.delete(`/admin/users/${userId}`);
    set((state) => ({
      users: state.users.filter((user) => user._id !== userId),
      isLoading: false,
    }));
  } catch (error) {
    set({ error: error.response?.data?.message || "Error deleting user", isLoading: false });
    throw error;
  }
},

createUser: async (userData) => {
  set({ isLoading: true, error: null });
  try {
    // First check if user exists
    const checkResponse = await axiosInstance.get(`/admin/users/check-email/${userData.email}`);
    if (checkResponse.data.exists) {
      throw new Error("A user with this email already exists");
    }

    const response = await axiosInstance.post('/admin/users', userData);
    set((state) => ({
      users: [...(state.users || []), response.data.user],
      isLoading: false
    }));
    return response.data.user;
  } catch (error) {
    const errorMessage = error.message === "A user with this email already exists" 
      ? error.message 
      : error.response?.data?.message || "Error creating user";
    
    set({ error: errorMessage, isLoading: false });
    throw new Error(errorMessage);
  }
},

updateUser: async (userId, userData) => {
  set({ isLoading: true, error: null });
  try {
    const response = await axiosInstance.put(`/admin/users/${userId}`, userData);
    set((state) => ({
      users: state.users.map(user => 
        user._id === userId ? response.data.user : user
      ),
      isLoading: false
    }));
    return response.data.user;
  } catch (error) {
    set({ error: error.response?.data?.message || "Error updating user", isLoading: false });
    throw error;
  }
},
// Admin can manage workouts as well
getAllWorkouts: async () => {
  set({ isLoading: true, error: null });
  try {
    const response = await axiosInstance.get('/admin/workouts');
    const workouts = response.data;
    
    set({ workouts, isLoading: false });
    return workouts;  // Return the workouts data
  } catch (error) {
    console.error('Fetch Workouts Error:', {
      response: error.response?.data,
      status: error.response?.status
    });
    set({ 
      error: error.response?.data?.message || "Error fetching workouts", 
      isLoading: false 
    });
    throw error;
  }
},

deleteWorkout: async (workoutId) => {
  set({ isLoading: true, error: null });
  try {
    await axiosInstance.delete(`/admin/workouts/${workoutId}`);
    set((state) => ({
      workouts: state.workouts.filter((workout) => workout._id !== workoutId),
      isLoading: false,
    }));
  } catch (error) {
    set({ error: error.response?.data?.message || "Error deleting workout", isLoading: false });
    throw error;
  }
},
createWorkout: async (workoutData) => {
  set({ isLoading: true, error: null });
  try {
    const response = await axiosInstance.post('/admin/workouts', workoutData);
    set((state) => ({
      workouts: [...(state.workouts || []), response.data.workout],
      isLoading: false
    }));
    return response.data.workout;
  } catch (error) {
    set({ error: error.response?.data?.message || "Error creating workout", isLoading: false });
    throw error;
  }
},

updateWorkout: async (workoutId, workoutData) => {
  set({ isLoading: true, error: null });
  try {
    const response = await axiosInstance.put(`/admin/workouts/${workoutId}`, workoutData);
    set((state) => ({
      workouts: state.workouts.map(workout => 
        workout._id === workoutId ? response.data.workout : workout
      ),
      isLoading: false
    }));
    return response.data.workout;
  } catch (error) {
    set({ error: error.response?.data?.message || "Error updating workout", isLoading: false });
    throw error;
  }
},


//notifications

fetchNotifications: async () => {
  try {
    const response = await axiosInstance.get("/notifications");
    console.log("Raw notifications response:", response.data);
    
    if (!Array.isArray(response.data)) {
      console.error("Expected array of notifications, got:", response.data);
      return;
    }
    
    const notifications = response.data.map(n => ({
      id: n._id,
      title: n.title,
      message: n.message,
      type: n.type,
      read: Boolean(n.read),
      createdAt: new Date(n.createdAt).toISOString()
    }));
    
    console.log("Processed notifications:", notifications);
    set({ notifications });
    
  } catch (error) {
    console.error("Error fetching notifications:", error);
    set({ notifications: [] });
  }
},

markNotificationAsRead: async (notificationId) => {
  try {
    const url = `/notifications/${notificationId}/read`;
    console.log("Request URL:", url); // Debugging
    const response = await axiosInstance.patch(url);
    set(state => ({
      notifications: state.notifications.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    }));
    
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
},

clearReadNotifications: async () => {
  try {
    await axiosInstance.delete('/notifications/clear');
    
    set(state => ({
      notifications: state.notifications.filter(notif => !notif.read)
    }));
  } catch (error) {
    console.error("Error clearing notifications:", error);
    throw error;
  }
},

}));


