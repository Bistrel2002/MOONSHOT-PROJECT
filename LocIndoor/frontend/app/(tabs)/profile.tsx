import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Svg, { Line, Path, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationServicesEnabled, setLocationServicesEnabled] = useState(true);
  const [arModeEnabled, setArModeEnabled] = useState(true);

  // Animation refs
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(30)).current;
  const floatingAnimation = useRef(new Animated.Value(0)).current;
  const profilePulse = useRef(new Animated.Value(1)).current;

  const userStats = {
    totalNavigations: 47,
    totalDistance: '2.3 km',
    averageAccuracy: '98%',
    favoriteLocation: 'Conference Room A',
  };

  const menuItems = [
    {
      id: 'history',
      title: 'Navigation History',
      subtitle: 'View your past navigations',
      icon: '📊',
      onPress: () => router.push('/history'),
    },
    {
      id: 'favorites',
      title: 'Favorite Locations',
      subtitle: 'Manage your saved places',
      icon: '❤️',
      onPress: () => Alert.alert('Coming Soon', 'Favorites feature will be available soon!'),
    },
    {
      id: 'offline',
      title: 'Offline Maps',
      subtitle: 'Download maps for offline use',
      icon: '📥',
      onPress: () => Alert.alert('Coming Soon', 'Offline maps feature will be available soon!'),
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: '❓',
      onPress: () => Alert.alert('Help', 'For support, email us at support@locindoor.com'),
    },
    {
      id: 'about',
      title: 'About LocIndoor',
      subtitle: 'App version and information',
      icon: 'ℹ️',
      onPress: () => Alert.alert('About', 'LocIndoor v1.0.0\nSmart Indoor Navigation System'),
    },
  ];

  useEffect(() => {
    // Initial animations
    Animated.parallel([
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating animation loop
    const floatingLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnimation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnimation, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    floatingLoop.start();

    // Profile pulse animation
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(profilePulse, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(profilePulse, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    return () => {
      floatingLoop.stop();
      pulseLoop.stop();
    };
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => {
          Alert.alert('Signed Out', 'You have been signed out successfully.');
        }},
      ]
    );
  };

  const StatCard = ({ title, value, subtitle }: { title: string, value: string | number, subtitle?: string }) => (
    <BlurView intensity={15} style={styles.statCard}>
      <LinearGradient
        colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.05)']}
        style={styles.statCardGradient}
      >
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </LinearGradient>
    </BlurView>
  );

  const MenuItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.menuItem} onPress={item.onPress}>
      <View style={styles.menuItemLeft}>
        <Text style={styles.menuItemIcon}>{item.icon}</Text>
        <View style={styles.menuItemText}>
          <Text style={styles.menuItemTitle}>{item.title}</Text>
          <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      <Text style={styles.menuItemArrow}>›</Text>
    </TouchableOpacity>
  );

  const SettingItem = ({ title, subtitle, value, onValueChange }: { 
    title: string, 
    subtitle: string, 
    value: boolean, 
    onValueChange: (value: boolean) => void 
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: 'rgba(255, 255, 255, 0.3)', true: '#00D4FF' }}
        thumbColor={value ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)'}
      />
    </View>
  );

  const floatingTranslateY = floatingAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* AR Navigation themed background */}
      <LinearGradient
        colors={['#0052D4', '#4364F7', '#6FB1FC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundContainer}
      >
        {/* AR Elements */}
        <Animated.View 
          style={[
            styles.arElement1,
            {
              transform: [{ translateY: floatingTranslateY }],
              opacity: floatingAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.7],
              })
            }
          ]}
        />
        <Animated.View 
          style={[
            styles.arElement2,
            {
              transform: [{ 
                translateY: floatingAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 8],
                })
              }],
              opacity: floatingAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.4, 0.8],
              })
            }
          ]}
        />
        
        {/* AR Grid Lines */}
        <Svg width="100%" height="100%" style={styles.arGridOverlay}>
          <Line
            x1="10%"
            y1="15%"
            x2="90%"
            y2="20%"
            stroke="rgba(0, 212, 255, 0.2)"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
          <Path
            d="M 30 40 Q 200 60 370 45"
            stroke="rgba(111, 177, 252, 0.2)"
            strokeWidth="1"
            fill="none"
            strokeDasharray="4,4"
          />
        </Svg>
      </LinearGradient>

      <SafeAreaView style={styles.safeArea}>
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnimation,
              transform: [{ translateY: slideAnimation }]
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile</Text>
            <Text style={styles.headerSubtitle}>Manage your account and preferences</Text>
          </View>

          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {/* User Info */}
            <View style={styles.section}>
              <BlurView intensity={20} style={styles.userCard}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                  style={styles.userCardGradient}
                >
                  <Animated.View style={[styles.avatarContainer, { transform: [{ scale: profilePulse }] }]}>
                    <LinearGradient
                      colors={['#00D4FF', '#6FB1FC']}
                      style={styles.avatarGradient}
                    >
                      <Feather name="user" size={32} color="#FFFFFF" />
                    </LinearGradient>
                  </Animated.View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>John Doe</Text>
                    <Text style={styles.userEmail}>john.doe@locindoor.com</Text>
                    <Text style={styles.userMember}>Member since Jan 2024</Text>
                  </View>
                </LinearGradient>
              </BlurView>
            </View>

            {/* Statistics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Stats</Text>
              <View style={styles.statsContainer}>
                <StatCard 
                  title="Navigations" 
                  value={userStats.totalNavigations} 
                  subtitle="Total trips"
                />
                <StatCard 
                  title="Distance" 
                  value={userStats.totalDistance} 
                  subtitle="Total walked"
                />
              </View>
              <View style={styles.statsContainer}>
                <StatCard 
                  title="Accuracy" 
                  value={userStats.averageAccuracy} 
                  subtitle="Average precision"
                />
                <StatCard 
                  title="Favorite" 
                  value={userStats.favoriteLocation} 
                  subtitle="Most visited"
                />
              </View>
            </View>

            {/* Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Settings</Text>
              <BlurView intensity={15} style={styles.settingsCard}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.05)']}
                  style={styles.settingsCardGradient}
                >
                  <SettingItem
                    title="Notifications"
                    subtitle="Receive navigation updates"
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                  />
                  <View style={styles.settingDivider} />
                  <SettingItem
                    title="Location Services"
                    subtitle="Enable precise positioning"
                    value={locationServicesEnabled}
                    onValueChange={setLocationServicesEnabled}
                  />
                  <View style={styles.settingDivider} />
                  <SettingItem
                    title="AR Navigation"
                    subtitle="Use augmented reality mode"
                    value={arModeEnabled}
                    onValueChange={setArModeEnabled}
                  />
                </LinearGradient>
              </BlurView>
            </View>

            {/* Menu Items */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>More</Text>
              <BlurView intensity={15} style={styles.menuCard}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.05)']}
                  style={styles.menuCardGradient}
                >
                  {menuItems.map((item, index) => (
                    <View key={item.id}>
                      <MenuItem item={item} />
                      {index < menuItems.length - 1 && <View style={styles.menuDivider} />}
                    </View>
                  ))}
                </LinearGradient>
              </BlurView>
            </View>

            {/* Logout Button */}
            <View style={styles.section}>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <LinearGradient
                  colors={['#FF6B6B', '#FF5252']}
                  style={styles.logoutButtonGradient}
                >
                  <Feather name="log-out" size={18} color="#FFFFFF" />
                  <Text style={styles.logoutButtonText}>Sign Out</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* App Version */}
            <View style={styles.versionContainer}>
              <Text style={styles.versionText}>LocIndoor v1.0.0</Text>
            </View>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  arElement1: {
    position: 'absolute',
    top: '15%',
    right: '10%',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  arElement2: {
    position: 'absolute',
    bottom: '25%',
    left: '5%',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(111, 177, 252, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(111, 177, 252, 0.4)',
  },
  arGridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 212, 255, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 212, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  userCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  userCardGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
    overflow: 'hidden',
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  userMember: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCard: {
    borderRadius: 15,
    overflow: 'hidden',
    width: '48%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statCardGradient: {
    padding: 15,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00D4FF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 212, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  settingsCard: {
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  settingsCardGradient: {
    paddingVertical: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  settingDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 15,
  },
  menuCard: {
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuCardGradient: {
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  menuItemArrow: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 15,
  },
  logoutButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  logoutButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});