import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = () => !!localStorage.getItem('adminData');
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

export default PrivateRoute;