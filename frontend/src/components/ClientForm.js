import React, { useState } from 'react';
import { FaChevronDown, FaChevronRight, FaStar, FaLock, FaCog, FaUser, FaSave, FaTimes, FaEye, FaPlus } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import '../styles/ClientForm.css';

const ClientForm = ({ onSave, onCancel }) => {
  // État initial du formulaire
  const [formData, setFormData] = useState({
    // Informations de base
    formeJuridique: 'SASU',
    numeroRCS: '877 502 S11 R.C.S. Créteil',
    codeAPE: '8 CHE DES CARRIER 94310 ORLY',
    nomPrenom: 'Nasser MAXOUF',
    nomCommercial: 'Qui manage',
    manager: 'Président',
    dateCreation: new Date('2015-12-11'),
    adresseSiege: '8 CHE DES CARRIER 94310 ORLY',
    dateCloture: new Date('2023-12-31'),
    siret: '30943154500014',
    capitaleSocial: '1 000,00 €',
    inscriptionRM: new Date('2025-05-14'),

    // Fiche client
    paie: true,
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

    // Bilan
    regimeTVABilan: 'Réel normal',
    regimeISBilan: 'Réel normal',
    dateDebutBilan: new Date(),
    dateFinBilan: new Date(),
    dateEcheanceBilan: new Date(),
    totaleBilan: '',
    chiffredaffaireBilan: '',
    resultatBilan: '',

    // Organismes
    organisme: {
      nom: 'Impôt',
      siteWeb: '',
      login: '',
      motDePasse: '',
      commentaire: ''
    }
  });

  // Liste des organismes enregistrés
  const [organismes, setOrganismes] = useState([]);
  const [showOrganismesList, setShowOrganismesList] = useState(false);
  
  // Nouveaux états pour gérer l'affichage des listes bilan et fiche client
  const [showBilanList, setShowBilanList] = useState(false);
  const [showFicheClientList, setShowFicheClientList] = useState(false);
  
  // Liste des bilans et fiches client
  const [bilans, setBilans] = useState([]);
  const [fichesClient, setFichesClient] = useState([]);

  // État pour gérer les sections dépliables
  const [expandedSections, setExpandedSections] = useState({
    infoBase: true,
    ficheClient: false,
    bilan: false,
    organismes: false
  });

  // Options pour les champs select
  const optionsRegimeTVA = ['Réel normal', 'Réel simplifié', 'Franchise en base'];
  const optionsRegimeIS = ['Réel normal', 'Réel simplifié', 'Micro-BIC', 'Micro-BNC'];
  const optionsTypeTVA = ['Débit', 'Encaissement'];
  const optionsOrganismes = ['Impôt', 'URSSAF', 'Net-entreprises'];

  // Fonction pour basculer l'état d'une section
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Fonction pour gérer les changements dans les champs du formulaire
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('organisme.')) {
      const organismeField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        organisme: {
          ...prev.organisme,
          [organismeField]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Fonction pour gérer les changements de date
  const handleDateChange = (date, name) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };

  // Fonction pour soumettre le formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    } else {
      console.log("Formulaire soumis:", formData);
    }
  };

  // Fonction pour annuler et fermer le formulaire
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      console.log("Formulaire annulé");
    }
  };

  // Fonction pour ajouter un organisme à la liste
  const handleAddOrganisme = () => {
    setOrganismes(prev => [...prev, { ...formData.organisme, id: Date.now() }]);
    setFormData(prev => ({
      ...prev,
      organisme: {
        nom: 'Impôt',
        siteWeb: '',
        login: '',
        motDePasse: '',
        commentaire: ''
      }
    }));
  };

  // Fonction pour basculer l'affichage de la liste des organismes
  const toggleOrganismesList = () => {
    setShowOrganismesList(prev => !prev);
  };
  
  // Fonction pour basculer l'affichage de la liste des bilans
  const toggleBilanList = () => {
    setShowBilanList(prev => !prev);
  };
  
  // Fonction pour basculer l'affichage de la liste des fiches client
  const toggleFicheClientList = () => {
    setShowFicheClientList(prev => !prev);
  };
  
  // Fonction pour ajouter un bilan
  const handleAddBilan = () => {
    const newBilan = {
      id: Date.now(),
      regimeTVA: formData.regimeTVABilan,
      regimeIS: formData.regimeISBilan,
      dateDebut: formData.dateDebutBilan,
      dateFin: formData.dateFinBilan,
      dateEcheance: formData.dateEcheanceBilan,
      totale: formData.totaleBilan,
      catit: formData.catitBilan,
      resultat: formData.resultatBilan
    };
    setBilans(prev => [...prev, newBilan]);
  };
  
  // Fonction pour ajouter une fiche client
  const handleAddFicheClient = () => {
    const newFicheClient = {
      id: Date.now(),
      paie: formData.paie,
      datePremierBilan: formData.datePremierBilan,
      dateDebutMission: formData.dateDebutMission,
      dateCulture: formData.dateCulture,
      regimeTVA: formData.regimeTVA,
      regimeIS: formData.regimeIS,
      jourTVA: formData.jourTVA,
      typeTVA: formData.typeTVA,
      dateContrat: formData.dateContrat,
      dateContratCN2C: formData.dateContratCN2C,
      compteFiscale: formData.compteFiscale
    };
    setFichesClient(prev => [...prev, newFicheClient]);
  };

  // Fonction pour basculer les valeurs booléennes
  const toggleBooleanField = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  return (
    <div className="client-container">
      <div className="client-header">
        <div className="client-header-info">
          <div className="client-icon">
            <FaUser />
          </div>
          <div className="client-name">Boucherie Mouad 065637</div>
        </div>
      </div>

      <div className="client-content">
        <form onSubmit={handleSubmit}>
          <div className="form-layout">
            {/* Colonne gauche */}
            <div className="column">
              {/* Section Informations de base */}
              <div className="section-container">
                <div 
                  className="section-header" 
                  onClick={() => toggleSection('infoBase')}
                >
                  {expandedSections.infoBase ? <FaChevronDown /> : <FaChevronRight />}
                  <span>Information de base</span>
                  <div className="section-actions">
                    <FaStar className="action-icon" />
                    <FaLock className="action-icon" />
                    <FaCog className="action-icon" />
                  </div>
                </div>
                
                {expandedSections.infoBase && (
                  <div className="section-content">
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
                        <label>Siret</label>
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
                        <label>Nom prénom</label>
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
                        <label>Adresse Siège</label>
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
                        <label>Inscription au RM</label>
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
                    {!showFicheClientList ? (
                      <>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Paie</label>
                            <div className="radio-boolean">
                              <label className={`radio-button ${formData.paie === true ? 'selected' : ''}`}>
                                <input
                                  type="radio"
                                  name="paie"
                                  value="true"
                                  checked={formData.paie === true}
                                  onChange={() => toggleBooleanField('paie', true)}
                                />
                                Oui
                              </label>
                              <label className={`radio-button ${formData.paie === false ? 'selected' : ''}`}>
                                <input
                                  type="radio"
                                  name="paie"
                                  value="false"
                                  checked={formData.paie === false}
                                  onChange={() => toggleBooleanField('paie', false)}
                                />
                                Non
                              </label>
                            </div>
                          </div>
                          <div className="form-group">
                            <label>Date de 1er bilan</label>
                            <DatePicker
                              selected={formData.datePremierBilan}
                              onChange={(date) => handleDateChange(date, 'datePremierBilan')}
                              dateFormat="dd-MM-yyyy"
                              className="datepicker-input"
                            />
                          </div>
                        </div>
                        
                        <div className="form-row">
                          <div className="form-group">
                            <label>Date début de mission</label>
                            <DatePicker
                              selected={formData.dateDebutMission}
                              onChange={(date) => handleDateChange(date, 'dateDebutMission')}
                              dateFormat="dd-MM-yyyy"
                              className="datepicker-input"
                            />
                          </div>
                          <div className="form-group">
                            <label>Date de culture</label>
                            <DatePicker
                              selected={formData.dateCulture}
                              onChange={(date) => handleDateChange(date, 'dateCulture')}
                              dateFormat="dd-MM-yyyy"
                              className="datepicker-input"
                            />
                          </div>
                        </div>
                        
                        <div className="form-row">
                          <div className="form-group">
                            <label>Régime TVA</label>
                            <select 
                              name="regimeTVA" 
                              value={formData.regimeTVA}
                              onChange={handleChange}
                            >
                              {optionsRegimeTVA.map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Régime IS</label>
                            <select 
                              name="regimeIS" 
                              value={formData.regimeIS}
                              onChange={handleChange}
                            >
                              {optionsRegimeIS.map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        <div className="form-row">
                          <div className="form-group">
                            <label>Jour de TVA</label>
                            <DatePicker
                              selected={formData.jourTVA}
                              onChange={(date) => handleDateChange(date, 'jourTVA')}
                              dateFormat="dd-MM"
                              className="datepicker-input"
                            />
                          </div>
                          <div className="form-group">
                            <label>Type de TVA</label>
                            <select 
                              name="typeTVA" 
                              value={formData.typeTVA}
                              onChange={handleChange}
                            >
                              {optionsTypeTVA.map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        <div className="form-row">
                          <div className="form-group">
                            <label>Date de contrat</label>
                            <DatePicker
                              selected={formData.dateContrat}
                              onChange={(date) => handleDateChange(date, 'dateContrat')}
                              dateFormat="dd-MM-yyyy"
                              className="datepicker-input"
                            />
                          </div>
                          <div className="form-group">
                            <label>Date de contrat CN2C</label>
                            <DatePicker
                              selected={formData.dateContratCN2C}
                              onChange={(date) => handleDateChange(date, 'dateContratCN2C')}
                              dateFormat="dd-MM-yyyy"
                              className="datepicker-input"
                            />
                          </div>
                        </div>
                        
                        <div className="form-group">
                          <label>Compte fiscale</label>
                          <div className="radio-boolean">
                            <label className={`radio-button ${formData.compteFiscale === true ? 'selected' : ''}`}>
                              <input 
                                type="radio" 
                                name="compteFiscale" 
                                value="true" 
                                checked={formData.compteFiscale === true}
                                onChange={() => toggleBooleanField('compteFiscale', true)}
                              />
                              Oui
                            </label>
                            <label className={`radio-button ${formData.compteFiscale === false ? 'selected' : ''}`}>
                              <input 
                                type="radio" 
                                name="compteFiscale" 
                                value="false" 
                                checked={formData.compteFiscale === false}
                                onChange={() => toggleBooleanField('compteFiscale', false)}
                              />
                              Non
                            </label>
                          </div>
                        </div>

                        <div className="form-actions">
                          <button type="button" className="btn-save" onClick={handleAddFicheClient}>
                            <FaSave /> Enregistrer
                          </button>
                          <button type="button" className="btn-view" onClick={toggleFicheClientList}>
                            <FaEye /> Voir la liste
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="fiches-client-list">
                        <h3>Liste des fiches client</h3>
                        {fichesClient.length === 0 ? (
                          <p>Aucune fiche client enregistrée.</p>
                        ) : (
                          <table className="table">
                            <thead>
                              <tr>
                                <th>Paie</th>
                                <th>Régime TVA</th>
                                <th>Régime IS</th>
                                <th>Type TVA</th>
                              </tr>
                            </thead>
                            <tbody>
                              {fichesClient.map((fiche) => (
                                <tr key={fiche.id}>
                                  <td>{fiche.paie ? 'Oui' : 'Non'}</td>
                                  <td>{fiche.regimeTVA}</td>
                                  <td>{fiche.regimeIS}</td>
                                  <td>{fiche.typeTVA}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                        <button type="button" className="btn-back" onClick={toggleFicheClientList}>
                          Retour au formulaire
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Colonne droite */}
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
                              name="regimeTVABilan" 
                              value={formData.regimeTVABilan}
                              onChange={handleChange}
                            >
                              {optionsRegimeTVA.map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Régime IS</label>
                            <select 
                              name="regimeISBilan" 
                              value={formData.regimeISBilan}
                              onChange={handleChange}
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
                              selected={formData.dateDebutBilan}
                              onChange={(date) => handleDateChange(date, 'dateDebutBilan')}
                              dateFormat="dd-MM-yyyy"
                              className="datepicker-input"
                            />
                          </div>
                          <div className="form-group">
                            <label>Date de fin</label>
                            <DatePicker
                              selected={formData.dateFinBilan}
                              onChange={(date) => handleDateChange(date, 'dateFinBilan')}
                              dateFormat="dd-MM-yyyy"
                              className="datepicker-input"
                            />
                          </div>
                        </div>
                        
                        <div className="form-row">
                          <div className="form-group">
                            <label>Date d'échéance</label>
                            <DatePicker
                              selected={formData.dateEcheanceBilan}
                              onChange={(date) => handleDateChange(date, 'dateEcheanceBilan')}
                              dateFormat="dd-MM-yyyy"
                              className="datepicker-input"
                            />
                          </div>
                          <div className="form-group">
                            <label>Totale bilan</label>
                            <input 
                              type="text" 
                              name="totaleBilan" 
                              value={formData.totaleBilan}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        
                        <div className="form-row">
                          <div className="form-group">
                            <label>chiffre d'affaire Bilan </label>
                            <input 
                              type="text" 
                              name="catitBilan" 
                              value={formData.catitBilan}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="form-group">
                            <label>Résultat</label>
                            <input 
                              type="text" 
                              name="resultatBilan" 
                              value={formData.resultatBilan}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        
                        <div className="form-actions">
                          <button type="button" className="btn-save" onClick={handleAddBilan}>
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
                        {bilans.length === 0 ? (
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
                              {bilans.map((bilan) => (
                                <tr key={bilan.id}>
                                  <td>{bilan.dateDebut?.toLocaleDateString()}</td>
                                  <td>{bilan.dateFin?.toLocaleDateString()}</td>
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
                              value={formData.organisme.nom}
                              onChange={handleChange}
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
                              value={formData.organisme.siteWeb}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        
                        <div className="form-row">
                          <div className="form-group">
                            <label>Login</label>
                            <input 
                              type="text" 
                              name="organisme.login" 
                              value={formData.organisme.login}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="form-group">
                            <label>Mot de passe</label>
                            <input 
                              type="password" 
                              name="organisme.motDePasse" 
                              value={formData.organisme.motDePasse}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        
                        <div className="form-row">
                          <div className="form-group full-width">
                            <label>Commentaire</label>
                            <textarea 
                              name="organisme.commentaire" 
                              value={formData.organisme.commentaire}
                              onChange={handleChange}
                              rows="3"
                            />
                          </div>
                        </div>
                        
                        <div className="form-actions">
                          <button type="button" className="btn-save" onClick={handleAddOrganisme}>
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
                        {organismes.length === 0 ? (
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
                              {organismes.map((org) => (
                                <tr key={org.id}>
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
          
        </form>
      </div>
    </div>
  );
};

export default ClientForm;