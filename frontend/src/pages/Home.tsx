import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Mic, Send, Loader2 } from 'lucide-react';

const Home = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<string | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [lawyerTips, setLawyerTips] = useState<string | null>(null);
    const [relatedCases, setRelatedCases] = useState<string[]>([]);
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
        setRelatedCases([]);
        
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
                if (res.data.pdf_url) setPdfUrl(`http://localhost:5000${res.data.pdf_url}`);

            } else {
                // Use Standard Query Endpoint
                res = await api.post('/api/query', {
                    question: data.question,
                    language: data.language,
                    location: data.state
                });
                
                if (res.data.retrieved_cases) {
                    setRelatedCases(res.data.retrieved_cases);
                }
                setLawyerTips(res.data.lawyer_suggestions);
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
        // Placeholder for real speech-to-text integration
        alert("Speech to text feature integration required.");
    };

    return (
        <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto min-h-screen flex flex-col">
             {/* Header Section */}
            <div className="mb-8 text-center sm:text-left">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
                    Law Bot MVP
                </h1>
                <p className="text-gray-400 text-lg">
                    Speak or type your issue. We detect the language, infer the jurisdiction, and simplify the law for you.
                </p>
            </div>

            {/* Main Input Card */}
            <div className="glass-panel p-6 sm:p-8 mb-8 relative overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
                    
                    {/* Issue Description */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Issue description</label>
                        <div className="relative">
                            <textarea 
                                {...register('question', { required: true })}
                                className="input-field min-h-[160px] resize-none pr-12 text-lg leading-relaxed"
                                placeholder="Explain what happened, who was involved, dates, and any deadlines..."
                            ></textarea>
                            <button 
                                type="button"
                                onClick={handleMicClick}
                                className="absolute bottom-4 right-4 p-2 bg-blue-600 rounded-full hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/30 group"
                            >
                                <Mic className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500">Hold the mic button and speak slowly. Works best in Chromium-based browsers.</p>
                    </div>

                    {/* Filters Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Language</label>
                            <select 
                                {...register('language')}
                                className="input-field py-2.5 appearance-none bg-black/40" 
                            >
                                <option value="English">English</option>
                                <option value="Hindi">Hindi</option>
                                <option value="Tamil">Tamil</option>
                                <option value="Telugu">Telugu</option>
                                <option value="Kannada">Kannada</option>
                                <option value="Malayalam">Malayalam</option>
                                <option value="Marathi">Marathi</option>
                                <option value="Bengali">Bengali</option>
                                <option value="Gujarati">Gujarati</option>
                                <option value="Urdu">Urdu</option>
                            </select>
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

                         <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Audio Response?</label>
                             <div className="flex items-center gap-3 pt-2">
                                <input 
                                    type="checkbox" 
                                    {...register('audio_response')}
                                    className="w-5 h-5 rounded border-gray-600 bg-black/20 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-400">Enable TTS</span>
                             </div>
                        </div>

                    </div>

                    {/* Location Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Country*</label>
                             <select {...register('country')} className="input-field py-2.5 appearance-none">
                                <option value="India">India</option>
                             </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">State/Province</label>
                             <input 
                                {...register('state')}
                                className="input-field py-2.5" 
                                placeholder="e.g. Karnataka"
                             />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">City</label>
                             <input 
                                {...register('city')}
                                className="input-field py-2.5" 
                                placeholder="e.g. Bangalore"
                             />
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
                         <div className="mt-8 p-6 bg-blue-900/20 border border-blue-500/30 rounded-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                            <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2">
                                <span className="text-xl">⚖️</span> AI Recommended Legal Experts
                            </h3>
                            <div className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed">
                                {lawyerTips}
                            </div>
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
