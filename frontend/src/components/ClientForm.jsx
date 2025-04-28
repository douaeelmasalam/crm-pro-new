import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { clientAPI } from '../services/api';
import '../styles/ClientForm.css';

const ClientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    project: '',
    tracker: 'Fiche client',
    subject: 'FICHE CLIENT 2025',
    description: 'Modifier',
    status: '',
    priority: 'Normal',
    assignedTo: '',
    targetVersion: '',
    parentTask: '',
    startDate: null,
    dueDate: null,
    estimatedTime: 0,
    percentDone: 0,
    clientContactName: '',
    activity: '',
    clientEmail: '',
    clientPhone: '',
    siretNumber: '',
    address: '',
    creationDate: null,
    closureDate: null,
    firstBalanceDate: null,
    vatType: '',
    vatNumber: '',
    vatDate: null,
    urssafRegime: 'Indépendant',
    taxationRegime: 'Réel simplifié',
    cn2cDebt: 0,
    keyManageDebt: 0,
    legalStatus: 'SARL',
    generalObservations: '',
    paymentRejection: '',
    fiscalAccount: '',
    subscriptionClient: '',
    cn2cContract: '',
    cn2cContractDate: null,
    keymanageContract: '',
    keymanageContractDate: null
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchClient = async () => {
        try {
          setLoading(true);
          const clientData = await clientAPI.getClient(id);
          
          // Convert date strings to Date objects
          const processedData = {
            ...clientData,
            startDate: clientData.startDate ? new Date(clientData.startDate) : null,
            dueDate: clientData.dueDate ? new Date(clientData.dueDate) : null,
            creationDate: clientData.creationDate ? new Date(clientData.creationDate) : null,
            closureDate: clientData.closureDate ? new Date(clientData.closureDate) : null,
            firstBalanceDate: clientData.firstBalanceDate ? new Date(clientData.firstBalanceDate) : null,
            vatDate: clientData.vatDate ? new Date(clientData.vatDate) : null,
            cn2cContractDate: clientData.cn2cContractDate ? new Date(clientData.cn2cContractDate) : null,
            keymanageContractDate: clientData.keymanageContractDate ? new Date(clientData.keymanageContractDate) : null
          };
          
          setFormData(processedData);
          setLoading(false);
        } catch (err) {
          setError(err.message || 'Error loading client data');
          setLoading(false);
        }
      };
      
      fetchClient();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleDateChange = (date, name) => {
    setFormData(prevState => ({
      ...prevState,
      [name]: date
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (isEditMode) {
        await clientAPI.updateClient(id, formData);
      } else {
        await clientAPI.createClient(formData);
      }
      
      setLoading(false);
      navigate('/clients'); // Redirect to clients list
    } catch (err) {
      setError(err.message || 'Error saving client data');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="client-form-container">
      <h2>{isEditMode ? 'Modifier le client' : 'Créer un nouveau client'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="left-column">
            {/* Basic Information */}
            <div className="form-group">
              <label htmlFor="project">Projet*</label>
              <input
                type="text"
                id="project"
                name="project"
                value={formData.project}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="tracker">Tracker*</label>
              <input
                type="text"
                id="tracker"
                name="tracker"
                value={formData.tracker}
                onChange={handleChange}
                required
              />
            </div>

            {/* Client Information */}
            <div className="section-title">Informations Client</div>

            <div className="form-group">
              <label htmlFor="clientContactName">Nom contact client</label>
              <input
                type="text"
                id="clientContactName"
                name="clientContactName"
                value={formData.clientContactName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="activity">Activité</label>
              <input
                type="text"
                id="activity"
                name="activity"
                value={formData.activity}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="clientEmail">Email contact client*</label>
              <input
                type="email"
                id="clientEmail"
                name="clientEmail"
                value={formData.clientEmail}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="clientPhone">Téléphone contact client</label>
              <input
                type="tel"
                id="clientPhone"
                name="clientPhone"
                value={formData.clientPhone}
                onChange={handleChange}
                placeholder="À RENSEIGNER"
              />
            </div>

            <div className="form-group">
              <label htmlFor="siretNumber">N° SIRET*</label>
              <input
                type="text"
                id="siretNumber"
                name="siretNumber"
                value={formData.siretNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Adresse</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
              />
            </div>

            {/* Date Fields */}
            <div className="form-group">
              <label htmlFor="startDate">Date de début</label>
              <DatePicker
                id="startDate"
                name="startDate"
                selected={formData.startDate}
                onChange={(date) => handleDateChange(date, 'startDate')}
                dateFormat="dd/MM/yyyy"
                className="datepicker-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Date d'échéance</label>
              <DatePicker
                id="dueDate"
                name="dueDate"
                selected={formData.dueDate}
                onChange={(date) => handleDateChange(date, 'dueDate')}
                dateFormat="dd/MM/yyyy"
                className="datepicker-input"
              />
            </div>

          </div>

          {/* Other fields go here */}
          {/* ... */}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={() => navigate('/clients')}
            disabled={loading}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientForm;
