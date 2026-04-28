-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users profile table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'manager' CHECK (role IN ('manager', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses
CREATE TABLE public.courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modules
CREATE TABLE public.modules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons
CREATE TABLE public.lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  video_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Progress
CREATE TABLE public.progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Dialogs (simulator sessions)
CREATE TABLE public.dialogs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  client_type TEXT NOT NULL CHECK (client_type IN ('economical', 'doubtful', 'professional')),
  messages JSONB NOT NULL DEFAULT '[]',
  score INTEGER,
  errors JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  strengths JSONB DEFAULT '[]',
  summary TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dialogs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies: courses
CREATE POLICY "Anyone can view published courses" ON public.courses
  FOR SELECT USING (is_published = TRUE OR 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage courses" ON public.courses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies: modules
CREATE POLICY "Anyone can view modules of published courses" ON public.modules
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND (is_published = TRUE OR 
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')))
  );

CREATE POLICY "Admins can manage modules" ON public.modules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies: lessons
CREATE POLICY "Anyone can view lessons" ON public.lessons
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage lessons" ON public.lessons
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies: progress
CREATE POLICY "Users can view their own progress" ON public.progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own progress" ON public.progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress" ON public.progress
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies: dialogs
CREATE POLICY "Users can manage their own dialogs" ON public.dialogs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all dialogs" ON public.dialogs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Function: auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'manager')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed: sample courses
INSERT INTO public.courses (id, title, description, is_published) VALUES
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Основы продаж отделочных материалов',
  'Базовый курс для новых менеджеров. Изучите техники продаж, типологию клиентов и работу с возражениями.',
  TRUE
),
(
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'Продвинутые техники переговоров',
  'Углублённый курс по работе с требовательными клиентами, закрытию сделок и увеличению среднего чека.',
  TRUE
);

-- Seed: modules for course 1
INSERT INTO public.modules (id, course_id, title, order_index) VALUES
(
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Введение в продажи отделочных материалов',
  1
),
(
  'd4e5f6a7-b8c9-0123-defa-234567890123',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Типология клиентов',
  2
),
(
  'e5f6a7b8-c9d0-1234-efab-345678901234',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Работа с возражениями',
  3
);

-- Seed: lessons
INSERT INTO public.lessons (module_id, title, content, order_index, duration_minutes) VALUES
(
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  'Рынок отделочных материалов: обзор',
  '## Введение в рынок отделочных материалов

Рынок отделочных материалов — один из наиболее динамично развивающихся сегментов строительной отрасли. Ежегодный оборот составляет более **500 млрд рублей** только в России.

### Основные категории товаров

**1. Напольные покрытия**
- Ламинат (бюджетный сегмент)
- Паркетная доска (средний и премиум)
- Керамогранит и плитка
- Линолеум и ПВХ-покрытия
- Ковровые покрытия

**2. Настенные покрытия**
- Обои (флизелин, виниловые, текстильные)
- Декоративные штукатурки
- Панели (МДФ, ПВХ, 3D)
- Плитка и мозаика

**3. Потолочные решения**
- Натяжные потолки
- Потолочные плиты и панели
- Гипсокартон и штукатурка

### Ключевые игроки рынка

Основные конкуренты в розничном сегменте:
- Леруа Мерлен / OBI
- Петрович
- Региональные строительные магазины

### Тренды 2024 года

1. **Экологичность** — спрос на сертифицированные материалы вырос на 23%
2. **Мультифактурность** — сочетание разных материалов в одном пространстве
3. **Крупный формат** — плитка 60×120 и более
4. **Тёплые тона** — бежевые, терракотовые оттенки вместо серого

### Портрет покупателя

Типичный клиент сегодня:
- **Возраст**: 28–55 лет
- **Мотивация**: новостройка (45%) или капитальный ремонт (35%)
- **Бюджет**: от 50 000 до 500 000 рублей на отделку
- **Информированность**: предварительно изучает материалы онлайн',
  1,
  15
),
(
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  'Структура консультации: от приветствия до закрытия',
  '## Идеальная структура продажи

Эффективная консультация по отделочным материалам состоит из 7 этапов. Пропуск любого из них снижает конверсию.

### Этап 1: Установление контакта (1–2 мин)
Цель: создать доверие, снять напряжение.

**Что делать:**
- Улыбнуться и поздороваться
- Дать клиенту 30 секунд осмотреться
- Начать разговор с нейтральной фразы

**Фразы-открыватели:**
> "Добрый день! Если будут вопросы — я рядом"
> "Делаете ремонт или присматриваетесь?"

### Этап 2: Выявление потребностей (3–5 мин)
Ключевой этап. Задаём вопросы по технике СПИН:

- **Ситуационные**: Какой объём? Где находится объект?
- **Проблемные**: Какие требования к покрытию?
- **Извлекающие**: Что будет, если материал быстро износится?
- **Направляющие**: Было бы удобно, если материал...?

### Этап 3: Презентация решения (5–10 мин)

Формула: **Свойство → Преимущество → Выгода**

> "Этот ламинат класса 33 (свойство) выдерживает интенсивный трафик (преимущество), поэтому прослужит 20+ лет даже в прихожей (выгода)"

### Этап 4: Работа с возражениями
### Этап 5: Допродажа
### Этап 6: Закрытие сделки
### Этап 7: Прощание и постпродажное обслуживание',
  2,
  20
),
(
  'd4e5f6a7-b8c9-0123-defa-234567890123',
  'Экономный клиент: стратегия работы',
  '## Работа с экономным клиентом

Экономный клиент — самый частый тип в строительном магазине. До 40% покупателей ставят цену на первое место.

### Психологический портрет

**Главный страх**: переплатить, купить не то
**Главная ценность**: соотношение цена/качество
**Поведение**: сравнивает цены, просит скидки, упоминает конкурентов

### Стратегия работы

**1. Не спорьте о цене — управляйте ценностью**

❌ Плохо: "Это дорого, зато качественно"
✅ Хорошо: "Давайте посчитаем полную стоимость ремонта..."

**2. Техника "Дорого в пересчёте на срок"**

> "Да, сейчас это 15 000 рублей. Но этот ламинат прослужит 20 лет — получается 750 рублей в год, или 2 рубля в день. Согласитесь, это немного за напольное покрытие в комнате?"

**3. Сравнение с конкурентами**

Когда клиент говорит "в Леруа дешевле":
- Не отрицайте (это вызывает недоверие)
- Уточните, что именно сравнивается
- Покажите разницу в комплектации, качестве

**4. Предложите альтернативы**

Всегда показывайте 3 варианта:
- Бюджетный (то, что просит)
- Оптимальный (+20% к бюджету, лучшее качество)
- Премиальный (для сравнения)

Большинство клиентов выбирает средний вариант.

### Типичные возражения

| Возражение | Ответ |
|-----------|-------|
| "Слишком дорого" | Техника "дорого в пересчёте" |
| "У конкурентов дешевле" | "Что конкретно сравниваем?" |
| "Подумаю" | "Что останавливает прямо сейчас?" |
| "Дайте скидку" | Скидка за объём, рассрочка, комплект |',
  1,
  25
),
(
  'e5f6a7b8-c9d0-1234-efab-345678901234',
  'Техники закрытия сделки',
  '## Закрытие сделки: практические техники

Закрытие сделки — финальный и самый важный этап. 70% менеджеров теряют продажи именно здесь.

### Почему клиенты не покупают

1. **Неуверенность** в правильности выбора
2. **Отсутствие срочности** — "подумаю и вернусь"
3. **Нерешённые возражения** — что-то осталось невысказанным
4. **Неудобство покупки** — сложный процесс оформления

### Техника 1: Предположительное закрытие

Действуйте так, будто решение уже принято.

> "Оформляем на эту неделю или вам удобнее следующая?"
> "Куда доставить? На адрес объекта?"

### Техника 2: Закрытие на выбор

Предлагайте выбор между двумя вариантами "да":

> "Возьмёте 50 или 60 упаковок? С запасом обычно берут на 10% больше."

### Техника 3: Создание срочности

Настоящая срочность, не надуманная:

> "Этот артикул заканчивается, следующая поставка через 3 недели"
> "Акция действует до конца месяца"

### Техника 4: Подведение итогов

Резюмируйте всё, что обсудили:

> "Итак, мы определились: ламинат 33 класса для гостиной и спальни, 65 м², плинтус в тон. Осталось только оформить доставку. Как вам удобнее оплатить?"

### Техника 5: Работа с "я подумаю"

Это не отказ — это запрос на помощь.

> "Конечно! А что именно хотите обдумать? Может, я смогу помочь прямо сейчас?"',
  1,
  20
);