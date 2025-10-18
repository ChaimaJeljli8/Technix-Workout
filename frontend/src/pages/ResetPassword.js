import { useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../hooks/useAuth";
import { useNavigate, useParams } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react"; // Make sure to import Eye and EyeOff
import toast from "react-hot-toast";

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for toggling confirm password visibility
    const { resetPassword, error, isLoading, message } = useAuthStore();

    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        try {
            await resetPassword(token, password);

            toast.success("Password reset successfully, redirecting to login page...");
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Error resetting password");
        }
    };

    const inputStyles = "w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white text-gray-900 placeholder-gray-500 transition duration-200";

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-teal-100 to-sky-100 flex items-center justify-center relative overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full bg-white bg-opacity-80 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
            >
                <div className="p-8">
                    <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-teal-700 to-sky-600 text-transparent bg-clip-text">
                        Reset Password
                    </h2>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    {message && <p className="text-green-500 text-sm mb-4">{message}</p>}

                    <form onSubmit={handleSubmit}>
                        <div className="relative mb-6">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-teal-500" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                                className={inputStyles}
                                placeholder="New Password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-4 transform -translate-y-1/2 text-teal-500 hover:text-teal-700 p-0 border-none bg-transparent"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5 mt-4" /> : <Eye className="h-5 w-5  mt-4" />}
                            </button>
                        </div>

                        <div className="relative mb-6">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-teal-500 " />
                            </div>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                value={confirmPassword}
                                className={inputStyles}
                                placeholder="Confirm New Password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-4 transform -translate-y-1/2 text-teal-500 hover:text-teal-700 p-0 border-none bg-transparent"
                            >
                                {showConfirmPassword ? <EyeOff className="h-5 w-5  mt-4" /> : <Eye className="h-5  mt-4 w-5" />}
                            </button>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3 px-4 bg-gradient-to-r from-teal-700 to-teal-500 text-white font-bold rounded-lg shadow-lg hover:from-teal-600 hover:to-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-white transition duration-200"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? "Resetting..." : "Set New Password"}
                        </motion.button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;