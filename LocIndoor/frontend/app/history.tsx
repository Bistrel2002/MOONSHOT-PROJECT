import React, { useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/apiService';

export default function HistoryScreen() {
  // Animation refs
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(30)).current;
  const headerAnimation = useRef(new Animated.Value(-100)).current;

  // Define the navigation session type
  interface NavigationSession {
    id: string;
    destination: string;
    startLocation: string;
    startTime: string;
    endTime?: string;
    status: 'active' | 'completed' | 'cancelled';
    duration?: number;
    date: string;
    time: string;
  }

  // State for navigation history
  const [navigationHistory, setNavigationHistory] = useState<NavigationSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalNavigations: 0,
    thisWeekCount: 0,
  });

  // Get authentication context
  const { isAuthenticated, user } = useAuth();

  // Load navigation history from backend
  const loadNavigationHistory = async () => {
    try {
      setIsLoading(true);
      const response = await ApiService.getNavigationHistory(20, 0);
      
      if (response.success) {
        setNavigationHistory(response.data.sessions);
        
        // Calculate stats
        const total = response.data.sessions.length;
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const thisWeek = response.data.sessions.filter((session: NavigationSession) => 
          new Date(session.startTime) >= oneWeekAgo
        ).length;
        
        setStats({
          totalNavigations: total,
          thisWeekCount: thisWeek,
        });
      }
    } catch (error) {
      console.error('Failed to load navigation history:', error);
      // Keep empty state on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check authentication and load data
    if (!isAuthenticated) {
      router.replace('/login-page');
      return;
    }

    // Load navigation history
    loadNavigationHistory();

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
      Animated.timing(headerAnimation, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isAuthenticated]);

  // Component to render individual history cards
  const HistoryCard = ({ session }: { session: NavigationSession }) => (
    <BlurView intensity={15} style={styles.historyCard}>
      <LinearGradient
        colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
        style={styles.historyCardGradient}
      >
        <View style={styles.historyCardHeader}>
          <View style={styles.destinationInfo}>
            <Text style={styles.destinationName}>{session.destination}</Text>
            <Text style={styles.startLocation}>From: {session.startLocation}</Text>
          </View>
          <View style={[styles.statusBadge, 
            session.status === 'completed' ? styles.statusCompleted : 
            session.status === 'active' ? styles.statusActive : styles.statusCancelled
          ]}>
            <Text style={styles.statusText}>
              {session.status === 'completed' ? '✓' : 
               session.status === 'active' ? '•' : '✕'}
            </Text>
          </View>
        </View>
        
        <View style={styles.historyCardFooter}>
          <View style={styles.timeInfo}>
            <Feather name="calendar" size={12} color="#666" />
            <Text style={styles.dateText}>{session.date}</Text>
          </View>
          <View style={styles.timeInfo}>
            <Feather name="clock" size={12} color="#666" />
            <Text style={styles.timeText}>{session.time}</Text>
          </View>
          {session.duration && (
            <View style={styles.timeInfo}>
              <Feather name="zap" size={12} color="#666" />
              <Text style={styles.durationText}>{session.duration}m</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </BlurView>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#0052D4', '#4364F7', '#6FB1FC']}
        style={styles.headerGradient}
      >
        <SafeAreaView>
          <Animated.View 
            style={[
              styles.header,
              { transform: [{ translateY: headerAnimation }] }
            ]}
          >
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Feather name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Navigation History</Text>
              <Text style={styles.headerSubtitle}>Your journey timeline</Text>
            </View>
          </Animated.View>

          {/* Stats Overview */}
          <Animated.View 
            style={[
              styles.statsOverview,
              { 
                opacity: fadeAnimation,
                transform: [{ translateY: slideAnimation }]
              }
            ]}
          >
            <BlurView intensity={10} style={styles.statsContainer}>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <MaterialIcons name="history" size={32} color="#00D4FF" />
                  <Text style={styles.statValue}>{stats.totalNavigations}</Text>
                  <Text style={styles.statLabel}>Total Journeys</Text>
                </View>
                <View style={styles.statCard}>
                  <MaterialIcons name="trending-up" size={32} color="#00D4FF" />
                  <Text style={styles.statValue}>{stats.thisWeekCount}</Text>
                  <Text style={styles.statLabel}>This Week</Text>
                </View>
              </View>
            </BlurView>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>

      {/* Content Area */}
      <Animated.View 
        style={[
          styles.contentContainer,
          { 
            opacity: fadeAnimation,
            transform: [{ translateY: slideAnimation }]
          }
        ]}
      >
        {/* Recent Filter Button */}
        <View style={styles.filterSection}>
          <TouchableOpacity style={styles.filterButton}>
            <BlurView intensity={0} style={styles.filterButtonContent}>
              <Feather name="clock" size={18} color="#FFFFFF" />
              <Text style={styles.filterButtonText}>Recent</Text>
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* History Content */}
        <ScrollView 
          style={styles.historyList}
          contentContainerStyle={styles.historyContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            // Loading State
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00D4FF" />
              <Text style={styles.loadingText}>Loading your journeys...</Text>
            </View>
          ) : navigationHistory.length > 0 ? (
            // History cards with real data
            <View style={styles.historyCardsContainer}>
              {navigationHistory.map((session, index) => (
                <HistoryCard key={session.id || index} session={session} />
              ))}
            </View>
          ) : (
            // Empty State
            <BlurView intensity={10} style={styles.emptyState}>
              <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                style={styles.emptyStateGradient}
              >
                <Feather name="map" size={48} color="#CCCCCC" />
                <Text style={styles.emptyTitle}>No journeys yet</Text>
                <Text style={styles.emptySubtitle}>
                  Your navigation history will appear here once you start exploring
                </Text>
                <TouchableOpacity 
                  style={styles.startNavigatingButton}
                  onPress={() => router.push('/(tabs)/')}
                >
                  <LinearGradient
                    colors={['#00D4FF', '#6FB1FC']}
                    style={styles.startNavigatingGradient}
                  >
                    <Feather name="navigation" size={16} color="#FFFFFF" />
                    <Text style={styles.startNavigatingText}>Start Exploring</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </BlurView>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    marginRight: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 212, 255, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    marginRight: 30,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  statsOverview: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  statsContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginHorizontal: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statLabel: {
    fontSize: 13,
    color: '#FffFFF',
    textAlign: 'center',
    fontWeight: '600',
    textShadowColor: 'rgba(245, 242, 242, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  contentContainer: {
    flex: 1,
    marginTop: -10,
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 20,
  },
  filterSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterButton: {
    alignSelf: 'flex-start',
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1A237E',
    backgroundColor: '#1A237E',
  },
  filterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  historyList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  historyContent: {
    paddingBottom: 100,
  },
  emptyState: {
    marginTop: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.1)',
  },
  emptyStateGradient: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  startNavigatingButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  startNavigatingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  startNavigatingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  historyCardsContainer: {
    gap: 12,
  },
  historyCard: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.1)',
  },
  historyCardGradient: {
    padding: 16,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  destinationInfo: {
    flex: 1,
  },
  destinationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  startLocation: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  statusCompleted: {
    backgroundColor: '#4CAF50',
  },
  statusActive: {
    backgroundColor: '#FF9800',
  },
  statusCancelled: {
    backgroundColor: '#F44336',
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  historyCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  durationText: {
    fontSize: 12,
    color: '#666',
  },
});