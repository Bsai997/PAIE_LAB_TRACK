# Student Engagement Frontend

React + Vite frontend for the Student Engagement Platform.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

- `src/assets/` - Images and static files
- `src/components/` - Reusable UI components
- `src/context/` - React context for state management
- `src/hooks/` - Custom React hooks
- `src/pages/` - Page components for each role
- `src/routes/` - Route protection logic
- `src/services/` - API integration
- `src/styles/` - CSS stylesheets
- `src/App.jsx` - Main app component
- `src/main.jsx` - Entry point

## Features

- Role-based routing (Student, Admin, Super Admin)
- Responsive dashboard layouts
- Real-time data fetching with Axios
- Chart.js integration for analytics
- JWT authentication
- Clean, modular component structure

## Key Components

- **Navbar** - Navigation with user profile
- **DashboardCard** - Main dashboard card component
- **StatCard** - Statistics display card
- **TaskCard** - Task display with actions
- **BarGraph** - Chart.js bar graph wrapper
- **LeaderboardTable** - Dynamic leaderboard display
- **ProtectedRoute** - Route protection based on role

## API Integration

All API calls go through `src/services/api.js` with automatic token attachment to requests.

## Styling

- Global styles in `global.css`
- Navbar styles in `navbar.css`
- Dashboard and component styles in `dashboard.css`
- Responsive design for mobile, tablet, and desktop

## Authentication Flow

1. Login with RegdID and password
2. Backend validates and returns JWT token
3. Token stored in localStorage
4. User redirected to role-specific dashboard
5. All subsequent requests include token in Authorization header
