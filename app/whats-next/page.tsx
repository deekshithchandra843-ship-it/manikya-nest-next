"use client";
import { useState } from "react";
import Link from "next/link";
import PageLayout from "../components/PageLayout";

const tabs = ["Jobs", "Commute", "Upskill", "Community", "City guide"];

const jobs = [
  { title: "Frontend Developer", company: "Flipkart", location: "Koramangala", skills: ["React", "TypeScript", "CSS"], salary: "₹8–12 LPA" },
  { title: "Product Design Intern", company: "Swiggy", location: "Outer Ring Road", skills: ["Figma", "UX Research"], salary: "₹25k/mo" },
  { title: "Data Analyst", company: "Razorpay", location: "Domlur", skills: ["Python", "SQL", "Tableau"], salary: "₹6–9 LPA" },
];

const courses = [
  { title: "React for Beginners", duration: "4 weeks · Online", badge: "Free", badgeColor: "bg-green-100 text-green-700" },
  { title: "Data Science Bootcamp", duration: "12 weeks · Live", badge: "Paid", badgeColor: "bg-amber-100 text-amber-700" },
  { title: "UI/UX Design Fundamentals", duration: "6 weeks · Self-paced", badge: "Free", badgeColor: "bg-green-100 text-green-700" },
];

const events = [
  { name: "Bengaluru Startup Meetup", date: "15 Jun 2026", location: "HSR Layout, Bengaluru" },
  { name: "Women in Tech Networking", date: "22 Jun 2026", location: "Indiranagar, Bengaluru" },
  { name: "Code & Coffee Weekend", date: "28 Jun 2026", location: "Koramangala, Bengaluru" },
];

const commuteModes = [
  { mode: "Bus", icon: "🚌", time: "45 min", cost: "₹30", best: false },
  { mode: "Metro", icon: "🚇", time: "32 min", cost: "₹40", best: true },
  { mode: "Cab pool", icon: "🚗", time: "28 min", cost: "₹120", best: false },
];

export default function WhatsNext() {
  const [activeTab, setActiveTab] = useState("Jobs");

  return (
    <PageLayout>
      {/* Page header */}
      <section className="mb-6 pt-2">
        <h1 className="text-xl font-medium text-gray-900">What&apos;s next for you?</h1>
        <p className="text-[13px] text-gray-500">Personalised to your nest in Koramangala</p>
      </section>

      {/* Section tab pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-4 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              activeTab === tab
                ? "bg-[#ff385c] text-white border-[#ff385c]"
                : "bg-white text-gray-500 border-gray-300 hover:border-gray-400"
            }`}
            style={{ borderWidth: "0.5px" }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Jobs Section */}
      <section className="mb-8" id="jobs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium text-gray-900">Jobs near your nest</h2>
          <Link href="/jobs" className="text-xs text-[#ff385c] font-medium hover:underline">See all jobs</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <div
              key={job.title}
              className="bg-white border border-gray-200 rounded-xl p-4"
              style={{ borderWidth: "0.5px" }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-400 flex-shrink-0">
                  {job.company[0]}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{job.title}</h3>
                  <p className="text-xs text-gray-500">{job.company} · {job.location}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {job.skills.map((skill) => (
                  <span key={skill} className="text-[10px] font-medium text-[#534AB7] bg-[#534AB7]/10 px-2 py-0.5 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#ff385c]">{job.salary}</span>
                <button className="text-xs font-medium text-[#ff385c] border border-[#ff385c] rounded-lg px-3 py-1 hover:bg-[#ff385c]/5 transition-colors">
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Commute planner */}
      <section className="mb-8" id="commute">
        <h2 className="text-base font-medium text-gray-900 mb-4">Commute planner</h2>
        <div className="bg-white border border-gray-200 rounded-xl p-4" style={{ borderWidth: "0.5px" }}>
          {/* Route */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff385c]" />
              <span className="text-xs text-gray-700">Koramangala 4th Block</span>
            </div>
            <div className="flex-1 border-t border-dashed border-gray-300" />
            <span className="text-[10px] font-medium bg-[#ff385c]/10 text-[#ff385c] px-2 py-0.5 rounded-full">32 min</span>
            <div className="flex-1 border-t border-dashed border-gray-300" />
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#534AB7]" />
              <span className="text-xs text-gray-700">Flipkart, Bellandur</span>
            </div>
          </div>

          {/* Mode tiles */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {commuteModes.map((m) => (
              <div
                key={m.mode}
                className={`text-center py-3 px-2 rounded-lg border transition-colors ${
                  m.best
                    ? "border-[#ff385c] bg-[#ff385c]/5"
                    : "border-gray-200"
                }`}
                style={{ borderWidth: "0.5px" }}
              >
                <div className="text-xl mb-1">{m.icon}</div>
                <p className="text-xs font-medium text-gray-800">{m.mode}</p>
                <p className="text-xs text-gray-500">{m.time}</p>
                <p className="text-xs text-[#ff385c] font-medium">{m.cost}</p>
              </div>
            ))}
          </div>

          <Link href="#" className="text-xs text-gray-400 hover:text-gray-600">Change destination</Link>
        </div>
      </section>

      {/* Upskilling */}
      <section className="mb-8" id="upskill">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium text-gray-900">Upskill this week</h2>
          <Link href="#" className="text-xs text-[#ff385c] font-medium hover:underline">Browse all</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div
              key={course.title}
              className="bg-white border border-gray-200 rounded-xl p-4"
              style={{ borderWidth: "0.5px" }}
            >
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${course.badgeColor}`}>
                {course.badge}
              </span>
              <h3 className="text-sm font-medium text-gray-900 mt-2 mb-1">{course.title}</h3>
              <p className="text-xs text-gray-500 mb-3">{course.duration}</p>
              <button className="w-full py-1.5 text-xs font-medium text-white bg-[#ff385c] rounded-lg hover:bg-[#e00b41] transition-colors">
                Enroll
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Community */}
      <section className="mb-8" id="community">
        <h2 className="text-base font-medium text-gray-900 mb-4">Your city network</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {events.map((event) => (
            <div
              key={event.name}
              className="bg-white border border-gray-200 rounded-xl p-4"
              style={{ borderWidth: "0.5px" }}
            >
              <h3 className="text-sm font-medium text-gray-900 mb-1">{event.name}</h3>
              <p className="text-xs text-gray-500 mb-0.5">{event.date}</p>
              <p className="text-xs text-gray-400 mb-3">{event.location}</p>
              <button className="px-4 py-1.5 text-xs font-medium text-[#ff385c] border border-[#ff385c] rounded-lg hover:bg-[#ff385c]/5 transition-colors">
                Join
              </button>
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
