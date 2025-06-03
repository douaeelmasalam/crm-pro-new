// components/DocumentsSection.js
import React, { useState, useEffect } from 'react';
import { FaDownload, FaUpload, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import '../styles/DocumentsSection.css';

const API_URL = 'http://localhost:5000/api';

const DocumentsSection = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [documents, setDocuments] = useState([]);

 const fetchDocuments = async () => {
  setIsLoading(true);
  try {
    const response = await axios.get(`${API_URL}/documents`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    // Validation basique
    if (response.data.documents && Array.isArray(response.data.documents)) {
      setDocuments(response.data.documents);
    } else {
      setDocuments([]);
    }
    setError(null);
  } catch (err) {
    setError(err.response?.data?.message || 'Erreur lors du chargement des documents');
    console.error('Fetch documents error:', err);
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    setSelectedFiles([...e.target.files]);
    setError(null);
    setSuccess(null);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Veuillez sélectionner au moins un fichier');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('documents', file);
      });

      const response = await axios.post(`${API_URL}/documents/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Fichiers téléchargés avec succès');
      setSelectedFiles([]);
      fetchDocuments(); // Rafraîchir la liste des documents
    } catch (err) {
      const errorMsg = err.response?.data?.message || 
                     err.message || 
                     'Erreur de connexion au serveur';
      setError(errorMsg);
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

 const handleDownload = async (id, originalName) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${API_URL}/documents/download/${id}`, 
      {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      }
    );
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', originalName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Erreur lors du téléchargement:', err);
    setError(err.response?.data?.message || 'Erreur lors du téléchargement');
  }
};

const handleDelete = async (id, originalName) => {
  // Validation de l'ID
  if (!id) {
    setError('ID du document manquant');
    return;
  }

  if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${originalName}"?`)) return;
  
  try {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/documents/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      setSuccess(`"${originalName}" a été supprimé avec succès!`);
      fetchDocuments(); // Rafraîchir la liste
    } else {
      setError(response.data.message || 'Erreur lors de la suppression');
    }
  } catch (err) {
    console.error('Erreur suppression:', err);
    setError(err.response?.data?.message || 'Erreur lors de la suppression');
  }
};

  return (
    <div className="documents-section">
      <h1>Documents</h1>
      
      <section className="mb-5">
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <div className="card p-3 mb-3">
          <div className="mb-3">
            <input 
              type="file" 
              id="file-upload"
              multiple
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="file-upload" className="btn btn-primary me-2">
              <FaUpload /> Sélectionner des fichiers
            </label>
            <span className="text-muted">
              {selectedFiles.length > 0 
                ? `${selectedFiles.length} fichier(s) sélectionné(s)` 
                : 'Aucun fichier sélectionné'}
            </span>
          </div>
          
          {selectedFiles.length > 0 && (
            <button 
              className="btn btn-success"
              onClick={handleUpload}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="spinner" /> Téléchargement...
                </>
              ) : (
                <>
                  <FaUpload /> Télécharger les fichiers
                </>
              )}
            </button>
          )}
        </div>
      </section>
      
      <section>
        <h2>Documents disponibles</h2>
        
        {isLoading && documents.length === 0 ? (
          <div className="text-center">
            <FaSpinner className="spinner" /> Chargement...
          </div>
        ) : documents.length === 0 ? (
          <div className="alert alert-info">Aucun document disponible</div>
        ) : (
          <div className="list-group">
            {documents.map((doc) => (
              <div key={doc.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div className="d-flex flex-column">
                  <span className="fw-bold">{doc.name}</span>
                  <small className="text-muted">
                    {new Date(doc.uploadedAt).toLocaleString()} - {doc.size}
                  </small>
                </div>
                <div>
                
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => {
                      console.log('Document à supprimer:', doc); // Pour debug
                      if (!doc.id) {
                        console.error('ID du document manquant', doc);
                        setError('ID du document introuvable');
                        return;
                      }
                      handleDelete(doc.id, doc.name);
                    }}
                    title="Supprimer"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default DocumentsSection;