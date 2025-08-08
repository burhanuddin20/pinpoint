# Pinpoint - Interactive Map App

A modern, interactive map application built with Expo React Native and TypeScript. Pinpoint provides real-time location tracking with a beautiful, modern UI.

## 🚀 Features

### Core Functionality

- **Interactive Map**: Full-screen interactive map using `react-native-maps`
- **Location Tracking**: Real-time user location with blue dot indicator
- **Permission Handling**: Automatic location permission requests with user-friendly alerts
- **Fallback Location**: Defaults to London if location is unavailable
- **Cross-Platform**: Works seamlessly on iOS and Android

### Modern UI/UX

- **Dark Theme**: Modern dark interface for better battery life and aesthetics
- **Status Indicators**: Real-time location status with color-coded badges
- **Floating Action Button**: Quick return to user's current location
- **Professional Design**: Modern shadows, typography, and spacing
- **Safe Area Support**: Proper handling of device safe areas

### Location Features

- **High Accuracy**: Uses high-accuracy location services
- **Permission Management**: Graceful handling of permission denials
- **Error Handling**: Comprehensive error handling with user feedback
- **Location Status**: Visual indicators for loading, active, denied, and error states

## 📱 Screenshots

The app features:

- Modern dark header with app title and status indicator
- Full-screen interactive map
- Floating action button for location return
- Real-time location status updates

## 🛠️ Technology Stack

- **Framework**: Expo React Native
- **Language**: TypeScript
- **Maps**: react-native-maps
- **Location**: expo-location
- **Icons**: @expo/vector-icons (Ionicons)
- **Navigation**: expo-router
- **Safe Areas**: react-native-safe-area-context

## 📋 Prerequisites

- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator or Android Emulator (optional)
- Expo Go app for testing

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd pinpoint
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npx expo start
```

### 4. Run on Device

- Install Expo Go on your mobile device
- Scan the QR code from the terminal
- Grant location permissions when prompted

## 📁 Project Structure

```
pinpoint/
├── app/
│   ├── (tabs)/
│   │   └── index.tsx          # Main map screen
│   ├── _layout.tsx            # Root layout
│   └── +not-found.tsx        # 404 page
├── components/                # Reusable components
├── constants/                 # App constants
├── hooks/                     # Custom hooks
├── assets/                    # Images and fonts
├── app.json                   # Expo configuration
└── package.json              # Dependencies
```

## 🔧 Configuration

### Location Permissions

The app is configured with proper location permissions:

**iOS** (`app.json`):

```json
"infoPlist": {
  "NSLocationWhenInUseUsageDescription": "This app needs access to location to show your current position on the map."
}
```

**Android** (`app.json`):

```json
"permissions": [
  "ACCESS_FINE_LOCATION",
  "ACCESS_COARSE_LOCATION"
]
```

### Dependencies

Key dependencies include:

- `react-native-maps@1.7.1` - Interactive maps
- `expo-location` - Location services
- `@expo/vector-icons` - Icon library
- `react-native-safe-area-context` - Safe area handling

## 🎯 Current Implementation

### Map Screen (`app/(tabs)/index.tsx`)

- **Location Permission Request**: Automatically requests foreground location permissions
- **User Location Display**: Shows user's location as a blue dot
- **Status Management**: Tracks location status (loading, granted, denied, error)
- **Modern Header**: App title with map icon and status indicator
- **Floating Action Button**: Returns to user's current location
- **Error Handling**: Graceful error handling with user alerts

### UI Components

- **Status Indicator**: Color-coded badges showing location status
- **Header**: Modern dark header with app branding
- **Map Container**: Full-screen map with proper styling
- **FAB**: Floating action button for quick location access

### State Management

- **Location State**: Tracks current user location coordinates
- **Region State**: Manages map view region and zoom level
- **Status State**: Tracks location permission and service status

## 🔄 Development Workflow

### Adding New Features

1. Create new components in the `components/` directory
2. Add new screens in the `app/` directory
3. Update navigation in `app/_layout.tsx`
4. Test on both iOS and Android

### Styling Guidelines

- Use the dark theme color palette
- Implement proper shadows and elevation
- Follow modern spacing and typography
- Ensure accessibility compliance

## 🐛 Troubleshooting

### Common Issues

**Location Permission Denied**

- The app will show London as default location
- User can grant permissions in device settings

**Map Not Loading**

- Ensure internet connection for map tiles
- Check if `react-native-maps` is properly installed

**Build Errors**

- Clear Metro cache: `npx expo start --clear`
- Reinstall dependencies: `npm install`

## 📈 Backend + Search

### Server (Google Places Proxy)
- Location: `server/`
- Env: create `server/.env` with `GOOGLE_PLACES_KEY` and `PORT`
- Run: `cd server && npm install && npm run dev`
- Endpoint: GET `/places/nearby?lat=..&lon=..&type=cafe&radius=1500&query=coffee`

### Mobile Env
- Copy `constants/env.example` to `.env`
- Set `EXPO_PUBLIC_BACKEND_URL` to your server, e.g. `http://localhost:4000`

### Usage
- Type in the search bar (e.g., "coffee near me") and press search/return
- Intent parsing:
  - contains "coffee" or "cafe" -> type=cafe
  - contains "pizza" -> type=restaurant + query=pizza
  - else -> type=restaurant
- Bottom sheet snaps: expanded fits all POIs, collapsed zooms to active
- Cards provide Directions/Call/Website actions
- [ ] Location sharing
- [ ] Geofencing capabilities

### UI Improvements

- [ ] Animated transitions
- [ ] Custom map overlays
- [ ] Enhanced status indicators
- [ ] Accessibility improvements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both iOS and Android
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support or questions, please open an issue in the repository.

---

**Built with ❤️ using Expo React Native**
