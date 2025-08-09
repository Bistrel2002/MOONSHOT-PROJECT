# LocIndoor Backend API Documentation

## 🚀 **Server Information**

- **Base URL**: `http://localhost:3001`
- **API Base**: `http://localhost:3001/api`
- **Database**: PostgreSQL (Neon)
- **Authentication**: Bearer Token (optional)

## 📊 **Health Check**

### GET `/api/health`
Check if the server is running.

**Response:**
```json
{
  "success": true,
  "message": "Server is healthy"
}
```

## 👥 **Users API**

### GET `/api/users`
Get all users.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "url",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST `/api/users`
Create a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "url" // optional
}
```

### GET `/api/users/:id`
Get user by ID.

### GET `/api/users/:id/locations`
Get user location history.

**Query Parameters:**
- `limit` (default: 50) - Number of records to return
- `days` (default: 7) - Number of days to look back

### GET `/api/users/:id/sessions`
Get user navigation sessions.

**Query Parameters:**
- `status` - Filter by session status (active, completed, cancelled)

### POST `/api/users/:id/location`
Update user location.

**Request Body:**
```json
{
  "locationId": 1,
  "beaconId": 1,
  "signalStrength": -65,
  "accuracy": 2,
  "coordinates": {"x": 10, "y": 20, "z": 0}
}
```

## 📍 **Locations API**

### GET `/api/locations`
Get all locations.

**Query Parameters:**
- `floor` - Filter by floor number
- `type` - Filter by location type (room, corridor, entrance, etc.)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Room 101",
      "description": "Conference room",
      "floor": 1,
      "coordinates": {"x": 10, "y": 20, "width": 30, "height": 40},
      "type": "room",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST `/api/locations`
Create a new location.

**Request Body:**
```json
{
  "name": "Room 101",
  "description": "Conference room",
  "floor": 1,
  "coordinates": {"x": 10, "y": 20, "width": 30, "height": 40},
  "type": "room"
}
```

### GET `/api/locations/:id`
Get location by ID.

### GET `/api/locations/:id/occupancy`
Get current occupants in a location.

**Query Parameters:**
- `minutes` (default: 5) - Time window in minutes

### GET `/api/locations/:id/beacons`
Get beacons in a location.

### GET `/api/locations/:startId/to/:endId`
Get navigation path between two locations.

## 📡 **Beacons API**

### GET `/api/beacons`
Get all beacons.

**Query Parameters:**
- `floor` - Filter by floor number
- `isActive` - Filter by active status (true/false)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "uuid": "B9407F30-F5F8-466E-AFF9-25556B57FE6D",
      "major": 100,
      "minor": 1,
      "name": "Room 101 Beacon",
      "location": {"x": 10, "y": 20, "z": 0, "floor": 1},
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST `/api/beacons`
Create a new beacon.

**Request Body:**
```json
{
  "uuid": "B9407F30-F5F8-466E-AFF9-25556B57FE6D",
  "major": 100,
  "minor": 1,
  "name": "Room 101 Beacon",
  "location": {"x": 10, "y": 20, "z": 0, "floor": 1},
  "isActive": true
}
```

### GET `/api/beacons/:id`
Get beacon by ID.

### PUT `/api/beacons/:id`
Update beacon.

### GET `/api/beacons/:id/readings`
Get beacon readings for analytics.

**Query Parameters:**
- `limit` (default: 100) - Number of readings to return
- `hours` (default: 24) - Time window in hours

### POST `/api/beacons/:id/readings`
Record a beacon reading.

**Request Body:**
```json
{
  "userId": "user-uuid",
  "rssi": -65,
  "distance": 3
}
```

## 🔧 **Environment Variables**

Create a `.env` file in the backend directory:

```env
PORT=3001
NODE_ENV=development
DATABASE_URL=your_neon_database_url
```

## 🚀 **Starting the Server**

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start

# Test database connection
npm run test
```

## 📊 **Database Schema**

### Tables:
- **users** - User accounts and profiles
- **beacons** - Beacon devices and locations  
- **locations** - Rooms, corridors, and areas
- **user_locations** - Real-time user location tracking
- **navigation_sessions** - Navigation history
- **beacon_readings** - Raw beacon signal data

## 🔍 **Error Handling**

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## 🎯 **Integration with Unity**

The API is designed to work with your Unity beacon simulation:

1. **Beacon Setup**: Create beacons via `/api/beacons`
2. **Location Tracking**: Send location updates via `/api/users/:id/location`
3. **Signal Data**: Record beacon readings via `/api/beacons/:id/readings`
4. **Analytics**: Query user movement patterns and beacon performance

Your Unity simulation can now POST beacon readings and location updates to this API! 🚀