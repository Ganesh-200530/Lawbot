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
        <div className="min-h-screen flex items-center justify-center p-4 py-12">
            <div className="glass-panel p-8 w-full max-w-md">
                <h2 className="text-3xl font-bold mb-6 text-center">Create Account</h2>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-300">Full Name</label>
                        <input {...register('name')} className="input-field mt-1" required />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-300">Email</label>
                        <input {...register('email')} type="email" className="input-field mt-1" required />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-300">Password</label>
                        <input {...register('password')} type="password" className="input-field mt-1" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="text-sm font-medium text-gray-300">State</label>
                             <input {...register('state')} className="input-field mt-1" />
                        </div>
                        <div>
                             <label className="text-sm font-medium text-gray-300">City</label>
                             <input {...register('city')} className="input-field mt-1" />
                        </div>
                    </div>

                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn-primary w-full flex justify-center py-3 mt-4"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-400 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-400 hover:text-blue-300">Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
