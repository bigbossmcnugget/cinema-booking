# Lumen Cinema — intermediate project presentation

## Client meeting script for Ruslan Rebo, Jegor Onoprijuk and Vadim Šamrin

This document contains a ready-to-use 12–15 minute presentation. The English
version can be spoken during the meeting. The Russian version explains the same
content and can be used for rehearsal.

The suggested speaking areas are presentation responsibilities, not claims that
only one person developed each part of the system. The project was built
collaboratively.

---

# Preparation before the meeting

Do this before the client arrives:

1. Start the API and website.
2. Open `http://127.0.0.1:3000/` in the browser.
3. Check that the footer says **Live booking connected**.
4. Open one screening and check that the seat map loads.
5. Prepare the test customer:
   - Name: `Demo Customer`
   - Email: `demo@example.com`
6. Keep a phone, notebook or document ready for the client's answers.
7. Do not create a real booking during the rehearsal immediately before the
   presentation, because that seat will remain occupied in the local database.

Suggested responsibility during the meeting:

- **Ruslan:** opens the meeting and demonstrates the catalogue.
- **Jegor:** demonstrates seat selection and booking.
- **Vadim:** explains the current result, asks the client questions and records
  the answers.
- Each person presents and defends their own development proposal.

## Timing

| Time | Part |
|---|---|
| 0:00–1:00 | Greeting, problem and value |
| 1:00–4:00 | Catalogue demonstration |
| 4:00–7:00 | Booking demonstration |
| 7:00–8:00 | Honest summary of the current result |
| 8:00–11:30 | Three next-month proposals |
| 11:30–14:00 | Questions and client feedback |
| 14:00–15:00 | Summary and closing |

---

# ENGLISH VERSION — READY TO SPEAK

## 1. Opening — Ruslan (about 1 minute)

**Ruslan says:**

> Hello. We are Ruslan Rebo, Jegor Onoprijuk and Vadim Šamrin, and our project
> is called Lumen Cinema.
>
> The problem we wanted to solve is simple: booking cinema tickets should not
> require a phone call, a complicated registration process or a long search for
> the right screening. Our website lets a visitor choose a date, find a film,
> select a screening and reserve seats in one clear process.
>
> Today we will first demonstrate what already works. After that, each team
> member will present one proposal for the next month of development, including
> its value to the client and an estimate in hours. At the end, we would like to
> ask for your priorities and record your feedback.

**Action:** Ruslan points to the open Lumen home page.

---

## 2. Catalogue and interface demonstration — Ruslan (about 3 minutes)

**Ruslan says:**

> This is the main page that a cinema visitor sees. The user can immediately
> see the cinema, available dates, films and screening times. The main booking
> actions are on one page, so the user does not need to navigate through a
> complicated menu.

**Action:** Show the date selector and select tomorrow, then return to today.

> The programme is loaded from the local database. When the user changes the
> date, the page requests the screenings for that day and shows the available
> times.

**Action:** Click **Superheroes**, then **Family**, then **All films**.

> The visitor can filter the programme by genre. This is useful when the user
> already knows what type of film they want to watch.

**Action:** Open **Search**, type `Lego`, show the result, then close the search.

> The search helps the visitor find a film by its title, genre or description.

**Action:** Open **More info** for one film and briefly show the details.

> Each film also has a detail view with information that helps the customer
> decide what to watch.

**Action:** Switch the language from **EN** to **RU**, then to **ET**, and return
to the language in which the meeting is being held.

> The interface supports English, Russian and Estonian. The selected language
> is remembered in the browser, which is useful for both local and international
> customers.

**Handover:**

> Jegor will now demonstrate the actual booking process.

---

## 3. Seat selection and booking — Jegor (about 3 minutes)

**Action:** Jegor clicks a screening time.

**Jegor says:**

> After the visitor selects a screening, the website loads the correct hall,
> ticket price and current seat availability from the database.

**Action:** Point to free and occupied seats. Select two free seats.

> Occupied seats cannot be selected. The visitor can choose up to ten different
> seats. The website immediately shows the selected seats and calculates the
> total price.

**Action:** Continue to checkout.

> This project currently supports guest booking. The customer enters a name and
> email address, so an account is not required. This keeps the first version of
> the booking process short and easy to test.

**Action:** Enter `Demo Customer` and `demo@example.com`.

> This is a preview checkout. No real payment is taken. When we confirm the
> booking, the server checks the screening and seats again instead of trusting
> information from the browser.

**Action:** Confirm the booking and wait for the success screen.

> The booking has now been saved in the local database. The customer receives a
> unique booking reference. If another visitor opens the same screening, these
> seats will appear as occupied. The database also prevents two customers from
> successfully booking the same seat for the same screening.

**Action:** Point to the booking reference. Do not read the whole random
reference aloud; showing it is sufficient.

**Handover:**

> Vadim will briefly summarise what is complete and what is not yet part of the
> current version.

---

## 4. Current result and limitations — Vadim (about 1 minute)

**Vadim says:**

> The current version completes the main guest journey: choosing a date,
> finding a film, selecting a screening, choosing available seats and saving a
> booking.
>
> The application uses stored data for films, genres, cinemas, halls, seats,
> screenings and bookings. Therefore, this is not only a visual prototype — the
> booking changes the state of the application.
>
> We also want to be clear about the current limits. There is no real online
> payment, customer account, booking cancellation, outgoing email or employee
> administration interface yet. These are possible development directions, but
> we would first like to agree on their value and priority with the client.

---

# NEXT-MONTH DEVELOPMENT PROPOSALS

Each team member must explain only their own proposal. Do not interrupt or
finish another member's explanation.

## 5. Ruslan's proposal — administration interface (about 1 minute)

**Ruslan says:**

> My proposal for the next month is an administration interface for cinema
> employees.
>
> At the moment, customers can use the programme, but an employee does not have
> a convenient page for updating it. The administration interface would allow
> an authorised employee to add or edit films, create screening times and hide
> films that are no longer available.
>
> The value for the client is independence: the cinema could update its own
> programme without asking a developer to change the database. It would also
> reduce mistakes caused by manual technical changes.
>
> My preliminary estimate is **22 hours**: 5 hours for protected administrator
> access, 6 hours for film management, 7 hours for screening management and 4
> hours for testing and corrections.

If the client asks why access protection is needed:

> The public visitor must not be able to change films or the schedule. That is
> why employee access is part of the estimate, not an optional detail.

---

## 6. Jegor's proposal — cancellation and seat release (about 1 minute)

**Jegor says:**

> My proposal is booking cancellation with a clear seat-release policy.
>
> In the current version, a completed booking keeps its seats occupied. If a
> customer changes their plans, they cannot cancel it themselves, and the cinema
> may lose the opportunity to offer those seats to another visitor.
>
> I propose allowing the customer to open a booking using its reference and
> email address, cancel it before an agreed deadline and make its seats available
> again.
>
> The value for the client is better seat availability and less manual work for
> cinema employees. The deadline would also protect the cinema from very late
> cancellations.
>
> My preliminary estimate is **16 hours**: 4 hours for finding and verifying a
> booking, 5 hours for cancellation and seat release, 3 hours for the user
> interface and 4 hours for conflict and edge-case testing.

If the client asks why the rule must be agreed first:

> We need the client to decide, for example, whether cancellation closes 30
> minutes or two hours before the screening. The system should implement the
> cinema's business rule, not invent it for the client.

---

## 7. Vadim's proposal — customer account and booking history (about 1 minute)

**Vadim says:**

> My proposal is an optional customer account with booking history.
>
> Guest booking should remain available, but returning customers could create
> an account and see all their current and previous bookings in one place. This
> would make it easier to find a booking reference and later support favourites
> or personalised offers.
>
> The value for the client is a more convenient service for returning customers
> and a foundation for customer loyalty features. The value for the user is that
> their bookings are no longer spread across separate confirmation screens.
>
> My preliminary estimate is **20 hours**: 8 hours for secure registration and
> login, 4 hours for the profile page, 5 hours for booking history and 3 hours
> for testing and access-control checks.

If the client asks whether registration becomes mandatory:

> My recommendation is no. Mandatory registration adds friction. Guest booking
> should stay available, while the account gives additional convenience to
> customers who want it.

---

# CLIENT DISCUSSION

## 8. Questions for the client — Vadim leads, everyone listens (2–3 minutes)

**Vadim says:**

> These estimates are preliminary. Before choosing the next task, we would like
> to understand your priorities and business rules.

Ask the questions one at a time. Pause after every question and write down the
answer.

1. **Which of our three proposals creates the most value for you right now: the
   administration interface, booking cancellation or customer accounts?**
2. **Should guest booking remain available if customer accounts are added?**
3. **How long before a screening should cancellation be allowed?**
4. **Which employee actions are essential in the first version of the
   administration interface?**
5. **For the next stage, is a reservation without real payment sufficient, or
   should online payment receive a higher priority?**

Useful follow-up phrases:

> Could you give us an example of how you expect that to work?

> Which users would need this function?

> Is this required for the next month, or can it be planned for a later stage?

> To confirm our understanding: you would like us to prioritise ___ because
> ___. Is that correct?

When the client asks for a new feature that has not been estimated:

> Thank you, we have recorded that request. We do not want to give an inaccurate
> estimate immediately. We will first divide it into tasks, check its effect on
> the current booking process and then provide an estimate in hours.

---

## 9. Closing — Vadim (about 30 seconds)

**Vadim says:**

> Thank you for your feedback. Today we demonstrated the complete guest-booking
> process and presented three possible next steps. We have recorded your
> priorities and the business rules that need clarification.
>
> Our next action is to turn the selected proposal into smaller tasks, confirm
> the estimate and agree on what result should be demonstrated at the next
> meeting.

**Ruslan says:**

> Thank you. Do you have any final questions about the current version?

---

# RUSSIAN VERSION — ДЛЯ РЕПЕТИЦИИ

## 1. Начало — Ruslan

> Здравствуйте. Мы Ruslan Rebo, Jegor Onoprijuk и Vadim Šamrin, а наш проект
> называется Lumen Cinema.
>
> Мы хотели решить простую проблему: бронирование билетов не должно требовать
> звонка в кинотеатр, сложной регистрации или долгого поиска подходящего сеанса.
> Наш сайт позволяет посетителю выбрать дату, найти фильм, выбрать сеанс и
> забронировать места в рамках одного понятного процесса.
>
> Сначала мы покажем, что уже работает. Затем каждый участник представит одно
> предложение на следующий месяц, объяснит его пользу клиенту и даст оценку в
> часах. В конце мы хотим узнать ваши приоритеты и записать ваши пожелания.

---

## 2. Каталог и интерфейс — Ruslan

> Это главная страница, которую видит посетитель кинотеатра. Здесь сразу видны
> кинотеатр, доступные даты, фильмы и время сеансов. Основные действия находятся
> на одной странице, поэтому пользователю не нужно разбираться в сложном меню.

**Показать:** выбор даты.

> Программа загружается из локальной базы данных. При изменении даты сайт
> запрашивает сеансы на выбранный день и показывает доступное время.

**Показать:** фильтры Superheroes, Family и All films.

> Фильтр по жанрам помогает пользователю, который уже знает, какой тип фильма
> хочет посмотреть.

**Показать:** поиск по слову `Lego`.

> Через поиск фильм можно найти по названию, жанру или описанию.

**Показать:** More info у одного фильма.

> У каждого фильма есть дополнительная информация, которая помогает принять
> решение.

**Показать:** языки EN, RU и ET.

> Интерфейс поддерживает английский, русский и эстонский языки. Выбранный язык
> сохраняется в браузере.

> Теперь Jegor покажет сам процесс бронирования.

---

## 3. Выбор мест и бронирование — Jegor

**Показать:** открыть сеанс и выбрать два места.

> После выбора сеанса сайт загружает из базы правильный зал, стоимость билета и
> текущую занятость мест.
>
> Занятые места выбрать нельзя. Посетитель может выбрать до десяти разных мест.
> Сайт сразу показывает выбранные места и рассчитывает общую сумму.

**Показать:** перейти к оформлению и ввести `Demo Customer` и
`demo@example.com`.

> Сейчас проект поддерживает гостевое бронирование. Пользователь вводит имя и
> электронную почту, поэтому создание аккаунта не требуется.
>
> Это демонстрационное оформление: настоящая оплата не производится. При
> подтверждении сервер повторно проверяет сеанс и места, а не доверяет данным из
> браузера.

**Показать:** подтвердить бронирование.

> Бронирование сохранено в локальной базе данных. Пользователь получает
> уникальный номер подтверждения. Если открыть этот сеанс снова, выбранные места
> уже будут заняты. База данных также не позволяет двум посетителям успешно
> забронировать одно и то же место на один сеанс.

> Vadim кратко подведёт итог готовой версии и её текущих ограничений.

---

## 4. Что готово и чего пока нет — Vadim

> Текущая версия реализует основной путь гостя: выбор даты, поиск фильма, выбор
> сеанса, выбор свободных мест и сохранение бронирования.
>
> Фильмы, жанры, кинотеатры, залы, места, сеансы и бронирования хранятся в базе.
> Поэтому это не только визуальный макет — бронирование действительно изменяет
> состояние приложения.
>
> Мы также хотим честно обозначить ограничения. Сейчас нет настоящей
> онлайн-оплаты, личного кабинета, отмены бронирования, отправки писем и
> административного интерфейса для сотрудников. Это возможные направления
> развития, но сначала мы хотим согласовать их пользу и приоритет с клиентом.

---

## 5. Предложение Ruslan — административный интерфейс

> Моё предложение на следующий месяц — административный интерфейс для
> сотрудников кинотеатра.
>
> Сейчас клиент может пользоваться программой, но у сотрудника нет удобной
> страницы для её обновления. Административный интерфейс позволит уполномоченному
> сотруднику добавлять и редактировать фильмы, создавать сеансы и скрывать
> фильмы, которые больше не показываются.
>
> Польза для клиента — самостоятельность. Кинотеатр сможет обновлять программу
> без обращения к разработчику. Также станет меньше ошибок от ручного изменения
> технических данных.
>
> Предварительная оценка — **22 часа**: 5 часов на защищённый доступ, 6 часов на
> управление фильмами, 7 часов на управление сеансами и 4 часа на тестирование и
> исправления.

---

## 6. Предложение Jegor — отмена и освобождение мест

> Моё предложение — отмена бронирования с понятным правилом освобождения мест.
>
> Сейчас завершённое бронирование оставляет места занятыми. Если планы клиента
> изменились, он не может самостоятельно отменить бронь, а кинотеатр может
> потерять возможность предложить эти места другому посетителю.
>
> Я предлагаю разрешить пользователю найти бронирование по его номеру и email,
> отменить его до согласованного срока и снова сделать места доступными.
>
> Польза для клиента — лучшая заполняемость зала и меньше ручной работы для
> сотрудников. Ограничение по времени также защитит кинотеатр от слишком поздних
> отмен.
>
> Предварительная оценка — **16 часов**: 4 часа на поиск и проверку бронирования,
> 5 часов на отмену и освобождение мест, 3 часа на интерфейс и 4 часа на проверку
> конфликтов и нестандартных ситуаций.

---

## 7. Предложение Vadim — аккаунт и история бронирований

> Моё предложение — необязательный аккаунт пользователя с историей
> бронирований.
>
> Гостевое бронирование должно остаться, но постоянный клиент сможет создать
> аккаунт и видеть все текущие и прошлые бронирования в одном месте. В будущем
> это также позволит добавить избранные фильмы и персональные предложения.
>
> Польза для клиента — более удобный сервис для постоянных посетителей и основа
> для программы лояльности. Пользователю больше не придётся искать отдельные
> номера подтверждений.
>
> Предварительная оценка — **20 часов**: 8 часов на безопасную регистрацию и
> вход, 4 часа на страницу профиля, 5 часов на историю бронирований и 3 часа на
> тестирование и проверку прав доступа.

---

## 8. Вопросы клиенту — Vadim задаёт, команда слушает и записывает

> Эти оценки предварительные. Перед выбором следующей задачи мы хотим понять
> ваши приоритеты и правила работы кинотеатра.

1. Какое из трёх предложений сейчас принесёт вам больше пользы:
   административный интерфейс, отмена бронирования или аккаунты пользователей?
2. Должно ли гостевое бронирование остаться после добавления аккаунтов?
3. За какое время до начала сеанса следует разрешать отмену?
4. Какие действия сотрудника обязательны в первой версии административного
   интерфейса?
5. Достаточно ли на следующем этапе бронирования без настоящей оплаты, или
   онлайн-оплата должна получить более высокий приоритет?

Фразы для уточнения:

> Можете привести пример того, как это должно работать?

> Каким пользователям нужна эта функция?

> Это обязательно сделать в следующем месяце или можно запланировать на более
> поздний этап?

> Правильно ли мы поняли, что нужно поставить ___ на первое место, потому что
> ___?

Если клиент просит новую функцию:

> Спасибо, мы записали это пожелание. Мы не хотим сразу давать неточную оценку.
> Сначала разделим функцию на задачи, проверим её влияние на текущее
> бронирование, а затем дадим оценку в часах.

---

## 9. Завершение — Vadim и Ruslan

**Vadim:**

> Спасибо за обратную связь. Сегодня мы показали полный процесс гостевого
> бронирования и предложили три возможных следующих шага. Мы записали ваши
> приоритеты и правила, которые необходимо уточнить.
>
> Наш следующий шаг — разделить выбранное предложение на небольшие задачи,
> подтвердить оценку и согласовать результат, который мы покажем на следующей
> встрече.

**Ruslan:**

> Спасибо. Остались ли у вас вопросы по текущей версии?

---

# Short answers to likely technical questions

Use these only if the client or teacher asks. Do not include them in the main
speech unless necessary.

## What technology is used?

**English:**

> The interface is built with React and TypeScript. A Node.js service handles
> the booking API, and the data is stored in a PostgreSQL-compatible database.

**Русский:**

> Интерфейс сделан на React и TypeScript. Сервер на Node.js обрабатывает API
> бронирования, а данные хранятся в базе, совместимой с PostgreSQL.

## Is this a real payment system?

**English:**

> No. The current checkout is a booking preview. It calculates the total and
> stores the booking, but it does not contact a payment provider or charge money.

**Русский:**

> Нет. Сейчас это демонстрационное оформление: сумма рассчитывается и бронь
> сохраняется, но платёжный сервис не вызывается и деньги не списываются.

## How do you prevent double booking?

**English:**

> The server checks availability during booking, and the database has a unique
> rule for a seat and screening. Even if two requests arrive together, only one
> can reserve the same seat successfully.

**Русский:**

> Сервер проверяет доступность при оформлении, а в базе есть уникальное правило
> для сочетания места и сеанса. Даже если два запроса придут одновременно, одно
> место успешно получит только один из них.

## Why is there no registration?

**English:**

> The first version focuses on the shortest complete customer journey. Guest
> booking lets us validate the booking process before adding account management.

**Русский:**

> Первая версия сосредоточена на самом коротком полном пути клиента. Гостевое
> бронирование позволяет сначала проверить основной процесс, а потом добавлять
> управление аккаунтами.

## How was the work divided?

Do not invent a false history. Use this honest answer:

**English:**

> We developed the project collaboratively instead of assigning every file to
> only one person. We discussed the user flow and checked the complete result as
> a team. For this meeting, we divided responsibility by product area so that
> every member can demonstrate the result and independently defend one next-step
> proposal.

**Русский:**

> Мы разрабатывали проект совместно, а не закрепляли каждый файл только за одним
> человеком. Пользовательский путь мы обсуждали и проверяли всей командой. Для
> этой встречи мы разделили ответственность по частям продукта, чтобы каждый
> участник мог показать результат и самостоятельно защитить одно предложение по
> дальнейшему развитию.

---

# Optional Figma sketches instead of slides

The presentation can be completed without slides. If the teacher expects Figma
sketches, prepare only three simple screens and show each one during its owner's
proposal:

1. **Ruslan:** administration page with a film list, “Add film” and “Add
   screening” buttons.
2. **Jegor:** “Find my booking” page and a cancellation confirmation dialog.
3. **Vadim:** account page with “Upcoming bookings” and “Booking history”.

The sketches do not need to work. Their purpose is to help the client understand
the proposed value and give specific feedback before development starts.

---

# Final rehearsal checklist

- Everyone can say their own part without another member finishing it.
- The main demonstration takes no longer than 7 minutes.
- Only test data is entered during the demonstration.
- The team clearly says that real payment is not implemented.
- Every proposal contains **what**, **why**, **client value** and **hours**.
- At least three questions are asked to the client.
- One person visibly records the answers.
- The team confirms the client's highest priority before closing.
- Total meeting time remains under 15 minutes.
