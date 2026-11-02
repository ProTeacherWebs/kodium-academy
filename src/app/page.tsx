import { Suspense } from "react";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { CourseCatalog } from "@/components/home/CourseCatalog";
import { Directions } from "@/components/home/Directions";
import { Faq } from "@/components/home/Faq";
import { Footer } from "@/components/home/Footer";
import { Header } from "@/components/home/Header";
import { Hero } from "@/components/home/Hero";
import { LeadForm } from "@/components/home/LeadForm";
import { Process } from "@/components/home/Process";
import { Reviews } from "@/components/home/Reviews";
import { Teachers } from "@/components/home/Teachers";
import { WhyUs } from "@/components/home/WhyUs";
import { getCourses } from "@/lib/courses";

async function Catalog() {
  return <CourseCatalog courses={await getCourses()} />;
}

async function Apply() {
  return <LeadForm courses={await getCourses()} />;
}

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Directions />
        <Suspense fallback={<div id="courses" className="h-96" aria-hidden />}>
          <Catalog />
        </Suspense>
        <WhyUs />
        <Process />
        <Teachers />
        <Reviews />
        <Faq />
        <Suspense fallback={<div id="apply" className="h-96" aria-hidden />}>
          <Apply />
        </Suspense>
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
