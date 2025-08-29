import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import UnityARView from '../components/UnityARView';

const { width, height } = Dimensions.get('window');

export default function ARNavigationScreen() {
  const { destination } = useLocalSearchParams();
  const destinationData = destination ? JSON.parse(destination as string) : null;

  useEffect(() => {
    // No animations needed - clean AR view only
  }, []);

  // No navigation handlers needed - clean AR view only

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Simple Header */}
      <LinearGradient
        colors={['#0052D4', '#4364F7', '#6FB1FC']}
        style={styles.simpleHeader}
      >
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
              <Feather name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>AR View</Text>
              <Text style={styles.headerSubtitle}>
                {destinationData?.name || 'Floorline Scene'}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
      
      {/* Unity AR View */}
      <View style={styles.arCameraContainer}>
        <UnityARView
          destination={destinationData}
        />
      </View>

      {/* Navigation panel removed - clean AR view only */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  simpleHeader: {
    paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  headerBackButton: {
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  arCameraContainer: {
    flex: 1,
    position: 'relative',
  },
});