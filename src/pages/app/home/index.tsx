import { useAuth } from "@/middlewares/auth-provider"
import { PublicHome } from "./public-home"
import { StudentHome } from "./student-home"
import { AdvisorHome } from "./advisor-home"
import { ArticulatorHome } from "./articulator-home"

export function Home() {
  const { isAuthenticated, role } = useAuth()

  if (!isAuthenticated) {
    return <PublicHome />
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
