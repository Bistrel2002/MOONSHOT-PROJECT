# LOC-INDOOR: Indoor Navigation System

A comprehensive indoor navigation system that combines beacon technology with AR navigation, featuring a React Native mobile app and Node.js backend with PostgreSQL database.

## 🏗️ Architecture

```
LOC-INDOOR/
├── backend/                 # Node.js API Server
│   ├── src/
│   │   ├── db/             # Database schema and connection
│   │   ├── routes/         # API endpoints
│   │   └── config/         # Environment configuration
├── frontend/               # React Native Mobile App
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── screens/        # App screens
│   │   ├── stores/         # State management (Zustand)
│   │   └── services/       # API services
└── LOC-INDOOR/            # Unity AR Application
    └── Script/            # Unity scripts for beacon integration
```

## 🚀 Features

### Backend API
- **User Management**: Registration, authentication, and profile management
- **Location Tracking**: Real-time user location updates via beacons
- **Navigation Sessions**: Track navigation history and active sessions
- **Beacon Management**: Monitor beacon status and signal strength
- **Analytics**: User movement patterns and location occupancy

### React Native App
- **Google Maps-like Interface**: Clean, intuitive navigation UI
- **Real-time Location**: Live location updates with beacon integration
- **Navigation History**: Timeline view of past navigation sessions
- **Floor Management**: Multi-floor building support
- **Search & Filter**: Find locations quickly
- **User Profiles**: Account management and settings

### Unity AR Integration
- **Beacon Simulation**: Test beacon signals in Unity editor
- **AR Navigation**: Augmented reality wayfinding
- **Room-to-Room Tracking**: Monitor user movement between rooms

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- React Native CLI
- PostgreSQL database (Neon recommended)
- Unity 2022.3+ (for AR features)

### Backend Setup

1. **Install Dependencies**
```bash
cd LocIndoor/backend
npm install
```

2. **Environment Configuration**
Create a `.env` file in `backend/`:
```env
PORT=3001
DATABASE_URL=your_neon_database_url
NODE_ENV=development
```

3. **Database Setup**
```bash
# The database schema will be automatically created when the server starts
npm run dev
```

### Frontend Setup

1. **Install Dependencies**
```bash
cd LocIndoor/frontend
npm install
```

2. **iOS Setup** (if developing for iOS)
```bash
cd ios && pod install && cd ..
```

3. **Start the App**
```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Unity Setup

1. **Open Unity Project**
   - Open `LOC-INDOOR/LOC-INDOOR.unity` in Unity 2022.3+

2. **Configure Beacons**
   - Add beacon UUIDs in the BeaconManager script
   - Set up room coordinates in the LocationManager

3. **Test Beacon Simulation**
   - Use the simulation interface to test room-to-room movement

## 📱 App Features

### Main Screens

1. **Map Screen** - Main navigation interface
   - Current location display
   - Floor selector
   - Location search
   - Navigation panel

2. **Navigation Screen** - Active navigation
   - Route visualization
   - Progress tracking
   - Turn-by-turn directions

3. **History Screen** - Navigation timeline
   - Past navigation sessions
   - Location history
   - Analytics data

4. **Profile Screen** - User settings
   - Account management
   - Privacy settings
   - Data export

### Key Components

- **LocationCard**: Displays location information with navigation options
- **FloorSelector**: Switch between building floors
- **NavigationPanel**: Active navigation session display
- **BeaconManager**: Handles beacon signal processing

## 🗄️ Database Schema

### Core Tables
- **users**: User accounts and profiles
- **beacons**: Beacon devices and their locations
- **locations**: Rooms, corridors, and areas
- **user_locations**: Real-time user location tracking
- **navigation_sessions**: Navigation history and active sessions
- **beacon_readings**: Beacon signal analytics

### Key Relationships
- Users have multiple location records
- Locations contain multiple beacons
- Navigation sessions track start/end locations
- Beacon readings provide signal strength data

## 🔌 API Endpoints

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/:id/locations` - Get user location history
- `POST /api/users/:id/location` - Update user location

### Locations
- `GET /api/locations` - Get all locations
- `POST /api/locations` - Create new location
- `GET /api/locations/:id` - Get location details
- `GET /api/locations/:id/occupancy` - Get current occupants
- `GET /api/locations/:id/beacons` - Get beacons in location
- `GET /api/locations/:startId/to/:endId` - Get navigation path

## 🎯 Usage Examples

### Starting Navigation
1. Open the app and navigate to the Map screen
2. Search for your destination or browse locations
3. Tap "Navigate" on the desired location
4. Follow the on-screen directions

### Viewing History
1. Go to the History tab
2. View your navigation timeline
3. See detailed session information
4. Export data if needed

### Beacon Integration
1. Ensure beacons are properly configured in Unity
2. The app will automatically detect nearby beacons
3. Location updates happen in real-time
4. Signal strength is displayed for accuracy

## 🔧 Development

### Adding New Features
1. **Backend**: Add routes in `src/routes/`
2. **Frontend**: Create components in `src/components/`
3. **Database**: Update schema in `src/db/schema.js`

### Testing
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### Deployment
1. **Backend**: Deploy to Vercel/Railway with Neon database
2. **Frontend**: Build APK/IPA for mobile deployment
3. **Unity**: Build for target platforms

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in `/Document/`
- Review the technical specifications

---

**Built with ❤️ for indoor navigation** 