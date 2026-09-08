import { Link } from '@tanstack/react-router'
import { Button } from '@/shared/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <h1 className="text-2xl font-semibold">Página não encontrada</h1>
      <p className="text-muted-foreground">O endereço que você acessou não existe.</p>
      <Button asChild>
        <Link to="/">Voltar para o início</Link>
      </Button>
    </div>
  )
}
