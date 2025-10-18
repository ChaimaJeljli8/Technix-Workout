import { Link } from "react-router-dom";

const Navbar = () => (
    <header className="fixed top-0 left-0 w-full bg-gray-100 text-white shadow-lg z-50">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link to="/" className="flex items-center space-x-2">
          <img src="../images/logo.png" alt="Logo" className="h-16 w-auto" />
          
         
        </Link>
        <nav className="flex items-center space-x-8 ">
          <a href="#home"className="hover:text-teal-400 transition-colors ">Home</a>
          <a href="#About" className="hover:text-teal-400 transition-colors">About</a>
          <a href="#Workouts" className="hover:text-teal-400 transition-colors">Workouts</a>
          <a href="#Contact" className="hover:text-teal-400 transition-colors">Contact</a>
          <Link to="/login">
            <button className="px-4 py-2 border-2 border-teal-400 text-white bg-teal-400 hover:border-teal-400 hover:bg-gray-100 rounded-lg hover:text-teal-400 transition-colors">
              Log In
            </button>
          </Link>
          <Link to="/signup">
            <button className="px-4 py-2 border-2 border-blue-700 bg-gray-100 text-blue-700 hover:bg-blue-700 hover:text-white rounded-lg transition-all">
              Sign Up
            </button>
          </Link>
        </nav>
      </div>
    </header>
  );
export default Navbar;
