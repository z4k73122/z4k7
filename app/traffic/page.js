// app/traffic/page.js
import TrafficValidator from "@/components/TrafficValidator";

export const metadata = {
  title: "Traffic Dashboard",
  description: "Monitor de tráfico en vivo",
};

export default function TrafficPage() {
  return (
    <main>
      <TrafficValidator />
    </main>
  );
}
