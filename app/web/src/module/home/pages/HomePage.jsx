import { BannerSearch } from "@/module/home/components/BannerSearch";
import { BannerSlider } from "@/module/home/components/BannerSlider";
import { HomeDiscovery } from "@/module/home/components/HomeDiscovery";
import { HomeCta } from "@/module/home/components/HomeCta";
import { HomeFaq } from "@/module/home/components/HomeFaq";
import { HostQuotes } from "@/module/home/components/HostQuotes";
import { PopularCities } from "@/module/home/components/PopularCities";
import { HomePromoBanner } from "@/module/cms/components/HomePromoBanner";
import { useHomeCms } from "@/module/cms/hooks/use-home-cms";

export function HomePage() {
  const { hero, mid, end, testimonials } = useHomeCms();

  return (
    <div className="pb-4">
      <div className="mx-auto max-w-[1240px] px-4 pt-4 md:px-8 md:pt-6">
        <BannerSlider slides={hero} />
        <div className="mx-auto mt-5 max-w-[920px] md:mt-8">
          <BannerSearch />
        </div>
      </div>
      <HomeDiscovery />
      {mid[0] ? <HomePromoBanner slide={mid[0]} className="mt-10" /> : null}
      <PopularCities />
      <HostQuotes reviews={testimonials} />
      {end[0] ? <HomePromoBanner slide={end[0]} className="mt-4" /> : null}
      <HomeFaq />
      <HomeCta />
    </div>
  );
}
