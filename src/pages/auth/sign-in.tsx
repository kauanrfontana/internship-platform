import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useAuth } from '@/middlewares/auth-provider'
import { useEffect } from 'react'

const signInForm = z.object({
  email: z.string().email(),
  password: z.string()
})

type SignInForm = z.infer<typeof signInForm>

export function SignIn() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting }
  } = useForm<SignInForm>()

  const email = watch('email')
  const password = watch('password')
  const isFormFilled = Boolean(email && password)

  async function handleSignIn(data: SignInForm) {
    try {
      login({login: data.email, password: data.password})

      toast.success('Login realizado com sucesso!')
      navigate('/', { replace: true })
    } catch {
      toast.error('Credenciais inválidas')
    }
  }

   useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])
  
  return (
    <>
      <Helmet title='Login' />

      <div className='p-8'>
        <div className='w-[350px] flex flex-col justify-center gap-6'>
          <div className='flex flex-col gap-2 text-center'>
            <h1 className='text-2xl font-semibold tracking-tight'>Acessar sua conta</h1>
            <p className='text-sm text-muted-foreground'>Acesse o seu ambiente de estágio!</p>
          </div>

          <form onSubmit={handleSubmit(handleSignIn)} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Seu e-mail</Label>
              <Input
                id='email'
                type='email'
                {...register('email')}
              />

              <Label htmlFor='password'>Sua senha</Label>
              <Input
                id='password'
                type='password'
                {...register('password')}
              />
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <Button
                disabled={!isFormFilled || isSubmitting}
                onClick={handleSubmit(handleSignIn)}
                variant="default"
              >
                Entrar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
