import React from 'react';
import { useAuthStore } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { FaUserAlt, FaDumbbell, FaChartLine, FaSignOutAlt, FaHome } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const UserNavbar = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuthStore();
    
    const handleClick = () => {
        logout();
        navigate('/');
    }
    
    return (
        <aside className="w-64 bg-gradient-to-b from-gray-300 to-white-50 text-gray  h-screen fixed left-0 top-0 shadow-xl flex flex-col">
            <div className="flex flex-col items-center w-full p-6">
                <Link to="/" className="flex items-center mb-8 transition-transform hover:scale-105">
                    <img
                        src="/images/logo.png"
                        alt="Technix Workout Logo"
                        className="h-16 w-auto object-contain"
                    />
                </Link>
                
                {user && (
                    <div className="space-y-8 w-full">
                        <div className="flex items-center justify-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                            <span className="text-lg font-semibold">Welcome, {user.name}</span>
                        </div>
                        
                        <nav className="flex flex-col space-y-3 w-full">
                            {[
                                { to: "/userHome", icon: <FaHome className="text-lg" />, label: "Home" },
                                { to: "/profile", icon: <FaUserAlt className="text-lg" />, label: "Profile Settings" },
                                { to: "/workouts-library", icon: <FaDumbbell className="text-lg" />, label: "Workout Library" },
                                { to: "/progress", icon: <FaChartLine className="text-lg" />, label: "Progress Tracker" },
                            ].map((item) => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className="flex items-center space-x-3 text-gray p-4 rounded-lg
                                             transition-all duration-200 hover:bg-white/20 hover:translate-x-2
                                             focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-50"
                                >
                                    <span className="text-teal-400">{item.icon}</span>
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                )}
            </div>
            
            <button
                onClick={handleClick}
                className="mt-auto mx-6 mb-6 flex items-center justify-center space-x-3 
                           bg-red-500/10 text-red-500 p-4 rounded-lg transition-all duration-200
                           hover:bg-red-500/20 hover:translate-y-[-2px]
                           focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
            >
                <FaSignOutAlt className="text-lg" />
                <span className="font-medium">Log Out</span>
            </button>
        </aside>
    );
}

export default UserNavbar;