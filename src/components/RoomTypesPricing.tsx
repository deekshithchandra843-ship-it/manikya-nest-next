"use client";

import { Tv, BedDouble, Armchair, Bed, DoorOpen, Wifi, Wind, Utensils, ShieldCheck } from "lucide-react";

type RoomType = {
  id: string;
  label: string;
  icon: "double" | "triple" | "others";
  price: number;
  deposit: number;
  amenities?: string[]; // optional override; defaults to standard set below
};

type RoomTypesPricingProps = {
  roomTypes?: RoomType[];
  title?: string;
  className?: string;
};

const ROOM_ICONS: Record<RoomType["icon"], React.ElementType> = {
  double: Bed,
  triple: BedDouble,
  others: DoorOpen,
};

const DEFAULT_ROOM_TYPES: RoomType[] = [
  { id: "double", label: "Double Bed Sharing", icon: "double", price: 7000, deposit: 2000, amenities: ["High-speed Wi-Fi", "Attached Bath", "Personal Wardrobe", "Study Desk"] },
  { id: "triple", label: "Triple Bed Sharing", icon: "triple", price: 5500, deposit: 2000, amenities: ["High-speed Wi-Fi", "Attached Bath", "Personal Wardrobe"] },
  { id: "others", label: "Single Room Private", icon: "others", price: 12000, deposit: 4000, amenities: ["High-speed Wi-Fi", "Attached Bath", "Personal Wardrobe", "Study Desk", "Air Conditioner"] },
];

const AMENITY_ICONS: Record<string, React.ElementType> = {
  "High-speed Wi-Fi": Wifi,
  "Attached Bath": DoorOpen,
  "Personal Wardrobe": Armchair,
  "Study Desk": Tv, // Fallback icon
  "Air Conditioner": Wind,
  "Meals Included": Utensils,
  "24/7 Security": ShieldCheck,
};

export default function RoomTypesPricing({ roomTypes: providedRoomTypes, title = "Room Options & Pricing", className }: RoomTypesPricingProps) {
  const roomTypesToRender = providedRoomTypes?.length ? providedRoomTypes : DEFAULT_ROOM_TYPES;

  return (
    <section className={`w-full rounded-[20px] border border-hairline bg-canvas p-6 shadow-sm ${className ?? ""}`.trim()}>
      <h2 className="mb-5 text-[17px] md:text-[20px] font-bold text-ink">{title}</h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {roomTypesToRender.map((room) => {
          const HeaderIcon = ROOM_ICONS[room.icon] || Bed;
          const roomAmenities = room.amenities ?? ["High-speed Wi-Fi", "Attached Bath", "Personal Wardrobe"];

          return (
            <div
              key={room.id}
              className="overflow-hidden rounded-2xl border border-hairline bg-canvas transition-all duration-300 hover:shadow-airbnb hover:border-rausch/20 hover:-translate-y-0.5"
            >
              {/* Header banner */}
              <div className="flex items-center gap-2.5 bg-rausch/[0.04] px-5 py-4 border-b border-hairline-soft">
                <div className="w-8 h-8 rounded-lg bg-rausch/10 flex items-center justify-center text-rausch">
                  <HeaderIcon className="h-4.5 w-4.5" />
                </div>
                <span className="font-bold text-ink text-sm">{room.label}</span>
              </div>

              {/* Body */}
              <div className="px-5 py-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-rausch">
                    ₹{room.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs font-semibold text-muted">/month</span>
                </div>

                <p className="mt-1 text-xs text-muted">
                  Security Deposit:{" "}
                  <span className="font-semibold text-body">
                    ₹{room.deposit.toLocaleString("en-IN")}
                  </span>
                </p>

                <hr className="my-4 border-hairline-soft" />

                <p className="mb-3 text-[10px] font-bold tracking-wider text-muted uppercase">
                  Room Features
                </p>

                <div className="space-y-2.5">
                  {roomAmenities.map((amenity) => {
                    const Icon = AMENITY_ICONS[amenity] || ShieldCheck;
                    return (
                      <div key={amenity} className="flex items-center gap-2 text-xs text-body">
                        <Icon className="h-3.5 w-3.5 text-muted shrink-0" />
                        <span className="font-medium truncate">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
