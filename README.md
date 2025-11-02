# Spotter - ELD Log Planning & Route Management

A full-stack application for truck drivers to plan trips, calculate routes with HOS (Hours of Service) compliance, and automatically generate ELD (Electronic Logging Device) logs.

## Features

- **Smart Route Planning**: Calculate optimal routes with consideration for HOS rules
- **Automated ELD Logs**: Generate compliant daily log sheets automatically
- **HOS Tracking**: Stay compliant with 70/8 day rules and driving limits
- **Interactive Maps**: Visualize routes, rest stops, and fuel stops
- **Trip Management**: Plan trips with current location, pickup, and dropoff points

## Tech Stack

- **Frontend**: React 18, Vite
- **State Management**: Redux Toolkit with Redux Persist
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion, GSAP
- **Maps**: Leaflet (OpenStreetMap)
- **HTTP Client**: Axios
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── api/           # API configuration and services
├── components/    # Reusable UI components
├── lib/           # Utility functions and helpers
├── pages/         # Page components
├── redux/         # Redux store and slices
└── styles/        # Global styles
```

## Assumptions

- Property-carrying driver
- 70 hours/8 days rule
- No adverse driving conditions
- Fueling at least once every 1,000 miles
- 1 hour for pickup and drop-off

## License

MIT
