import { Map } from "@/components/map";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Page() {
  return (
    <main className="relative w-screen h-screen overflow-hidden">
      <Map />
      <div className="absolute bottom-4 right-4 z-10">
        <ThemeToggle />
      </div>
    </main>
  );
}
