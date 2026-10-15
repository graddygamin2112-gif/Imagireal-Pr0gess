import { useSeoMeta } from '@unhead/react';

import { Nav } from '@/components/sections/Nav';
import { Hero } from '@/components/sections/Hero';
import { Stats } from '@/components/sections/Stats';
import { LogoStrip } from '@/components/sections/LogoStrip';
import { Features } from '@/components/sections/Features';
import { StudioDemo } from '@/components/sections/StudioDemo';
import { Showcase3D } from '@/components/sections/Showcase3D';
import { Workflow } from '@/components/sections/Workflow';
import { Pricing } from '@/components/sections/Pricing';
import { Testimonials } from '@/components/sections/Testimonials';
import { CTA, Footer } from '@/components/sections/CTA';
import { ScrollAurora } from '@/components/motion/ScrollAurora';

const Index = () => {
  useSeoMeta({
    title: 'Imagireal — Free Professional Video Editing Suite',
    description:
      'Imagireal is a free, professional-grade video editing suite with real-time 8K playback, node colour grading and studio sound — no subscriptions, no watermarks.',
    ogTitle: 'Imagireal — Edit at the speed of thought',
    ogDescription:
      'A free, professional video editing suite for editors who refuse to compromise. Real-time 8K, node colour, studio sound, unlimited free exports.',
    ogType: 'website',
  });

  return (
    <div className="grain relative min-h-screen overflow-x-clip bg-background">
      <ScrollAurora />
      <Nav />
      <main>
        <Hero />
        <Stats />
        <LogoStrip />
        <Features />
        <StudioDemo />
        <Showcase3D />
        <Workflow />
        <Pricing />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;