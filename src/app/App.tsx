import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import 'animate.css';
import '../styles/globals.css';

function App() {
  return <RouterProvider router={router} />;
}

export default App;