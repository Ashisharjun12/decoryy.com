import { BannerSearch } from "@/module/home/components/BannerSearch";
import { BannerSlider } from "@/module/home/components/BannerSlider";
import { HomeCta } from "@/module/home/components/HomeCta";
import { HomeFaq } from "@/module/home/components/HomeFaq";
import { HostQuotes } from "@/module/home/components/HostQuotes";
import { PopularCities } from "@/module/home/components/PopularCities";
import { TrendingGrid } from "@/module/home/components/TrendingGrid";

export function HomePage() {
  return (
    <div className="pb-4">
      <div className="mx-auto max-w-[1240px] px-4 pt-4 md:px-8 md:pt-6">
        <BannerSlider />
        <div className="mx-auto mt-5 max-w-[920px] md:mt-8">
          <BannerSearch />
        </div>
      </div>
      <TrendingGrid />
      <PopularCities />
      <HostQuotes />
      <HomeFaq />
      <HomeCta />
    </div>
  );
}
