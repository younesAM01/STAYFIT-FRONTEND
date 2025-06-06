import AboutUs from "@/components/about-section";
import ContactForm from "@/components/contactus";
import FAQ from "@/components/faq";
import HeroSection from "@/components/hero-section";
import FitnessNavbar from "@/components/moving-bare";
import MembershipPlans from "@/components/pack";
import TestimonialSlider from "@/components/testemonia";
import Timeline from "@/components/timeline";
import TrainerShowcase from "@/components/trainer";



export default async function Home() {

  

  return (
    <main className="overflow-x-hidden">
      <HeroSection />
      <FitnessNavbar /> 
      <div className="my-8">
      <AboutUs />
      <Timeline  />
      <TrainerShowcase />
      <TestimonialSlider /> 
      <MembershipPlans />
      <ContactForm /> 
      <FAQ />
      </div>
    </main>
  );
}