# LocIndoor - Unity + React Native AR Navigation

A hybrid AR navigation app that combines Unity's powerful AR capabilities with React Native's cross-platform UI.

## 🏗️ Architecture

- **Frontend**: React Native with Expo
- **AR Engine**: Unity with AR Foundation
- **Communication**: Custom bridge using react-native-unity
- **Navigation**: AI Navigation system with pathfinding

## 🚀 Setup Instructions

### Prerequisites

1. **Unity 2022.3 LTS or later**
2. **React Native development environment**
3. **Android Studio** (for Android builds)
4. **Xcode** (for iOS builds)

### Unity Setup

1. **Open the Unity project** in `LocIndoor/LOC-INDOOR/`
2. **Import required packages**:
   - AR Foundation
   - XR Interaction Toolkit
   - AI Navigation
3. **Set up the scene**:
   - Ensure `UnityBridge` GameObject exists in your scene
   - Assign `DestinationManager` to the UnityBridge component
   - Set up your AR scene with destinations

### React Native Setup

1. **Install dependencies**:
   ```bash
   cd LocIndoor/frontend
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```

3. **Run on device/simulator**:
   ```bash
   npm run android  # or npm run ios
   ```

## 🔗 Unity-React Native Communication

### Message Flow

```
React Native → UnityBridge → DestinationManager → ArrowPathRenderer
     ↑              ↓
UnityService ← UnityToReactNativeService ← UnityBridge
```

### Message Format

**Navigation Request**:
```json
{
  "action": "navigate",
  "category": "Facilities",
  "index": 1
}
```

**Get Destinations Request**:
```json
{
  "action": "getdestinations"
}
```

**Unity Response**:
```json
{
  "type": "destinations_list",
  "data": "{\"categories\":[...]}"
}
```

### Key Components

#### Unity Side
- **UnityBridge.cs**: Main bridge script that receives React Native messages
- **DestinationManager.cs**: Manages navigation destinations and categories
- **UnityToReactNativeService.cs**: Sends messages back to React Native

#### React Native Side
- **UnityService.ts**: Service for communicating with Unity
- **UnityTestView.tsx**: Hidden component that establishes Unity connection
- **UnityARView.tsx**: Full-screen Unity view for AR navigation

## 🧪 Testing

### Unity Testing

1. **In Unity Editor**:
   - Right-click on UnityBridge GameObject
   - Use context menu items to test communication
   - Check Console for debug messages

2. **Test Navigation**:
   - Use "Test Navigation to Facilities[0]" context menu
   - Verify path is drawn in scene

### React Native Testing

1. **Test Unity Connection**:
   - Press the WiFi icon button in the main screen
   - Check console for connection status

2. **Test Navigation**:
   - Press "Navigate" button on any location card
   - Verify Unity receives the message

## 🐛 Troubleshooting

### Common Issues

1. **Unity not responding**:
   - Check UnityBridge GameObject exists in scene
   - Verify DestinationManager is assigned
   - Check Unity Console for errors

2. **React Native can't connect**:
   - Ensure Unity is running
   - Check UnityTestView component is mounted
   - Verify react-native-unity package is installed

3. **Messages not received**:
   - Check GameObject names match (UnityBridge)
   - Verify method names match (ReceiveMessageFromReactNative)
   - Check JSON message format

### Debug Steps

1. **Unity Console**: Look for UnityBridge debug messages
2. **React Native Console**: Check UnityService logs
3. **Network**: Verify Unity and React Native are on same device/network

## 📱 Features

- **Category-based navigation**: Organize destinations by type
- **Real-time AR pathfinding**: Dynamic navigation paths
- **Cross-platform**: Works on Android and iOS
- **Responsive UI**: Modern React Native interface
- **Unity AR**: High-performance AR rendering

## 🔧 Customization

### Adding New Destinations

1. **In Unity**:
   - Add new Transform objects to DestinationManager categories
   - Position them in your AR scene

2. **In React Native**:
   - Destinations automatically load from Unity
   - No code changes needed

### Modifying Categories

1. **Edit DestinationManager.cs** in Unity
2. **Update category names** and destinations
3. **Rebuild Unity project**

## 📄 License

This project is part of the LocIndoor AR navigation system.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review Unity and React Native console logs
3. Create an issue with detailed error information 