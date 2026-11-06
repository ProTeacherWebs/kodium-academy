// Общий для сервера и браузера код: без обращения к файлам
export type Course = {
  slug: string;
  title: string;
  direction: string;
  duration: string;
  price: string;
  format: string;
  description: string;
  program: string[];
};

// Число из таблицы выводится как цена в месяц, любой текст («Бесплатно», «от 1 млн») — как есть
export function formatPrice(price: string): string {
  if (!price) return "Цена по запросу";
  return /^[\d\s.,]+$/.test(price) ? `${new Intl.NumberFormat("ru-RU").format(Number(price.replace(/[^\d]/g, "")))} сум / мес` : price;
}
