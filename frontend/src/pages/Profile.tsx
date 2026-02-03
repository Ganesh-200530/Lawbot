import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Grid2X2, Scale, Clock, Shield } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();
    
    // Mock History for MVP visualization
    const activityHistory = [
        { id: 1, action: "Asked about Property Law", date: "Today, 10:23 AM", status: "Completed" },
        { id: 2, action: "Downloaded Guidance PDF", date: "Today, 10:25 AM", status: "Downloaded" },
    ];

    if (!user) {
        return <div className="pt-24 text-center text-white">Please login to view profile.</div>;
    }

    return (
        <div className="pt-24 pb-12 px-4 max-w-5xl mx-auto min-h-screen">
            {/* Header / Cover */}
            <div className="relative mb-12">
                <div className="h-48 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80')] opacity-20 bg-cover bg-center"></div>
                </div>
                
                {/* Profile Card Overlay */}
                <div className="absolute -bottom-16 left-8 flex items-end gap-6">
                    <div className="w-32 h-32 rounded-2xl bg-black border-4 border-blue-900/50 flex items-center justify-center text-blue-400 shadow-2xl relative z-10">
                        <User className="w-16 h-16" />
                    </div>
                    <div className="mb-4">
                        <h1 className="text-3xl font-bold text-white">{user.name}</h1>
                        <p className="text-blue-300 font-medium capitalize">{user.gender || 'User'}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-20">
                {/* Left Column: Details */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Contact Info */}
                    <div className="glass-panel p-6 space-y-4">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Contact Info</h3>
                        
                        <div className="flex items-center gap-3 text-gray-300">
                            <Mail className="w-5 h-5 text-blue-500" />
                            <div className="overflow-hidden">
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="text-sm truncate">{user.email}</p>
                            </div>
                        </div>

                        {user.phone && (
                            <div className="flex items-center gap-3 text-gray-300">
                                <Phone className="w-5 h-5 text-blue-500" />
                                <div>
                                    <p className="text-xs text-gray-500">Phone</p>
                                    <p className="text-sm">{user.phone}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3 text-gray-300">
                            <MapPin className="w-5 h-5 text-blue-500" />
                            <div>
                                <p className="text-xs text-gray-500">Location</p>
                                <p className="text-sm">{user.city}, {user.state}</p>
                                <p className="text-xs text-gray-500">{user.country}</p>
                            </div>
                        </div>
                    </div>

                    {/* Dashboard/Stats Summary (Mock) */}
                    <div className="glass-panel p-6">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">You & LawBot</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-900/20 p-3 rounded-lg text-center">
                                <Scale className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                                <span className="block text-2xl font-bold text-white">12</span>
                                <span className="text-xs text-gray-400">Queries</span>
                            </div>
                            <div className="bg-blue-900/20 p-3 rounded-lg text-center">
                                <Shield className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                                <span className="block text-2xl font-bold text-white">Basic</span>
                                <span className="text-xs text-gray-400">Plan</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Activity */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Clock className="w-5 h-5 text-blue-400" />
                                Recent Activity
                            </h2>
                            <button className="text-sm text-blue-400 hover:text-blue-300">View All</button>
                        </div>

                        <div className="space-y-4">
                            {activityHistory.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400">
                                            <Grid2X2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-gray-200 font-medium">{item.action}</p>
                                            <p className="text-xs text-gray-500">{item.date}</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                            
                            <div className="p-8 text-center border-t border-dashed border-white/10 mt-8">
                                <p className="text-gray-500 text-sm">No older activity found.</p>
                            </div>
                        </div>
                    </div>

                    {/* Settings Section (Placeholder) */}
                    <div className="glass-panel p-8">
                        <h2 className="text-xl font-bold text-white mb-6">Settings</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4">
                                <div>
                                    <p className="text-gray-200">Email Notifications</p>
                                    <p className="text-sm text-gray-500">Receive updates about your case queries</p>
                                </div>
                                <div className="w-12 h-6 rounded-full bg-blue-600 relative cursor-pointer">
                                    <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Profile;
