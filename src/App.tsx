import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import Dashboard from './pages/Dashboard'
import GoalInput from './pages/GoalInput'
import Home from './pages/Home'
import PathSelect from './pages/PathSelect'
import Progress from './pages/Progress'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/goal" element={<GoalInput />} />
        <Route path="/path-select" element={<PathSelect />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
