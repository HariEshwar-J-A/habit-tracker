# Habit Tracker PWA

A beautiful, feature-rich Progressive Web Application for tracking and building daily habits. Built with React, TypeScript, and Material UI, featuring offline support, dark mode, and real-time synchronization.

![Habit Tracker Screenshot](https://images.pexels.com/photos/5386754/pexels-photo-5386754.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)

## ✨ Features

### 🔐 Authentication
- Email/password authentication with Supabase
- OAuth support for Google and GitHub
- Secure session management
- Protected routes and data access

### 📱 Progressive Web App
- Installable on desktop and mobile devices
- Works offline with full functionality
- Automatic updates when new versions are available
- Push notification support for reminders
- Responsive design for all screen sizes

### 📊 Habit Tracking
- Create, edit, and delete habits
- Daily, weekly, and monthly tracking options
- Customizable habit colors and descriptions
- Streak tracking and statistics
- Visual progress with heatmap calendar
- Reminder notifications

### 🎨 Customization
- Light and dark mode support
- 10 beautiful theme colors
- Persistent theme settings
- Customizable habit colors
- Modern, clean interface

### 📈 Statistics & Analytics
- Current and longest streaks
- Completion rates
- Visual heatmap of activity
- Detailed habit statistics
- Progress tracking

### 💾 Data Management
- Local data storage with IndexedDB
- Real-time sync with Supabase
- Data export and import functionality
- Automatic backup and recovery
- Offline support

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

## 🏗️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Styling**: Material UI + Tailwind CSS
- **State Management**: Zustand
- **Database**: 
  - Supabase (Cloud)
  - IndexedDB (Local)
- **Authentication**: Supabase Auth
- **PWA**: Vite PWA Plugin
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Form Handling**: Native React forms
- **Testing**: Vitest + React Testing Library

## 📁 Project Structure

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
- Secure authentication flow
- Protected API endpoints
- Encrypted local storage
- Session management
- CORS protection

## 🔄 Data Synchronization

The app implements a robust data synchronization strategy:

1. **Local-First**: All data is stored locally first
2. **Background Sync**: Changes are synchronized when online
3. **Conflict Resolution**: Latest-write-wins strategy
4. **Offline Support**: Full functionality without internet
5. **Data Export**: Backup and transfer capabilities

## 🎯 Future Scope

### Planned Features
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
- Advanced caching strategies
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