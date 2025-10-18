import { Link, useLocation } from 'react-router-dom';
import { 
  FaUsers, FaHome, FaDumbbell, FaPlus, FaUser , FaCog,FaEnvelope
} from 'react-icons/fa';
import { useAuthStore } from '../hooks/useAuth'; 

const AdminNavbar = () => {
  const location = useLocation();
  const { user } = useAuthStore(); 
  const isActive = (path) => location.pathname === path;



  return (
    <aside className="w-64 bg-gradient-to-b from-teal to-white shadow-lg">
      <div className="p-6 text-center mb-1">
        <h2 className="text-2xl font-semibold text-gray-700 flex flex-col items-center ">
          <img src="/logo.png" className="w-20" alt="logo" />
          <span className="mt-2 font-bold text-teal-600">Technix Workout</span>
        </h2>
      </div>
      <nav className="flex flex-col space-y-4 px-4">
        <Link 
          to="/admin" 
          className={`flex items-center p-3 rounded-lg transition-all duration-300 
            ${isActive('/admin') ? 'bg-teal-600 text-white' : 'text-gray-700 hover:bg-teal-50 hover:text-teal-600'}`}
        >
          <FaHome size={20} className="mr-3" />
          <span className="text-sm font-medium">Dashboard</span>
        </Link>
        <Link 
          to="/admin/users" 
          className={`flex items-center p-3 rounded-lg transition-all duration-300 
            ${isActive('/admin/users') ? 'bg-teal-600 text-white' : 'text-gray-700 hover:bg-teal-50 hover:text-teal-600'}`}
        >
          <FaUsers size={20} className="mr-3" />
          <span className="text-sm font-medium">Users</span>
        </Link>
        <Link 
          to="/admin/workouts" 
          className={`flex items-center p-3 rounded-lg transition-all duration-300 
            ${isActive('/admin/workouts') ? 'bg-teal-600 text-white' : 'text-gray-700 hover:bg-teal-50 hover:text-teal-600'}`}
        >
          <FaDumbbell size={20} className="mr-3" />
          <span className="text-sm font-medium">Workouts</span>
        </Link>
        <Link 
          to="/admin/contact-messages" 
          className={`flex items-center p-3 rounded-lg transition-all duration-300 
            ${isActive('/admin/contact-messages') ? 'bg-teal-600 text-white' : 'text-gray-700 hover:bg-teal-50 hover:text-teal-600'}`}
        >
          <FaEnvelope size={20} className="mr-3" />
          <span className="text-sm font-medium">Contact Messages</span>
        </Link>
        <Link 
          to="/admin/features" 
          className={`flex items-center p-3 rounded-lg transition-all duration-300 
            ${isActive('/admin/features') ? 'bg-teal-600 text-white' : 'text-gray-700 hover:bg-teal-50 hover:text-teal-600'}`}
        >
          <FaPlus size={20} className="mr-3" />
          <span className="text-sm font-medium">More Features</span>
        </Link>
      </nav>
      <div className="absolute pt-1 mt-4  bottom-0 left-0 right-0 p-6">
        <div className="flex items-center space-x-3">
          <FaUser  size={32} className="text-teal-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">{user?.name || "Admin"}</p>
            <p className="text-xs text-gray-500">{user?.email || "admin@example.com"}</p>
            <div className="flex flex-col items-start mt-2">
              <Link to="/admin/profile" className="text-gray-600 hover:text-teal-600 flex items-center">
                <FaCog size={16} className="mr-1" />
                Profile
              </Link>
              
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminNavbar;