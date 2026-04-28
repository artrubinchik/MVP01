const lessons = [
  {
    id: "lesson-1",
    title: "Как правильно начать диалог с клиентом",
    duration: "8 мин",
  },
  {
    id: "lesson-2",
    title: "Выявление потребности",
    duration: "12 мин",
  },
  {
    id: "lesson-3",
    title: "Презентация товара через выгоды",
    duration: "10 мин",
  },
  {
    id: "lesson-4",
    title: "Работа с возражением «дорого»",
    duration: "14 мин",
  },
  {
    id: "lesson-5",
    title: "Закрытие сделки",
    duration: "9 мин",
  },
];

export default function CoursePage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <a href="/dashboard" className="text-sm text-yellow-500">
          ← Назад в кабинет
        </a>

        <div className="mt-8 rounded-3xl border border-neutral-800 bg-neutral-900 p-8">
          <p className="text-sm uppercase tracking-[0.25em] text-yellow-500">
            Курс
          </p>
          <h1 className="mt-3 text-4xl font-bold">
            Продажи отделочных материалов
          </h1>
          <p className="mt-4 max-w-3xl text-neutral-400">
            Научитесь быстро понимать задачу клиента, правильно презентовать
            материалы и уверенно доводить диалог до покупки.
          </p>
        </div>

        <section className="mt-8 space-y-4">
          {lessons.map((lesson, index) => (
            <a
              key={lesson.id}
              href={`/lesson/${lesson.id}`}
              className="block rounded-2xl border border-neutral-800 bg-neutral-900 p-5 transition hover:border-yellow-500"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500">
                    Урок {index + 1}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">
                    {lesson.title}
                  </h2>
                </div>

                <span className="text-sm text-neutral-400">
                  {lesson.duration}
                </span>
              </div>
            </a>
          ))}
        </section>
      </div>
    </main>
  );
}