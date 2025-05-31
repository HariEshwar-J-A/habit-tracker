# Habit Tracker PWA

A beautiful, feature-rich Progressive Web Application for tracking and building daily habits. Built with React, TypeScript, and Material UI, featuring offline support for cached assets, dark mode, and real-time data synchronization with Supabase.

![Habit Tracker Screenshot](https://images.pexels.com/photos/5386754/pexels-photo-5386754.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)

## Table of Contents

- [Features](#features)
  - [Authentication](#authentication)
  - [Progressive Web App](#progressive-web-app)
  - [Habit Tracking](#habit-tracking)
  - [Customization](#customization)
  - [Statistics & Analytics](#statistics--analytics)
  - [Data Management](#data-management)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Application Architecture](#application-architecture)
- [User Flows](#user-flows)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Security Features](#security-features)
- [Data Synchronization](#data-synchronization)
- [Future Scope](#future-scope)
- [Contributing](#contributing)

## Features

### 🔐 Authentication
- Email/password authentication with Supabase
  - Secure password hashing and storage
  - Email verification flow
  - Password reset functionality
- OAuth support for Google and GitHub
  - Seamless social login integration
  - Profile data synchronization
- Secure session management
  - JWT-based authentication
  - Automatic token refresh
  - Secure token storage
- Protected routes and data access
  - Route-based authentication checks
  - Data access control with Row Level Security
  - User-specific data isolation

### 📱 Progressive Web App
- Installable on desktop and mobile devices
  - Custom install prompts
  - App icon and splash screen
  - Native-like experience
- Works offline with cached assets
  - Theme and settings persistence
  - Cached assets and resources
  - Automatic sync with Supabase when online
- Automatic updates when new versions are available
  - Service worker update flow
  - Update notification system
- Push notification support for reminders
  - Custom notification scheduling
  - Action-based notifications
- Responsive design for all screen sizes
  - Mobile-first approach
  - Adaptive layouts
  - Touch-friendly interactions

### 📊 Habit Tracking
- Create, edit, and delete habits
  - Rich habit configuration
  - Custom colors and descriptions
  - Flexible frequency options
- Daily, weekly, and monthly tracking options
  - Multiple tracking frequencies
  - Custom target setting
  - Progress monitoring
- Customizable habit colors and descriptions
  - Visual organization
  - Personal categorization
  - Quick identification
- Streak tracking and statistics
  - Current streak monitoring
  - Longest streak records
  - Completion rates
- Visual progress with heatmap calendar
  - Activity visualization
  - Historical data view
  - Pattern recognition
- Reminder notifications
  - Custom reminder times
  - Frequency-based alerts
  - Smart notification system

### 🎨 Customization
- Light and dark mode support
  - System preference detection
  - Manual mode selection
  - Persistent preference storage
- 10 beautiful theme colors
  - Material Design palette
  - Consistent styling
  - Accessible color combinations
- Persistent theme settings
  - Local storage
  - User preference sync
  - Cross-device consistency
- Customizable habit colors
  - Visual organization
  - Personal preference
  - Quick identification
- Modern, clean interface
  - Material Design components
  - Smooth animations
  - Intuitive layout

### 📈 Statistics & Analytics
- Current and longest streaks
  - Real-time streak tracking
  - Historical streak data
  - Achievement recognition
- Completion rates
  - Daily/weekly/monthly stats
  - Success percentage
  - Progress tracking
- Visual heatmap of activity
  - Calendar view
  - Activity intensity
  - Pattern visualization
- Detailed habit statistics
  - Individual habit metrics
  - Comparative analysis
  - Success tracking
- Progress tracking
  - Goal achievement
  - Trend analysis
  - Performance metrics

### 💾 Data Management
- Real-time sync with Supabase
  - Automatic synchronization
  - Conflict resolution
  - Data consistency
- Data export and import functionality
  - JSON data export
  - Backup creation
  - Data portability
- Automatic backup and recovery
  - Regular backups
  - Data restoration
  - Error recovery

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
  - Modern React features (hooks, context)
  - Type-safe development
  - Component-based architecture

- **Styling**: 
  - Material UI v5
    - Comprehensive component library
    - Theme customization
    - Responsive design
  - Tailwind CSS
    - Utility-first CSS
    - Rapid styling
    - Custom design system

- **State Management**: 
  - Zustand
    - Simple state management
    - Minimal boilerplate
    - DevTools integration
  - React Query
    - Server state management
    - Caching
    - Background updates

- **Database**: 
  - Supabase (Cloud)
    - PostgreSQL database
    - Real-time subscriptions
    - Row Level Security
  - IndexedDB
    - Theme and settings storage
    - Data export/import functionality

- **Authentication**: 
  - Supabase Auth
    - JWT-based auth
    - Social providers
    - Email verification

- **PWA**: 
  - Vite PWA Plugin
    - Service worker
    - Offline support
    - App manifest

- **Icons**: 
  - Lucide React
    - Modern icon set
    - Tree-shakeable
    - Customizable

- **Animations**: 
  - Framer Motion
    - Smooth animations
    - Gesture support
    - Layout animations

- **Form Handling**: 
  - Native React forms
    - Controlled components
    - Form validation
    - Error handling

- **Testing**: 
  - Vitest
    - Fast test runner
    - React Testing Library
    - Component testing

## Database Schema

### Habits Table
```sql
CREATE TABLE habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  description text,
  frequency text NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'custom')),
  color text NOT NULL,
  reminder_enabled boolean DEFAULT false,
  reminder_time time,
  target integer DEFAULT 1,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Habit Completions Table
```sql
CREATE TABLE habit_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid REFERENCES habits ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(habit_id, date)
);
```

### Row Level Security Policies

#### Habits Table
- Users can only view their own habits
- Users can only create habits for themselves
- Users can only update their own habits
- Users can only delete their own habits

#### Habit Completions Table
- Users can only view completions for their habits
- Users can only create completions for their habits
- Users can only delete completions for their habits

## Application Architecture

### Frontend Architecture
```
src/
├── components/         # Reusable UI components
│   ├── habits/        # Habit-related components
│   ├── layout/        # Layout components
│   └── settings/      # Settings components
├── pages/             # Page components
├── stores/            # Zustand state management
├── lib/               # Utilities and configurations
├── types/             # TypeScript type definitions
├── theme/             # Theme configuration
└── utils/             # Helper functions
```

### State Management
- **Auth Store**: Manages authentication state and user data
- **Theme Store**: Handles theme preferences and customization
- **Habit Store**: Manages habit data and operations

### Data Flow
1. User actions trigger store methods
2. Store updates local state
3. Changes are persisted to IndexedDB
4. Data is synchronized with Supabase
5. UI updates reflect the changes

## User Flows

### Authentication Flow
1. User arrives at `/auth`
2. Chooses login/signup method
3. Enters credentials or uses OAuth
4. Email verification if required
5. Redirected to dashboard

### Habit Management Flow
1. User creates/edits habit
2. Data saved locally
3. Synced with Supabase
4. UI updates immediately
5. Notifications scheduled if enabled

### Statistics Flow
1. User views statistics
2. Data fetched from local store
3. Calculations performed
4. Visual representations rendered
5. Real-time updates as needed

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/habit-tracker.git
cd habit-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

## 🏗️ Project Structure

```
src/
├── components/         # Reusable UI components
├── pages/             # Page components
├── stores/            # Zustand state management
├── lib/               # Utilities and configurations
├── types/             # TypeScript type definitions
├── theme/             # Theme configuration
└── utils/             # Helper functions
```

## 🔒 Security Features

- Row Level Security (RLS) with Supabase
  - User-specific data access
  - Secure API endpoints
  - Data isolation
- Secure authentication flow
  - JWT tokens
  - Refresh token rotation
  - Secure session storage
- Protected API endpoints
  - Authentication checks
  - Rate limiting
  - Error handling
- Encrypted local storage
  - Sensitive data protection
  - Secure preferences
  - Token management
- Session management
  - Automatic token refresh
  - Session timeout
  - Secure logout
- CORS protection
  - API security
  - Resource protection
  - Origin validation

## 🎯 Future Scope

### Planned Features
- Enhanced offline capabilities with full offline-first architecture
- Local-first data storage with background synchronization
- Conflict resolution for offline changes
- Social features and habit sharing
- Advanced analytics and insights
- Custom habit categories
- Habit templates and presets
- Goal setting and tracking
- Achievement system
- Mobile apps (React Native)
- API integrations

### Technical Improvements
- Enhanced offline capabilities
- Performance optimizations
- Advanced data caching and synchronization
- Real-time collaboration
- Machine learning insights
- Automated testing
- CI/CD pipeline

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Create a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Follow the existing code style
- Use conventional commits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for backend services
- [Material UI](https://mui.com) for UI components
- [Vite](https://vitejs.dev) for build tooling
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Lucide](https://lucide.dev) for icons