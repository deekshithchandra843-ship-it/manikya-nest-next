"use client";

/**
 * CategoryHero — dispatcher
 *
 * Renders the correct per-category hero based on the category slug.
 * Add a new case here whenever a new category is added to categories.ts.
 *
 * All heroes accept an optional `city` prop so the correct city name can be
 * injected at the call site (defaults to "Bengaluru").
 */

import RentHero from "./RentHero";
import BuyHero from "./BuyHero";
import PgHero from "./PgHero";
import ColivingHero from "./ColivingHero";
import FlatmateHero from "./FlatmateHero";
import CommercialOfficeHero from "./CommercialOfficeHero";
import CommercialShopHero from "./CommercialShopHero";
import CoworkingHero from "./CoworkingHero";
import WarehouseHero from "./WarehouseHero";
import LandHero from "./LandHero";
import LeaseHero from "./LeaseHero";
import HomestayHero from "./HomestayHero";
import ResortHero from "./ResortHero";
import ServiceApartmentHero from "./ServiceApartmentHero";
import HotelHero from "./HotelHero";

interface CategoryHeroProps {
  slug: string;
  city?: string;
}

export default function CategoryHero({ slug, city = "Bengaluru" }: CategoryHeroProps) {
  switch (slug) {
    case "rent":
      return <RentHero city={city} />;
    case "buy":
      return <BuyHero city={city} />;
    case "pg":
      return <PgHero city={city} />;
    case "coliving":
      return <ColivingHero city={city} />;
    case "flatmate":
      return <FlatmateHero city={city} />;
    case "commercial-office":
      return <CommercialOfficeHero city={city} />;
    case "commercial-shop":
      return <CommercialShopHero city={city} />;
    case "coworking":
      return <CoworkingHero city={city} />;
    case "warehouse":
      return <WarehouseHero city={city} />;
    case "land":
      return <LandHero city={city} />;
    case "lease":
      return <LeaseHero city={city} />;
    case "homestay":
      return <HomestayHero city={city} />;
    case "resort":
      return <ResortHero city={city} />;
    case "service-apartment":
      return <ServiceApartmentHero city={city} />;
    case "hotel":
      return <HotelHero city={city} />;
    default:
      // Unknown slug — render nothing; the category page handles its own 404.
      return null;
  }
}
