import express from 'express';
import ViteExpress from 'vite-express';

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Use ViteExpress to serve both frontend and backend  
ViteExpress.listen(app, PORT, () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});