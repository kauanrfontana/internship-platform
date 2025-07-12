import { createContext, useState, useContext, ReactNode } from 'react';
import logins from '@/backend/usuarios.json';

const rolesMap: any = {
  'aluno': 'student',
  'articulador': 'articulator',
  'orientador': 'advisor'
}

type Role = 'student' | 'advisor' | 'articulator' | null

type LoginData = {
  login: string;
  password: string;
}

type AuthContextType = {
  isAuthenticated: boolean
  role: Role,
  user: User | null,
  login: (LoginData: LoginData) => void
  logout: () => void
}

type User = {
  nome: string;
  tipo: string;
  login: string;
  senha: string;
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
  const [user, setUser] = useState<User | null>(null)

  function login(LoginData: LoginData) {
    const user = logins.find((user: User) => user.login === LoginData.login);
    const passwordMatch = user?.senha === LoginData.password;
    if(!user || !rolesMap[user.tipo.toLowerCase()] || !passwordMatch){
      throw new Error()
    }

    setUser(user)
    setIsAuthenticated(true)
    setRole(rolesMap[user.tipo.toLowerCase()])
  }

  function logout() {
    setIsAuthenticated(false)
    setRole(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
