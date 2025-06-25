import { createBrowserRouter } from "react-router-dom";
import { SignIn } from "./auth/sign-in";
import { SignUp } from "./auth/sign-up";
import { AppLayout } from "./_layouts/app";
import { AuthLayout } from "./_layouts/auth";
import { NotFound } from "./404";
import { Internships } from "./app/internships";
import { Calendar } from "./app/calendar";
import { FrequentlyAskedQuestions } from "./app/frequently-asked-questions";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <AppLayout/>,
        errorElement: <NotFound/>,
        children: [
            {path: '/estagios', element: <Internships/>},
            {path: '/calendar', element: <Calendar/>},
            {path: '/faq', element: <FrequentlyAskedQuestions/>},
        ]
    },

    {
        path: '/',
        element: <AuthLayout/>,
        children: [
            {path: '/sign-in', element: <SignIn/>},
            {path: '/sign-up', element: <SignUp/>},  
        ]
    }
    
])