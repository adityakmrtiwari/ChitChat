# ChitChat - Modern Premium Chat App

ChitChat is a full-stack, real-time chat application built with a modern MERN stack and a premium, responsive UI using React, Vite, Tailwind CSS, and Socket.io.

## 🚀 Features

### Core Features
- **Real-time Messaging**: Instant message delivery with live typing indicators
- **Chat Rooms**: Create, join, and manage public/private chat rooms
- **User Authentication**: Secure JWT-based login and registration
- **User Presence**: Real-time online/offline status tracking
- **Typing Indicators**: See when users are typing in real-time
- **Room Management**: Room owners and admins can manage users
- **Responsive Design**: Mobile-first design with premium UI/UX

### Admin Features
- **Admin Panel**: Complete admin functionality for system management
- **User Management**: View, delete, and manage user roles
- **Room Management**: Create, delete, and join any room
- **System Overview**: Complete system statistics and monitoring

### UI/UX Features
- **Modern Design**: Dark gradient theme with glassmorphism effects
- **Smooth Animations**: Framer Motion animations throughout
- **Premium Styling**: Tailwind CSS with custom gradients
- **Responsive Layout**: Works perfectly on all devices
- **Real-time Updates**: Live user list and message updates

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **shadcn/ui** - Modern UI components

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Passport.js** - Authentication middleware

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ChitChat
```

### 2. Backend Setup
```bash
cd Backend
npm install
```

Create a `.env` file in the Backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/chitchat
JWT_SECRET=your_super_secret_jwt_key_here
PORT=8000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
BCRYPT_ROUNDS=12
JWT_EXPIRES_IN=7d
```

Start the backend server:
```bash
npm run dev
```

### 3. Create Admin User
```bash
cd Backend
node createAdmin.js
```

This creates an admin user with:
- Email: `admin@chitchat.com`
- Password: `admin123`

### 4. Frontend Setup
```bash
cd Frontend
npm install
```

Create a `.env` file in the Frontend directory:
```env
VITE_API_URL=http://localhost:8000
VITE_SOCKET_URL=http://localhost:8000
VITE_APP_NAME=ChitChat
VITE_APP_VERSION=1.0.0
```

Start the frontend development server:
```bash
npm run dev
```

### 5. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

## 🎯 Usage

### Regular Users
1. **Register/Login**: Create an account or sign in
2. **Join Rooms**: Browse and join existing chat rooms
3. **Create Rooms**: Start new conversations
4. **Real-time Chat**: Send messages with typing indicators
5. **User Management**: View online users and room members

### Admin Users
1. **Admin Panel**: Access via navbar or `/admin` route
2. **User Management**: View, delete, and manage all users
3. **Room Management**: Create, delete, and join any room
4. **System Control**: Remove users from rooms, manage roles

## 🔧 Project Structure

```
ChitChat/
├── Backend/
│   ├── config/
│   │   ├── auth.js          # Passport JWT configuration
│   │   └── db.js            # MongoDB connection
│   ├── middleware/
│   │   └── auth.js          # Authentication middleware
│   ├── models/
│   │   ├── Message.js       # Message schema
│   │   ├── Room.js          # Room schema
│   │   └── User.js          # User schema
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   ├── messages.js      # Message routes
│   │   ├── rooms.js         # Room routes
│   │   └── users.js         # User routes
│   ├── socket/
│   │   └── socketHandler.js # Socket.io event handlers
│   ├── createAdmin.js       # Admin user creation script
│   └── server.js            # Express server
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── Toast.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── lib/
│   │   │   ├── api.js       # API configuration
│   │   │   ├── socket.js    # Socket configuration
│   │   │   └── utils.js
│   │   ├── pages/
│   │   │   ├── AdminPanel.jsx
│   │   │   ├── App.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   └── styles/
│   │       └── global.css
│   └── public/
│       └── assets/
├── DEPLOYMENT.md            # Deployment guide
└── README.md
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Role-based Access**: User and admin role management
- **Protected Routes**: Client and server-side route protection
- **Input Validation**: Request validation and sanitization
- **CORS Configuration**: Proper cross-origin resource sharing
- **Rate Limiting**: API rate limiting for security
- **Helmet**: Security headers for Express

## 🎨 Design System

### Color Scheme
- **Primary**: Dark gradient backgrounds
- **Accent**: Blue and purple gradients
- **Success**: Green tones
- **Error**: Red tones
- **Warning**: Yellow tones

### Components
- **Glass Cards**: Backdrop blur with transparency
- **Gradient Buttons**: Modern gradient button styles
- **Animated Elements**: Smooth transitions and animations
- **Responsive Layout**: Mobile-first design approach

## 🚀 Production Features

### Backend
- **Security Headers**: Helmet.js for security
- **Rate Limiting**: Express rate limiter
- **Compression**: Response compression
- **Input Validation**: Express-validator
- **Error Handling**: Global error handler
- **Health Check**: `/health` endpoint
- **Graceful Shutdown**: Proper process termination

### Frontend
- **Code Splitting**: Manual chunks for optimization
- **Tree Shaking**: Dead code elimination
- **Minification**: Terser for code compression
- **Console Removal**: Production console cleanup
- **Source Maps**: Disabled for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the deployment guide

---

**Enjoy your premium chat experience with full admin control! 🚀** 