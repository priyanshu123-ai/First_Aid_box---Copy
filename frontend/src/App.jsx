import React from 'react'
import { Route, Routes } from 'react-router-dom'
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


const App = () => {
  return (
    <div>
      <Navbar />
      <EmergencyChatbot />
      <Routes>
        
        <Route path='/' element={<Home />}/>
        <Route path='/register' element = {<Register />}/>
        <Route path='/login' element = {<Login />}/>
        <Route path='/first-aid' element = {<FirstAid />} />
        <Route path='/emergency' element={<Emergency />}/>
        <Route path='/profile' element={<Profile />} />
        <Route path='/hospitals' element={<Hospital />} />
        <Route path='/heart' element={<HeartRateChecker />}/>
        <Route path='/watch' element={<WatchBluetoothConnect />}/>
      </Routes>
      
    </div>
  )
}

export default App
