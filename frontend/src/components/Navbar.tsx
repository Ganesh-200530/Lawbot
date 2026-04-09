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
        <nav className="fixed top-0 w-full z-50 px-6 py-4 backdrop-blur-md bg-[#0b1120]/40 border-b border-white/5 transition-all duration-300">
            <div className="glass-panel !rounded-full !shadow-none !border-white/5 px-6 py-3 flex justify-between items-center max-w-7xl mx-auto bg-slate-900/60 backdrop-blur-xl">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="bg-gradient-to-tr from-blue-500 to-emerald-400 p-2 rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-blue-500/20">
                        <Scale className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-extrabold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">LAWBOT</span>
                </Link>

                <div className="flex items-center gap-6">
                    {user ? (
                        <>
                            <Link to="/profile" className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full hover:bg-white/10">
                                <UserIcon className="w-4 h-4" />
                                <span>{user.name}</span>
                            </Link>
                            <button  
                                onClick={handleLogout}
                                className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-red-500/10"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link 
                                to="/login" 
                                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                                    location.pathname === '/login' 
                                    ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" 
                                    : "text-slate-300 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className="btn-primary !px-5 !py-2.5 !rounded-full !text-sm !shadow-none hover:!shadow-[0_0_20px_rgba(37,99,235,0.3)]"
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
