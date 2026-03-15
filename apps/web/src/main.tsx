import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import './index.css'
import Drivers from './pages/Drivers'
import DriverDetail from './pages/DriverDetail'
import Races from './pages/Races'
import RaceDetail from './pages/RaceDetail'
import TeamBuilder from './pages/TeamBuilder'
import Layout from './components/Layout'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Drivers /> },
      { path: 'drivers', element: <Drivers /> },
      { path: 'drivers/:id', element: <DriverDetail /> },
      { path: 'races', element: <Races /> },
      { path: 'races/:slug', element: <RaceDetail /> },
      { path: 'team-builder', element: <TeamBuilder /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
