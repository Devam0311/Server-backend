// API handler for POST /api/generate-jersey
// Accepts a cropped image and extracts maximum rectangle from it

import formidable from 'formidable';
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
    const area = fields.area ? JSON.parse(fields.area as unknown as string) : null;
    const isPolygon = fields.isPolygon ? JSON.parse(fields.isPolygon as unknown as string) : false;

    // Extract maximum rectangle from the cropped image
    const maxRectanglePath = await extractMaxRectangle(imagePath, area, isPolygon);
    
    // Extract features using DINO model
    const features = await extractDINOFeatures(maxRectanglePath);
    
    if (features) {
      // Search for similar images using FAISS
      const similarImages = await searchFAISS(features);
      
      const imageUrl = '/uploads/' + path.basename(maxRectanglePath);
      const responseData = { 
        imageUrl,
        message: 'Similar designs found!',
        maxRectanglePath,
        features: features,
        similarDesigns: similarImages || []
      };
      
      return res.status(200).json(responseData);
    } else {
      return res.status(500).json({ error: 'Failed to extract features' });
    }
  });
}

async function extractMaxRectangle(imagePath, area, isPolygon) {
  // Load the image
  const image = sharp(imagePath);
  const metadata = await image.metadata();
  
  let maxRectanglePath = imagePath; // Default to original if no area specified
  
  if (isPolygon && area && area.length > 0) {
    // For polygon areas, use the polygon crop directly (no rectangle optimization)
    const outputPath = imagePath.replace(/(\.[^.]+)$/, '_polygon$1');
    
    // Create a mask from the polygon and crop to the polygon area
    const { width, height } = metadata;
    
    // Create SVG mask for the polygon
    const svgMask = `
      <svg width="${width}" height="${height}">
        <defs>
          <mask id="polygon-mask">
            <rect width="100%" height="100%" fill="white"/>
            <polygon points="${area.map(([x, y]) => `${x},${y}`).join(' ')}" fill="black"/>
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="white" mask="url(#polygon-mask)"/>
      </svg>
    `;
    
    // Apply the mask and crop to bounding box
    const minX = Math.min(...area.map(([x, y]) => x));
    const minY = Math.min(...area.map(([x, y]) => y));
    const maxX = Math.max(...area.map(([x, y]) => x));
    const maxY = Math.max(...area.map(([x, y]) => y));
    
    const cropWidth = maxX - minX;
    const cropHeight = maxY - minY;
    
    await image
      .composite([{
        input: Buffer.from(svgMask),
        blend: 'dest-in'
      }])
      .extract({ left: minX, top: minY, width: cropWidth, height: cropHeight })
      .toFile(outputPath);
    
    maxRectanglePath = outputPath;
  } else {
    // For full image or no area, just resize to a standard aspect ratio
    const outputPath = imagePath.replace(/(\.[^.]+)$/, '_maxrect$1');
    
    // Determine if image is landscape or portrait and crop accordingly
    const { width, height } = metadata;
    const aspectRatio = width / height;
    
    if (aspectRatio > 1) {
      // Landscape - crop to 4:3 or 16:9
      const targetRatio = 4/3; // You can change this to 16/9 if preferred
      const newHeight = Math.round(width / targetRatio);
      const y = Math.round((height - newHeight) / 2);
      
      await image
        .extract({ left: 0, top: y, width, height: newHeight })
        .toFile(outputPath);
    } else {
      // Portrait - crop to 3:4 or 9:16
      const targetRatio = 3/4; // You can change this to 9/16 if preferred
      const newWidth = Math.round(height * targetRatio);
      const x = Math.round((width - newWidth) / 2);
      
      // FIX: Ensure crop parameters are valid (no negative values)
      const left = Math.max(0, x);
      const cropWidth = Math.min(newWidth, width - left);
      
      await image
        .extract({ left: left, top: 0, width: cropWidth, height })
        .toFile(outputPath);
    }
    
    maxRectanglePath = outputPath;
  }
  
  return maxRectanglePath;
}

async function extractDINOFeatures(imagePath) {
  const form = new FormData();
  form.append('file', fs.createReadStream(imagePath));

  if (!process.env.FASTAPI_DINO_URL) {
    throw new Error('FASTAPI_DINO_URL environment variable is not set');
  }

  const response = await axios.post(process.env.FASTAPI_DINO_URL as string, form, {
    headers: form.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
  
  return response.data.features;
}

async function searchFAISS(features: any) {
  if (!process.env.FASTAPI_FAISS_URL) {
    throw new Error('FASTAPI_FAISS_URL environment variable is not set');
  }

  const response = await axios.post(process.env.FASTAPI_FAISS_URL as string, {
    features: features
  });

  return response.data.results;
}