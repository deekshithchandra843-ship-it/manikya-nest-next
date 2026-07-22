"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ListingGalleryProps {
  images: string[];
  alt: string;
  saved: boolean;
  onToggleSave: () => void;
  category?: string;
}

const ROOM_CATEGORIES = [
  { 
    label: "Living Room / Hall", 
    index: 0, 
    id: "hall",
    description: "Spacious main hall with premium vitrified tiles and optimized natural ventilation."
  },
  { 
    label: "Kitchen Area", 
    index: 1, 
    id: "kitchen",
    description: "Semi-modular setup equipped with piped gas provisions and granite countertops."
  },
  { 
    label: "Master Bedroom", 
    index: 2, 
    id: "bedroom",
    description: "Comes with large built-in wooden wardrobes and attached private balcony access."
  },
  { 
    label: "Bathroom / Washroom", 
    index: 3, 
    id: "bathroom",
    description: "Modern Western toilet with premium sanitary fixtures and geyser installed."
  },
  { 
    label: "Dining Room / Balcony", 
    index: 4, 
    id: "dining",
    description: "Cozy space perfect for dining table arrangements or setup as utility area."
  },
];

export default function ListingGallery({
  images,
  alt,
  saved,
  onToggleSave,
  category,
}: ListingGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [activeTab, setActiveTab] = useState("hall");
  const [shared, setShared] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isFlat = false;

  const handleShare = () => {
    if (typeof window === "undefined") return;
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: alt,
        url: shareUrl
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  // We want exactly 5 images. If we have fewer, we pad with the first image.
  const displayImages = [...images];
  while (displayImages.length < 5 && displayImages.length > 0) {
    displayImages.push(displayImages[0]);
  }

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (displayImages.length === 0) {
    return (
      <div className="h-[280px] md:h-[360px] bg-surface-soft rounded-[16px] overflow-hidden flex items-center justify-center relative">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-soft" aria-hidden="true">
          <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3m4-10h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01" />
        </svg>
      </div>
    );
  }

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(`modal-img-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    
    // Find which room element is currently in view
    let currentTab = "hall";
    let currentIdx = 0;
    for (let i = 0; i < ROOM_CATEGORIES.length; i++) {
      const cat = ROOM_CATEGORIES[i];
      const el = document.getElementById(`modal-img-${cat.id}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // If element top is near or past container top
        if (rect.top - containerRect.top <= 15) {
          currentTab = cat.id;
          currentIdx = i;
        }
      }
    }
    setActiveTab(currentTab);
    setActiveIdx(currentIdx);
  };

  return (
    <section className="mb-6">
      <div className="relative rounded-[16px] overflow-hidden bg-surface-soft shadow-airbnb">
        {/* Desktop 5-image grid layout */}
        <div className="hidden md:grid md:grid-cols-4 md:grid-rows-2 md:gap-2 h-[380px] lg:h-[450px]">
          {/* Left Column — 1 Large Image (spans 2 cols, 2 rows) */}
          <div 
            onClick={() => { setActiveIdx(0); setIsOpen(true); }}
            className="col-span-2 row-span-2 relative overflow-hidden group/main cursor-pointer"
          >
            <Image
              src={displayImages[0]}
              alt={`${alt} — Main view`}
              fill
              sizes="50vw"
              className="object-cover photo-enhance transition-transform duration-700 ease-out group-hover/main:scale-105"
              priority
            />
            {isFlat && (
              <span className="absolute bottom-3 left-3 bg-black/65 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Living Room / Hall
              </span>
            )}
          </div>

          {/* Right Column Grid — 4 smaller images */}
          {displayImages.slice(1, 5).map((img, i) => {
            const cat = ROOM_CATEGORIES[i + 1];
            return (
              <div 
                key={i} 
                onClick={() => { setActiveIdx(i + 1); setIsOpen(true); }}
                className="relative overflow-hidden group/thumb cursor-pointer"
              >
                <Image
                  src={img}
                  alt={`${alt} — view ${i + 2}`}
                  fill
                  sizes="25vw"
                  className="object-cover photo-enhance transition-all duration-500 group-hover/thumb:scale-105"
                  style={{ opacity: 0.85 + i * 0.03, filter: `brightness(${0.95 - i * 0.04})` }}
                  loading="lazy"
                />
                {isFlat && cat && (
                  <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    {cat.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile single image container */}
        <div 
          onClick={() => { setActiveIdx(0); setIsOpen(true); }}
          className="block md:hidden relative aspect-[4/3] w-full group/mobile cursor-pointer"
        >
          <Image
            src={displayImages[0]}
            alt={`${alt} — mobile view`}
            fill
            sizes="100vw"
            className="object-cover photo-enhance"
            priority
          />
          {isFlat && (
            <span className="absolute bottom-3 left-3 bg-black/65 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              Living Room / Hall (Tap for all spaces)
            </span>
          )}
        </div>

        {/* Share button overlay */}
        <button
          type="button"
          onClick={handleShare}
          className="absolute top-4 right-[60px] w-9 h-9 flex items-center justify-center rounded-full bg-canvas/90 shadow-airbnb hover:scale-105 active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch z-10"
          aria-label="Share listing"
        >
          {shared ? (
            <span className="text-[10px] font-bold text-emerald-600">✓</span>
          ) : (
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted"
              aria-hidden="true"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          )}
        </button>

        {/* Save button overlay (fits both layouts because it's absolute to the parent) */}
        <button
          type="button"
          onClick={onToggleSave}
          aria-pressed={saved}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-canvas/90 shadow-airbnb hover:scale-105 active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch z-10"
          aria-label={saved ? "Remove from saved" : "Save listing"}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={saved ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            className={saved ? "text-rausch" : "text-muted"}
            aria-hidden="true"
          >
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Full screen Airbnb style photo gallery modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-canvas flex flex-col animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-hairline-soft bg-canvas shrink-0">
            <p className="text-ink text-sm font-bold truncate max-w-md">{alt}</p>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full bg-surface-soft text-muted hover:text-ink hover:bg-surface-strong transition-colors"
              aria-label="Close Gallery"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Airbnb style layout */}
          {isFlat ? (
            <div className="flex-1 min-h-0 flex flex-col md:flex-row bg-canvas">
              {/* Sidebar Navigation */}
              <div className="w-full md:w-[240px] shrink-0 p-4 md:py-8 md:pl-6 md:pr-4 flex md:flex-col gap-5 overflow-x-auto md:overflow-y-auto scrollbar-none bg-canvas">
                {ROOM_CATEGORIES.map((cat) => {
                  const isActive = activeTab === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleTabClick(cat.id)}
                      className={`text-left border-transparent transition-all shrink-0 whitespace-nowrap md:whitespace-normal md:w-full border-b-2 md:border-b-0 md:border-l-2 pb-2.5 md:pb-0 md:pl-3.5 flex flex-col gap-1 ${
                        isActive
                          ? "text-rausch border-rausch md:border-rausch"
                          : "text-muted border-transparent hover:border-neutral-300 md:hover:border-neutral-300"
                      }`}
                    >
                      <span className={`text-xs font-extrabold ${isActive ? "text-rausch" : "text-ink"}`}>{cat.label}</span>
                      <span className="hidden md:block text-[10px] text-muted-soft font-normal leading-relaxed max-w-[190px]">
                        {cat.description}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Labeled Photo Scroll feed (Clean Full-Page overlapping images with Parallax transition) */}
              <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto scroll-smooth bg-canvas"
              >
                {ROOM_CATEGORIES.map((cat, idx) => {
                  const isUnderneath = idx < activeIdx;
                  return (
                    <div 
                      key={cat.id} 
                      id={`modal-img-${cat.id}`}
                      className="sticky w-full h-[calc(100vh-130px)] md:h-[calc(100vh-57px)] bg-canvas border-t border-hairline-soft/60 shadow-[0_-12px_24px_rgba(0,0,0,0.05)] overflow-hidden"
                      style={{ zIndex: 10 + idx * 10, top: "0" }}
                    >
                      <div className="relative w-full h-full overflow-hidden">
                        <div className={`w-full h-full transition-all duration-700 ease-out origin-center ${
                          isUnderneath 
                            ? "scale-95 opacity-50 blur-[1px] brightness-[0.75] translate-y-4" 
                            : "scale-100 opacity-100 blur-0 brightness-100 translate-y-0"
                        }`}>
                          <Image
                            src={displayImages[cat.index]}
                            alt={cat.label}
                            fill
                            sizes="100vw"
                            className="object-cover"
                            priority={cat.index === 0}
                          />
                        </div>
                        {/* Floating room category card (Airbnb Style) */}
                        <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-md border border-hairline-soft/50 z-20">
                          <p className="text-xs font-bold text-ink tracking-wide">{cat.label}</p>
                          <p className="text-[9px] text-muted mt-0.5 font-semibold">Space {idx + 1} of 5</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Non-flat simple lightbox slider */
            <div className="flex-grow flex items-center justify-center relative p-6 bg-canvas">
              <div className="relative aspect-[4/3] w-full max-w-[800px] rounded-2xl overflow-hidden bg-surface-soft border border-hairline-soft shadow-airbnb">
                <Image
                  src={displayImages[activeIdx]}
                  alt={`${alt} - view ${activeIdx + 1}`}
                  fill
                  className="object-cover"
                />
                
                {/* Count badge */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 rounded-full text-white text-xs font-bold">
                  {activeIdx + 1} / {displayImages.length}
                </div>
              </div>

              {/* Left/Right Navigation */}
              <button
                onClick={() => setActiveIdx((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))}
                className="absolute left-4 p-3 rounded-full bg-surface-soft/80 text-ink hover:bg-surface-strong transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={() => setActiveIdx((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))}
                className="absolute right-4 p-3 rounded-full bg-surface-soft/80 text-ink hover:bg-surface-strong transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
