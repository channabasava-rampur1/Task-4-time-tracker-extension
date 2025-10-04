import { useEffect, useState } from 'react';
import { api } from '../api';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Dashboard() {
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchUsage(); }, []);

  const fetchUsage = async () => {
    try {
      const res = await api.get('/usage');
      
      // Aggregate usage by domain
      const agg = {};
      res.data.forEach(u => {
        if (!agg[u.domain]) agg[u.domain] = { seconds: 0, category: u.category || 'neutral' };
        agg[u.domain].seconds += u.seconds;
      });
      const combinedUsage = Object.entries(agg).map(([domain, val]) => ({
        domain,
        seconds: val.seconds,
        category: val.category
      }));
      setUsage(combinedUsage);
      setLoading(false);
    } catch(err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) return <p className="loading-text">Loading...</p>;

  // ----- Chart 1: Usage per domain -----
  const colorPalette = ['#4e79a7','#f28e2c','#e15759','#76b7b2','#59a14f','#edc949','#af7aa1','#ff9da7','#9c755f','#bab0ac'];
  const domainLabels = usage.map(u => u.domain);
  const domainData = {
    labels: domainLabels,
    datasets: [{
      data: usage.map(u => u.seconds),
      backgroundColor: usage.map((_, idx) => colorPalette[idx % colorPalette.length]),
      borderColor: '#fff',
      borderWidth: 2
    }]
  };
  const domainOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 20, padding: 15, font: { size: 14 } } },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const total = ctx.dataset.data.reduce((a,b) => a+b, 0);
            const value = ctx.raw;
            const percent = ((value / total) * 100).toFixed(1);
            return `${ctx.label}: ${value}s (${percent}%)`;
          }
        }
      }
    }
  };

  // ----- Chart 2: Usage by category -----
  const categoryTotals = usage.reduce((acc, u) => {
    acc[u.category] = (acc[u.category] || 0) + u.seconds;
    return acc;
  }, {});
  const categoryLabels = Object.keys(categoryTotals);
  const categoryData = {
    labels: categoryLabels,
    datasets: [{
      label: 'Time spent (seconds)',
      data: Object.values(categoryTotals),
      backgroundColor: categoryLabels.map(cat => {
        if(cat==='productive') return 'green';
        if(cat==='unproductive') return 'red';
        return 'gray';
      })
    }]
  };
  const categoryOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: { legend: { position: 'bottom' } }
  };

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>

      <h4>Website Usage</h4>
      {usage.length === 0 ? <p>No usage data.</p> : <div className="chart-wrapper"><Pie data={domainData} options={domainOptions} /></div>}

      <h4>Category Breakdown</h4>
      {usage.length === 0 ? <p>No usage data.</p> : <div className="chart-wrapper"><Bar data={categoryData} options={categoryOptions} /></div>}
    </div>
  );
}
