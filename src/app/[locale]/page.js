import AboutUs from "@/components/about-section";
import HeroSection from "@/components/hero-section";
import FitnessNavbar from "@/components/moving-bare";



export default async function Home() {


  return (
    <main>
      <HeroSection />
      <FitnessNavbar /> 
      <div className="my-8">
      <AboutUs />

      </div>
    </main>
  );
}
