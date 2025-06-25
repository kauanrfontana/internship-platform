import { useAuth } from "@/middlwares/auth-provider"
import { PublicHome } from "./public-home"
import { StudentHome } from "./student-home"

export function Home() {
  const { isAuthenticated, role } = useAuth()

  if (!isAuthenticated) {
    return <PublicHome />
  }

  switch (role) {
    case 'student':
      return <StudentHome />
    default:
      return <div>Role desconhecido</div>
  }
}
