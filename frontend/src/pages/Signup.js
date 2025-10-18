import { useState } from "react";
import { useAuthStore } from "../hooks/useAuth";
import { Mail, Lock, Eye, EyeOff, User, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import { motion } from "framer-motion";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [role, setRole] = useState("user"); // Default to 'user'
  const { signup, error, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeToTerms) {
      alert("You must agree to the terms and privacy policy.");
      return;
    }
    try {
      await signup(email, password, name, role); // Pass accountType to signup function
      navigate("/verify-email");
    } catch (error) {
      console.log(error);
    }
  };

  const inputStyles =
    "w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white text-gray-900 placeholder-gray-500 transition duration-200";

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-teal-100 to-sky-100 flex items-center justify-center relative overflow-hidden">
      <Link
        to="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 text-teal-600 text-xl sm:text-2xl font-bold"
      >
        Technix Workout
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white bg-opacity-80 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="relative z-10 w-full mt-8 max-w-md">
          <h3 className="text-3xl font-bold mb-4 text-center flex items-center justify-center space-x-3 bg-gradient-to-r from-teal-700 to-sky-600 text-transparent bg-clip-text">
            <span>Create Account</span>
          </h3>

          <form className="pt-3 p-4 rounded-2xl bg-white-50" onSubmit={handleSubmit}>
            <div className="relative mb-5">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <User className="size-5 text-teal-500" />
              </div>
              <input
                type="text"
                onChange={(e) => setName(e.target.value)}
                value={name}
                className={inputStyles}
                placeholder="Enter your Full Name"
                required
              />
            </div>

            <div className="mb-5">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-teal-500" />
                <input
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  className={inputStyles}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="mb-5">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-teal-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  className={inputStyles}
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-6 transform -translate-y-1/2 text-teal-500 hover:text-teal-700 p-0 border-none bg-transparent"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <PasswordStrengthMeter password={password} />

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mt-2 mb-1 block">
                Account Type:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["user", "admin"].map((type) => (
                  <label
                    key={type}
                    className={`flex flex-col items-center justify-center p-1 border rounded-md cursor-pointer
                      transition-all duration-200 ease-in-out text-gray-700 text-sm font-medium
                      ${
                        role === type
                          ? "border-teal-600 bg-teal-50 shadow"
                          : "border-gray-300 hover:border-teal-500"
                      }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={type}
                      checked={role === type}
                      onChange={() => setRole(type)}
                      className="hidden"
                    />
                    {type === "user" ? (
                      <User className="h-5 w-5 text-teal-600 mb-1" />
                    ) : (
                      <Lock className="h-5 w-5 text-teal-600 mb-1" />
                    )}
                    <span>{type === "user" ? "User" : "Admin"}</span>
                  </label>
                ))}
              </div>
            </div>



            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={() => setAgreeToTerms(!agreeToTerms)}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500"
              />
              <label className="ml-2 text-sm text-gray-600">
                I agree to the{" "}
                <a href="/terms" className="text-teal-600 hover:text-teal-700">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-teal-600 hover:text-teal-700">
                  Privacy Policy
                </a>
              </label>
            </div>

            {error && <p className="text-red-500 font-semibold mt-2">{error}</p>}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="mt-5 w-full py-3 px-4 bg-gradient-to-r from-teal-700 to-teal-500 text-white 
                                font-bold rounded-lg shadow-lg hover:from-teal-400
                                hover:to-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500  focus:ring-offset-2
                                focus:ring-offset-white transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader className="animate-spin mx-auto" size={24} /> : "Sign Up"}
            </motion.button>
          </form>
        </div>

        <div className="px-8 py-4 bg-gray-50 flex justify-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-teal-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;