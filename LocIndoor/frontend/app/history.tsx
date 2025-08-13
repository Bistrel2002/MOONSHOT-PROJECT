import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather, MaterialIcons } from '@expo/vector-icons';

export default function HistoryScreen() {
  // Animation refs
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(30)).current;
  const headerAnimation = useRef(new Animated.Value(-100)).current;

  // Mock data for recent navigation history (last 3 days)
  const recentHistory = [
    // Currently empty to show the "No journeys yet" state
    // When there's actual data, it would look like:
    // {
    //   id: 1,
    //   destination: 'Conference Room A',
    //   startLocation: 'Main Entrance',
    //   date: '2024-01-15',
    //   time: '09:30 AM',
    // }
  ];

  // Stats for the overview cards
  const stats = {
    totalNavigations: 5,
    thisWeekCount: 0,
  };

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
      Animated.timing(headerAnimation, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
          {recentHistory.length > 0 ? (
            // History cards would go here when there's data
            <View />
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
                  Your navigation history will appear here
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
});