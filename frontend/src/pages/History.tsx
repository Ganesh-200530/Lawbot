import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Loader2, History as HistoryIcon, MapPin, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface QueryItem {
    id: number;
    question: string;
    response: string;
    lawyer_suggestions: string;
    search_key: string;
    timestamp: string;
}

const History = () => {
    const [history, setHistory] = useState<QueryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/api/history');
                setHistory(res.data);
            } catch (error) {
                console.error("Failed to load history:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    return (
        <div className="pt-24 pb-12 px-6 max-w-5xl mx-auto min-h-screen">
            <div className="mb-10 flex items-center gap-4">
                <div className="bg-gradient-to-tr from-emerald-500 to-teal-400 p-3.5 rounded-2xl shadow-lg shadow-emerald-500/20">
                    <HistoryIcon className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
                    Query History
                </h1>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
            ) : history.length === 0 ? (
                <div className="glass-panel p-10 text-center text-slate-400">
                    You haven't asked any legal questions yet.
                </div>
            ) : (
                <div className="space-y-6">
                    {history.map((item) => (
                        <div key={item.id} className="glass-panel p-8">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold text-white mb-2 pb-2 border-b border-white/5 inline-block">
                                    Q: {item.question}
                                </h3>
                                <span className="text-xs text-slate-500 font-medium whitespace-nowrap bg-slate-800/50 px-3 py-1 rounded-full border border-white/5">
                                    {new Date(item.timestamp).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="prose prose-invert max-w-none text-slate-300 text-sm mb-6 pb-6 border-b border-white/5">
                                <ReactMarkdown>{item.response}</ReactMarkdown>
                            </div>

                            {item.lawyer_suggestions && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                                        <MapPin className="w-4 h-4" /> Advice & Next Steps
                                    </h4>
                                    <p className="text-sm text-slate-400 bg-slate-900/50 p-4 rounded-xl border border-white/5">
                                        {item.lawyer_suggestions}
                                    </p>
                                    
                                    {item.search_key && (
                                        <a 
                                            href={`https://www.google.com/search?q=${encodeURIComponent(item.search_key)}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20 hover:text-emerald-300 rounded-lg transition-colors text-sm font-medium border border-emerald-500/20"
                                        >
                                            <Search className="w-4 h-4" /> Find Lawyers ({item.search_key})
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default History;