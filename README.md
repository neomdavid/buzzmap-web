# 🦟 BuzzMap - Dengue Surveillance & Community Engagement Platform

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0.15-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> A comprehensive web platform for dengue surveillance, community engagement, and public health management in Quezon City.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Live Demo](#live-demo)
- [Key Features](#key-features)
- [Technical Architecture](#technical-architecture)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

BuzzMap is a modern web application designed to combat dengue fever through community-driven surveillance, real-time mapping, and public health interventions. The platform serves three distinct user roles:

- **👥 Community Members**: Report dengue cases, engage in discussions, and access prevention resources
- **👨‍⚕️ Health Administrators**: Manage reports, coordinate interventions, and analyze data
- **🔧 Super Administrators**: Oversee user accounts and system administration

## ✨ Features

### 🗺️ Interactive Mapping
- **Real-time Dengue Case Mapping**: Visualize reported cases on interactive maps
- **Risk Level Assessment**: Color-coded risk zones based on case density
- **Street View Integration**: Detailed location verification using Google Street View
- **Quezon City Boundaries**: Precise geographic data for accurate case plotting

### 👥 Community Engagement
- **Social Feed**: Share reports, announcements, and prevention tips
- **Comment System**: Community discussions and information sharing
- **Reaction System**: Like, share, and react to community posts
- **User Profiles**: Personalized user experience with profile management

### 📊 Administrative Dashboard
- **Report Verification**: Validate and manage community-submitted reports
- **Intervention Management**: Plan and track dengue prevention interventions
- **Analytics Dashboard**: Comprehensive data visualization and trend analysis
- **Alert System**: Real-time notifications for new cases and outbreaks

### 🔐 Multi-Role Authentication
- **User Roles**: Community members, administrators, and super administrators
- **Secure Access**: Role-based permissions and protected routes
- **Session Management**: Persistent login with secure token handling

### 📱 Responsive Design
- **Mobile-First**: Optimized for all device sizes
- **Modern UI**: Clean, intuitive interface with Tailwind CSS
- **Accessibility**: WCAG compliant design principles

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - Modern UI library
- **Vite 6.2.0** - Fast build tool and dev server
- **Tailwind CSS 4.0.15** - Utility-first CSS framework
- **Redux Toolkit** - State management
- **React Router DOM** - Client-side routing

### Mapping & Visualization
- **Leaflet** - Interactive maps
- **Google Maps API** - Street view and geocoding
- **Chart.js** - Data visualization
- **Recharts** - Advanced charting library
- **@turf/turf** - Geospatial analysis

### UI Components
- **Lucide React** - Icon library
- **Framer Motion** - Animations
- **React Toastify** - Notifications
- **Swiper** - Touch sliders
- **Phosphor React** - Additional icons

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vite Plugin React** - React support

## 📸 Screenshots

*[Screenshots will be added here]*

## 🚀 Live Demo

*[Demo link will be added here]*

> **Note**: This is a portfolio project showcasing modern web development skills and public health technology solutions.

## 📖 Key Features

### For Community Members
- **Case Reporting**: Submit dengue case reports with precise location mapping
- **Community Engagement**: Participate in discussions and share prevention tips
- **Real-time Updates**: Access latest health alerts and prevention resources

### For Health Administrators
- **Comprehensive Dashboard**: View analytics, reports, and intervention management
- **Data Visualization**: Monitor trends and generate insights through interactive charts
- **Intervention Coordination**: Plan and track prevention activities

### For System Administrators
- **User Management**: Oversee accounts and permissions across the platform
- **System Analytics**: Access comprehensive platform performance metrics

## 📁 Project Structure

```
buzzmap-web/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   ├── features/         # Redux state management
│   ├── hooks/            # Custom React hooks
│   └── utils/            # Utility functions
├── public/               # Static assets
└── package.json
```

*Clean, modular architecture following React best practices*

## 🔌 Technical Architecture

### Frontend Architecture
- **Component-Based Design**: Modular React components for maintainability
- **State Management**: Redux Toolkit for centralized state management
- **Routing**: React Router for seamless navigation
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Data Flow
- **Real-time Updates**: Live data synchronization across components
- **Caching Strategy**: Optimized data fetching and caching
- **Error Handling**: Comprehensive error boundaries and user feedback

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages
- Add tests for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Quezon City Health Department** - For domain expertise and guidance
- **Open Source Community** - For the amazing libraries and tools
- **Contributors** - For their valuable contributions

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/buzzmap-web/issues)
- **Documentation**: [Wiki](https://github.com/yourusername/buzzmap-web/wiki)
- **Email**: support@buzzmap.com

---

**Made with ❤️ for public health and community safety** 