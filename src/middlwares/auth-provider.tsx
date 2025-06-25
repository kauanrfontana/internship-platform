import { createContext, useState, useContext, ReactNode } from 'react'

type Role = 'student' | 'teacher' | 'coordinator' | null

type AuthContextType = {
  isAuthenticated: boolean
  role: Role
  login: (role: Role) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  role: null,
  login: () => {},
  logout: () => {}
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [role, setRole] = useState<Role>(null)

  function login(userRole: Role) {
    setIsAuthenticated(true)
    setRole(userRole)
  }

  function logout() {
    setIsAuthenticated(false)
    setRole(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
