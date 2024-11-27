
---

# ChatApp - Documentation

## Demonstration

You can access the hosted version of the project here:

[ChatApp Hosted Version](https://chatapp-qdm6.onrender.com/)

You can also view a demonstration of ChatApp in action through the following video:

[ChatApp Demonstration Video](https://drive.google.com/file/d/1qj27H5fKvuWJidwsGdqXyQ8x62hoAz4c/view?usp=sharing)



---

## Introduction

**ChatApp** is a real-time messaging application that demonstrates modern full-stack development practices. The app includes features like authentication, message handling, and media uploads via Cloudinary. This repository is divided into two main parts: a **backend** built with Node.js and a **frontend** using Vite and React.

---

## Setup Instructions

### 1. Configure Environment Variables

Create a `.env` file in the root directory with the following structure:

```env
MONGODB_URI=your_mongo_uri
PORT=5001
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

NODE_ENV=development
```

### 2. Build the App

Install the dependencies and build the application:

```bash
npm install
npm run build
```

### 3. Start the App

Run the application:

```bash
npm start
```

---

## Project Structure

### Backend

The backend code is located in `backend/src`. Here’s the directory structure:

```plaintext
backend/src
├── controllers      # Handles business logic for API routes
├── models           # MongoDB schemas and data models
├── routes           # API route definitions
├── middlewares      # Custom middleware for request handling (e.g., authentication)
├── lib              # Utility functions (e.g., Cloudinary configuration)
└── index.js         # Entry point for the Node.js server
```

### Frontend

The frontend is built using Vite and React, with its code in `frontend/src`:

```plaintext
frontend/src
├── components       # Reusable React components
│   ├── ui           # Includes skeleton loaders and reusable UI elements
│   └── normal       # Standard components for the app
├── lib              # Shared utility functions
├── pages            # Defines individual pages (e.g., Home, Chat)
├── store            # State management (e.g., Redux, Context API)
├── app.jsx          # Main React entry file
└── Other config files for Vite and project setup
```

---

## Features

- **User Authentication**: Secure user registration and login using JWT, with encrypted password storage in MongoDB.
- **Chat Functionality**: Real-time messaging between authenticated users using WebSockets and Socket.io. Persistent chat history stored in MongoDB for future access.
- **User Interface**: A React-based chat UI with message input and display areas. Displays a list of currently online users.
- **Online Presence Indicator**: Real-time “online” or “offline” status updates using WebSocket events.
- **Basic UI Features**: Auto-scrolls chat to the latest message. Shows message timestamps for better context. Minimalist design for clean and functional user experience.
- **Advanced Features**: "Typing..." indicator for real-time feedback. Media upload support with storage on a cloud service. Read receipts to indicate when messages are seen by the recipient.

---
```
