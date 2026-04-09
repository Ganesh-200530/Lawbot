import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Loader2, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit } = useForm();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const onSubmit = async (data: any) => {
        setLoading(true);
        setError('');
        try {
            await login(data);
            navigate('/');
        } catch (err) {
            setError('Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 pt-32 pb-12 bg-gradient-to-tr from-[#0b1120] to-[#1e1b4b]">
            <div className="glass-panel p-8 w-full max-w-md animate-fade-in-up">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight">
                        Welcome Back
                    </h2>
                    <p className="text-slate-400 text-sm mt-3">Sign in to continue your legal journey</p>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label className="text-sm font-semibold text-slate-300 ml-1">Email Address</label>
                        <div className="relative group mt-1.5">
                            <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-blue-400 transition-colors z-10" />
                            <input 
                                {...register('email', { required: true })}
                                type="email" 
                                className="input-field !pl-11" 
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-slate-300 ml-1">Password</label>
                        <div className="relative group mt-1.5">
                            <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-blue-400 transition-colors z-10" />
                            <input 
                                {...register('password', { required: true })}
                                type={showPassword ? "text" : "password"}
                                className="input-field !pl-11 !pr-11" 
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition-colors focus:outline-none z-10"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center py-2.5 rounded-lg mt-2">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn-primary w-full flex justify-center items-center mt-6"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Log In'}
                    </button>
                </form>

                <p className="mt-8 text-center text-slate-400 text-sm">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
