import { useState } from 'react';
import styles from '../styles/Login.module.css';

function Login({ setIsLoggedIn, setUserRole, setMessage, message, setUserPermissions }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setIsSuccess(true);

        // 🪵 DEBUG LOGS
        console.log('[LOGIN] Réponse du serveur :', data);
        console.log('[LOGIN] Token JWT reçu :', data.token);
        console.log('[LOGIN] Rôle utilisateur :', data.role);
        console.log('[LOGIN] Permissions utilisateur :', data.user?.permissions);

        //  Stocker toutes les informations nécessaires
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userEmail', data.email);
        
        // Stocker les permissions et sections autorisées
        if (data.user?.permissions) {
          localStorage.setItem('userPermissions', JSON.stringify(data.user.permissions));
          localStorage.setItem('userSections', JSON.stringify(data.user.permissions.sections));
        }

        // Stocker les informations utilisateur complètes
        localStorage.setItem('userInfo', JSON.stringify({
          id: data.userId,
          email: data.email,
          role: data.role,
          firstName: data.user?.firstName,
          lastName: data.user?.lastName
        }));

        // 🪵 Vérification du contenu localStorage
        console.log('[DEBUG] Token en localStorage :', localStorage.getItem('token'));
        console.log('[DEBUG] Role en localStorage :', localStorage.getItem('userRole'));
        console.log('[DEBUG] Permissions en localStorage :', localStorage.getItem('userPermissions'));
        console.log('[DEBUG] Sections autorisées :', localStorage.getItem('userSections'));

        // Définir les états dans App.js avec un délai pour l'UX
        setTimeout(() => {
    setUserRole(data.role);
    if (setUserPermissions && data.user?.permissions) {
      setUserPermissions(data.user.permissions);
    }
    setIsLoggedIn(true);
    setIsLoading(false);
    window.location.href = '/dashboard'; // Redirection explicite
  }, 1000);


      } else {
        console.warn('[LOGIN] Échec :', data.message);
        setMessage(data.message || 'Erreur de connexion');
        setIsSuccess(false);
        setIsLoading(false);
        
        // Nettoyer le localStorage en cas d'erreur
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPermissions');
        localStorage.removeItem('userSections');
        localStorage.removeItem('userInfo');
      }
    } catch (error) {
      console.error('[LOGIN] Erreur réseau :', error);
      setMessage("Une erreur réseau est survenue. Vérifiez votre connexion.");
      setIsSuccess(false);
      setIsLoading(false);
      
      // Nettoyer le localStorage en cas d'erreur
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userPermissions');
      localStorage.removeItem('userSections');
      localStorage.removeItem('userInfo');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        {/* Section gauche (branding) */}
        <div className={styles.loginLeft}>
          <h1>CRM MIACORP</h1>
          <p>SERVICES INFORMATIQUES</p>
          <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
            <p> Authentification sécurisée</p>
            <p> Multi-utilisateurs</p>
            <p> Dashboard personnalisé</p>
          </div>
        </div>

        {/* Section droite (formulaire) */}
        <div className={styles.loginRight}>
          <h2>Se connecter</h2>
          
          {/* Indicateur de chargement */}
          {isLoading && (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              background: '#e3f2fd',
              borderRadius: '5px',
              marginBottom: '20px'
            }}>
            </div>
          )}

          <form className={styles.loginForm} onSubmit={handleLogin}>
            <input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              disabled={isLoading}
            />
            <input 
              type="password" 
              placeholder="Mot de passe" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading}
              style={{ 
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'CONNEXION...' : 'SE CONNECTER'}
            </button>
            
            {message && (
              <div className={isSuccess ? styles.successMessage : styles.errorMessage}>
                {isSuccess && ' '}
                {!isSuccess && ' '}
                {message}
                {isSuccess && (
                  <div style={{ fontSize: '12px', marginTop: '5px' }}>
                    Redirection en cours...
                  </div>
                )}
              </div>
            )}

       
            
            {/* Informations de test */}
            <div style={{
              marginTop: '20px',
              padding: '15px',
              background: '#f8f9fa',
              borderRadius: '5px',
              fontSize: '12px',
              color: '#666'
            }}>
              <strong></strong>
              <div> </div>
              <div> </div>
        
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;