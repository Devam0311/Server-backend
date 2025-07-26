
---

## ⚡ Getting Started

### 1. Install dependencies
```sh
pnpm install
# or
npm install
```

### 2. Set up environment variables

Create a `.env` file in the root with:

for local use create a .env :
FRONTEND_URL=https://localhost:8081
FASTAPI_YOLO_URL=http://0.0.0.0:8000/yolo
FASTAPI_DINO_URL=http://0.0.0.0:8000/dino
FASTAPI_FAISS_URL=http://0.0.0.0:8000/faiss

Adjust the URLs to match your FastAPI services.

### 3. Run the server
```sh
node server.cjs
```
Server runs at: [http://localhost:3001](http://localhost:3001)

---

## 🧩 Dependencies

- express
- multer
- cors
- axios
- form-data
- dotenv
- sharp

(See `package.json` for full list.)

---

## 🤝 Contributing

Pull requests and issues are welcome!  
Please open an issue to discuss your ideas or report bugs.


*Made with ❤️ for 8x Sports Jersey Studio*