import { Map } from "@/components/map";
import { ThemeToggle } from "@/components/theme-toggle";
import { InfoButton } from "@/components/info-button";

export default function Page() {
  return (
    <>
      <Map />
      <div className="absolute bottom-10 right-4 z-10 flex flex-col gap-2">
        <InfoButton />
        <ThemeToggle />
      </div>
    </>
  );
}
