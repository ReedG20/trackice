import { MapView } from "@/components/map";
import { ThemeToggle } from "@/components/theme-toggle";
import { InfoButton } from "@/components/info-button";

export default function Page() {
  return (
    <>
      <MapView />
      <div className="absolute top-4 right-4 z-10">
        <InfoButton />
      </div>
      <div className="absolute bottom-4 right-4 z-10">
        <ThemeToggle />
      </div>
    </>
  );
}
