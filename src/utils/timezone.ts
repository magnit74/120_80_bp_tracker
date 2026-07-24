export const isCallCenterOpen = (): { isOpen: boolean; nextOpenText: string } => {
  // Текущее время (Current time)
  const now = new Date();

  // Получаем компоненты времени в часовом поясе America/New_York (EST/EDT)
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour12: false,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
  const parts = formatter.formatToParts(now);

  let year = now.getFullYear();
  let month = now.getMonth() + 1;
  let dayOfMonth = now.getDate();
  let hours = now.getHours();
  let minutes = now.getMinutes();

  parts.forEach(p => {
    if (p.type === 'year') year = parseInt(p.value, 10);
    if (p.type === 'month') month = parseInt(p.value, 10);
    if (p.type === 'day') dayOfMonth = parseInt(p.value, 10);
    if (p.type === 'hour') hours = parseInt(p.value, 10);
    if (p.type === 'minute') minutes = parseInt(p.value, 10);
  });

  // Создаем локальную дату, которая соответствует календарному времени в Нью-Йорке
  // чтобы получить правильный день недели (getDay())
  const estDate = new Date(year, month - 1, dayOfMonth, hours, minutes);
  const day = estDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Переводим текущее время в минуты с начала дня для удобства сравнения
  const currentMinutes = hours * 60 + minutes;

  // Функция для конвертации часов/минут в минуты с начала дня
  const toMins = (h: number, m: number) => h * 60 + m;

  // График работы из карточки оффера (EST):
  // Пн-Чт: 10:30 - 19:00
  // Пт: 09:30 - 15:00
  // Сб-Вс: Выходной

  if (day >= 1 && day <= 4) {
    // Monday - Thursday
    const openTime = toMins(10, 30);
    const closeTime = toMins(19, 0);
    
    if (currentMinutes >= openTime && currentMinutes < closeTime) {
      return { isOpen: true, nextOpenText: '' };
    }
    
    // Если закрыто, пишем когда откроется
    if (currentMinutes < openTime) {
      return { isOpen: false, nextOpenText: 'Opens at 10:30 AM EST' };
    } else {
      // Если закрылось вечером, откроется завтра (или в пятницу)
      const nextDayTime = day === 4 ? '9:30 AM' : '10:30 AM';
      return { isOpen: false, nextOpenText: `Opens tmrw ${nextDayTime} EST` };
    }
  } else if (day === 5) {
    // Friday
    const openTime = toMins(9, 30);
    const closeTime = toMins(15, 0);

    if (currentMinutes >= openTime && currentMinutes < closeTime) {
      return { isOpen: true, nextOpenText: '' };
    }

    if (currentMinutes < openTime) {
      return { isOpen: false, nextOpenText: 'Opens at 9:30 AM EST' };
    } else {
      // Если закрылось в пятницу, откроется в понедельник
      return { isOpen: false, nextOpenText: 'Opens Mon 10:30 AM EST' };
    }
  } else {
    // Weekend (Saturday, Sunday)
    return { isOpen: false, nextOpenText: 'Opens Mon 10:30 AM EST' };
  }
};
