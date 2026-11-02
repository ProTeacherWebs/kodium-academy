import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Footer } from "@/components/home/Footer";
import { Header } from "@/components/home/Header";
import { LeadForm } from "@/components/home/LeadForm";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatPrice, getCourse, getCourses } from "@/lib/courses";

export async function generateMetadata({ params }: PageProps<"/courses/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);
  return course ? { title: `${course.title} — Kodium Academy`, description: course.description } : { title: "Курс не найден" };
}

async function CourseContent({ params }: { params: PageProps<"/courses/[slug]">["params"] }) {
  const { slug } = await params;
  const [course, courses] = await Promise.all([getCourse(slug), getCourses()]);
  if (!course) notFound();

  const facts = [
    ["Длительность", course.duration],
    ["Формат", course.format],
    ["Стоимость", formatPrice(course.price)],
  ].filter(([, value]) => value);

  return (
    <>
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <Badge tone="gold">{course.direction}</Badge>
        <h1 className="mt-6 max-w-3xl font-display text-2xl font-medium leading-tight tracking-tight sm:text-4xl lg:text-5xl">{course.title}</h1>
        <p className="mt-6 max-w-2xl text-lg text-mist">{course.description}</p>
        <div className="mt-8">
          <Button href="#apply" size="lg">
            Записаться на пробное занятие
          </Button>
        </div>
        <dl className="mt-12 grid gap-4 sm:grid-cols-3">
          {facts.map(([label, value]) => (
            <Card key={label}>
              <dt className="text-sm text-mist">{label}</dt>
              <dd className="mt-2 font-display text-lg tabular-nums">{value}</dd>
            </Card>
          ))}
        </dl>
        {course.program.length > 0 && (
          <>
            <h2 className="mt-16 font-display text-2xl">Программа курса</h2>
            <ol className="mt-6 max-w-2xl divide-y divide-line border-y border-line">
              {course.program.map((item, i) => (
                <li key={item} className="flex gap-4 py-4">
                  <span className="font-display text-gold">{i + 1}</span>
                  {item}
                </li>
              ))}
            </ol>
          </>
        )}
      </section>
      <LeadForm courses={courses} defaultCourse={course.slug} />
    </>
  );
}

export default function CoursePage({ params }: PageProps<"/courses/[slug]">) {
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<div className="h-screen" aria-hidden />}>
          <CourseContent params={params} />
        </Suspense>
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
