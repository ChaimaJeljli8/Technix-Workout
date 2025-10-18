import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../hooks/useAuth";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const EmailVerificationPage = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const { verifyEmail, error, isLoading, user } = useAuthStore();

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Allow only numeric input
    const newCode = [...code];

    // Handle pasted content
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || "";
      }
      setCode(newCode);

      // Focus on the last non-empty input or the first empty one
      const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
      const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
      inputRefs.current[focusIndex].focus();
    } else {
      newCode[index] = value;
      setCode(newCode);

      // Move focus to the next input field if value is entered
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      const verificationCode = code.join("");
      try {
        await verifyEmail(verificationCode); // Email verification now handles role-based navigation
        toast.success("Email verified successfully");
        if (user?.role === "admin") {
          navigate("/adminDashboard"); // Navigate to the admin dashboard
        } else {
          navigate("/userHome"); // Navigate to user home page
        }
      } catch (error) {
        console.log(error);
      }
    },
    [code, verifyEmail, navigate, user]
  );

  useEffect(() => {
    if (code.every((digit) => digit !== "")) {
      handleSubmit();
    }
  }, [code, handleSubmit]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-teal-100 to-sky-100 flex items-center justify-center relative overflow-hidden">
      {/* Logo */}
      <Link to="/" className="absolute top-4 left-4 text-teal-600 text-xl sm:text-2xl font-bold">
        Technix Workout
      </Link>
      <div className="max-w-md w-full bg-white bg-opacity-80 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md"
        >
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-teal-700 to-sky-600 text-transparent bg-clip-text">
            Verify Your Email
          </h2>
          <p className="text-center text-gray-700 mb-6">Enter the 6-digit code sent to your email address.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between">
              {code.map((digit, index) => (
               <input
               key={index}
               ref={(el) => (inputRefs.current[index] = el)}
               type="text"
               maxLength="1"
               value={digit}
               onChange={(e) => handleChange(index, e.target.value)}
               onKeyDown={(e) => handleKeyDown(index, e)}
               onPaste={(e) => {
                 e.preventDefault(); // Prevent default paste behavior
                 const pastedText = e.clipboardData.getData("text"); // Get pasted text
                 handleChange(index, pastedText); // Handle pasted content
               }}
               className="w-12 h-12 text-center text-2xl font-bold bg-white text-gray-900 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none"
               aria-label={`Verification code digit ${index + 1}`}
             />
              ))}
            </div>
            {error && <p className="text-red-500 font-semibold mt-2">{error}</p>}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading || code.some((digit) => !digit)}
              className="w-full bg-gradient-to-r from-teal-700 to-teal-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:from-teal-600 hover:to-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 disabled:opacity-50"
            >
              {isLoading ? "Verifying..." : "Verify Email"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;