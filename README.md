# 🚗 RideSurf - Vehicle Rental System

A comprehensive full-stack vehicle rental management system built with React, Node.js, Express, and MongoDB.

## 📋 Project Overview

RideSurf is a complete vehicle rental platform that includes:
- **User Frontend**: Customer-facing application for browsing and booking vehicles
- **Admin Frontend**: Administrative dashboard for managing vehicles, bookings, and users
- **Backend API**: RESTful API server with authentication, booking management, and data persistence

## 🏗️ Project Structure

```
ride-surf/
├── user-frontend/          # Customer React application
├── admin-rentals/          # Admin React dashboard  
├── server-rentals/         # Node.js/Express API server
└── README.md              # This file
```

## ✨ Features

### User Features
- 🔍 Browse vehicles without login
- 📅 Search available vehicles by date range
- 🔐 User registration and email verification
- 📄 License upload and verification
- 💳 Booking management with payment integration
- 👤 User profile management

### Admin Features
- 🚗 Vehicle management (CRUD operations)
- 📊 Booking oversight and management
- 👥 User management and license approval
- 📈 Travel history tracking
- 🔧 System administration

### Technical Features
- 🔒 JWT-based authentication with refresh tokens
- 📧 Email verification system
- 🖼️ Image upload with Cloudinary integration
- 📱 Responsive design
- 🔄 Real-time availability checking
- 🛡️ Protected routes and middleware

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/samyak-027/ride-surf.git
cd ride-surf
```

2. **Setup Backend Server**
```bash
cd server-rentals
npm install
cp .env.example .env
# Configure your environment variables
npm start
```

3. **Setup User Frontend**
```bash
cd ../user-frontend
npm install
npm run dev
```

4. **Setup Admin Frontend**
```bash
cd ../admin-rentals
npm install
npm run dev
```

## 🔧 Environment Configuration

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/vehicle-rental
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
SESSION_SECRET=your-session-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
PORT=5007
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5007/api
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/refresh-token` - Token refresh

### Vehicles
- `GET /api/cars/getCars` - Get all vehicles (public)
- `POST /api/cars/available` - Get available vehicles by date
- `POST /api/cars/add-car` - Add vehicle (admin)
- `PUT /api/cars/:id` - Update vehicle (admin)
- `DELETE /api/cars/:id` - Delete vehicle (admin)

### Bookings
- `POST /api/bookings/user-booking` - Create booking
- `GET /api/bookings/my-bookings` - Get user bookings
- `GET /api/bookings/allBookings` - Get all bookings (admin)

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling framework
- **Lucide React** - Icon library
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File upload
- **Cloudinary** - Image storage
- **Nodemailer** - Email service

## 🔐 Authentication Flow

1. User registers with email and password
2. Email verification with OTP
3. JWT access token (15min) + refresh token (7 days)
4. License upload and admin approval
5. Booking authorization based on verification status

## 📱 User Journey

1. **Browse Vehicles** - View available vehicles without login
2. **Search & Filter** - Find vehicles by date, type, price, etc.
3. **Registration** - Create account with email verification
4. **License Upload** - Submit driving license for approval
5. **Booking** - Select vehicle and confirm booking
6. **Payment** - Process payment (mock implementation)
7. **Management** - View and manage bookings in profile

## 🔧 Development

### Running in Development Mode

```bash
# Terminal 1 - Backend
cd server-rentals && npm start

# Terminal 2 - User Frontend  
cd user-frontend && npm run dev

# Terminal 3 - Admin Frontend
cd admin-rentals && npm run dev
```

### Default Ports
- Backend API: `http://localhost:5007`
- User Frontend: `http://localhost:5174`
- Admin Frontend: `http://localhost:5173`

## 🧪 Testing

### Admin Login
- Email: `admin@example.com`
- Password: `admin123`

### API Testing
```bash
# Test public vehicle endpoint
curl http://localhost:5007/api/cars/getCars

# Test authentication
curl -X POST http://localhost:5007/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or cloud database
2. Configure environment variables
3. Deploy to Heroku, Railway, or similar platform

### Frontend Deployment
1. Build the applications: `npm run build`
2. Deploy to Vercel, Netlify, or similar platform
3. Update API URLs in environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Issues

- Email service requires Gmail app password configuration
- Image uploads require Cloudinary setup
- Payment integration is currently mock implementation

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: support@ridesurf.com

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by real-world rental platforms
- Community feedback and contributions

---

**Made with ❤️ by Team RideSurf!**