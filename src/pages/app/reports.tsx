import { Helmet } from 'react-helmet-async'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/middlewares/auth-provider'
export function Reports() {
  const { role } = useAuth()

  return (
    <>
      <Helmet title="Relatórios" />

      <div className="min-h-screen">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-8">

            {role === 'advisor' && (
              <div className="flex justify-center">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                  EXPORTAR RELATÓRIO ORIENTANDOS ANTIGOS
                </Button>
              </div>
            )}

            {role === 'articulator' && (
              <div className="flex justify-center">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                  EXPORTAR RELATÓRIO DE TODOS OS ESTÁGIOS
                </Button>
              </div>
            )}

            {role === 'student' && (
              <div className="flex justify-center">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                  EXPORTAR RELATÓRIO DE TODOS OS ESTÁGIOS
                </Button>
              </div>
            )}

            <Card className="bg-gray-200 border-gray-300 shadow-xl">
              <CardContent className="p-8">
                <h2 className="text-center text-gray-800 font-semibold text-xl mb-8">
                  MEUS ORIENTANDOS
                </h2>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-gray-800 font-medium text-lg">
                      ESTAGIÁRIO X
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div><span className="font-medium">NOME DO ESTAGIÁRIO:</span></div>
                      <div><span className="font-medium">EMPRESA:</span></div>
                      <div><span className="font-medium">TEMPO DE DURAÇÃO DO ESTÁGIO:</span></div>
                      <div><span className="font-medium">SITUAÇÃO:</span></div>
                    </div>
                    <div className="border-b border-gray-400 pb-2"></div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-gray-800 font-medium text-lg">
                      ESTAGIÁRIO Y
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div><span className="font-medium">NOME DO ESTAGIÁRIO:</span></div>
                      <div><span className="font-medium">EMPRESA:</span></div>
                      <div><span className="font-medium">TEMPO DE DURAÇÃO DO ESTÁGIO:</span></div>
                      <div><span className="font-medium">SITUAÇÃO:</span></div>
                    </div>
                    <div className="border-b border-gray-400 pb-2"></div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  )
}
