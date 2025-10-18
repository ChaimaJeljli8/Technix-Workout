import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaUser, FaUsers, FaDumbbell, 
  FaSearch,FaTachometerAlt, FaCog, FaSignOutAlt,
  FaFireAlt, FaMedal, FaBell
} from 'react-icons/fa';
import AdminNavbar from '../components/AdminNavbar';
import { Chart } from 'chart.js/auto';

const AdminDashboard = () => {
  const { 
    user, 
    isAuthenticated, 
    logout, 
    getAllUsers, 
    getAllWorkouts,
    fetchNotifications,
    markNotificationAsRead,
    clearReadNotifications
  } = useAuthStore();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchWorkout, setSearchWorkout] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
    const { notifications } = useAuthStore();

  
  const barChartRef = useRef(null);
  const lineChartRef = useRef(null);
  const doughnutChartRef = useRef(null);
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);

 useEffect(() => {
    // Fetch notifications on mount
    fetchNotifications();
    
    // Set up polling interval
    const interval = setInterval(fetchNotifications, 30000);
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Function to handle marking a notification as read
  const handleMarkAsRead = async (id) => {
    await markNotificationAsRead(id);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const usersData = await getAllUsers();
        const workoutsData = await getAllWorkouts();
  
        if (Array.isArray(usersData)) {
          setUsers(usersData);
        }
  
        if (Array.isArray(workoutsData)) {
          setWorkouts(workoutsData);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  
    if (!isAuthenticated || (user && user.role !== 'admin')) {
      navigate('/login', { replace: true });
    } else {
      fetchData();
    }
  }, [isAuthenticated, user, navigate, getAllUsers, getAllWorkouts]);
  
  const handleClearReadNotifications = async () => {
    await clearReadNotifications();
  };


  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredWorkouts = workouts.filter(w => 
    w.title.toLowerCase().includes(searchWorkout.toLowerCase())
  );

  const getUserNameById = (userId) => {
    const foundUser = users.find(u => u._id === userId);
    return foundUser ? foundUser.name : 'Unknown User';
  };

  useEffect(() => {
    if (barChartRef.current) {
      if (barChartRef.current.chart) {
        barChartRef.current.chart.destroy();
      }
      const gradient = barChartRef.current.getContext('2d').createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, 'rgba(20, 184, 166, 0.8)');
      gradient.addColorStop(1, 'rgba(20, 184, 166, 0.2)');

      barChartRef.current.chart = new Chart(barChartRef.current, {
        type: 'bar',
        data: {
          labels: ['Users', 'Workouts'],
          datasets: [{
            label: 'Activity',
            data: [users.length, workouts.length],
            backgroundColor: gradient,
            borderRadius: 8,
            borderWidth: 0,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                display: false
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        },
      });
    }
  }, [users, workouts]);
  
  useEffect(() => {
    if (lineChartRef.current) {
      if (lineChartRef.current.chart) {
        lineChartRef.current.chart.destroy();
      }
      lineChartRef.current.chart = new Chart(lineChartRef.current, {
        type: 'line',
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [{
            label: 'Growth',
            data: [10, 20, 35, 50],
            borderColor: '#14b8a6',
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(20, 184, 166, 0.1)',
            pointBackgroundColor: '#14b8a6',
            pointRadius: 4,
            pointHoverRadius: 6,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                display: false
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        },
      });
    }
  }, []);
  
  useEffect(() => {
    if (doughnutChartRef.current) {
      if (doughnutChartRef.current.chart) {
        doughnutChartRef.current.chart.destroy();
      }
      doughnutChartRef.current.chart = new Chart(doughnutChartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Active', 'Inactive'],
          datasets: [{
            data: [users.length * 0.7, users.length * 0.3],
            backgroundColor: ['#14b8a6', '#e2e8f0'],
            borderWidth: 0,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '75%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            }
          }
        },
      });
    }
  }, [users]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <AdminNavbar />
      <div className="flex-1">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
             
                <FaTachometerAlt className="text-3xl text-teal-600" />
              
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-teal-600 text-sm mt-1">Welcome back, {user?.name || "Admin"} 👋</p>
              </div>
            </div>
               {/* Notifications Bell */}
                <div className=" flex  relative " ref={notificationsRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  >
                    <FaBell className="text-gray-600 text-xl" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-100 z-50 overflow-hidden">
                      <div className="flex justify-between items-center p-4 bg-gray-100 border-b border-gray-200">
                        <h3 className="text-gray-700 text-sm font-semibold">Notifications</h3>
                        <button
                          onClick={handleClearReadNotifications}
                          className="text-xs text-blue-500 hover:underline"
                        >
                          Clear Read
                        </button>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map(notification => (
                            <div 
                              key={notification.id} 
                              className={`p-4 border-b border-gray-100 ${notification.read ? 'bg-gray-50' : 'bg-white'}`}
                            >
                              <p className="text-sm font-medium text-gray-800">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
                              {!notification.read && (
                                <button
                                  className="text-blue-500 text-xs mt-2 hover:underline"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                >
                                  Mark as Read
                                </button>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 p-4 text-center">No notifications</p>
                        )}
                      </div>
                    </div>
                  )}

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                    <FaUser className="text-white" />
                  </div>
                  <span className="font-medium text-gray-700">{user?.name || "Admin"}</span>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
                    <Link
                      to="/admin/profile"
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <FaCog className="mr-3" />
                      Profile Settings
                    </Link>
                    <button
                      onClick={() => setShowLogoutModal(true)}
                      className="flex items-center w-full px-4 py-3 text-red-500 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <FaSignOutAlt className="mr-3" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {showLogoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Confirm Logout</h2>
              <p className="text-gray-600 mb-6">Are you sure you want to logout from the admin dashboard?</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => logout().then(() => navigate("/"))}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="container mx-auto p-6">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <FaUsers className="text-2xl text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
                  <p className="text-3xl font-bold text-blue-600">{users.length}</p>
                  <p className="text-sm text-gray-500">+12% from last week</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <FaDumbbell className="text-2xl text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Total Workouts</h3>
                  <p className="text-3xl font-bold text-green-600">{workouts.length}</p>
                  <p className="text-sm text-gray-500">+8% from last week</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <FaFireAlt className="text-2xl text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Active Users</h3>
                  <p className="text-3xl font-bold text-purple-600">{Math.floor(users.length * 0.7)}</p>
                  <p className="text-sm text-gray-500">+5% from last week</p>
                </div>
              </div>
            </div>

                  <div className="bg-white rounded-lg shadow-sm p-6 transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <FaMedal className="text-2xl text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Achievements</h3>
                  <p className="text-3xl font-bold text-yellow-600">{workouts.length * 2}</p>
                  <p className="text-sm text-gray-500">+15% from last week</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-teal-700 mb-4">User & Workout Activity</h3>
              <div className="h-64">
                <canvas ref={barChartRef}></canvas>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-teal-700 mb-4">Growth Over Time</h3>
              <div className="h-64">
                <canvas ref={lineChartRef}></canvas>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-teal-700 mb-4">User Engagement</h3>
              <div className="h-64">
                <canvas ref={doughnutChartRef}></canvas>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <FaUsers className="mr-2" />
                  Users
                </h2>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Search users..."
                    className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="overflow-x-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-50">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>

                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(u => (
                        <tr key={u._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{u.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                          
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-4 py-4 text-center text-gray-500">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <FaDumbbell className="mr-2" />
                  Workouts
                </h2>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Search workouts..."
                    className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={searchWorkout}
                    onChange={(e) => setSearchWorkout(e.target.value)}
                  />
                </div>
              </div>
              <div className="overflow-x-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-50">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Load</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reps</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>

                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredWorkouts.length > 0 ? (
                      filteredWorkouts.map(w => (
                        <tr key={w._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{w.title}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{w.load} kg</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{w.reps}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{getUserNameById(w.user_id)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-4 py-4 text-center text-gray-500">
                          No workouts found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;