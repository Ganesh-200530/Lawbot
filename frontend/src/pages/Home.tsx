import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Mic, Send, Loader2, MapPin, ChevronDown, Globe } from 'lucide-react';

const INDIAN_LOCATIONS: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Tirupati", "Other"],
  "Arunachal Pradesh": ["Itanagar", "Tawang", "Other"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Other"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Other"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Other"],
  "Goa": ["Panaji", "Margao", "Other"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Other"],
  "Haryana": ["Gurgaon", "Faridabad", "Panipat", "Other"],
  "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Other"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Other"],
  "Karnataka": ["Bangalore", "Mysore", "Mangalore", "Hubli", "Other"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Other"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Other"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Other"],
  "Manipur": ["Imphal", "Other"],
  "Meghalaya": ["Shillong", "Other"],
  "Mizoram": ["Aizawl", "Other"],
  "Nagaland": ["Kohima", "Dimapur", "Other"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Other"],
  "Punjab": ["Ludhiana", "Amritsar", "Chandigarh", "Other"],
  "Rajasthan": ["Jaipur", "Udaipur", "Jodhpur", "Kota", "Other"],
  "Sikkim": ["Gangtok", "Other"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Other"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Other"],
  "Tripura": ["Agartala", "Other"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Noida", "Agra", "Other"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Nainital", "Other"],
  "West Bengal": ["Kolkata", "Darjeeling", "Siliguri", "Other"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "Other"],
  "Jammu & Kashmir": ["Srinagar", "Jammu", "Other"],
  "Ladakh": ["Leh", "Kargil", "Other"],
  "Andaman & Nicobar Islands": ["Port Blair", "Other"],
  "Chandigarh": ["Chandigarh", "Other"],
  "Dadra & Nagar Haveli and Daman & Diu": ["Daman", "Diu", "Silvassa", "Other"],
  "Lakshadweep": ["Kavaratti", "Agatti", "Other"],
  "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam", "Other"],
  "Other": ["Other"]
};

const Home = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<string | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [lawyerTips, setLawyerTips] = useState<string | null>(null);
    const [searchKey, setSearchKey] = useState<string | null>(null);
    // const [relatedCases, setRelatedCases] = useState<string[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { register, handleSubmit, setValue, watch } = useForm({
        defaultValues: {
            question: '',
            language: 'English',
            country: 'India',
            state: user?.state || '',
            city: user?.city || '',
            audio_response: false
        }
    });

    const selectedState = watch('state');
    
    // File handler
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const onSubmit = async (data: any) => {
        setLoading(true);
        setResponse(null);
        setAudioUrl(null);
        setPdfUrl(null);
        setLawyerTips(null);
        setSearchKey(null);
        // setRelatedCases([]);
        
        try {
            let res;
            if (selectedFile) {
                // Use Upload Endpoint
                const formData = new FormData();
                formData.append('file', selectedFile);
                formData.append('question', data.question);
                formData.append('language', data.language);
                formData.append('location', data.state); // Use state as primary location
                formData.append('audio_response', data.audio_response.toString());
                
                res = await api.post('/api/upload_and_analyze', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                setLawyerTips(res.data.lawyer_suggestions);
                setSearchKey(res.data.search_key);
                if (res.data.pdf_url) setPdfUrl(`http://localhost:5000${res.data.pdf_url}`);

            } else {
                // Use Standard Query Endpoint
                res = await api.post('/api/query', {
                    question: data.question,
                    language: data.language,
                    location: data.state
                });
                
                // if (res.data.retrieved_cases) {
                //     setRelatedCases(res.data.retrieved_cases);
                // }
                setLawyerTips(res.data.lawyer_suggestions);
                setSearchKey(res.data.search_key);
                if (res.data.pdf_url) setPdfUrl(`http://localhost:5000${res.data.pdf_url}`);
            }

            setResponse(res.data.response);
            if (res.data.audio_url) {
                setAudioUrl(`http://localhost:5000${res.data.audio_url}`);
            }

        } catch (error) {
            console.error(error);
            setResponse("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleMicClick = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Your browser does not support Speech Recognition. Please try Chrome or Edge.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = watch('language') === 'Hindi' ? 'hi-IN' 
            : watch('language') === 'Tamil' ? 'ta-IN' 
            : watch('language') === 'Telugu' ? 'te-IN' 
            : 'en-IN'; // Add more mappings as needed
            
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            alert("Listening... Speak now!");
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            const currentQ = watch('question') || '';
            setValue('question', currentQ + (currentQ ? ' ' : '') + transcript);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            alert("Error recognizing speech. Please try again.");
        };

        recognition.start();
    };

    return (
        <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto min-h-screen flex flex-col">
             {/* Header Section */}
            <div className="mb-10 text-center sm:text-left mt-8">
                <p className="text-slate-400 text-lg sm:text-xl max-w-2xl font-medium leading-relaxed">
                    Speak or type your issue. We auto-detect your language, find relevant Indian case laws, and simplify your legal options.
                </p>
            </div>

            {/* Main Input Card */}
            <div className="glass-panel p-6 sm:p-10 mb-10 relative overflow-hidden backdrop-blur-2xl border-slate-700/50 bg-slate-900/70">
                {/* Decorative glows */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none mix-blend-screen"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[80px] -ml-40 -mb-40 pointer-events-none mix-blend-screen"></div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative z-10">
                    
                    {/* Issue Description */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-300 tracking-wide uppercase flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            Explain Your Situation
                        </label>
                        <div className="relative group">
                            <textarea 
                                {...register('question', { required: true })}
                                className="input-field min-h-[180px] resize-none pr-16 text-lg leading-relaxed bg-slate-950/50 backdrop-blur-md focus:bg-slate-900/80 transition-all shadow-inner"
                                placeholder="What happened? Include dates, who was involved, and any deadlines you're facing..."
                            ></textarea>
                            <button 
                                type="button"
                                onClick={handleMicClick}
                                className="absolute bottom-5 right-5 p-3.5 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full hover:from-indigo-400 hover:to-blue-500 transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] group/mic active:scale-95"
                            >
                                <Mic className="w-5 h-5 text-white group-hover/mic:scale-110 transition-transform" />
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 font-medium ml-1">You can type naturally or use the mic button to speak your issue directly.</p>
                    </div>

                    {/* Filters Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-blue-300 flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                Language
                            </label>
                            <div className="relative group">
                                <select 
                                    {...register('language')}
                                    className="w-full bg-blue-900/20 border border-blue-500/30 rounded-xl px-4 py-3 appearance-none text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all cursor-pointer hover:bg-blue-900/30 text-base font-medium shadow-lg shadow-black/20" 
                                >
                                    <option value="English" className="bg-slate-900 text-white">English</option>
                                    <option value="Hindi" className="bg-slate-900 text-white">Hindi</option>
                                    <option value="Tamil" className="bg-slate-900 text-white">Tamil</option>
                                    <option value="Telugu" className="bg-slate-900 text-white">Telugu</option>
                                    <option value="Kannada" className="bg-slate-900 text-white">Kannada</option>
                                    <option value="Malayalam" className="bg-slate-900 text-white">Malayalam</option>
                                    <option value="Marathi" className="bg-slate-900 text-white">Marathi</option>
                                    <option value="Bengali" className="bg-slate-900 text-white">Bengali</option>
                                    <option value="Gujarati" className="bg-slate-900 text-white">Gujarati</option>
                                    <option value="Urdu" className="bg-slate-900 text-white">Urdu</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400 group-hover:text-cyan-300 transition-colors">
                                    <ChevronDown className="w-5 h-5 stroke-[3]" />
                                </div>
                            </div>
                        </div>

                        {/* Document Upload */}
                        <div className="space-y-2">
                             <label className="block text-sm font-medium text-gray-300">Upload Document (PDF/Txt)</label>
                             <input 
                                type="file"
                                accept=".pdf,.txt"
                                onChange={handleFileChange}
                                className="input-field py-2 text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                             />
                        </div>

                        <div className="space-y-3">
                             <label className="text-sm font-bold text-slate-300 tracking-wide uppercase flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                Audio Response?
                             </label>
                             <div className="flex items-center gap-3 pt-2">
                                <input 
                                    type="checkbox" 
                                    id="audio_toggle"
                                    {...register('audio_response')}
                                    className="w-5 h-5 rounded border-slate-600 bg-slate-900/50 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                                <label htmlFor="audio_toggle" className="text-sm font-medium text-slate-400 cursor-pointer select-none hover:text-slate-300 transition-colors">
                                    Enable Audio Playback (TTS)
                                </label>
                             </div>
                        </div>

                    </div>

                    {/* Location Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-blue-300 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Country*
                            </label>
                            <div className="relative group">
                                <select 
                                    {...register('country')} 
                                    className="w-full bg-blue-900/20 border border-blue-500/30 rounded-xl px-4 py-3 appearance-none text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all cursor-pointer hover:bg-blue-900/30 text-base font-medium shadow-lg shadow-black/20"
                                >
                                    <option value="India" className="bg-slate-900 text-white">India</option>
                                    <option value="Other" className="bg-slate-900 text-white">Other</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400 group-hover:text-cyan-300 transition-colors">
                                    <ChevronDown className="w-5 h-5 stroke-[3]" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-blue-300">State/Province</label>
                            <div className="relative group">
                                <select 
                                   {...register('state')}
                                   onChange={(e) => {
                                       setValue('state', e.target.value);
                                       setValue('city', ''); // Reset city on state change
                                   }}
                                   className="w-full bg-blue-900/20 border border-blue-500/30 rounded-xl px-4 py-3 appearance-none text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all cursor-pointer hover:bg-blue-900/30 text-base font-medium shadow-lg shadow-black/20"
                                >
                                   <option value="" className="bg-slate-900 text-gray-500">Select State</option>
                                   {Object.keys(INDIAN_LOCATIONS).sort().map(state => (
                                       <option key={state} value={state} className="bg-slate-900 text-white">{state}</option>
                                   ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400 group-hover:text-cyan-300 transition-colors">
                                    <ChevronDown className="w-5 h-5 stroke-[3]" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-blue-300">City</label>
                             <div className="relative group">
                                <select 
                                   {...register('city')}
                                   disabled={!selectedState}
                                   className="w-full bg-blue-900/20 border border-blue-500/30 rounded-xl px-4 py-3 appearance-none text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all cursor-pointer hover:bg-blue-900/30 text-base font-medium shadow-lg shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                   <option value="" className="bg-slate-900 text-gray-500">Select City</option>
                                   {selectedState && INDIAN_LOCATIONS[selectedState]?.map(city => (
                                       <option key={city} value={city} className="bg-slate-900 text-white">{city}</option>
                                   ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400 group-hover:text-cyan-300 transition-colors">
                                    <ChevronDown className="w-5 h-5 stroke-[3]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-2">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="btn-primary flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            Get guidance
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setValue('question', '')}
                            className="px-6 py-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors font-medium"
                        >
                            Clear
                        </button>
                    </div>

                </form>
            </div>

            {/* Results Section */}
            {loading && !response && (
                <div className="glass-panel p-12 text-center animate-pulse">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white">Analyzing your case...</h3>
                    <p className="text-gray-400 mt-2">Consulting legal database & generating guidance...</p>
                </div>
            )}

            {response && (
                <div className="glass-panel p-8 space-y-6 animate-fade-in-up">
                    <div className="flex justify-between items-start">
                        <h2 className="text-2xl font-bold text-white">Legal Guidance</h2>
                        {audioUrl && (
                            <audio controls src={audioUrl} className="h-8 w-40" />
                        )}
                    </div>
                    
                    <div className="prose prose-invert max-w-none text-gray-200 leading-relaxed whitespace-pre-wrap">
                        {response}
                    </div>

                    {lawyerTips && (
                         <div className="mt-8 p-6 bg-gradient-to-br from-blue-900/40 to-slate-900/40 border border-blue-500/30 rounded-xl relative overflow-hidden shadow-xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                            
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="text-2xl">⚖️</span> 
                                Recommended Legal Action
                            </h3>
                            
                            <div className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed mb-8">
                                {lawyerTips}
                            </div>

                            {searchKey && (
                                <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t border-white/10">
                                    <a 
                                        href={`https://www.google.com/search?q=${encodeURIComponent(searchKey)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-100 text-black rounded-lg font-medium transition-colors shadow-lg shadow-white/5"
                                    >
                                        <div className="bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white font-bold">G</div>
                                        Search Google
                                    </a>
                                    
                                    <a 
                                        href={`https://www.google.com/maps/search/${encodeURIComponent(searchKey)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20"
                                    >
                                        <MapPin className="w-4 h-4" />
                                        Find Nearby Lawyers
                                    </a>
                                </div>
                            )}
                         </div>
                    )}
                    
                    {pdfUrl && (
                        <div className="mt-6 flex justify-end">
                            <a 
                                href={pdfUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl transition-all shadow-lg shadow-blue-900/40 font-medium group"
                            >
                                <span className="p-1 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">📄</span>
                                <div>
                                    <span className="block text-xs opacity-80">Get Professional Report</span>
                                    <span className="text-sm">Download Guidance PDF</span>
                                </div>
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Home;
