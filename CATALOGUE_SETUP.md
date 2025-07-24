# Catalogue Setup Guide

## What is the Catalogue Folder?

The **catalogue folder** contains all your jersey design images that will be used for similarity search. When a user selects an area, the system finds similar designs from this catalogue.

## Setup Steps

### 1. Add Jersey Images to Catalogue
```
catalogue/
├── jersey1.jpg
├── jersey2.jpg
├── jersey3.jpg

```

**Supported formats:** JPG, JPEG, PNG

### 2. Generate FAISS Index
Run the feature extraction script to create the FAISS index:

```bash
python feature_extraction.py
```

This will:
- Scan all images in the `catalogue/` folder
- Extract DINO features from each image
- Create `index/vector.index` (FAISS index)
- Create `index/index_to_path.json` (mapping)

### 3. Test the System
1. Start the server: `node server.cjs`
2. Start the frontend: `npm run dev`
3. Upload an image and click on an area
4. The system will find similar designs from the catalogue

## How It Works

1. **User selects area** → Image cropped to selected area
2. **Maximum rectangle extracted** → Landscape/portrait rectangle
3. **DINO features extracted** → 384-dimensional feature vector
4. **FAISS search** → Find similar designs from catalogue
5. **Results displayed** → Show similar jersey designs

## File Structure
```
project/
├── catalogue/          # Your jersey design images
├── index/             # FAISS index and mapping
│   ├── vector.index
│   └── index_to_path.json
├── dino/              # DINO scripts
│   ├── feature.py     # Feature extraction
│   └── search.py      # FAISS search
└── ...
```

## Troubleshooting

- **No similar designs found**: Make sure you have images in the catalogue folder
- **FAISS index not found**: Run `python feature_extraction.py` first
- **Images not loading**: Check that the catalogue folder is accessible

## Adding New Designs

1. Add new jersey images to the `catalogue/` folder
2. Re-run `python feature_extraction.py` to update the index
3. The new designs will be available for similarity search 