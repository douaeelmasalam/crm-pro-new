import React, { useState } from 'react';
import { FaChevronDown, FaChevronRight, FaStar, FaLock, FaCog, FaUser, FaSave, FaTimes } from 'react-icons/fa';
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
    dateCreation: new Date('2015-12-11'),
    adresseSiege: '8 CHE DES CARRIER 94310 ORLY',
    dateCloture: new Date('2023-12-31'),
    siret: '30943154500014',
    capitaleSocial: '1 000,00 €',
    inscriptionRM: 'cocc',
    
    // Informations juridiques
    siren: '',
    denomination: '',
    pays: '',
    codeAPEJuridique: '',
    dirigeant: '',
    dateCreationJuridique: null,
    activitePrincipale: '',
    
    // Informations sur le siège social
    siretSiege: '',
    codeAPESiege: '',
    adresseSiegeSocial: '',
    ville: '',
    codePostal: '',
    emailSiege: '',
    telFixeSiege: '',
    faxSiege: '',
    
    // Contact principal
    nomContactPrincipal: '',
    prenomContactPrincipal: '',
    qualiteContactPrincipal: '',
    fonctionContactPrincipal: '',
    servicesContactPrincipal: '',
    emailContactPrincipal: '',
    mobileContactPrincipal: '',
    telFixeContactPrincipal: '',
    faxContactPrincipal: '',
    
    // Informations client/fournisseur
    code: '',
    familleClient: '',
    sousFamille: '',
    
    // Comptabilité
    compteComptable: '',
    compteCollectif: '',
    familleComptabilite: '',
    
    // Informations par défaut
    civilite: '',
    tel: '',
    email: '',
    fax: '',
    
    // Terminalité (anciennement dans Informations complémentaires)
    famille: '',
    categorieTarif: '',
    tauxEscompte: '',
    remise1: '',
    tauxAcces: '',
    remise2: '',
    territorialite: ''
  });

  // État pour gérer les sections dépliables
  const [expandedSections, setExpandedSections] = useState({
    infoBase: true,
    infoDefault: true,
    infoJuridiques: false,
    infoSiegeSocial: false,
    contactPrincipal: false,
    infoClientFournisseur: false,
    comptabilite: false,
    infoComplementaires: true
  });

  // Fonction pour basculer l'état d'une section
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Fonction pour gérer les changements dans les champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
                        <label>Numéro RCS</label>
                        <input 
                          type="text" 
                          name="numeroRCS" 
                          value={formData.numeroRCS}
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
                        <label>Adresse Siège</label>
                        <input 
                          type="text" 
                          name="adresseSiege" 
                          value={formData.adresseSiege}
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
                        <label>Capitale social</label>
                        <input 
                          type="text" 
                          name="capitaleSocial" 
                          value={formData.capitaleSocial}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Inscription au RM</label>
                        <input 
                          type="text" 
                          name="inscriptionRM" 
                          value={formData.inscriptionRM}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Section Information par défaut */}
              <div className="section-container">
                <div 
                  className="section-header" 
                  onClick={() => toggleSection('infoDefault')}
                >
                  {expandedSections.infoDefault ? <FaChevronDown /> : <FaChevronRight />}
                  <span>Information par défaut</span>
                  <div className="section-actions">
                    <FaStar className="action-icon" />
                    <FaLock className="action-icon" />
                    <FaCog className="action-icon" />
                  </div>
                </div>
                
                {expandedSections.infoDefault && (
                  <div className="section-content">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Civilité</label>
                        <input 
                          type="text" 
                          name="civilite" 
                          value={formData.civilite}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input 
                          type="email" 
                          name="email" 
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Tél fixe</label>
                        <input 
                          type="text" 
                          name="tel" 
                          value={formData.tel}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Fax</label>
                        <input 
                          type="text" 
                          name="fax" 
                          value={formData.fax}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Section Information complémentaires */}
              <div className="section-container">
                <div 
                  className="section-header" 
                  onClick={() => toggleSection('infoComplementaires')}
                >
                  {expandedSections.infoComplementaires ? <FaChevronDown /> : <FaChevronRight />}
                  <span>Information complémentaires</span>
                  <div className="section-actions">
                    <FaStar className="action-icon" />
                    <FaLock className="action-icon" />
                    <FaCog className="action-icon" />
                  </div>
                </div>
                
                {expandedSections.infoComplementaires && (
                  <div className="section-content">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Famille</label>
                        <input 
                          type="text" 
                          name="famille" 
                          value={formData.famille}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Territorialité</label>
                        <input 
                          type="text" 
                          name="territorialite" 
                          value={formData.territorialite}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Catégorie tarif</label>
                        <input 
                          type="text" 
                          name="categorieTarif" 
                          value={formData.categorieTarif}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Taux d'escompte</label>
                        <input 
                          type="text" 
                          name="tauxEscompte" 
                          value={formData.tauxEscompte}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Remise 1</label>
                        <input 
                          type="text" 
                          name="remise1" 
                          value={formData.remise1}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Taux d'accès</label>
                        <input 
                          type="text" 
                          name="tauxAcces" 
                          value={formData.tauxAcces}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Remise 2</label>
                        <input 
                          type="text" 
                          name="remise2" 
                          value={formData.remise2}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Colonne droite */}
            <div className="column">
              {/* Section Informations juridiques */}
              <div className="section-container">
                <div 
                  className="section-header" 
                  onClick={() => toggleSection('infoJuridiques')}
                >
                  {expandedSections.infoJuridiques ? <FaChevronDown /> : <FaChevronRight />}
                  <span>Informations juridiques</span>
                  <div className="section-actions">
                    <FaStar className="action-icon" />
                    <FaLock className="action-icon" />
                    <FaCog className="action-icon" />
                  </div>
                </div>
                
                {expandedSections.infoJuridiques && (
                  <div className="section-content">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Siren</label>
                        <div className="input-with-search">
                          <input 
                            type="text" 
                            name="siren" 
                            value={formData.siren}
                            onChange={handleChange}
                          />
                          <button type="button" className="search-button">🔍</button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Dénomination</label>
                        <input 
                          type="text" 
                          name="denomination" 
                          value={formData.denomination}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Pays</label>
                        <input 
                          type="text" 
                          name="pays" 
                          value={formData.pays}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Dirigeant</label>
                        <input 
                          type="text" 
                          name="dirigeant" 
                          value={formData.dirigeant}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Date de création</label>
                        <DatePicker
                          selected={formData.dateCreationJuridique}
                          onChange={(date) => handleDateChange(date, 'dateCreationJuridique')}
                          dateFormat="dd-MM-yyyy"
                          className="datepicker-input"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Section Informations sur le siège social */}
              <div className="section-container">
                <div 
                  className="section-header" 
                  onClick={() => toggleSection('infoSiegeSocial')}
                >
                  {expandedSections.infoSiegeSocial ? <FaChevronDown /> : <FaChevronRight />}
                  <span>Informations sur le siège social</span>
                  <div className="section-actions">
                    <FaStar className="action-icon" />
                    <FaLock className="action-icon" />
                    <FaCog className="action-icon" />
                  </div>
                </div>
                
                {expandedSections.infoSiegeSocial && (
                  <div className="section-content">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Siret</label>
                        <input 
                          type="text" 
                          name="siretSiege" 
                          value={formData.siretSiege}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Adresse</label>
                        <input 
                          type="text" 
                          name="adresseSiegeSocial" 
                          value={formData.adresseSiegeSocial}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Code postal</label>
                        <input 
                          type="text" 
                          name="codePostal" 
                          value={formData.codePostal}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Ville</label>
                        <input 
                          type="text" 
                          name="ville" 
                          value={formData.ville}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Email</label>
                        <input 
                          type="email" 
                          name="emailSiege" 
                          value={formData.emailSiege}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Tél fixe</label>
                        <input 
                          type="text" 
                          name="telFixeSiege" 
                          value={formData.telFixeSiege}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Section Contact principal */}
              <div className="section-container">
                <div 
                  className="section-header" 
                  onClick={() => toggleSection('contactPrincipal')}
                >
                  {expandedSections.contactPrincipal ? <FaChevronDown /> : <FaChevronRight />}
                  <span>Contact principal</span>
                  <div className="section-actions">
                    <FaStar className="action-icon" />
                    <FaLock className="action-icon" />
                    <FaCog className="action-icon" />
                  </div>
                </div>
                
                {expandedSections.contactPrincipal && (
                  <div className="section-content">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Nom</label>
                        <input 
                          type="text" 
                          name="nomContactPrincipal" 
                          value={formData.nomContactPrincipal}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Prénom</label>
                        <input 
                          type="text" 
                          name="prenomContactPrincipal" 
                          value={formData.prenomContactPrincipal}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Fonction</label>
                        <input 
                          type="text" 
                          name="fonctionContactPrincipal" 
                          value={formData.fonctionContactPrincipal}
                          onChange={handleChange}
                        />
                      </div>
                       <div className="form-group">
                        <label>Email</label>
                        <input 
                          type="email" 
                          name="emailContactPrincipal" 
                          value={formData.emailContactPrincipal}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Mobile</label>
                        <input 
                          type="text" 
                          name="mobileContactPrincipal" 
                          value={formData.mobileContactPrincipal}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Tél fixe</label>
                        <input 
                          type="text" 
                          name="telFixeContactPrincipal" 
                          value={formData.telFixeContactPrincipal}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Section Informations client/fournisseur */}
              <div className="section-container">
                <div 
                  className="section-header" 
                  onClick={() => toggleSection('infoClientFournisseur')}
                >
                  {expandedSections.infoClientFournisseur ? <FaChevronDown /> : <FaChevronRight />}
                  <span>Informations client/fournisseur</span>
                  <div className="section-actions">
                    <FaStar className="action-icon" />
                    <FaLock className="action-icon" />
                    <FaCog className="action-icon" />
                  </div>
                </div>
                
                {expandedSections.infoClientFournisseur && (
                  <div className="section-content">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Code</label>
                        <input 
                          type="text" 
                          name="code" 
                          value={formData.code}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Famille</label>
                        <input 
                          type="text" 
                          name="familleClient" 
                          value={formData.familleClient}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Sous-famille</label>
                        <input 
                          type="text" 
                          name="sousFamille" 
                          value={formData.sousFamille}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Section Comptabilité */}
              <div className="section-container">
                <div 
                  className="section-header" 
                  onClick={() => toggleSection('comptabilite')}
                >
                  {expandedSections.comptabilite ? <FaChevronDown /> : <FaChevronRight />}
                  <span>Comptabilité</span>
                  <div className="section-actions">
                    <FaStar className="action-icon" />
                    <FaLock className="action-icon" />
                    <FaCog className="action-icon" />
                  </div>
                </div>
                
                {expandedSections.comptabilite && (
                  <div className="section-content">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Compte Comptable</label>
                        <input 
                          type="text" 
                          name="compteComptable" 
                          value={formData.compteComptable}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Compte Collectif</label>
                        <input 
                          type="text" 
                          name="compteCollectif" 
                          value={formData.compteCollectif}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Famille</label>
                        <input 
                          type="text" 
                          name="familleComptabilite" 
                          value={formData.familleComptabilite}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Barre des boutons pour enregistrer/annuler */}
          <div className="form-actions">
            <button type="submit" className="save-button">
              <FaSave /> Enregistrer
            </button>
            <button type="button" className="cancel-button" onClick={handleCancel}>
              <FaTimes /> Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;