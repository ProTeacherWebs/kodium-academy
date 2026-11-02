// Общий для сервера и браузера код: без обращения к файлам
export type Course = {
  slug: string;
  title: string;
  direction: string;
  duration: string;
  price: number | null;
  format: string;
  description: string;
  program: string[];
};

export function formatPrice(price: number | null): string {
  return price === null ? "Цена по запросу" : `${new Intl.NumberFormat("ru-RU").format(price)} сум / мес`;
}
