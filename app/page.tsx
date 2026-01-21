import { Map } from "@/components/map";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Page() {
  return (
    <>
      <Map />
      <div className="absolute bottom-10 right-4 z-10">
        <ThemeToggle />
      </div>
    </>
  );
}
