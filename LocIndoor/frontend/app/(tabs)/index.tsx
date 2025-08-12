import React, { useState, useRef, useEffect } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert,
  Animated
} from "react-native";
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Svg, { Line, Path, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchFocused, setSearchFocused] = useState(false);

  // Animation refs
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(30)).current;
  const floatingAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  
  // Search input ref
  const searchInputRef = useRef<TextInput>(null);

  // Nearby locations data (moved from nearby page)
  const nearbyLocations = [
    { 
      id: 1, 
      name: 'Main Reception', 
      type: 'service', 
    },
    { 
      id: 2, 
      name: 'Coffee Shop', 
      type: 'food', 
    },
    { 
      id: 3, 
      name: 'Meeting Room B', 
      type: 'meeting', 
    },
    { 
      id: 4, 
      name: 'Restroom', 
      type: 'facility', 
    },
    { 
      id: 5, 
      name: 'Library', 
      type: 'study', 
    },
  ];

  const categories = [
    { id: 'all', name: 'All', icon: '📍' },
    { id: 'food', name: 'Food', icon: '🍽️' },
    { id: 'meeting', name: 'Rooms', icon: '👥' },
    { id: 'facility', name: 'Facilities', icon: '🚻' },
    { id: 'service', name: 'Services', icon: '🏢' },
    { id: 'study', name: 'Study', icon: '📚' },
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

    // Pulse animation loop
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
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

  // Filter locations based on selected category and search query
  const filteredLocations = nearbyLocations.filter(location => {
    const matchesCategory = selectedCategory === 'all' || location.type === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const getSignalColor = (strength: number) => {
    if (strength >= 80) return '#4CAF50';
    if (strength >= 60) return '#FF9800';
    return '#F44336';
  };

  const LocationCard = ({ location }: { location: any }) => (
    <BlurView intensity={15} style={styles.locationCard}>
      <LinearGradient
        colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.05)']}
        style={styles.locationCardGradient}
      >
        <View style={styles.locationInfo}>
          <View style={[styles.locationIcon, { backgroundColor: getIconColor(location.type) }]}>
            <Text style={styles.locationIconText}>{getIconSymbol(location.type)}</Text>
          </View>
          <View style={styles.locationDetails}>
            <Text style={styles.locationName}>{location.name}</Text> 
          </View>
        </View>
        <TouchableOpacity 
          style={styles.navigateButton}
          onPress={() => router.push({
            pathname: '/ar-navigation',
            params: { destination: JSON.stringify(location) }
          })}
        >
          <LinearGradient
            colors={['#00D4FF', '#6FB1FC']}
            style={styles.navigateButtonGradient}
          >
            <Feather name="navigation" size={14} color="#FFFFFF" />
            <Text style={styles.navigateButtonText}>Navigate</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </BlurView>
  );

  const getIconColor = (type: string) => {
    switch(type) {
      case 'service': return '#00D4FF';
      case 'meeting': return '#6FB1FC';
      case 'food': return '#00FFFF';
      case 'facility': return '#4364F7';
      case 'study': return '#9C27B0';
      default: return '#0052D4';
    }
  };

  const getIconSymbol = (type: string) => {
    switch(type) {
      case 'service': return '🏢';
      case 'meeting': return '👥';
      case 'food': return '🍽️';
      case 'facility': return '🚻';
      case 'study': return '📚';
      default: return '📍';
    }
  };

  const handleARNavigation = () => {
    router.push({
      pathname: '/ar-navigation',
      params: { 
        destination: JSON.stringify({ 
          name: 'AR Mode',
          type: 'navigation'
        })
      }
    });
  };

  const handleViewHistory = () => {
    router.push('/history');
  };

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
            y1="20%"
            x2="90%"
            y2="25%"
            stroke="rgba(0, 212, 255, 0.2)"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
          <Line
            x1="15%"
            y1="60%"
            x2="85%"
            y2="65%"
            stroke="rgba(111, 177, 252, 0.15)"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
          <Path
            d="M 50 30 Q 200 50 350 35"
            stroke="rgba(0, 212, 255, 0.2)"
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
            <Text style={styles.headerTitle}>LocIndoor</Text>
            <Text style={styles.headerSubtitle}>Smart Indoor Navigation</Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TouchableOpacity 
              style={[styles.searchInputContainer, searchFocused && styles.searchInputFocused]}
              onPress={() => {
                console.log('Search container pressed');
                searchInputRef.current?.focus();
              }}
              activeOpacity={1}
            >
              <MaterialIcons name="search" size={20} color={searchFocused ? "#00D4FF" : "#666"} />
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder="Search for locations, rooms..."
                placeholderTextColor="rgba(102, 102, 102, 0.7)"
                value={searchQuery}
                onChangeText={(text) => {
                  console.log('Search input changed:', text);
                  setSearchQuery(text);
                }}
                onFocus={() => {
                  console.log('Search input focused');
                  setSearchFocused(true);
                }}
                onBlur={() => {
                  console.log('Search input blurred');
                  setSearchFocused(false);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                keyboardType="default"
                editable={true}
                selectTextOnFocus={true}
                multiline={false}
                numberOfLines={1}
                blurOnSubmit={true}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <MaterialIcons name="clear" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>

          {/* Category Filter */}
          <View style={styles.categoryContainer}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelector}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.id && styles.categoryButtonActive
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category.id && styles.categoryTextActive
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Map Preview */}
          <BlurView intensity={25} style={styles.mapContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
              style={styles.mapPlaceholder}
            >
              <Animated.View style={[styles.mapContent, { transform: [{ scale: pulseAnimation }] }]}>
                <Feather name="map" size={32} color="#00D4FF" />
                <Text style={styles.mapText}>Interactive Map</Text>
                <Text style={styles.mapSubtext}>Indoor Navigation</Text>
                <TouchableOpacity style={styles.arButton} onPress={handleARNavigation}>
                  <LinearGradient
                    colors={['#00D4FF', '#6FB1FC']}
                    style={styles.arButtonGradient}
                  >
                    <Feather name="eye" size={18} color="#FFFFFF" style={styles.arButtonIcon} />
                    <Text style={styles.arButtonText}>AR Navigation</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </LinearGradient>
          </BlurView>

          {/* Nearby Locations */}
          <View style={styles.nearbyLocationsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Nearby Locations ({filteredLocations.length})
              </Text>  
            </View>
            <ScrollView 
              style={styles.locationsList} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.locationsListContent}
            >
              {filteredLocations.length > 0 ? (
                filteredLocations.map((location) => (
                  <LocationCard key={location.id} location={location} />
                ))
              ) : (
                <BlurView intensity={15} style={styles.noResultsContainer}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.05)']}
                    style={styles.noResultsContent}
                  >
                    <Text style={styles.noResultsIcon}>🔍</Text>
                    <Text style={styles.noResultsTitle}>No locations found</Text>
                    <Text style={styles.noResultsMessage}>
                      {searchQuery 
                        ? `No results for "${searchQuery}"`
                        : 'No locations match the selected category'
                      }
                    </Text>
                    {searchQuery && (
                      <TouchableOpacity 
                        style={styles.clearSearchButton}
                        onPress={() => setSearchQuery('')}
                      >
                        <Text style={styles.clearSearchText}>Clear search</Text>
                      </TouchableOpacity>
                    )}
                  </LinearGradient>
                </BlurView>
              )}
            </ScrollView>
          </View>
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
    top: '20%',
    right: '15%',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  arElement2: {
    position: 'absolute',
    bottom: '30%',
    left: '10%',
    width: 40,
    height: 40,
    borderRadius: 20,
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
    paddingVertical: 40,
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
  searchContainer: {
    marginVertical: 4,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    minHeight: 50,
  },
  searchInputFocused: {
    borderWidth: 2,
    borderColor: '#00D4FF',
    shadowColor: 'rgba(0, 212, 255, 0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
    backgroundColor: 'transparent',
    borderWidth: 0,
    minHeight: 30,
  },
  categoryContainer: {
    marginBottom: 15,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllText: {
    fontSize: 14,
    color: '#00D4FF',
    fontWeight: '600',
  },
  categorySelector: {
    flexDirection: 'row',
  },
  categoryButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  categoryButtonActive: {
    backgroundColor: '#00D4FF',
    borderColor: '#00D4FF',
    shadowColor: 'rgba(0, 212, 255, 0.5)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  categoryIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  mapContainer: {
    marginVertical: 15,
    height: height * 0.18,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  mapPlaceholder: {
    flex: 1,
    borderRadius: 20,
  },
  mapContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 8,
    textShadowColor: 'rgba(0, 212, 255, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  mapSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  arButton: {
    marginTop: 15,
    borderRadius: 25,
    overflow: 'hidden',
  },
  arButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  arButtonIcon: {
    marginRight: 8,
  },
  arButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nearbyLocationsContainer: {
    flex: 1,
    minHeight: height * 0.4,
  },
  locationsList: {
    flex: 1,
    minHeight: height * 0.35,
  },
  locationsListContent: {
    paddingBottom: 90, // Space to clear the tab bar (60px height + 30px safety margin)
    flexGrow: 1,
  },
  locationCard: {
    marginBottom: 15,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  locationCardGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  locationIconText: {
    fontSize: 20,
  },
  locationDetails: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  locationDistance: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  locationFloor: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 1,
  },
  signalContainer: {
    alignItems: 'center',
    marginLeft: 10,
  },
  signalBar: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  signalText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  navigateButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  navigateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  navigateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  noResultsContainer: {
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  noResultsContent: {
    padding: 30,
    alignItems: 'center',
  },
  noResultsIcon: {
    fontSize: 32,
    marginBottom: 15,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultsMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 15,
  },
  clearSearchButton: {
    backgroundColor: '#00D4FF',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  clearSearchText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});