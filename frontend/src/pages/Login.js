import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch(err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="row justify-content-center mt-5">
      <div className="col-md-6">
        <h2>Login</h2>
        <input className="form-control mb-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" className="form-control mb-2" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="btn btn-primary w-100" onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}
