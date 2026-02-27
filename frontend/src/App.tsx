import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Navbar } from './components/Navbar'
import { LoginPage } from './pages/LoginPage'
import { EquipmentPage } from './pages/EquipmentPage'
import { AdminPage } from './pages/AdminPage'

function App() {
  const auth = useAuth()

  return (
    <BrowserRouter>
      {/* Navbar แสดงเฉพาะเมื่อ login แล้ว */}
      {auth.isAuthenticated && <Navbar auth={auth} />}

      <Routes>

        {/* หน้า Login — redirect ไป / ถ้า login แล้ว */}
        <Route
          path="/login"
          element={
            auth.isAuthenticated
              ? <Navigate to="/" replace />
              : <LoginPage auth={auth} />
          }
        />

        {/* หน้าหลัก: รายการอุปกรณ์ — ต้อง login */}
        <Route
          path="/"
          element={
            <ProtectedRoute isAuthenticated={auth.isAuthenticated}>
              <EquipmentPage auth={auth} />
            </ProtectedRoute>
          }
        />

        {/* หน้าจัดการ — เฉพาะ admin (teacher ดูได้ด้วยหากต้องการ) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute
              isAuthenticated={auth.isAuthenticated}
              userRole={auth.user?.role}
              requiredRole="admin"
            >
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* หน้า 403 */}
        <Route
          path="/forbidden"
          element={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <p className="text-6xl font-black text-slate-300 mb-4">403</p>
                <p className="text-slate-600 font-semibold">ไม่มีสิทธิ์เข้าถึงหน้านี้</p>
              </div>
            </div>
          }
        />

        {/* ทุก path อื่น → redirect ไป / */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
