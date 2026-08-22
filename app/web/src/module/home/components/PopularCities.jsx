import { ArrowRightIcon } from "lucide-react";
import { useLocationStore } from "@/store/location.store";
import { Reveal } from "@/module/home/components/Reveal";

const CITY_TONES = [
  "from-amber-400 to-amber-200",
  "from-orange-400 to-rose-200",
  "from-emerald-600 to-lime-300",
  "from-sky-500 to-teal-200",
  "from-rose-400 to-rose-200",
  "from-slate-600 to-slate-300",
  "from-violet-500 to-fuchsia-200",
  "from-yellow-600 to-amber-300",
];

export function PopularCities() {
  const cities = useLocationStore((s) => s.cities);
  const setLocation = useLocationStore((s) => s.setLocation);

  if (cities.length === 0) {
    return null;
  }

  return (
    <Reveal className="mx-auto max-w-[1240px] px-4 py-16 md:px-8">
      <div className="mb-8">
        <span className="mb-0.5 block text-[15px] font-bold tracking-wide text-amber-800 italic uppercase dark:text-primary">
          wherever you&apos;re celebrating
        </span>
        <h2 className="font-heading text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight">
          Popular in your city
        </h2>
        <p className="mt-2 max-w-[460px] text-[15px] text-muted-foreground">
          Pick a city to price the catalog. Setups stay the same; the rate is local.
        </p>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {cities.map((city, index) => (
          <button
            key={city.id}
            type="button"
            onClick={() =>
              setLocation({ city, pincode: null, source: "manual" })
            }
            className={`relative h-[140px] w-[210px] shrink-0 overflow-hidden rounded-[20px] bg-linear-to-br p-5 text-left text-white ${CITY_TONES[index % CITY_TONES.length]}`}
          >
            <h4 className="font-heading text-[19px] font-extrabold">{city.name}</h4>
            <span className="text-[12.5px] text-white/90">{city.state}</span>
            <span className="absolute right-4 bottom-4 flex size-8 items-center justify-center rounded-full bg-white/25">
              <ArrowRightIcon className="size-4" />
            </span>
          </button>
        ))}
      </div>
    </Reveal>
  );
}
