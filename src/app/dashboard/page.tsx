const courses = [
  {
    id: "sales",
    title: "Продажи отделочных материалов",
    description:
      "Базовый курс для менеджеров: выявление потребности, работа с возражениями, презентация товара.",
    progress: 35,
    lessons: 5,
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-yellow-500">
              Кабинет менеджера
            </p>
            <h1 className="mt-2 text-4xl font-bold">Моё обучение</h1>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <p className="text-neutral-400">Прогресс</p>
            <h2 className="mt-2 text-3xl font-bold">35%</h2>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <p className="text-neutral-400">Курсов доступно</p>
            <h2 className="mt-2 text-3xl font-bold">1</h2>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <p className="text-neutral-400">Уроков</p>
            <h2 className="mt-2 text-3xl font-bold">5</h2>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-semibold">Курсы</h2>

          {courses.map((course) => (
            <div
              key={course.id}
              className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6"
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{course.title}</h3>
                  <p className="mt-2 max-w-2xl text-neutral-400">
                    {course.description}
                  </p>
                  <p className="mt-4 text-sm text-neutral-500">
                    {course.lessons} уроков
                  </p>
                </div>

                <a
                  href={`/course/${course.id}`}
                  className="rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-black"
                >
                  Продолжить
                </a>
              </div>

              <div className="mt-6 h-2 rounded-full bg-neutral-800">
                <div
                  className="h-2 rounded-full bg-yellow-500"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}