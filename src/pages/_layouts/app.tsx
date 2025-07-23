import { Header } from "@/components/header"
import { Outlet } from "react-router-dom"

export function AppLayout() {
    return (
        <div className="flex min-h-screen flex-col">
            <div className="text-center opacity-50 fixed bottom-0 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-4 py-2 rounded-b shadow-md">
                Este é um protótipo, não o sistema final! <br/>
                Avalie sua experiência, como se fosse um sistema final: <a href="https://forms.gle/3GSZBpngb2aoh7Sm6">Aqui</a>
            </div>
            <Header />


            <div className="flex flex-1 flex-col gap-4 p-8 pt-6">
                <Outlet />
            </div>
        </div>
    )
}