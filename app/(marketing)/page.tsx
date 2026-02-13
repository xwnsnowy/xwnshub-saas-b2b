import { HeroHeader } from '@/app/(marketing)/_components/header';
import HeroSection from '@/app/(marketing)/_components/hero-section';
import { AboutSection } from '@/app/(marketing)/_components/about-section';

export default function Home() {
  return (
    <div>
      <HeroHeader />
      <HeroSection />
      <AboutSection />
    </div>
  );
}
