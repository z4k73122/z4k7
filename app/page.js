import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Skills from "@/components/Skills";
import Labs from "@/components/Labs";
import Graph from "@/components/Graph";
import Certs from "@/components/Certs";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <Skills />
      <Labs />
      <Graph />
      <Certs />
      <Contact />
    </main>
  );
}
