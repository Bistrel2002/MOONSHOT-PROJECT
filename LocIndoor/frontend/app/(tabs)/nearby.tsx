import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  Switch,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Line, Path } from 'react-native-svg';


export default function NearbyScreen() {
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);

  // Animation refs
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const floatingAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const floatingLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnimation, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(floatingAnimation, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    );
    floatingLoop.start();
    return () => floatingLoop.stop();
  }, []);

  // Only connected/active beacons - filtered by connection status
  const connectedBeacons = [
    { id: 'B001', strength: 95, status: 'connected', distance: '2m'},
    { id: 'B002', strength: 87, status: 'connected', distance: '8m'},
    { id: 'B003', strength: 78, status: 'connected', distance: '15m'},
    { id: 'B005', strength: 92, status: 'connected', distance: '12m'},
    { id: 'B007', strength: 71, status: 'connected', distance: '25m'},
  ];

  const getSignalColor = (strength: number) => {
    if (strength >= 80) return '#4CAF50';
    if (strength >= 60) return '#FF9800';
    return '#F44336';
  };

  const getConnectionStatusColor = (status: string) => {
    switch(status) {
      case 'connected': return '#4CAF50';
      case 'connecting': return '#FF9800';
      case 'disconnected': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const BeaconCard = ({ beacon }: { beacon: any }) => (
    <View style={styles.beaconCard}>
      <View style={styles.beaconHeader}>
        <View style={styles.beaconIconContainer}>
          <Text style={styles.beaconIcon}>📡</Text>
        </View>
        <View style={styles.beaconInfo}>
          <Text style={styles.beaconId}>{beacon.id}</Text>
          <Text style={styles.beaconDistance}>{beacon.distance} away {beacon.lastSeen}</Text>
        </View>
        <View style={styles.beaconStatusContainer}>
          <View style={[styles.statusDot, { 
            backgroundColor: getConnectionStatusColor(beacon.status)
          }]} />
          <View style={[styles.signalBar, { backgroundColor: getSignalColor(beacon.strength) }]}>
            <Text style={styles.signalText}>{beacon.strength}%</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0052D4', '#4364F7', '#6FB1FC']} style={styles.backgroundContainer}>
        <Svg width="100%" height="100%" style={styles.arGridOverlay}>
          <Line x1="10%" y1="20%" x2="90%" y2="25%" stroke="rgba(0, 212, 255, 0.2)" strokeWidth="1" strokeDasharray="5,5" />
          <Path d="M 30 40 Q 200 60 370 45" stroke="rgba(111, 177, 252, 0.2)" strokeWidth="1" fill="none" strokeDasharray="4,4" />
        </Svg>
      </LinearGradient>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, { opacity: fadeAnimation }]}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Bluetooth Beacons</Text>
            <Text style={styles.headerSubtitle}>Connected indoor positioning signals</Text>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Bluetooth Status */}
            <View style={styles.section}>
              <View style={styles.bluetoothStatusCard}>
                <View style={styles.bluetoothStatusHeader}>
                  <Text style={styles.bluetoothIcon}>🔵</Text>
                  <View style={styles.bluetoothStatusInfo}>
                    <Text style={styles.bluetoothStatusTitle}>Bluetooth Status</Text>
                    <Text style={styles.bluetoothStatusText}>
                      {bluetoothEnabled ? 'Connected & Scanning' : 'Disconnected'}
                    </Text>
                  </View>
                  <Switch
                    value={bluetoothEnabled}
                    onValueChange={setBluetoothEnabled}
                    trackColor={{ false: '#E0E0E0', true: '#B3C5EF' }}
                    thumbColor={bluetoothEnabled ? '#1A237E' : '#9E9E9E'}
                  />
                </View>
              </View>
            </View>

            {/* Connected Beacons */}
            {bluetoothEnabled && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Connected Beacons ({connectedBeacons.length})
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Active beacon signals for indoor positioning
                </Text>
                {connectedBeacons.map((beacon) => (
                  <BeaconCard key={beacon.id} beacon={beacon} />
                ))}
              </View>
            )}

            {/* Bluetooth Disabled Message */}
            {!bluetoothEnabled && (
              <View style={styles.section}>
                <View style={styles.disabledMessageCard}>
                  <Text style={styles.disabledIcon}>📴</Text>
                  <Text style={styles.disabledTitle}>Bluetooth Disabled</Text>
                  <Text style={styles.disabledMessage}>
                    Enable Bluetooth to detect nearby beacons for accurate indoor positioning.
                  </Text>
                </View>
              </View>
            )}
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
  scrollContent: {
    flex: 1,
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
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 212, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 15,
  },
  bluetoothStatusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  bluetoothStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bluetoothIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  bluetoothStatusInfo: {
    flex: 1,
  },
  bluetoothStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  bluetoothStatusText: {
    fontSize: 14,
    color: '#757575',
  },
  disabledMessageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  disabledIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  disabledTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  disabledMessage: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 20,
  },
  signalContainer: {
    alignItems: 'center',
  },
  signalBar: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  signalText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  beaconCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  beaconHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  beaconIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  beaconIcon: {
    fontSize: 20,
  },
  beaconInfo: {
    flex: 1,
  },
  beaconId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  beaconName: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 2,
  },
  beaconDistance: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  beaconStatusContainer: {
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 8,
  },
});