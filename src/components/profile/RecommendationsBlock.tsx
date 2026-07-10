"use client";
import Link from "next/link";
import Image from "next/image";
import { LISTINGS, getCategory } from "@/lib/categories";

interface JobRec {
  id: string;
  title: string;
  company: string;
  location: string;
  match: number;
  salary: string;
  logo: string;
}

const MOCK_JOBS: JobRec[] = [
  { id: "1", title: "Frontend Developer", company: "Google", location: "Bengaluru", match: 96, salary: "₹18-24 LPA", logo: "G" },
  { id: "2", title: "UI/UX Designer", company: "Adobe", location: "Bengaluru", match: 91, salary: "₹12-16 LPA", logo: "A" },
  { id: "3", title: "Fullstack Engineer", company: "Razorpay", location: "Bengaluru", match: 88, salary: "₹15-20 LPA", logo: "R" },
];

export default function RecommendationsBlock({
  segment,
  userCity,
}: {
  segment: "property" | "career";
  userCity: string;
}) {
  const matchingNests = LISTINGS.filter((l) => 
    l.location.toLowerCase().includes(userCity.toLowerCase())
  ).slice(0, 4);

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-ink flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rausch animate-pulse" />
          <span>AI Smart Matches For You</span>
          <span className="text-[10px] bg-rausch/10 text-rausch px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
            Match score based
          </span>
        </h3>
      </div>

      {segment === "property" ? (
        <div className="flex flex-row gap-4 overflow-x-auto pb-4 pt-1 pr-1.5 scrollbar-thin snap-x snap-mandatory">
          {matchingNests.map((nest, idx) => {
            const matchScore = 98 - idx * 3;
            const category = getCategory(nest.category);
            const imgSrc = nest.image || category?.image || "/categories/rent.jpg";
            return (
              <Link
                key={nest.id}
                href={`/listing/${nest.id}`}
                className="group bg-canvas border border-hairline rounded-[18px] p-3 transition-all hover:shadow-airbnb hover:-translate-y-1 w-[260px] shrink-0 snap-start flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] bg-surface-strong overflow-hidden rounded-xl mb-3">
                    <Image
                      src={imgSrc}
                      alt={nest.title}
                      fill
                      sizes="260px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2 left-2 text-[9px] font-bold text-white bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {nest.badge}
                    </span>
                    <span className="absolute bottom-2 right-2 text-[10px] font-bold text-white bg-rausch px-2 py-0.5 rounded-full shadow-sm">
                      {matchScore}% Match
                    </span>
                  </div>
                  <h4 className="font-bold text-ink text-sm leading-snug group-hover:text-rausch transition-colors line-clamp-1">
                    {nest.title}
                  </h4>
                  <p className="text-[11px] text-muted truncate mt-0.5">{nest.location}</p>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-hairline-soft">
                  <span className="text-xs font-extrabold text-ink">{nest.price}</span>
                  <span className="text-[10px] text-rausch font-bold hover:underline">View Nest →</span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {MOCK_JOBS.map((job) => (
            <Link
              key={job.id}
              href="/jobs"
              className="group bg-canvas border border-hairline rounded-[18px] p-4 transition-all hover:shadow-airbnb hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-lg bg-surface-soft border border-hairline flex items-center justify-center font-bold text-ink group-hover:bg-rausch/10 group-hover:text-rausch transition-colors shrink-0">
                    {job.logo}
                  </span>
                  <span className="text-[10px] font-bold text-rausch bg-rausch/10 px-2 py-0.5 rounded-full">
                    {job.match}% Match
                  </span>
                </div>
                <h4 className="font-bold text-ink text-sm leading-snug group-hover:text-rausch transition-colors line-clamp-1">
                  {job.title}
                </h4>
                <p className="text-[11px] text-muted mt-0.5">{job.company} · {job.location}</p>
              </div>
              <div className="flex items-center justify-between mt-4 pt-2 border-t border-hairline-soft">
                <span className="text-xs font-bold text-ink">{job.salary}</span>
                <span className="text-[10px] text-muted group-hover:text-rausch font-medium transition-colors">Apply →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
