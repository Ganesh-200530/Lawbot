import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    ScrollView, 
    ActivityIndicator, 
    Alert,
    Switch,
    Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { 
    Scale, 
    User, 
    Upload, 
    FileText, 
    Mic, 
    Volume2, 
    Download, 
    MapPin, 
    Globe,
    ChevronDown,
    X
} from 'lucide-react-native/dist/esm/lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

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

// ... existing code ...
interface AnalysisResult {
    response: string;
    lawyer_suggestions: string;
    search_key: string;
    pdf_url: string | null;
    audio_url: string | null;
}

export default function HomeScreen({ navigation }: any) {
    const { user } = useAuth();
    const [question, setQuestion] = useState('');
    const [language, setLanguage] = useState('English');
    const [selectedState, setSelectedState] = useState(user?.state || '');
    const [selectedCity, setSelectedCity] = useState(user?.city || '');
    const [audioResponse, setAudioResponse] = useState(false);
    const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'text/plain'],
                copyToCacheDirectory: true
            });

            if (result.assets && result.assets[0]) {
                setSelectedFile(result.assets[0]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDownloadPdf = async (url: string) => {
        if (!url) return;
        
        try {
            // Fix localhost URL for simulator/device if needed
            // Assuming the backend returns relative path or localhost
            // Using api.defaults.baseURL to reconstruct full URL if relative
            
            // Note: The backend returns /static/pdfs/... or full URL
            // If it's a relative path starting with /, prepend base URL
            let downloadUrl = url;
            if (url.startsWith('/')) {
                downloadUrl = `${api.defaults.baseURL}${url}`;
            }

            // Simple browser open for now, or FileSystem download
            // await Linking.openURL(downloadUrl); 
            
            // Better: Download and Share
            const filename = url.split('/').pop() || 'legal_analysis.pdf';
            const fileUri = FileSystem.documentDirectory + filename;
            
            setLoading(true);
            const downloadRes = await FileSystem.downloadAsync(downloadUrl, fileUri);
            
            if (Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(downloadRes.uri);
            } else {
                Alert.alert('Download Complete', `File saved to ${downloadRes.uri}`);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to download PDF');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!question.trim() && !selectedFile) {
            Alert.alert('Required', 'Please describe your issue or upload a document.');
            return;
        }
        
        setLoading(true);
        setResult(null);
        
        try {
            let response;
            
            if (selectedFile) {
                // Form Data upload
                const formData = new FormData();
                
                // Append file
                // Start of Selection
                formData.append('file', {
                    uri: selectedFile.uri,
                    type: selectedFile.mimeType || 'application/pdf',
                    name: selectedFile.name,
                } as any);

                formData.append('question', question);
                formData.append('language', language);
                formData.append('location', selectedState || 'India');
                formData.append('audio_response', audioResponse.toString());

                response = await api.post('/api/upload_and_analyze', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                // JSON query
                response = await api.post('/api/query', {
                    question,
                    language,
                    location: selectedState || 'India',
                    audio_response: audioResponse
                });
            }
            
            setResult({
                response: response.data.response || JSON.stringify(response.data),
                lawyer_suggestions: response.data.lawyer_suggestions,
                search_key: response.data.search_key,
                pdf_url: response.data.pdf_url,
                audio_url: response.data.audio_url
            });

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={['#0f172a', '#1e293b', '#0f172a']}
            style={styles.container}
        >
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Law Bot MVP</Text>
                    <Text style={styles.headerSubtitle}>AI Legal Assistant</Text>
                </View>
                <TouchableOpacity 
                    onPress={() => navigation.navigate('Profile')} 
                    style={styles.profileButton}
                >
                    <User size={24} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView 
                style={styles.content} 
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <BlurView intensity={20} tint="dark" style={styles.card}>
                    {/* Location Selectors */}
                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}><MapPin size={12} color="#94a3b8" /> &nbsp;State</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={selectedState}
                                    onValueChange={(itemValue) => {
                                        setSelectedState(itemValue);
                                        setSelectedCity('');
                                    }}
                                    style={styles.picker}
                                    dropdownIconColor="white"
                                    mode="dropdown"
                                >
                                    <Picker.Item label="Select State" value="" color="#94a3b8" />
                                    {Object.keys(INDIAN_LOCATIONS).sort().map(state => (
                                        <Picker.Item key={state} label={state} value={state} color="black" />
                                    ))}
                                </Picker>
                            </View>
                        </View>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>City</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={selectedCity}
                                    onValueChange={setSelectedCity}
                                    enabled={!!selectedState}
                                    style={styles.picker}
                                    dropdownIconColor="white"
                                    mode="dropdown"
                                >
                                    <Picker.Item label="Select City" value="" color="#94a3b8" />
                                    {selectedState && INDIAN_LOCATIONS[selectedState]?.map(city => (
                                        <Picker.Item key={city} label={city} value={city} color="black" />
                                    ))}
                                </Picker>
                            </View>
                        </View>
                    </View>

                    {/* Language & Audio row */}
                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}><Globe size={12} color="#94a3b8" /> &nbsp;Language</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={language}
                                    onValueChange={setLanguage}
                                    style={styles.picker}
                                    dropdownIconColor="white"
                                >
                                    {['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Marathi', 'Bengali', 'Gujarati'].map(lang => (
                                        <Picker.Item key={lang} label={lang} value={lang} color="black" />
                                    ))}
                                </Picker>
                            </View>
                        </View>
                        
                        <View style={[styles.halfInput, { alignItems: 'center', justifyContent: 'center' }]}>
                             <Text style={styles.label}>Audio Response</Text>
                             <Switch
                                value={audioResponse}
                                onValueChange={setAudioResponse}
                                trackColor={{ false: "#334155", true: "#3b82f6" }}
                                thumbColor={audioResponse ? "#ffffff" : "#f4f3f4"}
                             />
                        </View>
                    </View>

                    {/* Question Input */}
                    <Text style={styles.label}>Describe your Issue</Text>
                    <View style={styles.textAreaContainer}>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Explain what happened, dates, and any deadlines..."
                            placeholderTextColor="#64748b"
                            multiline
                            numberOfLines={6}
                            value={question}
                            onChangeText={setQuestion}
                            textAlignVertical="top"
                        />
                        <TouchableOpacity style={styles.micButton} onPress={() => Alert.alert('Voice', 'Voice input coming soon!')}>
                            <Mic size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* File Upload */}
                    <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
                        {selectedFile ? (
                            <View style={styles.fileInfo}>
                                <FileText size={20} color="#3b82f6" />
                                <Text style={styles.fileName} numberOfLines={1}>
                                    {selectedFile.name}
                                </Text>
                                <TouchableOpacity onPress={() => setSelectedFile(null)}>
                                    <X size={16} color="#ef4444" style={{ marginLeft: 8 }} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.uploadContent}>
                                <Upload size={20} color="#94a3b8" />
                                <Text style={styles.uploadText}>Upload Document (PDF/TXT)</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Submit */}
                    <TouchableOpacity 
                        style={styles.submitButton} 
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Text style={styles.submitButtonText}>Analyze Case</Text>
                                <Scale size={20} color="white" style={{ marginLeft: 8 }} />
                            </>
                        )}
                    </TouchableOpacity>
                </BlurView>

                {/* Results Section */}
                {result && (
                    <BlurView intensity={20} tint="dark" style={styles.resultCard}>
                        <View style={styles.resultHeader}>
                            <Text style={styles.resultTitle}>Legal Analysis</Text>
                            <View style={styles.resultActions}>
                                {result.audio_url && (
                                    <TouchableOpacity style={styles.iconButton}>
                                        <Volume2 size={20} color="#3b82f6" />
                                    </TouchableOpacity>
                                )}
                                {result.pdf_url && (
                                    <TouchableOpacity 
                                        style={styles.iconButton}
                                        onPress={() => handleDownloadPdf(result.pdf_url!)}
                                    >
                                        <Download size={20} color="#10b981" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                        
                        <Text style={styles.sectionHeader}>Assessment:</Text>
                        <Text style={styles.resultText}>{result.response}</Text>
                        
                        {result.lawyer_suggestions && (
                            <>
                                <View style={styles.divider} />
                                <Text style={styles.sectionHeader}>Recommended Legal Help:</Text>
                                <Text style={styles.resultText}>{result.lawyer_suggestions}</Text>
                            </>
                        )}
                    </BlurView>
                )}
                
                <View style={{ height: 100 }} />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#94a3b8',
    },
    profileButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    card: {
        padding: 24,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        marginBottom: 24,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
    },
    halfInput: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94a3b8',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    pickerContainer: {
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        height: 50,
        justifyContent: 'center',
    },
    picker: {
        color: 'white',
        backgroundColor: 'transparent',
    },
    textAreaContainer: {
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        padding: 16,
        marginBottom: 20,
        height: 150,
        position: 'relative',
    },
    textArea: {
        color: 'white',
        fontSize: 16,
        flex: 1,
        lineHeight: 24,
    },
    micButton: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    uploadButton: {
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderStyle: 'dashed',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
    },
    uploadContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    uploadText: {
        color: '#94a3b8',
        fontSize: 14,
    },
    fileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    fileName: {
        color: 'white',
        fontSize: 14,
        marginLeft: 12,
        flex: 1,
    },
    submitButton: {
        backgroundColor: '#3b82f6',
        borderRadius: 16,
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resultCard: {
        padding: 24,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    resultTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    resultActions: {
        flexDirection: 'row',
        gap: 12,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#94a3b8',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    resultText: {
        color: '#e2e8f0',
        fontSize: 16,
        lineHeight: 26,
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginVertical: 16,
    },
});
