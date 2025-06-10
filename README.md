# LOC-INDOOR: Indoor Navigation System

## Overview

## Features
- 🎯 Real-time beacon detection using Minew BeaconSET Plus
- 📱 AR-based navigation interface
- 📊 RSSI-based distance calculation
- 🔋 Battery level monitoring for beacons
- 📍 MAC address tracking for unique beacon identification
- 🔄 Automatic beacon scanning and updates
- 📱 Cross-platform support (Android)

## Prerequisites
- Unity 2022.3 LTS or later
- Android Studio (for Android development)
- Minew BeaconSET Plus beacons
- Android device with:
  - Bluetooth LE support
  - ARCore compatibility
  - Android 7.0 (API level 24) or higher

## Project Structure
```
LOC-INDOOR/
├── Assets/
│   ├── Plugins/
│   │   └── Android/
│   │       ├── MTBeaconPlus.aar       # Minew SDK library
│   │       └── AndroidManifest.xml    # Android configuration
│   ├── Script/
│   │   ├── MinewBeaconManager.cs         # Main beacon detection logic
│   │   ├── BeaconDiagnosis.cs            # Beacon debugging interface
│   │   ├── AndroidPermission.cs          # Camera, Bluetooth, and location 
│   │   ├── BeaconLocalizer.cs            # Estimates player position from multiple beacons 
│   │   ├── VirtualBeacon.cs              # Simulates a single BLE beacon device
│   │   ├── DestinationNav.cs             # Handles room selection and navigation
permission
│   │   └── BeaconTestController.cs       # UI management
│   └── Scenes/
│       └── algosup.unity          

```

## Setup Instructions

### 1. Unity Setup
1. Open the project in Unity 2022.3 LTS or later
2. Go to **Edit > Project Settings > Player > Android Settings**
3. Set the following:
   - Target API Level: 33 or 34
   - Minimum API Level: 24
   - Package Name: `com.LocIndoor.LOCINDOOR`

### 2. Beacon Configuration
1. Power on your Minew BeaconSET Plus beacons
2. Place beacons strategically in your indoor space
3. Note down the MAC addresses for configuration

### 3. Building the Project
1. Open **File > Build Settings**
2. Select Android platform
3. Click "Build" or "Build and Run"

## Usage

### Starting the App
1. Launch the app on your Android device
2. Grant required permissions:
   - Location
   - Bluetooth
   - Camera (for AR)


### Navigation
1. The app will automatically detect nearby beacons

## Troubleshooting

### Common Issues
1. **No Beacons Detected**
   - Ensure beacons are powered on
   - Check Bluetooth is enabled
   - Verify location permissions are granted

2. **Build Errors**
   - Verify API levels in Unity Player Settings
   - Ensure all required plugins are present

3. **AR Not Working**
   - Verify ARCore is installed on device
   - Check camera permissions
   - Ensure good lighting conditions

## Contributing
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License
This project is proprietary and confidential. All rights reserved.


## Acknowledgments
- Minew Technology for the BeaconSET Plus SDK
- Unity Technologies for the AR Foundation
- Google for ARCore support

## Virtual Simulation Environment

For testing and development purposes, this project includes a Unity-based virtual simulation environment that mimics real beacon behavior without requiring physical hardware.

### Running the Simulation

#### Prerequisites for Simulation
- Unity 2022.3 LTS or later
- NavMesh Components (Window → Package Manager → AI Navigation)
- TextMeshPro for UI elements

#### Simulation Setup
1. **Open the Unity project** in Unity Editor
2. **Load the simulation scene**: `Assets/Scenes/locindoor.unity`
3. **Verify virtual beacons are placed** in the scene (look for GameObjects with VirtualBeacon components).

#### Running the Simulation
1. **Press Play** in Unity Editor
2. **Observe the beacon network visualization**:
   - 🔵 Cyan spheres = Virtual beacon positions
   - 🔴 Red wireframe = Actual agent position  
   - 🟢 Green lines = Triangulation signals
3. **Use the dropdown menu** to select destination rooms
4. **Watch the agent navigate** using simulated beacon positioning

This simulation environment allows you to test indoor navigation concepts without requiring physical beacon hardware.

