#Архив метеослужбы

###Задача:

Разработать клиент для визуализации данных веб-сервиса, который хранит архив изменений температуры и уровня осадков за последние 120 лет в одном из городов России.

###Средства разработки:
- HTML5/CSS3
- JavaScript без использования сторонних библиотек и инструментов

###Требование к исходному коду:
- Приложение должно быть выполнено в идеологии Single Page Application
- Исходный код должен быть оформлен в едином стиле и содержать необходимые комментарии
- Аккуратность исходного кода будет оцениваться наряду с функциональностью приложения
- Можно использовать возможности последних версий браузеров (Chrome, Firefox, IE11, Edge). Требований по минимально поддерживаемой версии браузера нет.
- Файлы с исходным кодом тестового задания не должен быть обсфуцированы

###Шаблон интерфейса приложения
![UI apllication template](https://shavenzov.github.io/weather-service-archive/unnamed.png)

###Техническое описание приложения
- Страница приложения состоит из двух частей - выбора типа данных и графика с визуализацией выбранных данных.
- По умолчанию пользователь должен видеть данные архива изменения температуры.
- Для построения графика используются данные из IndexedDB 
- Данные на клиенте хранятся в двух таблицах temperature и precipitation
- При отсутствии данных в таблице, данные для нее запрашиваются с сервера.
- Данные с сервера запрашиваются по требованию, когда произошло обращение за соответствующими данными в локальную базу данных и они в ней не найдены.
- Данные для каждой из таблиц запрашиваются с сервера отдельно.
- Запись за отдельный месяц метеорологических измерений должна хранится как отдельный объект/запись в IndexedDB.
- Серверную части можно организовать просто как отдачу файлов c удобного для вас веб-сервера или реализовать сервер на Node.js.
- Файлы с данными, которые нужно использовать при выполнении тестового задания прикреплены к письму.
- По умолчанию на графике должны быть отображены данные за весь период с 1881 по 2006 год, то есть должны использоваться все данные полученные с сервера (46020 записей).
- Никаких расчетов на сервере делать нельзя.
- Пользователь должен иметь возможность уточнить период отображения архива и указать период с точностью до года.
- Для отображения графика использовать Canvas
- При формировании графика интерфейс приложения не должен "замораживаться" и пользователю должны быть доступны для выбора все элементы управления.
- Не должно быть запретов и ожиданий при переключении типов данных или выбора значений для фильтра.
- Расчеты можно делать в отдельном WebWorker-е.

###Дополнительно
- Проявление инициативы сверх основного задания приветствуется
- При разработке функционала нужно сделать упор на производительность и скорость работы как интерфейса приложения, так и обработки полученных с сервера данных