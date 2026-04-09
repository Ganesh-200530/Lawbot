import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const Signup = () => {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit } = useForm();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data: any) => {
        setLoading(true);
        setError('');
        try {
            await signup(data);
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 pt-32 pb-12 bg-gradient-to-tr from-[#0b1120] to-[#1e1b4b]">
            <div className="glass-panel p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight">Create Account</h2>
                    <p className="text-slate-400 mt-2 text-sm">Join Lawbot today to manage your legal cases.</p>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label className="text-sm font-semibold text-slate-300 ml-1">Full Name</label>
                        <input {...register('name')} className="input-field mt-1.5" required placeholder="John Doe" />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-slate-300 ml-1">Email</label>
                        <input {...register('email')} type="email" className="input-field mt-1.5" required placeholder="name@example.com" />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-slate-300 ml-1">Password</label>
                        <input {...register('password')} type="password" className="input-field mt-1.5" required placeholder="••••••••" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="text-sm font-semibold text-slate-300 ml-1">State</label>
                             <input {...register('state')} className="input-field mt-1.5" placeholder="e.g. Delhi" />
                        </div>
                        <div>
                             <label className="text-sm font-semibold text-slate-300 ml-1">City</label>
                             <input {...register('city')} className="input-field mt-1.5" placeholder="e.g. New Delhi" />
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
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Create Account'}
                    </button>
                </form>

                <p className="mt-8 text-center text-slate-400 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
