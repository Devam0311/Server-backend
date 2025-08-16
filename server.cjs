const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const https = require('https');
const fs = require('fs');
const { execFile } = require('child_process');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Preserve original extension
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Ensure directories exist
const profilesDir = path.join(__dirname, 'profiles');
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir);
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// --- CORS & FILE UPLOADS ---
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

// --- API ENDPOINTS ---

// Test endpoint to verify server is working
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is working!', 
    timestamp: new Date().toISOString(),
    endpoints: ['/api/upload-image', '/api/generate-jersey', '/api/test']
  });
});

app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      error: 'No image uploaded',
      details: 'req.file is null/undefined'
    });
  }
  
  const imagePath = req.file.path;
  
  // Check if file exists
  if (!fs.existsSync(imagePath)) {
    return res.status(500).json({ 
      error: 'File not found on server',
      path: imagePath
    });
  }
  
  // Send the image to FastAPI YOLO endpoint
  const form = new FormData();
  
  const fileStream = fs.createReadStream(imagePath);
  form.append('file', fileStream);

  const response = await axios.post(process.env.FASTAPI_YOLO_URL, form, {
    headers: form.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    timeout: 30000, // 30 second timeout
  });
  
  const polygons = response.data.polygons;
  const imageUrl = '/uploads/' + path.basename(imagePath);
  const responseData = { imageUrl, polygons };
  
  res.json(responseData);
  // Delete the uploaded file after a short delay
  setTimeout(() => {
    fs.unlink(imagePath, err => {
      if (err) console.error('Failed to delete upload:', imagePath, err);
      else console.log('Deleted upload:', imagePath);
    });
  }, 30000); // 30 seconds
});

// --- GENERATE JERSEY ENDPOINT ---
app.post('/api/generate-jersey', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  const imagePath = req.file.path;
  const area = req.body.area ? JSON.parse(req.body.area) : null;
  const isPolygon = req.body.isPolygon ? JSON.parse(req.body.isPolygon) : false;

  // Extract maximum rectangle from the cropped image
  const maxRectanglePath = await extractMaxRectangle(imagePath, area, isPolygon);
  
  // Extract features using DINO model
  const features = await extractDINOFeatures(maxRectanglePath);
  
  if (features) {
    // Search for similar images using FAISS
    let similarImages = await searchFAISS(features);
    // Limit to top 15 results
    if (Array.isArray(similarImages)) {
      similarImages = similarImages.slice(0, 15);
    }
    res.status(200).json({ 
      imageUrl: '/uploads/' + path.basename(maxRectanglePath),
      message: 'Similar designs found!',
      maxRectanglePath,
      features: features,
      similarDesigns: similarImages || []
    });
  } else {
    res.status(500).json({ error: 'Failed to extract features' });
  }
  // Delete both the uploaded and processed files after a short delay
  setTimeout(() => {
    fs.unlink(imagePath, err => {
      if (err) console.error('Failed to delete upload:', imagePath, err);
      else console.log('Deleted upload:', imagePath);
    });
    if (maxRectanglePath !== imagePath) {
      fs.unlink(maxRectanglePath, err => {
        if (err) console.error('Failed to delete processed file:', maxRectanglePath, err);
        else console.log('Deleted processed file:', maxRectanglePath);
      });
    }
  }, 30000); // 30 seconds
});

async function extractMaxRectangle(imagePath, area, isPolygon) {
  const sharp = require('sharp');
  if (isPolygon && area && area.length > 0) {
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    // Calculate bounding rectangle of the polygon
    const minX = Math.max(0, Math.round(Math.min(...area.map(([x, y]) => x))));
    const minY = Math.max(0, Math.round(Math.min(...area.map(([x, y]) => y))));
    const maxX = Math.min(metadata.width, Math.round(Math.max(...area.map(([x, y]) => x))));
    const maxY = Math.min(metadata.height, Math.round(Math.max(...area.map(([x, y]) => y))));
    const cropWidth = Math.max(1, maxX - minX);
    const cropHeight = Math.max(1, maxY - minY);
    const outputPath = imagePath.replace(/(\.[^.]+)$/, '_polygon$1');
    await image.extract({
      left: minX,
      top: minY,
      width: cropWidth,
      height: cropHeight
    }).toFile(outputPath);
    return outputPath;
  } else {
    // No polygon provided, just return the original image
    return imagePath;
  }
}

async function extractDINOFeatures(imagePath) {
  const form = new FormData();
  form.append('file', fs.createReadStream(imagePath));
  const response = await axios.post(process.env.FASTAPI_DINO_URL, form, {
    headers: form.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
  return response.data.features;
}

async function searchFAISS(features) {
  const response = await axios.post(process.env.FASTAPI_FAISS_URL, {
    features: features
  });
  return response.data.results;
}

// Serve static files (for placeholder.svg and uploaded images)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve catalogue directory
const catalogueDir = path.join(__dirname, 'catalogue');
app.use('/catalogue', express.static(catalogueDir));

const PORT = process.env.PORT || 3001;
// Convert HTTPS server to HTTP
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
}); 