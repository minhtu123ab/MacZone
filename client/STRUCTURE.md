# Frontend Structure Documentation

## 📁 Project Structure

```
client/src/
├── assets/                      # Static assets (images, fonts, etc.)
├── components/                  # Reusable components
│   ├── common/                 # Common UI components
│   │   ├── FeatureCard/       # Feature card component
│   │   └── ProductCard/       # Product card component
│   ├── layout/                 # Layout components
│   │   ├── Header/            # App header with user menu
│   │   ├── Footer/            # App footer
│   │   └── PageLayout/        # Page wrapper with background effects
│   └── features/              # Feature-specific components
│       ├── auth/              # Authentication components
│       │   ├── LoginForm/     # Login form component
│       │   ├── RegisterForm/  # Registration form component
│       │   └── AuthCard/      # Auth page card wrapper
│       └── profile/           # Profile page components
│           ├── ProfileHeader/ # Profile header with avatar
│           ├── ProfileInfo/   # Profile information form
│           └── ChangePassword/# Change password form
├── pages/                      # Page components
│   ├── HomePage.jsx           # Landing page
│   ├── LoginPage.jsx          # Login page
│   ├── RegisterPage.jsx       # Registration page
│   └── ProfilePage.jsx        # User profile page
├── services/                   # API services
│   └── api.js                 # Axios instance and API methods
├── store/                      # State management (Zustand)
│   └── useAuthStore.js        # Authentication state
├── hooks/                      # Custom React hooks
│   └── useAuth.js             # Auth-related hooks
├── utils/                      # Utility functions
│   └── auth.js                # Auth utility functions
├── constants/                  # Constants and configurations
│   └── index.js               # App constants (routes, API endpoints, etc.)
├── styles/                     # Global styles
│   └── index.css              # Style exports
├── App.jsx                     # Main app component
├── App.css                     # App styles
├── main.jsx                    # Entry point
└── index.css                   # Global styles
```

## 🎯 Component Organization

### 1. **Common Components** (`components/common/`)

Reusable UI components used across multiple features.

- Self-contained and highly reusable
- Accept props for customization
- No business logic or API calls

**Example:**

```jsx
import { FeatureCard } from "../components/common/FeatureCard";

<FeatureCard
  icon={<AppleOutlined />}
  title="Feature Title"
  description="Feature description"
/>;
```

### 2. **Layout Components** (`components/layout/`)

Components that define the app's layout structure.

- Header, Footer, Sidebar, etc.
- Provide consistent layout across pages
- Handle navigation and global UI elements

**Example:**

```jsx
import PageLayout from "../components/layout/PageLayout";

<PageLayout showBackgroundEffects={true}>
  <YourContent />
</PageLayout>;
```

### 3. **Feature Components** (`components/features/`)

Components specific to a feature or domain.

- Organized by feature (auth, profile, products, etc.)
- Can contain business logic
- May include API calls

**Example:**

```jsx
import { LoginForm } from "../components/features/auth/LoginForm";

<LoginForm onSubmit={handleLogin} loading={loading} />;
```

## 🪝 Custom Hooks

### `useAuth`

Hook for authentication logic and user state.

```jsx
import { useAuth } from "../hooks/useAuth";

const { user, isAuthenticated } = useAuth();
```

### `useRequireAuth`

Protect routes - redirect to login if not authenticated.

```jsx
import { useRequireAuth } from "../hooks/useAuth";

const { isAuthenticated } = useRequireAuth();
```

### `useRedirectIfAuthenticated`

Redirect authenticated users away from auth pages.

```jsx
import { useRedirectIfAuthenticated } from "../hooks/useAuth";

useRedirectIfAuthenticated("/dashboard");
```

## 📦 State Management

### Zustand Store (`store/useAuthStore.js`)

Centralized authentication state management.

```jsx
import useAuthStore from "../store/useAuthStore";

const { user, login, logout, updateProfile } = useAuthStore();
```

**Available methods:**

- `login(credentials)` - User login
- `register(data)` - User registration
- `fetchProfile()` - Fetch user profile
- `updateProfile(data)` - Update user profile
- `logout()` - User logout

## 🌐 API Services

### API Instance (`services/api.js`)

Axios instance with interceptors for authentication.

```jsx
import { authAPI } from "../services/api";

// Login
await authAPI.login({ email, password });

// Get profile
await authAPI.getProfile();

// Update profile
await authAPI.updateProfile(data);

// Change password
await authAPI.changePassword({
  current_password,
  new_password,
  confirm_password,
});
```

## 🎨 Styling

- **Tailwind CSS** for utility classes
- **Ant Design** for UI components
- **Custom CSS** for theme and animations (App.css)
- **CSS Variables** for colors and spacing

### Theme Colors (from App.css)

```css
--color-apple-blue: #007AFF
--color-apple-blue-light: #60a5fa
--color-dark-bg: #0a0a0a
--color-dark-card: #111111
```

## 🔑 Constants

All app constants are centralized in `constants/index.js`:

```jsx
import { ROUTES, API_ENDPOINTS, STORAGE_KEYS } from "../constants";

// Routes
navigate(ROUTES.HOME);
navigate(ROUTES.PROFILE);

// Storage
localStorage.getItem(STORAGE_KEYS.TOKEN);
```

## 📝 Best Practices

### Component Structure

Each component should have its own folder with:

```
ComponentName/
├── ComponentName.jsx    # Component logic
├── ComponentName.css    # Component styles (if needed)
├── index.js            # Export file
└── ComponentName.test.js # Tests (optional)
```

### Import Order

1. React and external libraries
2. Components
3. Hooks
4. Utils and constants
5. Styles

```jsx
// 1. React and libraries
import { useState } from "react";
import { Button } from "antd";

// 2. Components
import Header from "../components/layout/Header";

// 3. Hooks
import { useAuth } from "../hooks/useAuth";

// 4. Utils and constants
import { ROUTES } from "../constants";

// 5. Styles
import "./styles.css";
```

### Component Naming

- **PascalCase** for component files and names
- **camelCase** for variables and functions
- **UPPER_SNAKE_CASE** for constants

### Props Validation

Use PropTypes for all component props:

```jsx
import PropTypes from "prop-types";

ComponentName.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};
```

## 🚀 Quick Start Guide

### Adding a New Page

1. Create page component in `src/pages/`
2. Add route to `src/App.jsx`
3. Add route constant to `src/constants/index.js`

### Adding a New Feature

1. Create feature folder in `src/components/features/`
2. Create components within feature folder
3. Export components in `src/components/index.js`
4. Import and use in pages

### Adding a New API Endpoint

1. Add endpoint constant to `src/constants/index.js`
2. Add API method to `src/services/api.js`
3. Use in components or hooks

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Ant Design](https://ant.design/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Vite](https://vitejs.dev/)

## 🎯 Migration from Old Structure

If migrating from the old structure:

1. **Pages**: Already updated to use new components
2. **Components**: Extracted into modular, reusable components
3. **State**: Centralized with constants
4. **Imports**: Updated to use new paths
5. **Constants**: All magic strings moved to constants/index.js

All old functionality is preserved while improving:

- ✅ Code reusability
- ✅ Maintainability
- ✅ Testability
- ✅ Developer experience
