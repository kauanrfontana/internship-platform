import { Building, ChevronDown, LogOut, User } from "lucide-react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";

export function AccountMenu() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 select-none">
                    Eduardo Ferraz
                    <ChevronDown/>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col">
                    <span>Eduardo Ferraz</span>
                    <span className="text-xs font-normal text-muted-foreground">
                        edupferraz@gmail.com
                    </span>
                </DropdownMenuLabel>

                <DropdownMenuSeparator/>

                <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4"/>
                    <span>Meu Perfil</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="text-rose-500 dark:text-rose-400">
                    <LogOut className="mr-2 h-4 w-4"/>
                    <span>Sair</span>
                </DropdownMenuItem>

            </DropdownMenuContent>
        </DropdownMenu>
    )
}