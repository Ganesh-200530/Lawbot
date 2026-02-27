import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView, 
    Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { 
    User, 
    Phone, 
    MapPin, 
    LogOut, 
    ChevronRight, 
    Settings, 
    Bell, 
    Shield,
    ArrowLeft
} from 'lucide-react-native/dist/esm/lucide-react-native';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }: any) {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", onPress: logout, style: "destructive" }
            ]
        );
    };

    const UserDetailRow = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
        <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
                <Icon size={20} color="#94a3b8" />
            </View>
            <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>{label}</Text>
                <Text style={styles.detailValue} numberOfLines={1}>{value}</Text>
            </View>
        </View>
    );

    const MenuItem = ({ icon: Icon, label, onPress, color = "white" }: any) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                    <Icon size={20} color={color} />
                </View>
                <Text style={[styles.menuItemText, { color }]}>{label}</Text>
            </View>
            <ChevronRight size={20} color="#475569" />
        </TouchableOpacity>
    );

    return (
        <LinearGradient
            colors={['#0f172a', '#1e293b', '#0f172a']}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ArrowLeft size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Profile</Text>
                    <TouchableOpacity>
                        <Settings size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <BlurView intensity={20} tint="dark" style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
                    <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
                </BlurView>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Personal Info</Text>
                </View>
                
                <BlurView intensity={10} tint="dark" style={styles.infoSection}>
                    <UserDetailRow 
                        icon={Phone} 
                        label="Phone" 
                        value={user?.phone || 'Not provided'} 
                    />
                    <View style={styles.divider} />
                    <UserDetailRow 
                        icon={MapPin} 
                        label="Location" 
                        value={[user?.city, user?.state, user?.country].filter(Boolean).join(', ') || 'Not provided'} 
                    />
                     <View style={styles.divider} />
                     <UserDetailRow 
                        icon={User} 
                        label="Gender" 
                        value={user?.gender || 'Not provided'} 
                    />
                </BlurView>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Settings</Text>
                </View>

                <BlurView intensity={10} tint="dark" style={styles.menuSection}>
                    <MenuItem icon={Bell} label="Notifications" onPress={() => {}} color="#e2e8f0" />
                    <View style={styles.divider} />
                    <MenuItem icon={Shield} label="Privacy & Security" onPress={() => {}} color="#e2e8f0" />
                    <View style={styles.divider} />
                    <MenuItem icon={LogOut} label="Logout" onPress={handleLogout} color="#ef4444" />
                </BlurView>

                <View style={{ height: 40 }} />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 40,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    profileCard: {
        alignItems: 'center',
        padding: 30,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: 30,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    avatarText: {
        fontSize: 40,
        color: 'white',
        fontWeight: 'bold',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 16,
        color: '#94a3b8',
    },
    sectionHeader: {
        marginBottom: 12,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginLeft: 4,
    },
    infoSection: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        padding: 16,
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    detailIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    detailTextContainer: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: '#94a3b8',
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 16,
        color: 'white',
        fontWeight: '500',
    },
    menuSection: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        padding: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuItemText: {
        fontSize: 16,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginLeft: 56, // Align with text start
    },
});
