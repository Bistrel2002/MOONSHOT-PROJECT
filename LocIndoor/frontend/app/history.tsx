import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather, MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function HistoryScreen() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Animation refs
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(30)).current;
  const headerAnimation = useRef(new Animated.Value(-100)).current;

  const navigationHistory = [
    {
      id: 1,
      destination: 'Conference Room A',
      startLocation: 'Main Entrance',
      date: '2024-01-15',
      time: '09:30 AM',
      duration: '3 min 45 sec',
      distance: '78m',
      accuracy: '98%',
      status: 'completed',
      floor: '2nd Floor',
    },
    {
      id: 2,
      destination: 'Cafeteria',
      startLocation: 'Office 204',
      date: '2024-01-15',
      time: '12:15 PM',
      duration: '2 min 30 sec',
      distance: '45m',
      accuracy: '95%',
      status: 'completed',
      floor: '1st Floor',
    },
    {
      id: 3,
      destination: 'Parking Garage',
      startLocation: 'Lobby',
      date: '2024-01-15',
      time: '05:45 PM',
      duration: '4 min 12 sec',
      distance: '120m',
      accuracy: '97%',
      status: 'completed',
      floor: 'Basement',
    },
    {
      id: 4,
      destination: 'Meeting Room B',
      startLocation: 'Elevator',
      date: '2024-01-14',
      time: '02:20 PM',
      duration: '1 min 50 sec',
      distance: '32m',
      accuracy: '99%',
      status: 'completed',
      floor: '3rd Floor',
    },
    {
      id: 5,
      destination: 'Restroom',
      startLocation: 'Conference Room A',
      date: '2024-01-14',
      time: '11:00 AM',
      duration: '1 min 15 sec',
      distance: '25m',
      accuracy: '96%',
      status: 'completed',
      floor: '2nd Floor',
    },
  ];

  const filters = [
    { id: 'all', name: 'All', icon: 'list' },
    { id: 'recent', name: 'Recent', icon: 'clock' },
    { id: 'favorites', name: 'Favorites', icon: 'heart' },
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
      Animated.timing(headerAnimation, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const stats = {
    totalNavigations: navigationHistory.length,
    thisWeekCount: navigationHistory.filter(nav => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      return nav.date >= weekAgo;
    }).length,
  };

  const getFilteredHistory = () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    switch (selectedFilter) {
      case 'recent':
        return navigationHistory.filter(nav => nav.date >= threeDaysAgo);
      case 'favorites':
        // For demo, show most frequently visited locations
        return navigationHistory.filter(nav => 
          nav.destination.includes('Conference') || 
          nav.destination.includes('Cafeteria')
        );
      default:
        return navigationHistory;
    }
  };

  const HistoryCard = ({ navigation: navItem }: { navigation: any }) => (
    <TouchableOpacity 
      style={styles.historyCard}
      onPress={() => {
        router.push({
          pathname: '/ar-navigation',
          params: { 
            destination: JSON.stringify({ 
              name: navItem.destination,
              floor: navItem.floor.split(' ')[0]
            })
          }
        });
      }}
    >
      <View style={styles.historyHeader}>
        <View style={styles.historyMainInfo}>
          <Text style={styles.destinationName}>{navItem.destination}</Text>
          <Text style={styles.routeInfo}>
            From: {navItem.startLocation}
          </Text>
          <Text style={styles.floorInfo}>{navItem.floor}</Text>
        </View>
        <View style={styles.historyTime}>
          <Text style={styles.timeText}>{navItem.time}</Text>
          <Text style={styles.dateText}>{navItem.date}</Text>
        </View>
      </View>
      
      <View style={styles.historyStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{navItem.duration}</Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{navItem.distance}</Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{navItem.accuracy}</Text>
          <Text style={styles.statLabel}>Accuracy</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.repeatButton}>
        <Text style={styles.repeatButtonText}>Repeat Navigation</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const StatCard = ({ title, value, subtitle }: { title: string, value: string | number, subtitle?: string }) => (
    <View style={styles.summaryStatCard}>
      <Text style={styles.summaryStatValue}>{value}</Text>
      <Text style={styles.summaryStatTitle}>{title}</Text>
      {subtitle && <Text style={styles.summaryStatSubtitle}>{subtitle}</Text>}
    </View>
  );

  const filteredHistory = getFilteredHistory();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Modern Header with Gradient */}
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
            <TouchableOpacity style={styles.searchButton}>
              <Feather name="search" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>

          {/* Simple Stats Overview */}
          <Animated.View 
            style={[
              styles.statsOverview,
              { 
                opacity: fadeAnimation,
                transform: [{ translateY: slideAnimation }]
              }
            ]}
          >
            <BlurView intensity={20} style={styles.statsContainer}>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <MaterialIcons name="history" size={28} color="#00D4FF" />
                  <Text style={styles.statValue}>{stats.totalNavigations}</Text>
                  <Text style={styles.statLabel}>Total Journeys</Text>
                </View>
                <View style={styles.statCard}>
                  <MaterialIcons name="trending-up" size={28} color="#4CAF50" />
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
          styles.modernContentContainer,
          { 
            opacity: fadeAnimation,
            transform: [{ translateY: slideAnimation }]
          }
        ]}
      >
        {/* Filter Buttons */}
        <View style={styles.modernFilterSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.modernFilterContainer}
            contentContainerStyle={styles.modernFilterContent}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.modernFilterButton,
                  selectedFilter === filter.id && styles.modernFilterButtonActive
                ]}
                onPress={() => setSelectedFilter(filter.id)}
              >
                <BlurView intensity={selectedFilter === filter.id ? 0 : 10} style={styles.modernFilterButtonContent}>
                  <Feather 
                    name={filter.icon as any} 
                    size={18} 
                    color={selectedFilter === filter.id ? '#FFFFFF' : '#1A237E'} 
                  />
                  <Text style={[
                    styles.modernFilterButtonText,
                    selectedFilter === filter.id && styles.modernFilterButtonTextActive
                  ]}>
                    {filter.name}
                  </Text>
                </BlurView>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* History List */}
        <ScrollView 
          style={styles.historyList}
          contentContainerStyle={styles.historyContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredHistory.length > 0 ? (
            filteredHistory.map((navItem, index) => (
              <Animated.View
                key={navItem.id}
                style={[
                  styles.historyCardWrapper,
                  {
                    opacity: fadeAnimation,
                    transform: [{
                      translateY: slideAnimation.interpolate({
                        inputRange: [0, 30],
                        outputRange: [0, 30 + (index * 10)],
                      })
                    }]
                  }
                ]}
              >
                <BlurView intensity={10} style={styles.historyCard}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                    style={styles.historyCardGradient}
                  >
                    <View style={styles.historyCardHeader}>
                      <View style={styles.destinationContainer}>
                        <View style={styles.destinationIcon}>
                          <Feather name="map-pin" size={20} color="#1A237E" />
                        </View>
                        <View style={styles.destinationInfo}>
                          <Text style={styles.destinationName}>{navItem.destination}</Text>
                          <Text style={styles.startLocation}>From {navItem.startLocation}</Text>
                          <Text style={styles.historyTime}>{navItem.date} • {navItem.time}</Text>
                        </View>
                      </View>
                      <TouchableOpacity style={styles.navigateAgainButton}>
                        <LinearGradient
                          colors={['#00D4FF', '#6FB1FC']}
                          style={styles.navigateAgainGradient}
                        >
                          <Feather name="navigation" size={16} color="#FFFFFF" />
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </LinearGradient>
                </BlurView>
              </Animated.View>
            ))
          ) : (
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
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
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
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 212, 255, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsOverview: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  statsContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryStatCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    width: '48%',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 4,
  },
  summaryStatTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  summaryStatSubtitle: {
    fontSize: 12,
    color: '#757575',
  },


  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  historyMainInfo: {
    flex: 1,
  },
  destinationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  routeInfo: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 2,
  },
  floorInfo: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  historyTime: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  dateText: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  historyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    paddingVertical: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A237E',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#757575',
  },
  repeatButton: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  repeatButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
  },

  exportButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  exportIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  exportInfo: {
    flex: 1,
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  exportSubtitle: {
    fontSize: 12,
    color: '#757575',
  },
  
  // Modern styles for redesigned components (duplicates removed)
  modernContentContainer: {
    flex: 1,
    marginTop: -10,
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 20,
  },
  modernFilterSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modernFilterContainer: {
    flexDirection: 'row',
  },
  modernFilterContent: {
    paddingHorizontal: 0,
  },
  modernFilterButton: {
    marginRight: 15,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(26, 35, 126, 0.1)',
  },
  modernFilterButtonActive: {
    borderColor: '#1A237E',
    backgroundColor: '#1A237E',
  },
  modernFilterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  modernFilterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A237E',
    marginLeft: 8,
  },
  modernFilterButtonTextActive: {
    color: '#FFFFFF',
  },
  historyList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  historyContent: {
    paddingBottom: 100,
  },
  historyCardWrapper: {
    marginBottom: 15,
  },
  historyCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.1)',
  },
  historyCardGradient: {
    padding: 20,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  destinationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  destinationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(26, 35, 126, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    fontSize: 14,
    color: '#757575',
    marginBottom: 2,
  },
  historyTime: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  navigateAgainButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  navigateAgainGradient: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
  exportSection: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(26, 35, 126, 0.1)',
  },
  exportContainer: {
    padding: 20,
  },
  exportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A237E',
    marginLeft: 10,
  },
  exportButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  exportButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});