import { Outlet } from "react-router-dom"
import { GraduationCap } from 'lucide-react'

import { FrequentlyAskedQuestions } from "../app/frequently-asked-questions";

export function AuthLayout() {
    return (
        <div className="min-h-screen grid grid-cols-2 antialiased">
            <div className="h-full border-r border-foreground/5 bg-muted p-10 text-muted-foreground flex flex-col justify-between">
                <div className="flex items-center gap-3 text-lg font-medium text-foreground">
                    <GraduationCap className="h-5 w-5"/>
                    <span className="font-semibold">internship.platform</span>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-4 space-y-4 my-8 max-h-80 ">
                    <FrequentlyAskedQuestions/>
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