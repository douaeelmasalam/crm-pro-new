import React, { useState, useEffect } from 'react';
import { clientAPI } from '../services/api';
import '../styles/ClientsList.css';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const CombinedClientsList = () => {
  // États pour la liste des clients
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // État pour afficher/masquer le formulaire de création
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // État pour le formulaire
  const [formData, setFormData] = useState({
    project: '',
    tracker: 'Fiche client',
    subject: 'FICHE CLIENT 2025',
    status: '',
    priority: '',
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
    clientPhone: 'À RENSEIGNER',
    siretNumber: '',
    address: '',
    creationDate: null,
    closureDate: null,
    firstBalanceDate: null,
    vatType: 'CA3 Mensuelle',
    vatNumber: '',
    vatDate: null,
    urssafRegime: 'Indépendant',
    taxationRegime: 'Réel simplifié',
    cn2cDebt: 0,
    keyManageDebt: 0,
    legalStatus: 'SARL',
    generalObservations: '',
    paymentRejection: false,
    fiscalAccount: '',
    subscriptionClient: false,
    cn2cContract: false,
    cn2cContractDate: null,
    keymanageContract: false,
    keymanageContractDate: null
  });

  // Fonction pour récupérer la liste des clients
  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await clientAPI.getClients();
      setClients(data);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Error fetching clients');
      setLoading(false);
    }
  };

  // Effet pour charger les clients au chargement du composant
  useEffect(() => {
    fetchClients();
  }, []);

  // Fonctions de gestion du formulaire
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDateChange = (date, name) => {
    setFormData(prevState => ({
      ...prevState,
      [name]: date
    }));
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await clientAPI.createClient(formData);
      
      // Réinitialiser le formulaire
      setFormData({
        project: '',
        tracker: 'Fiche client',
        subject: 'FICHE CLIENT 2025',
        status: '',
        priority: '',
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
        clientPhone: 'À RENSEIGNER',
        siretNumber: '',
        address: '',
        creationDate: null,
        closureDate: null,
        firstBalanceDate: null,
        vatType: 'CA3 Mensuelle',
        vatNumber: '',
        vatDate: null,
        urssafRegime: 'Indépendant',
        taxationRegime: 'Réel simplifié',
        cn2cDebt: 0,
        keyManageDebt: 0,
        legalStatus: 'SARL',
        generalObservations: '',
        paymentRejection: false,
        fiscalAccount: '',
        subscriptionClient: false,
        cn2cContract: false,
        cn2cContractDate: null,
        keymanageContract: false,
        keymanageContractDate: null
      });
      
      // Masquer le formulaire
      setShowCreateForm(false);
      
      // Recharger la liste des clients
      fetchClients();
    } catch (err) {
      setError(err.message || 'Error saving client data');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour supprimer un client
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client?')) {
      try {
        await clientAPI.deleteClient(id);
        setClients(clients.filter(client => client._id !== id));
      } catch (err) {
        setError(err.message || 'Error deleting client');
      }
    }
  };

  // Affichage pendant le chargement
  if (loading && clients.length === 0) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="clients-list-container">
      <div className="clients-header">
        <h2>Liste des Clients</h2>
        <button 
          className="btn-add" 
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Annuler' : 'Ajouter un Client'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {clients.length === 0 ? (
        <p>Aucun client trouvé.</p>
      ) : (
        <div className="table-responsive">
          <table className="clients-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>SIRET</th>
                <th>Statut Juridique</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client._id}>
                  <td>{client.clientContactName || '—'}</td>
                  <td>{client.clientEmail}</td>
                  <td>{client.clientPhone || '—'}</td>
                  <td>{client.siretNumber}</td>
                  <td>{client.legalStatus}</td>
                  <td className="actions-cell">
                    <button className="btn-view">
                      Voir
                    </button>
                    <button className="btn-edit">
                      Modifier
                    </button>
                    <button 
                      onClick={() => handleDelete(client._id)} 
                      className="btn-delete"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Formulaire de création de client */}
      {showCreateForm && (
        <div className="client-form-container">
          <h3>Créer un nouveau client</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="left-column">
                {/* Informations Générales */}
                <div className="form-section">
                  <h3>Informations Générales</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="project">Project*</label>
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
                      <label htmlFor="parentTask">Tâche parente</label>
                      <input
                        type="text"
                        id="parentTask"
                        name="parentTask"
                        value={formData.parentTask}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="tracker">Tracker*</label>
                      <input
                        type="text"
                        id="tracker"
                        name="tracker"
                        value={formData.tracker}
                        onChange={handleChange}
                        readOnly
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="startDate">Début</label>
                      <DatePicker
                        id="startDate"
                        selected={formData.startDate}
                        onChange={(date) => handleDateChange(date, 'startDate')}
                        dateFormat="dd/MM/yyyy"
                        className="datepicker-input"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="subject">Sujet*</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      readOnly
                      required
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="status">Statut*</label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Sélectionner</option>
                        <option value="Nouveau">Nouveau</option>
                        <option value="En cours">En cours</option>
                        <option value="Clôturé">Clôturé</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="dueDate">Échéance</label>
                      <DatePicker
                        id="dueDate"
                        selected={formData.dueDate}
                        onChange={(date) => handleDateChange(date, 'dueDate')}
                        dateFormat="dd/MM/yyyy"
                        className="datepicker-input"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="priority">Priorité*</label>
                      <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Sélectionner</option>
                        <option value="Basse">Basse</option>
                        <option value="Normale">Normale</option>
                        <option value="Haute">Haute</option>
                        <option value="Urgente">Urgente</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="estimatedTime">Temps estimé (heures)</label>
                      <input
                        type="number"
                        id="estimatedTime"
                        name="estimatedTime"
                        value={formData.estimatedTime}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="assignedTo">Assigné à</label>
                      <input
                        type="text"
                        id="assignedTo"
                        name="assignedTo"
                        value={formData.assignedTo}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="percentDone">% réalisé</label>
                      <input
                        type="number"
                        id="percentDone"
                        name="percentDone"
                        value={formData.percentDone}
                        onChange={handleChange}
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="targetVersion">Version cible</label>
                    <input
                      type="text"
                      id="targetVersion"
                      name="targetVersion"
                      value={formData.targetVersion}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Informations Client */}
                <div className="form-section">
                  <h3>Informations Client</h3>
                  
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

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="creationDate">Date de création</label>
                      <DatePicker
                        id="creationDate"
                        selected={formData.creationDate}
                        onChange={(date) => handleDateChange(date, 'creationDate')}
                        dateFormat="dd/MM/yyyy"
                        className="datepicker-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="closureDate">Date de clôture</label>
                      <DatePicker
                        id="closureDate"
                        selected={formData.closureDate}
                        onChange={(date) => handleDateChange(date, 'closureDate')}
                        dateFormat="dd/MM/yyyy"
                        className="datepicker-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="firstBalanceDate">Date premier bilan</label>
                    <DatePicker
                      id="firstBalanceDate"
                      selected={formData.firstBalanceDate}
                      onChange={(date) => handleDateChange(date, 'firstBalanceDate')}
                      dateFormat="dd/MM/yyyy"
                      className="datepicker-input"
                    />
                  </div>
                </div>
              </div>

              <div className="right-column">
                {/* Fiscalité */}
                <div className="form-section">
                  <h3>Fiscalité</h3>
                  
                  <div className="form-group">
                    <label>Type de TVA</label>
                    <div className="radio-group">
                      <label>
                        <input
                          type="radio"
                          name="vatType"
                          value="CA3 Mensuelle"
                          checked={formData.vatType === 'CA3 Mensuelle'}
                          onChange={handleChange}
                        />
                        CA3 Mensuelle
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="vatType"
                          value="CA3 Trimestrielle"
                          checked={formData.vatType === 'CA3 Trimestrielle'}
                          onChange={handleChange}
                        />
                        CA3 Trimestrielle
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="vatType"
                          value="CA12 Annuelle"
                          checked={formData.vatType === 'CA12 Annuelle'}
                          onChange={handleChange}
                        />
                        CA12 Annuelle
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="vatType"
                          value="Franchise de taxe"
                          checked={formData.vatType === 'Franchise de taxe'}
                          onChange={handleChange}
                        />
                        Franchise de taxe
                      </label>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="vatNumber">Numéro de TVA</label>
                      <input
                        type="text"
                        id="vatNumber"
                        name="vatNumber"
                        value={formData.vatNumber}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="vatDate">Date de TVA</label>
                      <DatePicker
                        id="vatDate"
                        selected={formData.vatDate}
                        onChange={(date) => handleDateChange(date, 'vatDate')}
                        dateFormat="dd/MM/yyyy"
                        className="datepicker-input"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="urssafRegime">Régime URSSAF</label>
                      <select
                        id="urssafRegime"
                        name="urssafRegime"
                        value={formData.urssafRegime}
                        onChange={handleChange}
                      >
                        <option value="Indépendant">Indépendant</option>
                        <option value="Auto-entrepreneur">Auto-entrepreneur</option>
                        <option value="Portage salarial">Portage salarial</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="taxationRegime">Régime imposition</label>
                      <select
                        id="taxationRegime"
                        name="taxationRegime"
                        value={formData.taxationRegime}
                        onChange={handleChange}
                      >
                        <option value="Réel simplifié">Réel simplifié</option>
                        <option value="Réel normal">Réel normal</option>
                        <option value="Micro-fiscal">Micro-fiscal</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Données financières */}
                <div className="form-section">
                  <h3>Données financières</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="cn2cDebt">Dette CN2C (€)</label>
                      <input
                        type="number"
                        id="cn2cDebt"
                        name="cn2cDebt"
                        value={formData.cn2cDebt}
                        onChange={handleChange}
                        min="0"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="keyManageDebt">Dette Key Manage (€)</label>
                      <input
                        type="number"
                        id="keyManageDebt"
                        name="keyManageDebt"
                        value={formData.keyManageDebt}
                        onChange={handleChange}
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Informations juridiques */}
                <div className="form-section">
                  <h3>Informations juridiques</h3>
                  
                  <div className="form-group">
                    <label htmlFor="legalStatus">Statut juridique</label>
                    <select
                      id="legalStatus"
                      name="legalStatus"
                      value={formData.legalStatus}
                      onChange={handleChange}
                    >
                      <option value="SARL">SARL</option>
                      <option value="SAS">SAS</option>
                      <option value="SASU">SASU</option>
                      <option value="EI">Entreprise Individuelle</option>
                      <option value="EURL">EURL</option>
                      <option value="Auto-entrepreneur">Auto-entrepreneur</option>
                    </select>
                  </div>
                </div>

                {/* Observations générales */}
                <div className="form-section">
                  <h3>Observations générales</h3>
                  
                  <div className="form-group">
                    <textarea
                      id="generalObservations"
                      name="generalObservations"
                      value={formData.generalObservations}
                      onChange={handleChange}
                      rows="5"
                      placeholder="Saisissez vos observations ici..."
                    />
                  </div>
                </div>

                {/* Autres informations */}
                <div className="form-section">
                  <h3>Autres informations</h3>
                  
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="paymentRejection"
                        checked={formData.paymentRejection}
                        onChange={handleChange}
                      />
                      Rejet prélèvement
                    </label>
                  </div>

                  <div className="form-group">
                    <label htmlFor="fiscalAccount">Compte fiscal</label>
                    <input
                      type="text"
                      id="fiscalAccount"
                      name="fiscalAccount"
                      value={formData.fiscalAccount}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="subscriptionClient"
                        checked={formData.subscriptionClient}
                        onChange={handleChange}
                      />
                      Client abonnement
                    </label>
                  </div>

                  <div className="form-row">
                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          name="cn2cContract"
                          checked={formData.cn2cContract}
                          onChange={handleChange}
                        />
                        Contrat CN2C
                      </label>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="cn2cContractDate">Date contrat CN2C</label>
                      <DatePicker
                        id="cn2cContractDate"
                        selected={formData.cn2cContractDate}
                        onChange={(date) => handleDateChange(date, 'cn2cContractDate')}
                        dateFormat="dd/MM/yyyy"
                        className="datepicker-input"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          name="keymanageContract"
                          checked={formData.keymanageContract}
                          onChange={handleChange}
                        />
                        Contrat Keymanage
                      </label>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="keymanageContractDate">Date contrat Keymanage</label>
                      <DatePicker
                        id="keymanageContractDate"
                        selected={formData.keymanageContractDate}
                        onChange={(date) => handleDateChange(date, 'keymanageContractDate')}
                        dateFormat="dd/MM/yyyy"
                        className="datepicker-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setShowCreateForm(false)}
                disabled={loading}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CombinedClientsList;