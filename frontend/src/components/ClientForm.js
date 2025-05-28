import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronRight, FaStar, FaLock, FaCog, FaUser, FaSave, FaTimes, FaEye, FaPlus } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import '../styles/ClientForm.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Ajout d'axios pour les requêtes HTTP

const ClientForm = ({ clientId, onSave, onCancel }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Ajout des champs obligatoires manquants
    nom: '',
    email: '',
    
    formeJuridique: '',
    nomCommercial: '',
    numeroRCS: '',
    siret: '',
    codeAPE: '',
    nomPrenom: '',
    dateCreation: new Date(),
    manager: '',
    adresseSiege: '',
    capitaleSocial: '',
    dateCloture: new Date(),
    inscriptionRM: new Date(),
    
    ficheClient: {
      paie: false,
      datePremierBilan: new Date(),
      dateDebutMission: new Date(),
      dateCulture: new Date(),
      regimeTVA: 'Réel normal',
      regimeIS: 'Réel normal',
      jourTVA: new Date(),
      typeTVA: 'Débit',
      dateContrat: new Date(),
      dateContratCN2C: new Date(),
      compteFiscale: false
    },

    bilans: [],
    organismes: []
  });

  const [nouveauBilan, setNouveauBilan] = useState({
    regimeTVA: 'Réel normal',
    regimeIS: 'Réel normal',
    dateDebut: new Date(),
    dateFin: new Date(),
    dateEcheance: new Date(),
    totale: '',
    chiffreAffaire: '',
    resultat: ''
  });

  const [nouvelOrganisme, setNouvelOrganisme] = useState({
    nom: 'Impôt',
    siteWeb: '',
    login: '',
    motDePasse: '',
    commentaire: ''
  });

  const [showOrganismesList, setShowOrganismesList] = useState(false);
  const [showBilanList, setShowBilanList] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    infoBase: true,
    ficheClient: false,
    bilan: false,
    organismes: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const optionsRegimeTVA = ['Réel normal', 'Réel simplifié', 'Franchise en base'];
  const optionsRegimeIS = ['Réel normal', 'Réel simplifié', 'Micro-BIC', 'Micro-BNC'];
  const optionsTypeTVA = ['Débit', 'Encaissement'];
  const optionsOrganismes = ['Impôt', 'URSSAF', 'Net-entreprises'];

  useEffect(() => {
    if (clientId) {
      fetchClientData();
    }
  }, [clientId]);

  const parseDate = (dateString) => {
    if (!dateString) return new Date();
    try {
      return new Date(dateString);
    } catch (error) {
      console.error('Erreur lors de la conversion de la date:', error);
      return new Date();
    }
  };

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/clients/${clientId}`);
      const client = response.data;

      const formattedClient = {
        ...client,
        dateCreation: client.dateCreation ? parseDate(client.dateCreation) : new Date(),
        dateCloture: client.dateCloture ? parseDate(client.dateCloture) : new Date(),
        inscriptionRM: client.inscriptionRM ? parseDate(client.inscriptionRM) : new Date(),
        
        ficheClient: {
          paie: false,
          datePremierBilan: new Date(),
          dateDebutMission: new Date(),
          dateCulture: new Date(),
          regimeTVA: 'Réel normal',
          regimeIS: 'Réel normal',
          jourTVA: new Date(),
          typeTVA: 'Débit',
          dateContrat: new Date(),
          dateContratCN2C: new Date(),
          compteFiscale: false,
          ...(client.ficheClient || {})
        },
        
        bilans: client.bilans || [],
        organismes: client.organismes || []
      };

      if (client.ficheClient) {
        formattedClient.ficheClient = {
          ...formattedClient.ficheClient,
          datePremierBilan: client.ficheClient.datePremierBilan ? parseDate(client.ficheClient.datePremierBilan) : new Date(),
          dateDebutMission: client.ficheClient.dateDebutMission ? parseDate(client.ficheClient.dateDebutMission) : new Date(),
          dateCulture: client.ficheClient.dateCulture ? parseDate(client.ficheClient.dateCulture) : new Date(),
          jourTVA: client.ficheClient.jourTVA ? parseDate(client.ficheClient.jourTVA) : new Date(),
          dateContrat: client.ficheClient.dateContrat ? parseDate(client.ficheClient.dateContrat) : new Date(),
          dateContratCN2C: client.ficheClient.dateContratCN2C ? parseDate(client.ficheClient.dateContratCN2C) : new Date()
        };
      }

      setFormData(formattedClient);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement du client:', error);
      setError('Impossible de charger les données du client');
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCancel = () => {
    navigate('/clients');
  };

  const toggleBilanList = () => {
    setShowBilanList(prev => !prev);
  };

  const toggleOrganismesList = () => {
    setShowOrganismesList(prev => !prev);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFicheClientChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldName = name.replace('ficheClient.', '');
    setFormData(prev => ({
      ...prev,
      ficheClient: {
        ...prev.ficheClient,
        [fieldName]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleBilanChange = (e) => {
    const { name, value } = e.target;
    const fieldName = name.replace('bilan.', '');
    setNouveauBilan(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleOrganismeChange = (e) => {
    const { name, value } = e.target;
    const fieldName = name.replace('organisme.', '');
    setNouvelOrganisme(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleDateChange = (date, name) => {
    if (!date) return;
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };

  const handleFicheClientDateChange = (date, fieldName) => {
    if (!date) return;
    setFormData(prev => ({
      ...prev,
      ficheClient: {
        ...prev.ficheClient,
        [fieldName]: date
      }
    }));
  };

  const handleBilanDateChange = (date, fieldName) => {
    if (!date) return;
    setNouveauBilan(prev => ({
      ...prev,
      [fieldName]: date
    }));
  };

  const formatDateForBackend = (date) => {
    return date ? date.toISOString() : new Date().toISOString();
  };

const prepareFormDataForBackend = (data) => {
  console.log('Données reçues:', data); // Pour debug
  
  const preparedData = {
    // Champs obligatoires
    nom: data.nom,
    email: data.email,
    
    // Informations de base
    formeJuridique: data.formeJuridique || '',
    nomCommercial: data.nomCommercial || '',
    numeroRCS: data.numeroRCS || '',
    siret: data.siret || '',
    codeAPE: data.codeAPE || '',
    nomPrenom: data.nomPrenom || '',
    manager: data.manager || '',
    adresseSiege: data.adresseSiege || '',
    capitaleSocial: data.capitaleSocial || '',
    
    // Dates formatées
    dateCreation: formatDateForBackend(data.dateCreation),
    dateCloture: formatDateForBackend(data.dateCloture),
    inscriptionRM: formatDateForBackend(data.inscriptionRM),
    
    // Fiche client avec dates formatées
    ficheClient: {
      ...data.ficheClient,
      datePremierBilan: formatDateForBackend(data.ficheClient?.datePremierBilan),
      dateDebutMission: formatDateForBackend(data.ficheClient?.dateDebutMission),
      dateCulture: formatDateForBackend(data.ficheClient?.dateCulture),
      jourTVA: formatDateForBackend(data.ficheClient?.jourTVA),
      dateContrat: formatDateForBackend(data.ficheClient?.dateContrat),
      dateContratCN2C: formatDateForBackend(data.ficheClient?.dateContratCN2C)
    },
    
    // Bilans avec dates formatées
    bilans: data.bilans?.map(bilan => ({
      ...bilan,
      dateDebut: formatDateForBackend(bilan.dateDebut),
      dateFin: formatDateForBackend(bilan.dateFin),
      dateEcheance: formatDateForBackend(bilan.dateEcheance)
    })) || [],
    
    // Organismes
    organismes: data.organismes || []
  };
  
  console.log('Données préparées:', preparedData); // Pour debug
  return preparedData;
};

  const handleAddBilan = async () => {
    try {
      if (!nouveauBilan.totale || !nouveauBilan.resultat) {
        setError('Veuillez remplir tous les champs obligatoires du bilan');
        return;
      }

      if (clientId) {
        setLoading(true);
        await axios.post(`/api/clients/${clientId}/bilans`, nouveauBilan);
        await fetchClientData();
        setSuccessMessage('Bilan ajouté avec succès');
      } else {
        setFormData(prev => ({
          ...prev,
          bilans: [...prev.bilans, { ...nouveauBilan, _id: Date.now().toString() }]
        }));
      }

      setNouveauBilan({
        regimeTVA: 'Réel normal',
        regimeIS: 'Réel normal',
        dateDebut: new Date(),
        dateFin: new Date(),
        dateEcheance: new Date(),
        totale: '',
        chiffreAffaire: '',
        resultat: ''
      });
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout du bilan:', error);
      setError('Erreur lors de l\'ajout du bilan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrganisme = async () => {
    try {
      if (!nouvelOrganisme.nom) {
        setError('Veuillez spécifier un nom pour l\'organisme');
        return;
      }
      
      if (clientId) {
        await axios.post(`/api/clients/${clientId}/organismes`, nouvelOrganisme);
        await fetchClientData();
      } else {
        setFormData(prev => ({
          ...prev,
          organismes: [...prev.organismes, { ...nouvelOrganisme, _id: Date.now().toString() }]
        }));
      }
      
      setNouvelOrganisme({
        nom: 'Impôt',
        siteWeb: '',
        login: '',
        motDePasse: '',
        commentaire: ''
      });
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'organisme:', error);
      setError('Erreur lors de l\'ajout de l\'organisme');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFicheClient = async () => {
    try {
      if (clientId) {
        setLoading(true);
        await axios.put(`/api/clients/${clientId}/fiche-client`, formData.ficheClient);
        setSuccessMessage('Fiche client mise à jour avec succès');
      } else {
        setSuccessMessage('Fiche client prête (sera enregistrée avec le client)');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la fiche client:', error);
      setError('Erreur lors de la mise à jour de la fiche client');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vérifier si les champs obligatoires sont remplis
    if (!formData.nom || !formData.email) {
      setError('Le nom et l\'email du client sont obligatoires');
      return;
    }
    
    try {
      setLoading(true);
      const dataToSend = prepareFormDataForBackend(formData);

      if (clientId) {
        await axios.put(`/api/clients/${clientId}`, dataToSend);
        setSuccessMessage('Client mis à jour avec succès');
        if (onSave) onSave();
      } else {
        await axios.post('http://localhost:5000/api/clients', dataToSend)
        setSuccessMessage('Client créé avec succès');
        setTimeout(() => navigate('/clients'), 1000);
      }
    } catch (error) {
      console.error('Erreur détaillée:', error);
      setError(`Erreur lors de ${clientId ? 'la mise à jour' : 'la création'} du client: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };


return (
  <div className="client-form-container">
    <form onSubmit={handleSubmit}>
      {/* Section Informations de base */}
      <div className="section-container">
        <div 
          className="section-header" 
          onClick={() => toggleSection('infoBase')}
        >
          {expandedSections.infoBase ? <FaChevronDown /> : <FaChevronRight />}
          <span>Informations de base</span>
          <div className="section-actions">
            <FaStar className="action-icon" />
            <FaLock className="action-icon" />
            <FaCog className="action-icon" />
          </div>
        </div>
        
        {expandedSections.infoBase && (
          <div className="section-content">
            {/* Nouveaux champs obligatoires */}
            <div className="form-row">
              <div className="form-group">
                <label>Nom du client *</label>
                <input 
                  type="text" 
                  name="nom" 
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  className={formData.nom ? "" : "input-error"}
                />
                {!formData.nom && <span className="error-message">Le nom est obligatoire</span>}
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={formData.email ? "" : "input-error"}
                />
                {!formData.email && <span className="error-message">L'email est obligatoire</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Forme juridique</label>
                <input 
                  type="text" 
                  name="formeJuridique" 
                  value={formData.formeJuridique}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Nom commercial</label>
                <input 
                  type="text" 
                  name="nomCommercial" 
                  value={formData.nomCommercial}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Numéro RCS</label>
                <input 
                  type="text" 
                  name="numeroRCS" 
                  value={formData.numeroRCS}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>SIRET</label>
                <input 
                  type="text" 
                  name="siret" 
                  value={formData.siret}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Code APE</label>
                <input 
                  type="text" 
                  name="codeAPE" 
                  value={formData.codeAPE}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Nom & Prénom</label>
                <input 
                  type="text" 
                  name="nomPrenom" 
                  value={formData.nomPrenom}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Date de création</label>
                <DatePicker
                  selected={formData.dateCreation}
                  onChange={(date) => handleDateChange(date, 'dateCreation')}
                  dateFormat="dd-MM-yyyy"
                  className="datepicker-input"
                />
              </div>
              <div className="form-group">
                <label>Manager</label>
                <input 
                  type="text" 
                  name="manager" 
                  value={formData.manager}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Adresse siège</label>
                <input 
                  type="text" 
                  name="adresseSiege" 
                  value={formData.adresseSiege}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Capitale social</label>
                <input 
                  type="text" 
                  name="capitaleSocial" 
                  value={formData.capitaleSocial}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Date de clôture</label>
                <DatePicker
                  selected={formData.dateCloture}
                  onChange={(date) => handleDateChange(date, 'dateCloture')}
                  dateFormat="dd-MM-yyyy"
                  className="datepicker-input"
                />
              </div>
              <div className="form-group">
                <label>Inscription RM</label>
                <DatePicker
                  selected={formData.inscriptionRM}
                  onChange={(date) => handleDateChange(date, 'inscriptionRM')}
                  dateFormat="dd-MM-yyyy"
                  className="datepicker-input"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section Fiche client */}
      <div className="section-container">
        <div 
          className="section-header" 
          onClick={() => toggleSection('ficheClient')}
        >
          {expandedSections.ficheClient ? <FaChevronDown /> : <FaChevronRight />}
          <span>Fiche client</span>
          <div className="section-actions">
            <FaStar className="action-icon" />
            <FaLock className="action-icon" />
            <FaCog className="action-icon" />
          </div>
        </div>
        
        {expandedSections.ficheClient && (
          <div className="section-content">
            <div className="form-row">
              <div className="form-group checkbox-group">
                <label>
                  <input 
                    type="checkbox" 
                    name="ficheClient.paie" 
                    checked={formData.ficheClient.paie}
                    onChange={handleFicheClientChange}
                  />
                  Paie
                </label>
              </div>
              <div className="form-group">
                <label>Date premier bilan</label>
                <DatePicker
                  selected={formData.ficheClient.datePremierBilan}
                  onChange={(date) => handleFicheClientDateChange(date, 'datePremierBilan')}
                  dateFormat="dd-MM-yyyy"
                  className="datepicker-input"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Date début mission</label>
                <DatePicker
                  selected={formData.ficheClient.dateDebutMission}
                  onChange={(date) => handleFicheClientDateChange(date, 'dateDebutMission')}
                  dateFormat="dd-MM-yyyy"
                  className="datepicker-input"
                />
              </div>
              <div className="form-group">
                <label>Date culture</label>
                <DatePicker
                  selected={formData.ficheClient.dateCulture}
                  onChange={(date) => handleFicheClientDateChange(date, 'dateCulture')}
                  dateFormat="dd-MM-yyyy"
                  className="datepicker-input"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Régime TVA</label>
                <select 
                  name="ficheClient.regimeTVA" 
                  value={formData.ficheClient.regimeTVA}
                  onChange={handleFicheClientChange}
                >
                  {optionsRegimeTVA.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Régime IS</label>
                <select 
                  name="ficheClient.regimeIS" 
                  value={formData.ficheClient.regimeIS}
                  onChange={handleFicheClientChange}
                >
                  {optionsRegimeIS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Jour TVA</label>
                <DatePicker
                  selected={formData.ficheClient.jourTVA}
                  onChange={(date) => handleFicheClientDateChange(date, 'jourTVA')}
                  dateFormat="dd-MM-yyyy"
                  className="datepicker-input"
                />
              </div>
              <div className="form-group">
                <label>Type TVA</label>
                <select 
                  name="ficheClient.typeTVA" 
                  value={formData.ficheClient.typeTVA}
                  onChange={handleFicheClientChange}
                >
                  {optionsTypeTVA.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Date contrat</label>
                <DatePicker
                  selected={formData.ficheClient.dateContrat}
                  onChange={(date) => handleFicheClientDateChange(date, 'dateContrat')}
                  dateFormat="dd-MM-yyyy"
                  className="datepicker-input"
                />
              </div>
              <div className="form-group">
                <label>Date contrat CN2C</label>
                <DatePicker
                  selected={formData.ficheClient.dateContratCN2C}
                  onChange={(date) => handleFicheClientDateChange(date, 'dateContratCN2C')}
                  dateFormat="dd-MM-yyyy"
                  className="datepicker-input"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group checkbox-group">
                <label>
                  <input 
                    type="checkbox" 
                    name="ficheClient.compteFiscale" 
                    checked={formData.ficheClient.compteFiscale}
                    onChange={handleFicheClientChange}
                  />
                  Compte fiscale
                </label>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="button" className="btn-save" onClick={handleUpdateFicheClient} disabled={loading}>
                <FaSave /> Enregistrer la fiche
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Colonne droite */}
      <div className="form-columns">
        <div className="column">
          {/* Section Bilan */}
          <div className="section-container">
            <div 
              className="section-header" 
              onClick={() => toggleSection('bilan')}
            >
              {expandedSections.bilan ? <FaChevronDown /> : <FaChevronRight />}
              <span>Bilan</span>
              <div className="section-actions">
                <FaStar className="action-icon" />
                <FaLock className="action-icon" />
                <FaCog className="action-icon" />
              </div>
            </div>
            
            {expandedSections.bilan && (
              <div className="section-content">
                {!showBilanList ? (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Régime TVA</label>
                        <select 
                          name="bilan.regimeTVA" 
                          value={nouveauBilan.regimeTVA}
                          onChange={handleBilanChange}
                        >
                          {optionsRegimeTVA.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Régime IS</label>
                        <select 
                          name="bilan.regimeIS" 
                          value={nouveauBilan.regimeIS}
                          onChange={handleBilanChange}
                        >
                          {optionsRegimeIS.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Date de début</label>
                        <DatePicker
                          selected={nouveauBilan.dateDebut}
                          onChange={(date) => handleBilanDateChange(date, 'dateDebut')}
                          dateFormat="dd-MM-yyyy"
                          className="datepicker-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Date de fin</label>
                        <DatePicker
                          selected={nouveauBilan.dateFin}
                          onChange={(date) => handleBilanDateChange(date, 'dateFin')}
                          dateFormat="dd-MM-yyyy"
                          className="datepicker-input"
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Date d'échéance</label>
                        <DatePicker
                          selected={nouveauBilan.dateEcheance}
                          onChange={(date) => handleBilanDateChange(date, 'dateEcheance')}
                          dateFormat="dd-MM-yyyy"
                          className="datepicker-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Totale bilan</label>
                        <input 
                          type="text" 
                          name="bilan.totale" 
                          value={nouveauBilan.totale}
                          onChange={handleBilanChange}
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Chiffre d'affaire</label>
                        <input 
                          type="text" 
                          name="bilan.chiffreAffaire" 
                          value={nouveauBilan.chiffreAffaire}
                          onChange={handleBilanChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Résultat</label>
                        <input 
                          type="text" 
                          name="bilan.resultat" 
                          value={nouveauBilan.resultat}
                          onChange={handleBilanChange}
                        />
                      </div>
                    </div>
                    
                    <div className="form-actions">
                      <button type="button" className="btn-save" onClick={handleAddBilan} disabled={loading}>
                        <FaSave /> Enregistrer
                      </button>
                      <button type="button" className="btn-view" onClick={toggleBilanList}>
                        <FaEye /> Voir la liste
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="bilans-list">
                    <h3>Liste des bilans</h3>
                    {formData.bilans.length === 0 ? (
                      <p>Aucun bilan enregistré.</p>
                    ) : (
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Date de début</th>
                            <th>Date de fin</th>
                            <th>Régime TVA</th>
                            <th>Régime IS</th>
                            <th>Totale</th>
                            <th>Résultat</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.bilans.map((bilan) => (
                            <tr key={bilan._id}>
                              <td>{new Date(bilan.dateDebut).toLocaleDateString()}</td>
                              <td>{new Date(bilan.dateFin).toLocaleDateString()}</td>
                              <td>{bilan.regimeTVA}</td>
                              <td>{bilan.regimeIS}</td>
                              <td>{bilan.totale}</td>
                              <td>{bilan.resultat}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    <button type="button" className="btn-back" onClick={toggleBilanList}>
                      Retour au formulaire
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Section Organismes */}
          <div className="section-container">
            <div 
              className="section-header" 
              onClick={() => toggleSection('organismes')}
            >
              {expandedSections.organismes ? <FaChevronDown /> : <FaChevronRight />}
              <span>Organismes</span>
              <div className="section-actions">
                <FaStar className="action-icon" />
                <FaLock className="action-icon" />
                <FaCog className="action-icon" />
              </div>
            </div>
            
            {expandedSections.organismes && (
              <div className="section-content">
                {!showOrganismesList ? (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Nom</label>
                        <select 
                          name="organisme.nom" 
                          value={nouvelOrganisme.nom}
                          onChange={handleOrganismeChange}
                        >
                          {optionsOrganismes.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Site web</label>
                        <input 
                          type="text" 
                          name="organisme.siteWeb" 
                          value={nouvelOrganisme.siteWeb}
                          onChange={handleOrganismeChange}
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Login</label>
                        <input 
                          type="text" 
                          name="organisme.login" 
                          value={nouvelOrganisme.login}
                          onChange={handleOrganismeChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Mot de passe</label>
                        <input 
                          type="password" 
                          name="organisme.motDePasse" 
                          value={nouvelOrganisme.motDePasse}
                          onChange={handleOrganismeChange}
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group full-width">
                        <label>Commentaire</label>
                        <textarea 
                          name="organisme.commentaire" 
                          value={nouvelOrganisme.commentaire}
                          onChange={handleOrganismeChange}
                          rows="3"
                        />
                      </div>
                    </div>
                    
                    <div className="form-actions">
                      <button type="button" className="btn-save" onClick={handleAddOrganisme} disabled={loading}>
                        <FaSave /> Enregistrer
                      </button>
                      <button type="button" className="btn-view" onClick={toggleOrganismesList}>
                        <FaEye /> Voir la liste
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="organismes-list">
                    <h3>Liste des organismes</h3>
                    {formData.organismes.length === 0 ? (
                      <p>Aucun organisme enregistré.</p>
                    ) : (
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Nom</th>
                            <th>Site web</th>
                            <th>Login</th>
                            <th>Commentaire</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.organismes.map((org) => (
                            <tr key={org._id}>
                              <td>{org.nom}</td>
                              <td>{org.siteWeb}</td>
                              <td>{org.login}</td>
                              <td>{org.commentaire}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    <button type="button" className="btn-back" onClick={toggleOrganismesList}>
                      Retour au formulaire
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Boutons d'action principaux du formulaire */}
      
      <div className="form-footer">
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? (
            <span>Chargement...</span>
          ) : (
            <>
              <FaSave /> {clientId ? 'Mettre à jour' : 'Enregistrer'}
            </>
          )}
        </button>
        <button type="button" className="btn-cancel" onClick={onCancel || handleCancel}>
<FaTimes /> Annuler
</button>
      </div>
    </form>

    {/* Affichage des messages d'erreur et de succès */}
    {error && <div className="alert alert-error">{error}</div>}
    {successMessage && <div className="alert alert-success">{successMessage}</div>}
  </div>
);
};

export default ClientForm;