// backend/routes/api.js
const express = require('express');
const router = express.Router();
const documentController = require('../Controllers/documentController');
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');

// Configuration de Multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Routes pour les documents
router.post('/documents/upload', 
  authMiddleware, 
  upload.array('documents'), 
  documentController.uploadDocuments
);

router.get('/documents/download/:id', 
  authMiddleware, 
  documentController.downloadDocument
);

router.delete('/documents/:id', 
  authMiddleware, 
  documentController.deleteDocument
);

router.get('/documents', 
  authMiddleware, 
  documentController.listDocuments
);

module.exports = router;