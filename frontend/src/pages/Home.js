import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="text-center mt-5">
      <h1>Welcome to Time Tracker</h1>
      <p>Track your website usage and productivity.</p>
      <Link className="btn btn-primary me-2" to="/login">Login</Link>
      <Link className="btn btn-success" to="/register">Register</Link>
    </div>
  );
}
