import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/middlewares/auth-provider'
import { StudentHome } from './student-home'
import { AdvisorHome } from './advisor-home'
import { ArticulatorHome } from './articulator-home'

export function Home() {
  let { isAuthenticated, role } = useAuth()
  const navigate = useNavigate()


  if (role === 'student') {
    console.log('Usuário é estudante')
  }

    if (role === 'advisor') {
    console.log('Usuário é orientador')
  }


    if (role === 'articulator') {
    console.log('Usuário é articulador')
  }

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/sign-in')
    }
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) {
    return null
  }

  switch (role) {
    case 'student':
      return <StudentHome />
    case 'advisor':
      return <AdvisorHome />
    case 'articulator':
      return <ArticulatorHome />
    default:
      return <div>Role desconhecido</div>
  }
}
