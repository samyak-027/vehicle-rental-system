import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await API.get('/admin/check-auth');
        console.log(response.data);
        if (!response.data.isAuthenticated) {
          navigate('/login', { replace: true });
        }
      } catch (err) {
        navigate('/login', { replace: true });
      }
    };
    checkAuth();
  }, [navigate]);

  return children;
}