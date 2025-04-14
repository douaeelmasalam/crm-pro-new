import { useState } from 'react';
// Retirez l'import du CSS s'il n'existe pas encore
// import '../styles/Login.css';

function Login({ setIsLoggedIn, setUserRole, setMessage, message }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    

    if (response.ok) {
        const data = await response.json(); // Parse JSON response
        setMessage(data.message);
        setUserRole(data.role); // Store the user role
        setIsLoggedIn(true);
        alert('Login successful!');
    } else {
        const errorText = await response.text();
        setMessage(errorText);
        alert(`Login failed: ${errorText}`);
    }
};

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <input 
          placeholder="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        /><br />
        <input 
          type="password" 
          placeholder="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        /><br />
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Login;