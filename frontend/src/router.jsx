import Layout from '../layout/layout.jsx'
import Login from '../pages/login.jsx'
import Signup from '../pages/signup.jsx'
import Interview from '../pages/interview.jsx'
import { createRoutesFromElements, RouterProvider, Route } from 'react-router-dom'
import { createBrowserRouter } from 'react-router-dom'
import Home from '../pages/home.jsx'
import Feedback from '../pages/feedback.jsx'
import Ats from '../pages/ats.jsx'
import Profile from '../pages/profile.jsx'
import App from './App.jsx';
import ProtectedRoute from '../components/protectedroutes.jsx';
const Router = createBrowserRouter(
  createRoutesFromElements(
    // WRAP EVERYTHING INSIDE APP
    <Route path="/" element={<App />}>
      
      {/* Public Routes */}
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<Signup />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
           <Route index element={<Home />} />
           <Route path="interview" element={<Interview />} />
           <Route path="profile" element={<Profile />} />
           <Route path="feedback" element={<Feedback />} />
           <Route path="ats" element={<Ats />} />
           {/* ... other protected pages */}
        </Route>
      </Route>

    </Route>
  )
);

export default Router;