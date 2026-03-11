import React from 'react'
import Hospital from './Hospital'
import { Route, Routes } from 'react-router-dom'

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Hospital />}/>
    </Routes>
  
  )
}

export default App
