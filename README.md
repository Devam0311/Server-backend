# 🏈 8x Sports Jersey Studio – Backend Server

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-5.1.0-blue?style=for-the-badge&logo=express)
![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=for-the-badge)

*A powerful Node.js Express backend for AI-powered jersey design analysis and search* 🚀

[Features](#-features) • [API Endpoints](#-api-endpoints) • [Quick Start](#-quick-start) • [Architecture](#-architecture)

</div>

---

## ✨ Features

| Feature | Description | Status |
|---------|-------------|--------|
| 🖼️ **Image Upload** | Secure file upload with validation | ✅ Ready |
| 🎯 **Polygon Detection** | YOLO-powered object detection | ✅ Ready |
| 🔍 **AI Search** | DINO + FAISS for similar designs | ✅ Ready |
| ✂️ **Smart Cropping** | Intelligent area extraction | ✅ Ready |
| 🚀 **High Performance** | Optimized for production | ✅ Ready |
| 🔒 **CORS Security** | Cross-origin request handling | ✅ Ready |

---

## 🛠️ API Endpoints

### 🔍 Health Check
```http
GET /api/test
```
**Response:**
```json
{
  "message": "Server is working!",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "endpoints": ["/api/upload-image", "/api/generate-jersey", "/api/test"]
}
```

### 📤 Image Upload & Analysis
```http
POST /api/upload-image
Content-Type: multipart/form-data

Body: { image: File }
```
**Response:**
```json
{
  "imageUrl": "/uploads/1234567890-image.jpg",
  "polygons": [[[x1,y1], [x2,y2], ...]]
}
```

### 🏈 Jersey Design Search
```http
POST /api/generate-jersey
Content-Type: multipart/form-data

Body: {
  image: File,
  area?: [[x,y], [x,y], ...],
  isPolygon?: boolean
}
```
**Response:**
```json
{
  "imageUrl": "/uploads/processed-image.jpg",
  "message": "Similar designs found!",
  "similarDesigns": [...],
  "features": [...]
}
```

---

## ⚡ Quick Start

### 1. 🚀 Clone & Install
```bash
git clone https://github.com/Devam0311/Server-backend.git
cd Server-backend
pnpm install
```

### 2. ⚙️ Environment Setup
Create `.env` file:
```env
# Frontend URL
FRONTEND_URL=https://localhost:8081

# FastAPI Services
FASTAPI_YOLO_URL=http://0.0.0.0:8000/yolo
FASTAPI_DINO_URL=http://0.0.0.0:8000/dino
FASTAPI_FAISS_URL=http://0.0.0.0:8000/faiss
```

### 3. 🎯 Start Server
```bash
node server.cjs
```
🌐 Server running at: **http://localhost:3001**

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   FastAPI       │
│   (React)       │◄──►│   (Express)     │◄──►│   Services      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   File System   │
                       │   (uploads/)    │
                       └─────────────────┘
```

### 📁 Project Structure
```
backend/
├── 🚀 server.cjs          # Main Express server
├── 📦 package.json        # Dependencies & scripts
├── 📁 uploads/            # Uploaded images (auto-created)
├── 📁 profiles/           # User profiles (auto-created)
├── 📁 catalogue/          # Design catalogue
├── 📁 src/                # Source code
│   ├── 📁 lib/            # Utilities
│   └── 📁 pages/          # API routes
└── 📄 README.md           # This file
```

---

## 🧩 Tech Stack

### Core Dependencies
- **Express** - Web framework
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing
- **Axios** - HTTP client
- **Sharp** - Image processing
- **Form-data** - Multipart form handling

### Development Tools
- **Node.js** ≥ 18.0.0
- **pnpm** ≥ 8.0.0
- **TypeScript** support
- **ESLint** + **Prettier**

---

## 🔧 Development

### Available Scripts
```bash
# Install dependencies
pnpm install

# Run development server
node server.cjs

# Lint code
pnpm lint

# Format code
pnpm format

# Type checking
pnpm type-check
```

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `FRONTEND_URL` | Frontend application URL | `https://localhost:8081` |
| `FASTAPI_YOLO_URL` | YOLO detection service | `http://0.0.0.0:8000/yolo` |
| `FASTAPI_DINO_URL` | DINO feature extraction | `http://0.0.0.0:8000/dino` |
| `FASTAPI_FAISS_URL` | FAISS search service | `http://0.0.0.0:8000/faiss` |

---

## 🤝 Contributing

We love contributions! Here's how you can help:

1. 🍴 **Fork** the repository
2. 🌿 **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. 📤 **Push** to the branch (`git push origin feature/amazing-feature`)
5. 🔄 **Open** a Pull Request

### 🐛 Bug Reports
Found a bug? [Open an issue](https://github.com/Devam0311/Server-backend/issues) with:
- Bug description
- Steps to reproduce
- Expected vs actual behavior
- Environment details

---

<div align="center">

**Made with ❤️ for 8x Sports Jersey Studio**

[![GitHub stars](https://img.shields.io/github/stars/Devam0311/Server-backend?style=social)](https://github.com/Devam0311/Server-backend/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Devam0311/Server-backend?style=social)](https://github.com/Devam0311/Server-backend/network/members)

*Empowering sports enthusiasts with AI-driven jersey design* 🏆

</div>