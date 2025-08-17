// API handler for POST /api/upload-image
// Accepts a multipart/form-data image upload and returns a dummy image URL

import formidable from 'formidable';
import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';
dotenv.config();


export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm({
    uploadDir: path.join(process.cwd(), 'uploads'),
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error parsing form' });
    }
    
    const file = files.image;
    if (!file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }
    
    const fileObj = Array.isArray(file) ? file[0] : file;
    const imagePath = (fileObj as { filepath: string }).filepath;
    
    // Resize the image to 200x200 using sharp
    const resizedPath = imagePath.replace(/(\.[^.]+)$/, '_resized$1');
    await sharp(imagePath).resize(200, 200).toFile(resizedPath);

    // Send the image to FastAPI YOLO endpoint
    if (!process.env.FASTAPI_YOLO_URL) {
      return res.status(500).json({ error: 'FASTAPI_YOLO_URL environment variable not configured' });
    }
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(resizedPath));
    
    const response = await axios.post(process.env.FASTAPI_YOLO_URL, formData, {
      headers: formData.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    
    const polygons = response.data.polygons;
    const imageUrl = '/uploads/' + path.basename(resizedPath);
    
    return res.status(200).json({ imageUrl, polygons });
  });
} 