export default function LessonPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <a href="/course/sales" className="text-sm text-yellow-500">
          ← Назад к курсу
        </a>

        <article className="mt-8 rounded-3xl border border-neutral-800 bg-neutral-900 p-8">
          <p className="text-sm uppercase tracking-[0.25em] text-yellow-500">
            Урок
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Как правильно начать диалог с клиентом
          </h1>

          <div className="mt-8 aspect-video rounded-2xl border border-neutral-800 bg-neutral-950 flex items-center justify-center text-neutral-500">
            Видео урока
          </div>

          <div className="mt-8 space-y-5 text-lg leading-8 text-neutral-300">
            <p>
              Первые 30 секунд общения определяют, будет ли клиент доверять
              менеджеру. Важно не начинать с давления и продажи, а понять
              задачу покупателя.
            </p>

            <p>
              Хороший старт диалога — это короткий вопрос, который помогает
              выявить контекст: для какого помещения подбираются материалы,
              какой этап ремонта сейчас и какой результат клиент хочет получить.
            </p>

            <p>
              Вместо фразы «Что вам показать?» лучше использовать:
              «Подскажите, для какого помещения выбираете материалы и какой
              результат хотите получить?»
            </p>
          </div>

          <div className="mt-8 rounded-2xl bg-neutral-950 p-5">
            <h2 className="text-xl font-semibold">Задание</h2>
            <p className="mt-2 text-neutral-400">
              Сформулируйте 3 вопроса, которые помогут понять задачу клиента
              до презентации товара.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}