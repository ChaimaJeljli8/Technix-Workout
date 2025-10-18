import { useState } from "react";
import { useAuthStore } from "../hooks/useAuth";
import { Mail, Lock, Eye, EyeOff, LogIn, Loader, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const { login, error: authError, isLoading } = useAuthStore();
    const [loginAttempts, setLoginAttempts] = useState(0);

    const {   user, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    const validateForm = () => {
        const errors = {};
        if (!email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = 'Please enter a valid email';
        }
        if (!password.trim()) {
            errors.password = 'Password is required';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        try {
            await login(email, password);
            // Reset attempts on successful login
            setLoginAttempts(0);
        } catch (err) {
            setLoginAttempts(prev => prev + 1);
            console.error("Login failed:", err);
        }
    };

    const getErrorMessage = () => {
        if (authError === "Invalid credentials") {
            return loginAttempts > 2 
                ? "Multiple login attempts failed. Please check your email and password carefully or use 'Forgot Password'."
                : "Email or password is incorrect. Please try again.";
        }
        return authError;
    };
    useEffect(() => {
        if (isAuthenticated && user?.role) {
            navigate(user.role === "admin" ? "/adminDashboard" : "/userHome");
        }
    }, [isAuthenticated, user?.role, navigate]);
    

    const inputStyles = "w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white text-gray-900 placeholder-gray-500 transition duration-200";

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-teal-100 to-sky-100 flex items-center justify-center relative overflow-hidden">
            <Link to="/" className="absolute top-4 left-4 text-teal-600 text-xl sm:text-2xl font-bold">
                Technix Workout
            </Link>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full bg-white bg-opacity-80 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
            >
                <div className="relative z-10 w-full mt-5 max-w-md p-8">
                    <h3 className="text-3xl font-bold mb-6 text-center flex items-center justify-center space-x-3 bg-gradient-to-r from-teal-700 to-sky-600 text-transparent bg-clip-text">
                        <LogIn className="h-6 w-6 text-teal-900" />
                        <span>Welcome Back</span>
                    </h3>
                    <form className="p-8 rounded-2xl bg-white-100" onSubmit={handleSubmit}>
                        {authError && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg flex items-start gap-3"
                            >
                                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-red-500 text-sm font-medium">{getErrorMessage()}</p>
                                    {loginAttempts > 2 && (
                                        <Link 
                                            to="/forgot-password"
                                            className="text-sm text-red-400 hover:text-red-300 mt-2 inline-block"
                                        >
                                            Reset your password →
                                        </Link>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        <div className="relative mb-6">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Mail className="size-5 text-teal-500" />
                            </div>
                            <input
                                type="email"
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setFormErrors({...formErrors, email: ''});
                                }}
                                value={email}
                                className={`${inputStyles} ${formErrors.email || authError ? 'border-red-500' : ''}`}
                                placeholder="Email Address"
                            />
                            {formErrors.email && (
                                <p className="mt-1 text-red-500 text-sm">{formErrors.email}</p>
                            )}
                        </div>

                        <div className="relative mb-6">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Lock className="h-5 w-5 text-teal-500" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setFormErrors({...formErrors, password: ''});
                                }}
                                value={password}
                                className={`${inputStyles} ${formErrors.password || authError ? 'border-red-500' : ''}`}
                                placeholder="Password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-6 transform -translate-y-1/2 text-teal-500 hover:text-teal-700 p-0 border-none bg-transparent"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                            {formErrors.password && (
                                <p className="mt-1 text-red-500 text-sm">{formErrors.password}</p>
                            )}
                        </div>

                        <div className="mb-6 text-right">
                            <Link to="/forgot-password" className="text-sm text-teal-700 hover:text-teal-900">
                                Forgot Password?
                            </Link>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="mt-5 w-full py-3 px-4 bg-gradient-to-r from-teal-700 to-teal-500 text-white 
                                font-bold rounded-lg shadow-lg hover:from-teal-400
                                hover:to-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
                                focus:ring-offset-white transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader className="animate-spin mx-auto" size={24} /> : "Log In"}
                        </motion.button>
                    </form>
                </div>

                <div className="px-8 py-4 bg-gray-50 flex justify-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-teal-600 hover:underline">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;