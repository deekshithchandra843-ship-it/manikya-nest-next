"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star, ShieldCheck } from "lucide-react";

interface Review {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  location: string;
  date: string;
}

const REVIEWS_DATA: Review[] = [
  {
    id: 1,
    name: "Aarav Mehta",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    text: "Finding a PG near my office in HSR Layout was completely stress-free with FindWay. The commuting map is a lifesaver!",
    location: "PG in HSR Layout",
    date: "July 12, 2026",
  },
  {
    id: 2,
    name: "Sneha Nair",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    text: "Beautiful interface, and all details were 100% accurate. I booked a double sharing co-living room directly with the owner.",
    location: "Co-living in Koramangala",
    date: "July 08, 2026",
  },
  {
    id: 3,
    name: "Rahul Sharma",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    text: "No brokerage fees and verified properties. I visited three places and they all looked exactly like the photos.",
    location: "2BHK Rent in Indiranagar",
    date: "June 28, 2026",
  },
  {
    id: 4,
    name: "Pooja Hegde",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    text: "Excellent service. The option to map out my daily travel times made choosing a place so much easier.",
    location: "1BHK Rent in Whitefield",
    date: "June 25, 2026",
  },
  {
    id: 5,
    name: "Vikram Malhotra",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    text: "Highly recommended for students and professionals. Safe, secure, and truly modern rental options listed.",
    location: "Hostel in Jayanagar",
    date: "June 19, 2026",
  },
  {
    id: 6,
    name: "Karan Johar",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    text: "The direct deal options are great. I was able to talk to the property owner directly and finalize terms in one day.",
    location: "Flat in Bellandur",
    date: "June 15, 2026",
  },
  {
    id: 7,
    name: "Ananya Panday",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    text: "Very user-friendly website. The verified listings gave me confidence. Found a lovely studio apartment in prime location.",
    location: "Studio in Koramangala",
    date: "June 10, 2026",
  },
];

export default function ReviewsSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.35 });

  // Sync scroll visibility to isOpen state
  useEffect(() => {
    if (isInView) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [isInView]);

  // Check if device is mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle outside clicks to close the deck
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sectionRef.current && !sectionRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleDeckHoverStart = () => {
    if (!isMobile) {
      setIsOpen(true);
    }
  };

  const handleDeckHoverEnd = () => {
    if (!isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      onMouseLeave={handleDeckHoverEnd}
      className="relative w-full pt-8 pb-20 md:pt-12 md:pb-28 bg-gradient-to-b from-lime-50/50 via-lime-100/35 to-lime-50/50 overflow-hidden flex flex-col items-center select-none"
    >
      <div className="max-w-3xl mx-auto px-4 w-full text-center mb-10">
        <div className="w-10 h-1 bg-rausch/40 mx-auto rounded-full mb-4" />
        <h2 className="text-[30px] md:text-[42px] font-extrabold tracking-tight text-ink leading-tight">
          What Our Users Say
        </h2>
        <div className="w-10 h-1 bg-rausch/40 mx-auto rounded-full mt-4 mb-5" />
        <p className="text-xs md:text-sm text-neutral-500 font-medium leading-relaxed max-w-2xl mx-auto">
          Discover genuine co-living experiences shared by students, working professionals, and families who found their perfect, brokerage-free spaces with FindWay. Verified stories from real residents who found a place to call home.
        </p>
      </div>

      {/* Cards Area (Adjusted height to fit both deck and dealt cards below it with spacing) */}
      <div className="relative w-full max-w-6xl h-[530px] md:h-[500px] flex items-center justify-center px-4">
        
        {/* The Dealt Cards Row */}
        <div 
          className={`absolute inset-0 flex items-center justify-center
            ${isMobile ? "overflow-x-auto snap-x snap-mandatory px-8 scrollbar-thin flex-row gap-4 bottom-0 top-auto h-[250px]" : ""}`}
        >
          {REVIEWS_DATA.map((review, idx) => {
            const totalCards = REVIEWS_DATA.length;
            const cardWidth = 160; 
            const gap = -90; // compact overlap
            const totalWidth = (totalCards * cardWidth) + ((totalCards - 1) * gap);
            const startX = -totalWidth / 2 + cardWidth / 2;
            const targetX = startX + idx * (cardWidth + gap);

            const dealDelay = idx * 0.12; 
            const flipDelay = (totalCards * 0.12) + (idx * 0.3); 

            return (
              <motion.div
                key={review.id}
                className="md:absolute relative shrink-0 w-[160px] h-[230px] md:top-2 top-auto snap-center perspective-1000 z-10 md:left-1/2 md:-translate-x-1/2"
                style={{
                  transformStyle: "preserve-3d",
                }}
                initial={{
                  x: 0,
                  y: isMobile ? 150 : 0, 
                  scale: 0.96,
                  opacity: isMobile ? 0 : 1,
                }}
                animate={
                  isOpen
                    ? {
                        x: isMobile ? 0 : targetX,
                        y: isMobile ? 0 : 260, // Deals downward by 260px (clear of the 230px deck + 30px gap)
                        scale: hoveredCard === review.id ? 1.05 : 1,
                        opacity: 1,
                        translateY: hoveredCard === review.id ? -15 : 0,
                        zIndex: hoveredCard === review.id ? 50 : 10 + idx,
                      }
                    : {
                        x: 0, 
                        y: isMobile ? 150 : 0, 
                        scale: 0.96,
                        opacity: isMobile ? 0 : 1,
                        zIndex: 10 - idx,
                      }
                }
                transition={{
                  type: "spring",
                  stiffness: 90,
                  damping: 17,
                  delay: isOpen ? dealDelay : (totalCards - 1 - idx) * 0.08,
                }}
                onMouseEnter={() => isOpen && !isMobile && setHoveredCard(review.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Inner Flip Container */}
                <motion.div
                  className="w-full h-full relative cursor-pointer"
                  style={{
                    transformStyle: "preserve-3d",
                  }}
                  animate={{
                    rotateY: isOpen ? 180 : 0,
                  }}
                  transition={{
                    duration: 0.6,
                    ease: "easeInOut",
                    delay: isOpen ? flipDelay : 0,
                  }}
                >
                  {/* BACK SIDE OF PLAYING CARD */}
                  <div
                    className="absolute inset-0 w-full h-full rounded-xl p-3 bg-gradient-to-tr from-rausch via-red-500 to-rose-600 border border-white/20 shadow-xl flex flex-col items-center justify-between overflow-hidden"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                    }}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-60 pointer-events-none" />
                    
                    <div className="w-full flex justify-between items-center z-10">
                      <div className="text-white/20 font-black text-sm">FW</div>
                      <ShieldCheck className="w-4 h-4 text-white/50" />
                    </div>

                    <div className="flex flex-col items-center justify-center text-center z-10">
                      <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center bg-white/10 backdrop-blur-md mb-2 shadow-inner">
                        <span className="text-white font-extrabold text-lg tracking-tight">F</span>
                      </div>
                      <span className="text-white font-bold text-xs tracking-wide">FindWay</span>
                      <span className="text-white/70 text-[9px] uppercase font-bold tracking-widest mt-1">
                        Verified Review
                      </span>
                    </div>

                    <div className="w-full flex justify-between items-center z-10">
                      <ShieldCheck className="w-4 h-4 text-white/50" />
                      <div className="text-white/20 font-black text-sm">FW</div>
                    </div>
                  </div>

                  {/* FRONT SIDE OF PLAYING CARD */}
                  <div
                    className={`absolute inset-0 w-full h-full rounded-xl p-3 bg-white border border-neutral-200/80 shadow-2xl flex flex-col justify-between transition-all duration-300
                      ${hoveredCard === review.id ? "border-rausch/40 shadow-rausch/10 ring-2 ring-rausch/10" : ""}`}
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    {/* Top User Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <img
                          src={review.avatar}
                          alt={review.name}
                          className="w-7 h-7 rounded-full object-cover border border-neutral-100"
                        />
                        <div className="min-w-0">
                          <h4 className="text-[11px] font-bold text-neutral-800 truncate">
                            {review.name}
                          </h4>
                          <span className="text-[9px] text-muted truncate block">
                            {review.location}
                          </span>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5 mt-2 text-amber-500">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-2.5 h-2.5 fill-current" />
                        ))}
                      </div>

                      {/* Review Text */}
                      <p className="text-[10px] leading-relaxed text-neutral-600 mt-2 line-clamp-5 font-medium">
                        &quot;{review.text}&quot;
                      </p>
                    </div>

                    {/* Bottom Metadata */}
                    <div className="flex justify-between items-center pt-2 border-t border-neutral-100 mt-auto">
                      <span className="text-[8px] font-bold text-rausch flex items-center gap-1 bg-rausch/5 px-1.5 py-0.5 rounded-full">
                        <ShieldCheck className="w-2.5 h-2.5" /> Verified
                      </span>
                      <span className="text-[8px] text-neutral-400 font-semibold">{review.date}</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* The Rummy Deck (Top-Center) */}
        <motion.div
          onMouseEnter={handleDeckHoverStart}
          onClick={handleToggle}
          className="absolute top-2 left-1/2 -translate-x-1/2 cursor-pointer group z-40"
          animate={
            isOpen
              ? {
                  y: -8, 
                  scale: 1.02,
                }
              : {
                  y: 0,
                  scale: 1,
                }
          }
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
        >
          {/* Layered stack effect to look like a thick deck of cards */}
          <div className="relative w-[160px] h-[230px] rounded-xl flex items-center justify-center transition-all duration-300">
            {/* Bottom Layer Shadow */}
            <div className="absolute -inset-x-3 bottom-[-10px] h-4 bg-neutral-900/25 blur-lg rounded-full group-hover:opacity-100 transition-opacity" />

            {/* Stack Card 3 */}
            <div className="absolute inset-0 bg-gradient-to-tr from-red-950 via-red-900 to-rose-950 border border-neutral-950 rounded-xl transform translate-y-2 scale-96 shadow-md opacity-45 transition-all duration-300 group-hover:translate-y-3" />

            {/* Stack Card 2 */}
            <div className="absolute inset-0 bg-gradient-to-tr from-red-900 via-red-800 to-rose-900 border border-neutral-900 rounded-xl transform translate-y-1 scale-98 shadow-md opacity-70 transition-all duration-300 group-hover:translate-y-1.5" />

            {/* Top Deck Cover Card */}
            <div className="absolute inset-0 bg-gradient-to-tr from-neutral-950 via-zinc-900 to-neutral-950 border-2 border-amber-500/30 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.12)] flex flex-col items-center justify-center text-white p-4 select-none overflow-hidden ring-4 ring-amber-500/5">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-black/50 pointer-events-none" />
              
              {/* Center Content */}
              <div className="flex flex-col items-center justify-center text-center z-10">
                <div className="w-12 h-12 rounded-full border-2 border-amber-500/40 flex items-center justify-center bg-amber-500/10 backdrop-blur-md mb-3 shadow-[0_0_10px_rgba(245,158,11,0.15)]">
                  <span className="text-amber-500 font-extrabold text-xl tracking-tighter">F</span>
                </div>
                <h3 className="text-white font-black text-sm tracking-wide">FindWay Reviews</h3>
                <span className="text-amber-500/80 text-[8px] uppercase font-extrabold tracking-[0.2em] mt-2 block">
                  {isOpen ? "Close Deck" : "Deck Pack"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
