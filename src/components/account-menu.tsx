import { ChevronDown, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useAuth } from "@/middlewares/auth-provider";
import { useNavigate } from "react-router-dom";

export function AccountMenu() {
    const {user, logout} = useAuth()
    const navigate = useNavigate()

    function handleLogout() {
        logout()
        navigate('/sign-in')
    }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 select-none">
                    {user?.nome}
                    <ChevronDown/>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col">
                    <span>{user?.nome}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                        {user?.login}
                    </span>
                </DropdownMenuLabel>

                <DropdownMenuSeparator/>

                <DropdownMenuItem className="text-rose-500 dark:text-rose-400" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4"/>
                    <span>Sair</span>
                </DropdownMenuItem>

            </DropdownMenuContent>
        </DropdownMenu>
    )
}