// backend/controllers/documentController.js
const Document = require('../Models/Document');
const fs = require('fs');
const path = require('path');
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const mongoose = require('mongoose');

exports.uploadDocuments = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Aucun fichier sélectionné' 
      });
    }

    const savedDocuments = await Promise.all(req.files.map(async (file) => {
      const document = new Document({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        uploadedBy: req.user.id
      });
      return await document.save();
    }));

    res.status(200).json({
      success: true,
      message: 'Fichiers téléchargés avec succès',
      files: savedDocuments.map(doc => ({
        id: doc._id,
        name: doc.originalName,
        size: doc.size,
        uploadedAt: doc.uploadedAt
      }))
    });
  } catch (error) {
    console.error('Erreur upload:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du téléchargement'
    });
  }
};

exports.listDocuments = async (req, res) => {
  try {
    const documents = await Document.find()
      .sort({ uploadedAt: -1 })
      .populate('uploadedBy', 'username');

    res.status(200).json({
      success: true,
      documents: documents.map(doc => ({
        id: doc._id,
        name: doc.originalName,
        size: `${(doc.size / (1024 * 1024)).toFixed(2)} MB`,
        uploadedAt: doc.uploadedAt,
        uploadedBy: doc.uploadedBy?.username || 'System'
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Les autres méthodes (downloadDocument, deleteDocument) restent similaires
// mais doivent aussi gérer la suppression dans la base de données

exports.downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé dans la base de données'
      });
    }

    const filePath = path.join(UPLOAD_DIR, document.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouvé sur le serveur'
      });
    }

    res.download(filePath, document.originalName);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement'
    });
  }
};

// Modifiez la méthode deleteDocument

exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Validation renforcée de l'ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de document invalide'
      });
    }

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé dans la base de données'
      });
    }

    // Suppression physique du fichier
    const filePath = path.join(UPLOAD_DIR, document.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Suppression dans la base de données
    await Document.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Document supprimé avec succès',
      deletedDocument: {
        id: document._id,
        name: document.originalName
      }
    });

  } catch (error) {
    console.error('Erreur suppression:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression'
    });
  }
};