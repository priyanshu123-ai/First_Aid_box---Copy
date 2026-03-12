import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Register from './components/Register'
import Login from './components/Login'
import Home from "./Pages/Home"
import FirstAid from './Pages/first_Aid'
import Profile from './Pages/Profile'
import Emergency from './Pages/Emergency'
import Navbar from './Pages/Navbar'
import  Hospital  from './Pages/Hospital'
import EmergencyChatbot from './Pages/ChatBot'
import HeartMonitor from './Pages/HeartRate'
import HeartRateChecker from './Pages/HeartRate'
import WatchBluetoothConnect from './Pages/Watch'
import ProfileView from './Pages/ProfileView'
import HealthWallet from './Pages/HealthWallet'
import { requestFirebaseToken, onMessageListener } from './lib/firebase'
import { toast } from 'react-toastify'
import { useContext, useEffect } from 'react'
import { AuthContext } from './context/AuthContext'


const App = () => {
  const location = useLocation();
  const isProfileView = location.pathname.startsWith('/profile-view');
  const { authUser } = useContext(AuthContext) || {};

  useEffect(() => {
    // Request FCM Token
    const setupFirebase = async () => {
      // Use authUser email if available to link token to profile
      const email = authUser?.email || localStorage.getItem("userEmail");
      if (email) {
         await requestFirebaseToken(email);
      } else {
         await requestFirebaseToken(); // Just request permission without saving to DB yet
      }
    };
    
    setupFirebase();

    // Listen for foreground push notifications
    onMessageListener()
      .then((payload) => {
        console.log("Foreground push notification received:", payload);
        toast.info(`🚨 ${payload.notification.title}: ${payload.notification.body}`, {
           position: "top-center",
           autoClose: 10000,
        });
      })
      .catch((err) => console.log('Failed to listen for messages: ', err));
  }, [authUser]);

  return (
    <div>
      {!isProfileView && <Navbar />}
      {!isProfileView && <EmergencyChatbot />}
      <Routes>
        
        <Route path='/' element={<Home />}/>
        <Route path='/register' element = {<Register />}/>
        <Route path='/login' element = {<Login />}/>
        <Route path='/first-aid' element = {<FirstAid />} />
        <Route path='/emergency' element={<Emergency />}/>
        <Route path='/profile' element={<Profile />} />
        <Route path='/hospitals' element={<Hospital />} />
        <Route path='/health-wallet' element={<HealthWallet />} />
        <Route path='/heart' element={<HeartRateChecker />}/>
        <Route path='/watch' element={<WatchBluetoothConnect />}/>
        <Route path='/profile-view/:id' element={<ProfileView />} />
        <Route path='/profile-view' element={<ProfileView />} />
      </Routes>
      
    </div>
  )
}

export default App

