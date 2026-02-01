import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { checkAuth } from '../redux/authslice';
import react from 'react';
function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if cookie exists as soon as app loads
    dispatch(checkAuth());
  }, [dispatch]);

  // <Outlet /> renders whatever child route is active (Login, Home, Profile, etc.)
  return <Outlet />;
}

export default App;