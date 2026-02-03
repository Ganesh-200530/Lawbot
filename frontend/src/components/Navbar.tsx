import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scale, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="fixed top-0 w-full z-50 px-6 py-4">
            <div className="glass-panel px-6 py-3 flex justify-between items-center max-w-7xl mx-auto">
                <Link to="/" className="flex items-center gap-2 text-blue-400 font-bold text-xl">
                    <Scale className="w-6 h-6" />
                    <span>LAWBOT</span>
                </Link>

                <div className="flex items-center gap-6">
                    {user ? (
                        <>
                            <Link to="/profile" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
                                <UserIcon className="w-4 h-4" />
                                <span>{user.name}</span>
                            </Link>
                            <button  
                                onClick={handleLogout}
                                className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </>
                    ) : (
                        <div className="flex gap-4">
                            <Link 
                                to="/login" 
                                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                                    location.pathname === '/login' 
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                                    : "text-gray-300 hover:text-white"
                                }`}
                            >
                                Login
                            </Link>
                            <Link 
                                to="/signup" 
                                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                                    location.pathname === '/signup' 
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                                    : "text-gray-300 hover:text-white"
                                }`}
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
