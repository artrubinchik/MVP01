export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-20">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-yellow-500">
          Sales LMS
        </p>

        <h1 className="max-w-4xl text-5xl font-bold leading-tight md:text-7xl">
          LMS-платформа для обучения менеджеров продажам отделочных материалов
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-neutral-300">
          Курсы, уроки, прогресс и практические сценарии продаж в одном
          интерфейсе. MVP готов к развитию в полноценный AI-тренажёр.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="/dashboard"
            className="rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-black"
          >
            Открыть кабинет
          </a>

          <a
            href="/course/sales"
            className="rounded-xl border border-neutral-700 px-6 py-3 text-white"
          >
            Смотреть курс
          </a>
        </div>
      </section>
    </main>
  );
}