import { Outlet } from "react-router-dom"
import { GraduationCap } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import noticiasData from '@/backend/noticias.json'; 

export function AuthLayout() {
    return (
        <div className="min-h-screen grid grid-cols-2 antialiased">
            <div className="h-full border-r border-foreground/5 bg-muted p-10 text-muted-foreground flex flex-col justify-between">
                <div className="flex items-center gap-3 text-lg font-medium text-foreground">
                    <GraduationCap className="h-5 w-5"/>
                    <span className="font-semibold">internship.platform</span>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-4 space-y-4 my-8 max-h-80 ">
                    {noticiasData.map((noticia, index) => (
                        <Card key={index} className="bg-white dark:bg-gray-800 shadow-md">
                            <CardHeader>
                                <CardTitle className="text-sm text-gray-900 dark:text-gray-100">{noticia.titulo}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-gray-600 dark:text-gray-400">{noticia.descricao}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <footer className="text-sm">
                    Painel de estágio &copy; internship.platform - {new Date().getFullYear()}
                </footer>
            </div>

            <div className="flex flex-col items-center justify-center">
                <Outlet />
            </div>
        </div>
    )
}