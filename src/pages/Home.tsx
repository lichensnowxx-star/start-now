import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'

export default function Home() {
  const navigate = useNavigate()

  return (
    <main className="mx-auto flex min-h-[calc(100vh-76px)] w-full max-w-5xl flex-col px-6 py-10 md:py-14">
      <section className="flex flex-1 items-center justify-center py-10">
        <p className="max-w-3xl text-center text-4xl font-semibold leading-relaxed text-text md:text-6xl md:leading-tight">
          先别急着想清全部，先找到眼前这一步
        </p>
      </section>

      <section className="mx-auto w-full max-w-xl space-y-4 pb-2">
        <Button className="py-4 text-lg md:text-xl" onClick={() => navigate('/goal')}>
          开始行动
        </Button>
        <Button className="py-4 text-lg md:text-xl" variant="secondary" onClick={() => navigate('/goal')}>
          查看演示
        </Button>
      </section>
    </main>
  )
}
