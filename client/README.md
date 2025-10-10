# MacZone E-Commerce Client

React.js frontend application for MacZone E-Commerce.

## 🚀 Tech Stack

- **React 18** - UI Library
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Ant Design** - React UI library
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **Zustand** - State management

## 📦 Installation

```bash
cd client
npm install
```

## 🛠️ Development

```bash
npm run dev
```

Server will run on: `http://localhost:3000`

## 🏗️ Build

```bash
npm run build
```

## 📁 Project Structure

```
client/
├── src/
│   ├── pages/          # Page components
│   ├── components/     # Reusable components
│   ├── services/       # API services
│   ├── stores/         # Zustand stores
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main App component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── public/             # Static files
├── index.html          # HTML template
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind configuration
└── package.json
```

## 🎨 Features

- ✅ Responsive design with Tailwind CSS
- ✅ Beautiful UI with Ant Design components
- ✅ Fast development with Vite HMR
- ✅ Routing with React Router
- ✅ State management with Zustand
- ✅ API integration with Axios
- ✅ Proxy to backend API

## 🔗 API Proxy

Development server proxies `/api/*` requests to `http://localhost:5000`

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌈 Customization

### Tailwind Colors

Edit `tailwind.config.js` to customize colors:

```js
theme: {
  extend: {
    colors: {
      primary: '#1890ff',
      secondary: '#52c41a',
    },
  },
}
```

### Ant Design Theme

Edit `src/main.jsx` ConfigProvider:

```js
<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 8,
    },
  }}
>
```

## 📄 License

ISC
