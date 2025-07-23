import { Outlet } from "react-router-dom"
import { GraduationCap } from 'lucide-react'

import { FrequentlyAskedQuestions } from "../app/frequently-asked-questions";

export function AuthLayout() {
    return (
        <div className="min-h-screen grid grid-cols-2 antialiased">
            <div className="text-center fixed bottom-0 opacity-50 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-4 py-2 rounded-b shadow-md">
                Este é um protótipo, não o sistema final! <br/>
                Avalie sua experiência, como se fosse um sistema final: <a href="https://forms.gle/3GSZBpngb2aoh7Sm6">Aqui</a>
            </div>
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