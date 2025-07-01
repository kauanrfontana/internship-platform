import { createContext, useState, useContext, ReactNode } from 'react'

type Role = 'student' | 'advisor' | 'articulator' | null

type AuthContextType = {
  isAuthenticated: boolean
  role: Role
  login: (role: Role) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

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
