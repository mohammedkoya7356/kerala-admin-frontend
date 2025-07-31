import { Routes, Route, Navigate } from "react-router-dom";
import AuthForm from "./assets/components/AuthForm";
import AdminDashboard from "./assets/components/AdminDashboard";
import ProtectedRoute from "./assets/components/ProtectedRoute";


function App() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <Routes>

      <Route path="/" element={<AuthForm />} />

      {/*  Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute user={user}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

  
      <Route
        path="/edit/:id/:block"
        element={
          <ProtectedRoute user={user}>
            
          </ProtectedRoute>
        }
      />

    
      <Route
        path="/admin/update-banner/:id"
        element={
          <ProtectedRoute user={user}>
          
          </ProtectedRoute>
        }
      />

    
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
