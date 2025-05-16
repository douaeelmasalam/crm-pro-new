import { useState } from 'react';
import styles from '../styles/Login.module.css';// Import modifié pour le module CSS

function Login({ setIsLoggedIn, setUserRole, setMessage, message }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

// src/Pages/Login.js
// const handleLogin = async (e) => {
//   e.preventDefault();
//   try {
//     const response = await fetch('http://localhost:5000/api/auth/login', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ email, password })
//     });

//     if (response.ok) {
//       const data = await response.json();
//       setMessage(data.message);
//       setIsSuccess(true);
      
//       // Ajouter un délai de 2 secondes avant la redirection
//       setTimeout(() => {
//         setUserRole(data.role);
//         setIsLoggedIn(true);
//       }, 2000);
//     } else {
//       const errorText = await response.text();
//       setMessage(errorText);
//       setIsSuccess(false);
//     }
//   } catch (error) {
//     setMessage("Une erreur réseau est survenue");
//     setIsSuccess(false);
//   }
// };

const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      const data = await response.json();
      setMessage(data.message);
      setIsSuccess(true);

      // 🪵 DEBUG LOGS
      console.log('[LOGIN] Réponse du serveur :', data);
      console.log('[LOGIN] Token JWT reçu :', data.token);
      console.log('[LOGIN] Rôle utilisateur :', data.role);
      console.log('[LOGIN] ID utilisateur :', data.userId);
      console.log('[LOGIN] Email utilisateur :', data.email);

      // 💾 Stocker dans localStorage pour vérifier
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.role);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('userEmail', data.email);

      // 🪵 Vérification immédiate du contenu localStorage
      console.log('[DEBUG] Token en localStorage :', localStorage.getItem('token'));
      console.log('[DEBUG] Role en localStorage :', localStorage.getItem('userRole'));

      // 🔁 Pas de navigation automatique ici pendant le debug
      setTimeout(() => {
        setUserRole(data.role);
        setIsLoggedIn(true);
      }, 2000);

    } else {
      const errorText = await response.text();
      console.warn('[LOGIN] Échec :', errorText);
      setMessage(errorText);
      setIsSuccess(false);
    }
  } catch (error) {
    console.error('[LOGIN] Erreur réseau :', error);
    setMessage("Une erreur réseau est survenue");
    setIsSuccess(false);
  }
};



  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        {/* Section gauche (branding) */}
        <div className={styles.loginLeft}>
          <h1>MIACORP</h1>
          <p>SERVICES INFORMATIQUES</p>
        </div>

        {/* Section droite (formulaire) */}
        <div className={styles.loginRight}>
          <h2>Se connecter</h2>
          <form className={styles.loginForm} onSubmit={handleLogin}>
            <input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <input 
              type="password" 
              placeholder="Mot de passe" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <button type="submit">SE CONNECTER</button>
            
            {message && (
              <p className={isSuccess ? styles.successMessage : styles.errorMessage}>
                {message}
              </p>
            )}

            <div className={styles.forgotPassword}>
            <a href="/reset-password">Mot de passe oublié ?</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;