import './App.css';
import { Route,BrowserRouter,Routes } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from "./components/pages/authent/AdminLogin";
import AdminRegister from "./components/pages/authent/Adminregister";
function App() {
  return (
    <div className="App">
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/login" element={<AdminLogin />} /> 
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
      </BrowserRouter>  
  </div>
  );
}

export default App;
