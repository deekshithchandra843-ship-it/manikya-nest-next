"use client";

import { Tv, BedDouble, Presentation, PanelsTopLeft, Armchair, Bed, DoorOpen } from "lucide-react";

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

const DEFAULT_AMENITY_ICONS = [Tv, BedDouble, Presentation, PanelsTopLeft, Armchair];

const ROOM_ICONS: Record<RoomType["icon"], React.ElementType> = {
  double: Bed,
  triple: DoorOpen, // swap for a triple-bed icon if you add a custom SVG
  others: PanelsTopLeft,
};

const DEFAULT_ROOM_TYPES: RoomType[] = [
  { id: "double", label: "Double Bed", icon: "double", price: 7000, deposit: 2000 },
  { id: "triple", label: "Triple Bed", icon: "triple", price: 5500, deposit: 2000 },
  { id: "others", label: "Others", icon: "others", price: 5000, deposit: 2000 },
];

export default function RoomTypesPricing({ roomTypes: providedRoomTypes, title = "Room Types & Pricing", className }: RoomTypesPricingProps) {
  const roomTypesToRender = providedRoomTypes?.length ? providedRoomTypes : DEFAULT_ROOM_TYPES;

  return (
    <section className={`w-full rounded-2xl border border-gray-200 bg-white p-6 ${className ?? ""}`.trim()}>
      <h2 className="mb-5 text-xl font-bold text-gray-900">{title}</h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {roomTypesToRender.map((room) => {
          const HeaderIcon = ROOM_ICONS[room.icon];
          const isOthers = room.icon === "others";

          return (
            <div
              key={room.id}
              className="overflow-hidden rounded-xl border border-orange-100 transition-transform duration-300 ease-out hover:scale-[1.03] hover:shadow-lg hover:shadow-orange-100/60 will-change-transform"
            >
              {/* Header banner */}
              <div
                className={`flex items-center gap-2 bg-orange-50 px-5 py-4 ${
                  isOthers ? "justify-center" : ""
                }`}
              >
                {!isOthers && <HeaderIcon className="h-5 w-5 text-orange-500" />}
                <span className="font-semibold text-orange-600">{room.label}</span>
              </div>

              {/* Body */}
              <div className="px-5 py-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-orange-500">
                    ₹{room.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm text-gray-400">/month</span>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  Deposit:{" "}
                  <span className="font-medium text-gray-700">
                    ₹{room.deposit.toLocaleString("en-IN")}
                  </span>
                </p>

                <hr className="my-4 border-gray-100" />

                <p className="mb-2 text-xs font-semibold tracking-wide text-gray-400">
                  ROOM AMENITIES
                </p>

                <div className="flex flex-wrap gap-2">
                  {DEFAULT_AMENITY_ICONS.map((Icon, i) => (
                    <div
                      key={i}
                      className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-100 text-gray-600"
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
