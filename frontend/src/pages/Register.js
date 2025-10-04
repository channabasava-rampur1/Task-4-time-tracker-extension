import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await api.post('/auth/register', { email, password });
      alert('Registered! Please login.');
      navigate('/login');
    } catch(err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="row justify-content-center mt-5">
      <div className="col-md-6">
        <h2>Register</h2>
        <input className="form-control mb-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" className="form-control mb-2" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="btn btn-success w-100" onClick={handleRegister}>Register</button>
      </div>
    </div>
  );
}
