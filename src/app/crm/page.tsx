"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// -------------------------------------------------------------
// Type Definitions
// -------------------------------------------------------------
type Role = "admin" | "builder" | "agent" | "owner" | "customer";
type Tab = "dashboard" | "properties" | "leads" | "requirements" | "messages" | "calendar" | "analytics" | "settings";

interface Lead {
  id: string;
  name: string;
  phone: string;
  property: string;
  budget: string;
  source: string;
  date: string;
  status: "New Lead" | "Contacted" | "Qualified" | "Site Visit" | "Negotiation" | "Booked" | "Closed";
}

interface ChatMessage {
  id: string;
  sender: "user" | "me";
  text: string;
  time: string;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  role: string;
  messages: ChatMessage[];
}

// -------------------------------------------------------------
// Mock Data (Consistent with HubSpot, HubSpot CRM, Linear, Stripe)
// -------------------------------------------------------------
const INITIAL_LEADS: Lead[] = [
  { id: "L-101", name: "Aarav S. Mehta", phone: "+91 98765 43210", property: "Sujana PG Triple", budget: "₹8,500/mo", source: "Website Portal", date: "2026-07-04", status: "New Lead" },
  { id: "L-102", name: "Meera R. Kapoor", phone: "+91 90000 00002", property: "Stanza Living Flats", budget: "₹18,000/mo", source: "WhatsApp Chat", date: "2026-07-03", status: "Contacted" },
  { id: "L-103", name: "Karan Johar", phone: "+91 98888 77777", property: "Sri Lakshmi Comforts", budget: "₹12,000/mo", source: "Direct Referral", date: "2026-07-02", status: "Qualified" },
  { id: "L-104", name: "Ananya Panday", phone: "+91 91234 56789", property: "Stanza Living Flats", budget: "₹18,000/mo", source: "Google Search", date: "2026-07-01", status: "Site Visit" },
  { id: "L-105", name: "Varun Dhawan", phone: "+91 95555 44444", property: "Sujana PG Triple", budget: "₹8,500/mo", source: "Instagram Ad", date: "2026-06-30", status: "Negotiation" },
  { id: "L-106", name: "Alia Bhatt", phone: "+91 97777 66666", property: "Sri Lakshmi Comforts", budget: "₹12,000/mo", source: "Website Portal", date: "2026-06-29", status: "Booked" },
  { id: "L-107", name: "Sidharth M.", phone: "+91 96666 55555", property: "Stanza Living Flats", budget: "₹18,000/mo", source: "Direct Referral", date: "2026-06-28", status: "Closed" },
];

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    name: "Aarav S. Mehta",
    avatar: "AM",
    lastMessage: "Is Tower A approved by RERA?",
    time: "10:30 AM",
    unread: true,
    role: "Tenant Seeker",
    messages: [
      { id: "m1", sender: "user", text: "Hello, I wanted to ask about the Stanza Living Residential Flat in HSR Layout.", time: "10:15 AM" },
      { id: "m2", sender: "me", text: "Hi Aarav! Yes, it is fully available. Would you like to schedule a site visit?", time: "10:20 AM" },
      { id: "m3", sender: "user", text: "Yes, please. Also, is Tower A approved by RERA?", time: "10:30 AM" }
    ]
  },
  {
    id: "c2",
    name: "Meera R. Kapoor",
    avatar: "MK",
    lastMessage: "I uploaded the legal deeds in the documents folder.",
    time: "Yesterday",
    unread: false,
    role: "Property Builder",
    messages: [
      { id: "m1", sender: "user", text: "Hey Mahadev, I uploaded the legal deeds in the documents folder for Tower B.", time: "4:15 PM" },
      { id: "m2", sender: "me", text: "Perfect! I will review the documents and submit them to the admin queue.", time: "4:30 PM" }
    ]
  },
  {
    id: "c3",
    name: "Rajesh Kumar",
    avatar: "RK",
    lastMessage: "Can we negotiate on the security deposit?",
    time: "2 days ago",
    unread: false,
    role: "Flat Owner",
    messages: [
      { id: "m1", sender: "user", text: "Hi, about the flat in Indiranagar. Can we negotiate on the security deposit?", time: "Yesterday" }
    ]
  }
];

export default function FindWayCRM() {
  // -------------------------------------------------------------
  // States
  // -------------------------------------------------------------
  const [activeRole, setActiveRole] = useState<Role>("agent");
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  // Tasks list state
  const [tasks, setTasks] = useState([
    { id: 1, text: "Call Aarav S. regarding deposit query", done: false },
    { id: 2, text: "Send possession layout draft to Meera R.", done: true },
    { id: 3, text: "Verify RERA certificates of Tower C", done: false },
    { id: 4, text: "Approve flat listing in Indiranagar", done: false },
  ]);

  // Messages state
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState("c1");
  const [newMessageText, setNewMessageText] = useState("");

  // Drawer / Dropdown open triggers
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Toast notifications state
  const [toasts, setToasts] = useState<{ id: string; text: string; type: "success" | "info" }[]>([]);

  // Dark Mode dummy toggle
  const [darkMode, setDarkMode] = useState(false);

  // Quick add form state
  const [newLeadForm, setNewLeadForm] = useState({
    name: "",
    phone: "",
    property: "",
    budget: "",
    source: "Website Portal"
  });

  // -------------------------------------------------------------
  // Side Effects & Handlers
  // -------------------------------------------------------------
  const triggerToast = (text: string, type: "success" | "info" = "success") => {
    // eslint-disable-next-line react-hooks/purity
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleToggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
    const task = tasks.find((t) => t.id === id);
    if (task) {
      triggerToast(task.done ? "Task marked as active" : "Task completed!", "success");
    }
  };

  // Chat message sending
  const handleSendMessage = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConvId) {
          const updatedMsgs: ChatMessage[] = [
            ...c.messages,
            {
              id: Date.now().toString(),
              sender: "me" as const,
              text: newMessageText.trim(),
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ];
          return {
            ...c,
            lastMessage: newMessageText.trim(),
            time: "Just now",
            messages: updatedMsgs
          };
        }
        return c;
      })
    );
    setNewMessageText("");
    triggerToast("Message sent successfully", "success");
  };

  // Kanban status shifting
  const handleMoveStatus = (leadId: string, direction: "next" | "prev") => {
    const stages: Lead["status"][] = ["New Lead", "Contacted", "Qualified", "Site Visit", "Negotiation", "Booked", "Closed"];
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          const currentIndex = stages.indexOf(l.status);
          let nextIndex = currentIndex;
          if (direction === "next" && currentIndex < stages.length - 1) {
            nextIndex = currentIndex + 1;
          } else if (direction === "prev" && currentIndex > 0) {
            nextIndex = currentIndex - 1;
          }
          if (nextIndex !== currentIndex) {
            triggerToast(`Lead moved to ${stages[nextIndex]}`);
            return { ...l, status: stages[nextIndex] };
          }
        }
        return l;
      })
    );
  };

  // Quick Lead Submission
  const handleQuickAddLead = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newLeadForm.name || !newLeadForm.phone) {
      alert("Name and Phone are required.");
      return;
    }
    const newL: Lead = {
      // eslint-disable-next-line react-hooks/purity
      id: `L-${Date.now().toString().slice(-3)}`,
      name: newLeadForm.name,
      phone: newLeadForm.phone,
      property: newLeadForm.property || "General Interest",
      budget: newLeadForm.budget || "TBD",
      source: newLeadForm.source,
      date: new Date().toISOString().split("T")[0],
      status: "New Lead"
    };
    setLeads((prev) => [newL, ...prev]);
    setQuickAddOpen(false);
    setNewLeadForm({ name: "", phone: "", property: "", budget: "", source: "Website Portal" });
    triggerToast("New CRM lead created!");
  };

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  return (
    <div className={`min-h-screen font-sans ${darkMode ? "dark bg-slate-950 text-slate-100" : "bg-[#F8FAFC] text-slate-800"}`}>
      
      {/* -------------------------------------------------------------
          GLOBAL TOP NAVIGATION
          ------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg lg:hidden"
            aria-label="Toggle Sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600 dark:text-blue-400">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="stroke-blue-600"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
            <span>FindWay <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase bg-slate-50 border px-1.5 py-0.5 rounded ml-1">CRM</span></span>
          </Link>
        </div>

        {/* Search and Quick Tools */}
        <div className="flex items-center gap-4 flex-1 max-w-xl mx-8 hidden sm:flex">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" /></svg>
            </span>
            <input
              type="text"
              placeholder="Search leads, properties, invoices, RERA registrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 text-sm border-0 rounded-full py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-600 transition-all text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-3">
          {/* Quick Add Action */}
          <button
            onClick={() => setQuickAddOpen(true)}
            className="hidden md:flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-full transition-all shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
            <span>Quick Add</span>
          </button>

          {/* Dark Mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full text-slate-500"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
            )}
          </button>

          {/* Notifications Panel Trigger */}
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full text-slate-500"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
          </button>

          {/* User profile dropdown trigger */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center border border-blue-200 focus:outline-none text-sm"
            >
              M
            </button>
            
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg py-2 z-50 text-xs text-slate-700 dark:text-slate-200">
                <div className="px-4 py-2.5 border-b border-slate-50 dark:border-slate-800">
                  <p className="font-bold text-slate-900 dark:text-slate-100">Mahadev 👋</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">mahadev@findway.app</p>
                </div>
                <button onClick={() => { setActiveTab("settings"); setProfileOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                  Account Settings
                </button>
                <div className="border-t border-slate-50 dark:border-slate-800 my-1" />
                <button onClick={() => { alert("Logout triggered"); setProfileOpen(false); }} className="w-full text-left px-4 py-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 flex items-center gap-2">
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        
        {/* -------------------------------------------------------------
            GLOBAL LEFT SIDEBAR (Enterprise HubSpot Style)
            ------------------------------------------------------------- */}
        <aside className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-64px)] z-30 w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 px-3 py-4 flex flex-col justify-between shrink-0 transform transition-transform duration-300 lg:translate-x-0 ${sidebarCollapsed ? "-translate-x-full" : "translate-x-0"}`}>
          <div className="space-y-6">
            
            {/* Active Workspace / Role quick switcher */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Active CRM Role
              </label>
              <select
                value={activeRole}
                onChange={(e) => {
                  setActiveRole(e.target.value as Role);
                  triggerToast(`Switched view to ${e.target.value.toUpperCase()} Dashboard`, "info");
                }}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg outline-none cursor-pointer focus:ring-1 focus:ring-blue-500"
              >
                <option value="admin">Platform Admin</option>
                <option value="builder">Builder / Developer</option>
                <option value="agent">Real Estate Agent</option>
                <option value="owner">Property Owner</option>
                <option value="customer">Customer / Seeker</option>
              </select>
            </div>

            {/* Menu List */}
            <nav className="space-y-1">
              {[
                { id: "dashboard", label: "CRM Dashboard", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg> },
                { id: "properties", label: "Properties", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1"><path d="M3 21h18M9 21V9a3 3 0 016 0v12M4 21V13a2 2 0 012-2h3M20 21V11a2 2 0 00-2-2h-3" /></svg> },
                { id: "leads", label: "CRM Leads", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg> },
                { id: "requirements", label: "Seeker Demands", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
                { id: "messages", label: "Messages Chat", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg> },
                { id: "calendar", label: "CRM Calendar", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg> },
                { id: "analytics", label: "Reports & Insights", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1"><path d="M18 20V10M12 20V4M6 20v-6" /></svg> },
                { id: "settings", label: "Settings", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg> },
              ].map((menuItem) => (
                <button
                  key={menuItem.id}
                  onClick={() => setActiveTab(menuItem.id as Tab)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === menuItem.id ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800"}`}
                >
                  {menuItem.icon}
                  <span>{menuItem.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-xs text-slate-400">
            <p className="font-semibold">FindWay CRM v1.0</p>
            <p className="mt-1">Mahadev&apos;s Admin Session</p>
          </div>
        </aside>

        {/* -------------------------------------------------------------
            MAIN CONTENT AREA
            ------------------------------------------------------------- */}
        <main className="flex-1 min-h-[calc(100vh-64px)] p-6 overflow-x-hidden">
          
          {/* TAB 1: WORKSPACE DASHBOARDS */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              
              {/* Active view header descriptor */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-3d-soft">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Good Morning, Mahadev 👋
                  </h1>
                  <p className="text-sm text-slate-400 mt-1">
                    Here is the overview for your active role: <span className="font-bold text-blue-600 capitalize">{activeRole}</span>.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl">
                  {(["agent", "builder", "admin", "owner", "customer"] as Role[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => setActiveRole(r)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg capitalize transition-all ${activeRole === r ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400 font-extrabold" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* -------------------------------------------------------------
                  ROLE: AGENT DASHBOARD
                  ------------------------------------------------------------- */}
              {activeRole === "agent" && (
                <div className="space-y-8 animate-fade-up">
                  
                  {/* KPI CARDS WITH HIGH VISIBILITY ACCENTS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { title: "Active Listings", value: "3 Units", sub: "1 PG · 1 Flat · 1 Co-Living", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400" },
                      { title: "New CRM Leads", value: "7 Leads", sub: "3 hot leads need dial-out", color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400" },
                      { title: "Site Visits", value: "4 Visits", sub: "2 scheduled for today", color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400" },
                      { title: "Commission Paid", value: "₹2.45L", sub: "+₹45k cleared this week", color: "text-rose-500 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400" },
                    ].map((kpi, idx) => (
                      <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{kpi.title}</p>
                          <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{kpi.value}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{kpi.sub}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${kpi.color} shrink-0`}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* KANBAN PIPELINE BOARD - EXPANDED VIEW WITH ZERO-CLICK DETAILS */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Interactive Lead Pipeline</h2>
                        <p className="text-xs text-slate-400">Drag or shift status cards directly to update backend db.json record</p>
                      </div>
                      <span className="text-[11px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 px-3 py-1 rounded-full uppercase tracking-wider">Live Pipeline</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-3 overflow-x-auto pb-4">
                      {(["New Lead", "Contacted", "Qualified", "Site Visit", "Negotiation", "Booked", "Closed"] as Lead["status"][]).map((stage) => {
                        const stageLeads = leads.filter((l) => l.status === stage);
                        return (
                          <div key={stage} className="bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl min-w-[210px] flex flex-col space-y-3">
                            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate">{stage}</span>
                              <span className="text-[10px] bg-slate-200 dark:bg-slate-700 font-extrabold px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-300">
                                {stageLeads.length}
                              </span>
                            </div>
                            
                            <div className="space-y-2.5 flex-1">
                              {stageLeads.map((lead) => (
                                <div key={lead.id} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-3 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                                  <div>
                                    <div className="flex justify-between items-start gap-1">
                                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{lead.name}</h4>
                                      <span className="text-[9px] text-slate-400 bg-slate-50 dark:bg-slate-800 px-1 rounded shrink-0">{lead.id}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">🎯 {lead.property}</p>
                                  </div>
                                  
                                  <div className="space-y-1 text-[10px] text-slate-500">
                                    <p className="font-semibold text-slate-700 dark:text-slate-300">💰 Budget: {lead.budget}</p>
                                    <p className="truncate">📞 {lead.phone}</p>
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                      <span className="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                        {lead.source}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Quick Actions Panel - Dial Out immediately without popups */}
                                  <div className="flex gap-1 pt-2 border-t border-slate-100 dark:border-slate-800 justify-between items-center">
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => triggerToast(`Dialing ${lead.phone}...`)}
                                        className="p-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 rounded-lg text-slate-600 dark:text-slate-300"
                                        title="Call Lead"
                                      >
                                        📞
                                      </button>
                                      <button
                                        onClick={() => { setActiveTab("messages"); triggerToast("Loading Whatsapp Messenger..."); }}
                                        className="p-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 rounded-lg text-slate-600 dark:text-slate-300"
                                        title="WhatsApp Chat"
                                      >
                                        💬
                                      </button>
                                    </div>

                                    {/* Column Shifters */}
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => handleMoveStatus(lead.id, "prev")}
                                        className="px-1.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold rounded"
                                        title="Move Back"
                                      >
                                        ◀
                                      </button>
                                      <button
                                        onClick={() => handleMoveStatus(lead.id, "next")}
                                        className="px-1.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded"
                                        title="Advance Stage"
                                      >
                                        ▶
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              
                              {stageLeads.length === 0 && (
                                <div className="text-[10px] text-center text-slate-400 py-8 border border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                                  Empty Stage
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* PROPERTY PERFORMANCE DIRECT GRID */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Listed Property Performance (Zero-Click Insights)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { title: "Sujana PG - Triple Sharing", views: "1,240 views", favs: "98 saves", enq: "12 enquiries", rera: "RERA Approved", loc: "Koramangala, Bangalore", color: "border-blue-500" },
                        { title: "Stanza Living Residential Flats", views: "840 views", favs: "45 saves", enq: "8 enquiries", rera: "RERA Approved", loc: "HSR Layout, Bangalore", color: "border-emerald-500" },
                        { title: "Sri Lakshmi Comforts Co-Living", views: "1,920 views", favs: "122 saves", enq: "24 enquiries", rera: "Pending Clearance", loc: "Indiranagar, Bangalore", color: "border-amber-500" }
                      ].map((item, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                          <div>
                            <div className="flex justify-between items-start gap-1">
                              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{item.title}</h4>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${item.rera === "RERA Approved" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                                {item.rera}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">📍 {item.loc}</p>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-center border-t border-slate-50 dark:border-slate-800 pt-3">
                            <div className="bg-slate-50 dark:bg-slate-850 p-2 rounded-lg">
                              <span className="text-[9px] font-bold text-slate-400 block uppercase">Views</span>
                              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{item.views.split(" ")[0]}</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-850 p-2 rounded-lg">
                              <span className="text-[9px] font-bold text-slate-400 block uppercase">Saves</span>
                              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{item.favs.split(" ")[0]}</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-850 p-2 rounded-lg">
                              <span className="text-[9px] font-bold text-slate-400 block uppercase">Enquiry</span>
                              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{item.enq.split(" ")[0]}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* BOTTOM SECTIONS: LEADS TABLE & TASK CHECKLIST */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    
                    {/* Leads Table */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm xl:col-span-2 space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Recent Leads Matrix</h3>
                          <p className="text-[10px] text-slate-400">Detailed overview of recently assigned buyers/tenants</p>
                        </div>
                        <button onClick={() => setActiveTab("leads")} className="text-xs font-bold text-blue-600 hover:underline">View All Leads Database</button>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                              <th className="py-2.5 pl-2">Lead Name</th>
                              <th>Target Unit</th>
                              <th>Budget</th>
                              <th>Source</th>
                              <th>Assigned Date</th>
                              <th className="text-right pr-2">Quick Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {leads.slice(0, 4).map((l) => (
                              <tr key={l.id} className="border-b border-slate-50 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                                <td className="py-3 pl-2">
                                  <p className="font-bold text-slate-800 dark:text-slate-100">{l.name}</p>
                                  <p className="text-[10px] text-slate-400">{l.phone}</p>
                                </td>
                                <td className="text-slate-500 font-medium">{l.property}</td>
                                <td className="font-semibold text-slate-700 dark:text-slate-300">{l.budget}</td>
                                <td>
                                  <span className="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold">
                                    {l.source}
                                  </span>
                                </td>
                                <td className="text-slate-400">{l.date}</td>
                                <td className="text-right pr-2 space-x-1">
                                  <button onClick={() => triggerToast(`Initiated call to ${l.name}`)} className="bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 hover:bg-slate-100 p-1.5 rounded-lg text-xs" title="Call">📞</button>
                                  <button onClick={() => { setActiveTab("messages"); triggerToast("Opening messages chat..."); }} className="bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 hover:bg-slate-100 p-1.5 rounded-lg text-xs" title="WhatsApp Chat">💬</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Today's Tasks with Priority details */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Tasks & Follow-Ups</h3>
                        <p className="text-[10px] text-slate-400">Check boxes to mark task items as completed</p>
                      </div>
                      
                      <div className="space-y-3">
                        {[
                          { id: 1, text: "Call Aarav S. regarding deposit query", cat: "Hot Lead", pri: "High", time: "11:30 AM", done: false },
                          { id: 2, text: "Send possession layout to Meera R.", cat: "Docs", pri: "Medium", time: "02:00 PM", done: true },
                          { id: 3, text: "Verify RERA certificates of Tower C", cat: "Compliance", pri: "High", time: "04:30 PM", done: false },
                          { id: 4, text: "Approve flat listing in Indiranagar", cat: "Review", pri: "Low", time: "06:00 PM", done: false },
                        ].map((task) => (
                          <div key={task.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-slate-100/50 dark:border-slate-800 transition-colors">
                            <input
                              type="checkbox"
                              checked={task.done}
                              onChange={() => handleToggleTask(task.id)}
                              className="mt-1.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <span className={`text-xs font-semibold block ${task.done ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-200"}`}>
                                {task.text}
                              </span>
                              <div className="flex gap-2 mt-1.5 items-center text-[9px] font-bold">
                                <span className="text-slate-400">🕒 {task.time}</span>
                                <span className={`px-1.5 py-0.5 rounded ${task.pri === "High" ? "bg-rose-50 text-rose-600" : task.pri === "Medium" ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-600"}`}>
                                  {task.pri} Priority
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  ROLE: BUILDER DASHBOARD
                  ------------------------------------------------------------- */}
              {activeRole === "builder" && (
                <div className="space-y-8 animate-fade-up">
                  
                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { title: "Active Projects", value: "2 Projects", sub: "1 HSR Layout · 1 Indiranagar", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400" },
                      { title: "Available Inventory", value: "26 Units", sub: "Towers A, B, and C", color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400" },
                      { title: "Overall Sales Progression", value: "78% Booked", sub: "+4% units sold this week", color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400" },
                      { title: "Total Bookings Cleared", value: "₹4.80 Cr", sub: "All RERA deposits cleared", color: "text-rose-500 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400" },
                    ].map((kpi, idx) => (
                      <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{kpi.title}</p>
                          <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{kpi.value}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{kpi.sub}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${kpi.color} shrink-0`}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5" /></svg>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Active Project Cards with RERA & Phase Details visible upfront */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Project A */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300">
                      <div>
                        <div className="h-44 bg-slate-200 relative">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end p-4">
                            <div className="space-y-1">
                              <div className="flex gap-2">
                                <span className="text-[9px] font-bold text-white bg-blue-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Premium Residencies</span>
                                <span className="text-[9px] font-bold text-white bg-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-wider">RERA Approved</span>
                              </div>
                              <h3 className="text-base font-bold text-white">Manikya Nest Residency</h3>
                              <p className="text-xs text-slate-350">📍 Sector 2, HSR Layout, Bengaluru</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 space-y-4 text-xs">
                          {/* Zero Click Specs */}
                          <div className="grid grid-cols-2 gap-3 text-slate-500">
                            <div>
                              <span className="font-semibold block text-[10px] text-slate-400">RERA License</span>
                              <span className="font-bold text-slate-700 dark:text-slate-300">PRM/KA/RERA/1251/310/004381</span>
                            </div>
                            <div>
                              <span className="font-semibold block text-[10px] text-slate-400">Active Phase</span>
                              <span className="font-bold text-slate-700 dark:text-slate-300">Flooring & Finishing</span>
                            </div>
                            <div>
                              <span className="font-semibold block text-[10px] text-slate-400">Possession Target</span>
                              <span className="font-bold text-slate-700 dark:text-slate-300">December 2026</span>
                            </div>
                            <div>
                              <span className="font-semibold block text-[10px] text-slate-400">Property Plot Area</span>
                              <span className="font-bold text-slate-700 dark:text-slate-300">3.2 Acres</span>
                            </div>
                          </div>

                          <div className="space-y-1 pt-2">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-400">Construction Timeline Progress</span>
                              <span className="text-blue-600 font-bold">85% Completed</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div className="bg-blue-600 h-full rounded-full" style={{ width: "85%" }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 border-t border-slate-50 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20 grid grid-cols-3 gap-2 text-center text-xs">
                        <div>
                          <p className="text-slate-400 text-[10px] font-semibold uppercase">Sold Units</p>
                          <p className="font-bold text-slate-800 dark:text-slate-200">42 / 50</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-[10px] font-semibold uppercase">Available</p>
                          <p className="font-bold text-emerald-600 dark:text-emerald-400">8 Units</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-[10px] font-semibold uppercase">Total Revenue</p>
                          <p className="font-bold text-slate-800 dark:text-slate-200">₹3.8 Cr</p>
                        </div>
                      </div>
                    </div>

                    {/* Project B */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300">
                      <div>
                        <div className="h-44 bg-slate-200 relative">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end p-4">
                            <div className="space-y-1">
                              <div className="flex gap-2">
                                <span className="text-[9px] font-bold text-white bg-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Commercial Hub</span>
                                <span className="text-[9px] font-bold text-white bg-blue-600 px-2 py-0.5 rounded-full uppercase tracking-wider">RERA Registered</span>
                              </div>
                              <h3 className="text-base font-bold text-white">Manikya Commercial Hub</h3>
                              <p className="text-xs text-slate-350">📍 Indiranagar Metro, Bengaluru</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 space-y-4 text-xs">
                          {/* Zero Click Specs */}
                          <div className="grid grid-cols-2 gap-3 text-slate-500">
                            <div>
                              <span className="font-semibold block text-[10px] text-slate-400">RERA License</span>
                              <span className="font-bold text-slate-700 dark:text-slate-300">PRM/KA/RERA/1251/310/005612</span>
                            </div>
                            <div>
                              <span className="font-semibold block text-[10px] text-slate-400">Active Phase</span>
                              <span className="font-bold text-slate-700 dark:text-slate-300">Excavation & Pillars</span>
                            </div>
                            <div>
                              <span className="font-semibold block text-[10px] text-slate-400">Possession Target</span>
                              <span className="font-bold text-slate-700 dark:text-slate-300">August 2027</span>
                            </div>
                            <div>
                              <span className="font-semibold block text-[10px] text-slate-400">Property Plot Area</span>
                              <span className="font-bold text-slate-700 dark:text-slate-300">1.8 Acres</span>
                            </div>
                          </div>

                          <div className="space-y-1 pt-2">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-400">Construction Timeline Progress</span>
                              <span className="text-emerald-500 font-bold">40% Completed</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: "40%" }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 border-t border-slate-50 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20 grid grid-cols-3 gap-2 text-center text-xs">
                        <div>
                          <p className="text-slate-400 text-[10px] font-semibold uppercase">Sold Units</p>
                          <p className="font-bold text-slate-800 dark:text-slate-200">12 / 35</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-[10px] font-semibold uppercase">Available</p>
                          <p className="font-bold text-emerald-600 dark:text-emerald-400">18 Units</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-[10px] font-semibold uppercase">Total Revenue</p>
                          <p className="font-bold text-slate-800 dark:text-slate-200">₹1.0 Cr</p>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* INVENTORY ALLOCATION GRID - TOWER DETAILS DIRECT TABLE */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    
                    {/* Tower status map */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm xl:col-span-2 space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Tower Block Status</h3>
                        <p className="text-[10px] text-slate-400">Detailed layout of unit allocation status for each wing</p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          { name: "Tower A (Residential)", booked: 18, avail: 2, blocked: 0, res: 0, progress: "90%" },
                          { name: "Tower B (Residential)", booked: 24, avail: 4, blocked: 1, res: 1, progress: "80%" },
                          { name: "Tower C (Commercial)", booked: 12, avail: 12, blocked: 4, res: 2, progress: "40%" }
                        ].map((tower, idx) => (
                          <div key={idx} className="border border-slate-150 dark:border-slate-800 p-4 rounded-xl space-y-3 bg-slate-50/50 dark:bg-slate-900/10 hover:border-slate-200 dark:hover:border-slate-750 transition-colors">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{tower.name}</h4>
                            
                            <div className="space-y-1.5 text-[10px] text-slate-500 font-semibold">
                              <div className="flex justify-between">
                                <span>Booked:</span>
                                <span className="text-slate-800 dark:text-slate-200 font-bold">{tower.booked} units</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Available:</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{tower.avail} units</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Blocked/Reserved:</span>
                                <span className="text-slate-850 dark:text-slate-350 font-bold">{tower.blocked + tower.res} units</span>
                              </div>
                            </div>
                            
                            <div className="pt-1">
                              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-blue-600 h-full rounded-full" style={{ width: tower.progress }} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top Performing Agents Leaderboard */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Top Performing Agents</h3>
                        <p className="text-[10px] text-slate-400">Closed bookings and commissions leaderboard</p>
                      </div>
                      
                      <div className="space-y-3.5">
                        {[
                          { name: "Kiran Real Estate Agency", deals: "18 Deals", comm: "₹4.2L commission paid", initials: "K" },
                          { name: "Rajesh Kumar Agency", deals: "12 Deals", comm: "₹2.8L commission paid", initials: "R" },
                          { name: "Sunitha Realties Ltd.", deals: "8 Deals", comm: "₹1.9L commission paid", initials: "S" }
                        ].map((agent, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-extrabold flex items-center justify-center text-xs shrink-0">
                                {agent.initials}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{agent.name}</p>
                                <p className="text-[10px] text-slate-400 font-medium">{agent.comm}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 px-2 py-0.5 rounded-full">
                              {agent.deals}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  ROLE: ADMIN DASHBOARD
                  ------------------------------------------------------------- */}
              {activeRole === "admin" && (
                <div className="space-y-6 animate-fade-up">
                  
                  {/* Global Platform Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Total Registrations", val: "1,240", change: "+12% MoM" },
                      { label: "Active Builders", val: "18", change: "3 pending review" },
                      { label: "Approved Agents", val: "42", change: "Fully verified" },
                      { label: "Verification Queue", val: "5", change: "Requires action" }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{item.label}</span>
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{item.val}</p>
                        <span className="text-[10px] text-emerald-500 font-semibold">{item.change}</span>
                      </div>
                    ))}
                  </div>

                  {/* Verification Pending Queues */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Builder approvals */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Builder Verification Queue</h3>
                      <div className="space-y-3">
                        {[
                          { name: "DLF Developers Ltd.", license: "LC-19028", date: "Today" },
                          { name: "Prestige Group South", license: "LC-40810", date: "Yesterday" }
                        ].map((b, i) => (
                          <div key={i} className="flex justify-between items-center p-3 border border-slate-100 dark:border-slate-800 rounded-xl">
                            <div>
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{b.name}</p>
                              <p className="text-[10px] text-slate-400">License: {b.license} · Submitted: {b.date}</p>
                            </div>
                            <div className="space-x-1.5">
                              <button onClick={() => triggerToast("License verified, builder approved")} className="text-[10px] bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg font-bold">Approve</button>
                              <button onClick={() => triggerToast("Application rejected")} className="text-[10px] bg-rose-50 text-rose-600 px-2.5 py-1 rounded-lg font-bold">Reject</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Agent approvals */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Agent Approvals</h3>
                      <div className="space-y-3">
                        {[
                          { name: "Kiran Real Estate Agency", exp: "8 yrs", loc: "Koramangala" },
                          { name: "Aarav Consultancy Services", exp: "3 yrs", loc: "HSR Layout" }
                        ].map((a, i) => (
                          <div key={i} className="flex justify-between items-center p-3 border border-slate-100 dark:border-slate-800 rounded-xl">
                            <div>
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{a.name}</p>
                              <p className="text-[10px] text-slate-400">Exp: {a.exp} · Location: {a.loc}</p>
                            </div>
                            <button onClick={() => triggerToast("Agent approved successfully")} className="text-[10px] bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg font-bold">Verify License</button>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  ROLE: CUSTOMER DASHBOARD
                  ------------------------------------------------------------- */}
              {activeRole === "customer" && (
                <div className="space-y-6 animate-fade-up">
                  
                  {/* Seeker stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: "Saved Properties", val: "3", desc: "View lists in saved folder" },
                      { label: "Active Applications", val: "1 Pending", desc: "Under review by Ravi Sharma" },
                      { label: "Scheduled Visits", val: "1 Scheduled", desc: "Tomorrow at 4:00 PM" }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400">{item.label}</span>
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{item.val}</p>
                        <p className="text-[11px] text-slate-400">{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recommendation card listings */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Recommended for You</h3>
                    <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-slate-400">
                      <p className="text-sm">Based on your requirement search criteria in Koramangala & HSR Layout.</p>
                      <button onClick={() => setActiveTab("properties")} className="mt-3 text-xs bg-blue-600 text-white font-bold px-4 py-2 rounded-full">Explore Properties</button>
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  ROLE: OWNER DASHBOARD
                  ------------------------------------------------------------- */}
              {activeRole === "owner" && (
                <div className="space-y-6 animate-fade-up">
                  
                  {/* Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: "My Listings", val: "2", sub: "1 Active · 1 Pending Review" },
                      { label: "Property Views", val: "148", sub: "+24 views today" },
                      { label: "Received Leads", val: "5 Seeker matches", sub: "Click details to review" }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400">{item.label}</span>
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{item.val}</p>
                        <span className="text-[10px] text-slate-400">{item.sub}</span>
                      </div>
                    ))}
                  </div>

                  {/* Active List */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">My Listings</h3>
                    <div className="flex justify-between items-center border border-slate-100 dark:border-slate-800 p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Sujana PG - Triple Sharing Room</p>
                          <p className="text-[10px] text-slate-400">Koramangala, Bangalore · ₹8,500/mo</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">Active</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: PROPERTIES MANAGEMENT */}
          {activeTab === "properties" && (
            <div className="space-y-6 animate-fade-up">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Property Management</h1>
                  <p className="text-xs text-slate-400 mt-1">Manage listings, set promotional flags, or publish houses.</p>
                </div>
                <button onClick={() => triggerToast("Add Property form opened")} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-full">
                  + Add Property
                </button>
              </div>

              {/* Listings display grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: "Sujana PG - Triple Sharing Room", location: "Koramangala, Bangalore", price: "₹8,500/mo", views: "102", favs: "14", type: "pg", status: "Active", bg: "bg-blue-600" },
                  { title: "Stanza Living Residential Flats", location: "HSR Layout, Bangalore", price: "₹18,000/mo", views: "48", favs: "8", type: "flat", status: "Active", bg: "bg-emerald-500" },
                  { title: "Sri Lakshmi Comforts Co-Living", location: "Indiranagar, Bangalore", price: "₹12,000/mo", views: "192", favs: "22", type: "coliving", status: "Pending Review", bg: "bg-amber-500" }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between">
                    <div>
                      {/* Media area */}
                      <div className="h-40 bg-slate-100 relative">
                        <div className="absolute top-3 right-3 flex gap-1">
                          <span className={`text-[9px] font-bold text-white px-2 py-0.5 rounded-full ${item.bg}`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4 space-y-2">
                        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{item.title}</h3>
                        <p className="text-[10px] text-slate-400">{item.location}</p>
                        
                        <div className="flex items-center gap-3 text-[10px] text-slate-400">
                          <span>👁️ {item.views} views</span>
                          <span>❤️ {item.favs} saved</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.price}</span>
                      <div className="flex gap-1.5">
                        <button onClick={() => triggerToast(`Viewing ${item.title}`)} className="text-[10px] bg-slate-50 border px-2 py-1 rounded">View</button>
                        <button onClick={() => triggerToast(`Editing ${item.title}`)} className="text-[10px] bg-slate-50 border px-2 py-1 rounded">Edit</button>
                        <button onClick={() => triggerToast("Listing promoted in listings rankings")} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold">Promote</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LEADS */}
          {activeTab === "leads" && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 animate-fade-up">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Leads Database</h1>
                  <p className="text-xs text-slate-400 mt-0.5">Filter, search, or trigger actions for CRM contacts.</p>
                </div>
                <button onClick={() => setQuickAddOpen(true)} className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-full">+ Add Lead</button>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                      <th className="py-2.5 pl-3">Name</th>
                      <th>Phone</th>
                      <th>Interested In</th>
                      <th>Budget</th>
                      <th>Status</th>
                      <th className="text-right pr-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((l) => (
                      <tr key={l.id} className="border-b border-slate-50 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                        <td className="py-3 pl-3 font-semibold text-slate-800 dark:text-slate-100">{l.name}</td>
                        <td className="text-slate-500">{l.phone}</td>
                        <td className="text-slate-500">{l.property}</td>
                        <td className="font-semibold text-slate-700 dark:text-slate-300">{l.budget}</td>
                        <td>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                            {l.status}
                          </span>
                        </td>
                        <td className="text-right pr-3 space-x-1">
                          <button onClick={() => triggerToast(`Contacting ${l.name}...`)} className="bg-slate-50 border p-1 rounded">📞</button>
                          <button onClick={() => { setActiveTab("messages"); triggerToast("Loading messages thread..."); }} className="bg-slate-50 border p-1 rounded">💬</button>
                          <button onClick={() => handleMoveStatus(l.id, "next")} className="bg-slate-50 border p-1 rounded" title="Progress lead">➔</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: SEEKER DEMANDS */}
          {activeTab === "requirements" && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 animate-fade-up">
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Active Seeker Demands</h1>
                <p className="text-xs text-slate-400">Review matching tenant and buyer filters from the marketplace.</p>
              </div>
              <div className="border border-dashed border-slate-200 dark:border-slate-800 p-12 rounded-xl text-center text-slate-400">
                <p className="text-sm">Requirements filters loaded. Post a seeker request from the explore page to append RERA matches.</p>
                <Link href="/requirements" className="mt-3 inline-block text-xs bg-blue-600 text-white font-bold px-4 py-2 rounded-full">Go to Requirements Page</Link>
              </div>
            </div>
          )}

          {/* TAB 5: MESSAGES CHAT */}
          {activeTab === "messages" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex h-[600px] animate-fade-up">
              
              {/* Sidebar list */}
              <div className="w-80 border-r border-slate-100 dark:border-slate-800 flex flex-col">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-sm text-slate-950 dark:text-slate-100">Conversations</h3>
                </div>
                <div className="flex-1 overflow-y-auto space-y-1 p-2">
                  {conversations.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setActiveConvId(c.id)}
                      className={`w-full text-left p-3 rounded-xl flex gap-3 transition-colors ${c.id === activeConvId ? "bg-blue-50 dark:bg-blue-950/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                        {c.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h4 className="text-xs font-bold truncate text-slate-900 dark:text-slate-100">{c.name}</h4>
                          <span className="text-[10px] text-slate-400 shrink-0">{c.time}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{c.lastMessage}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat window */}
              <div className="flex-1 flex flex-col justify-between bg-slate-50/50 dark:bg-slate-900/30">
                {activeConversation ? (
                  <>
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{activeConversation.name}</h4>
                        <span className="text-[10px] text-slate-400">{activeConversation.role}</span>
                      </div>
                      <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Online
                      </span>
                    </div>

                    {/* Messages list */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {activeConversation.messages.map((m) => (
                        <div key={m.id} className={`flex ${m.sender === "me" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[70%] p-3 rounded-2xl text-xs space-y-1 shadow-sm ${m.sender === "me" ? "bg-blue-600 text-white rounded-tr-none" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 rounded-tl-none"}`}>
                            <p>{m.text}</p>
                            <span className={`block text-[9px] text-right ${m.sender === "me" ? "text-blue-200" : "text-slate-400"}`}>
                              {m.time} {m.sender === "me" && "✓✓"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Input bar */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
                      <input
                        type="text"
                        placeholder="Type a message or insert attachments..."
                        value={newMessageText}
                        onChange={(e) => setNewMessageText(e.target.value)}
                        className="flex-1 bg-slate-50 dark:bg-slate-850 rounded-xl px-4 py-2 text-xs border-0 outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-100"
                      />
                      <button type="submit" className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl">Send</button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">Select a conversation thread to chat</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: CALENDAR */}
          {activeTab === "calendar" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-up">
              
              {/* Monthly calendar */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">July 2026</h3>
                  <div className="space-x-1.5">
                    <button className="p-1 border rounded text-xs">‹</button>
                    <button className="p-1 border rounded text-xs">›</button>
                  </div>
                </div>
                
                {/* Mock grid */}
                <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-slate-400">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center text-xs">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border ${i === 3 ? "bg-blue-50 border-blue-200 text-blue-600 font-bold" : "border-slate-50 dark:border-slate-800 text-slate-600 dark:text-slate-400"}`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>

              {/* Side appointments */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Site Visits Schedule</h3>
                <div className="space-y-3">
                  {[
                    { time: "02:30 PM", desc: "Site visit at Tower A (Aarav S.)" },
                    { time: "05:00 PM", desc: "Follow-up call with Karan Johar" }
                  ].map((vis, i) => (
                    <div key={i} className="border-l-4 border-blue-600 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-r-xl">
                      <span className="text-[10px] font-bold text-blue-600">{vis.time}</span>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1">{vis.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 7: ANALYTICS REPORTS */}
          {activeTab === "analytics" && (
            <div className="space-y-6 animate-fade-up">
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Reports & Insights</h1>
              
              {/* SVG Charts display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Revenue chart */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Revenue Trend (Q2 2026)</h3>
                  <div className="h-48 w-full flex items-end justify-between px-2 pt-4 relative">
                    <div className="absolute inset-y-0 left-0 flex flex-col justify-between text-[10px] text-slate-400 pr-2">
                      <span>₹5L</span><span>₹3.5L</span><span>₹2L</span><span>0</span>
                    </div>
                    {/* SVG bars */}
                    <div className="flex-1 flex justify-around items-end h-full pl-8 pb-4">
                      {[
                        { label: "Apr", val: "h-[40%]", color: "bg-blue-600" },
                        { label: "May", val: "h-[65%]", color: "bg-blue-600" },
                        { label: "Jun", val: "h-[90%]", color: "bg-blue-600" }
                      ].map((bar, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1.5 w-12">
                          <div className={`w-8 ${bar.val} ${bar.color} rounded-t-lg transition-all duration-500`} />
                          <span className="text-[10px] text-slate-400">{bar.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Lead sources pie */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lead Sources</h3>
                  <div className="flex items-center justify-around h-48">
                    {/* Radial SVG Representation */}
                    <svg width="120" height="120" viewBox="0 0 36 36" className="circular-chart">
                      <path className="circle-bg" stroke="#F1F5F9" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="circle" stroke="#2563EB" strokeDasharray="60, 100" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="circle" stroke="#22C55E" strokeDasharray="30, 100" strokeDashoffset="-60" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <text x="18" y="20.5" className="percentage font-bold text-[6px] fill-slate-800 dark:fill-slate-100" textAnchor="middle">100%</text>
                    </svg>
                    
                    <div className="text-xs space-y-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                        <span>Website Portal (60%)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                        <span>WhatsApp (30%)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                        <span>Referral (10%)</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 8: SETTINGS */}
          {activeTab === "settings" && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 animate-fade-up">
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">CRM Preferences</h1>
                <p className="text-xs text-slate-400">Configure layout themes, RERA API keys, or webhooks.</p>
              </div>
              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center py-3 border-b">
                  <div>
                    <p className="font-bold">Dark Theme Interface</p>
                    <p className="text-slate-400">Toggle dark styling across the CRM dashboard.</p>
                  </div>
                  <button onClick={() => setDarkMode(!darkMode)} className="bg-slate-100 border px-3 py-1.5 rounded-lg font-semibold">Toggle Theme</button>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <div>
                    <p className="font-bold">Automated Email Notifications</p>
                    <p className="text-slate-400">Ping agent whenever a new seeker requirement matches.</p>
                  </div>
                  <span className="text-[10px] text-emerald-500 font-bold bg-emerald-50 px-2 py-0.5 rounded">Enabled</span>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* -------------------------------------------------------------
          NOTIFICATION DRAWER PANEL
          ------------------------------------------------------------- */}
      {notificationOpen && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 shadow-2xl z-50 p-5 flex flex-col justify-between animate-fade-left">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm text-slate-950 dark:text-slate-100">Notifications Drawer</h3>
              <button onClick={() => setNotificationOpen(false)} className="text-xs text-slate-400 font-bold">Close</button>
            </div>
            
            <div className="space-y-3">
              {[
                { title: "New Lead Recorded", desc: "Aarav S. submitted interest for Koramangala room.", time: "2m ago" },
                { title: "Property Approved", desc: "Admin verified Stanza Living residential flat.", time: "1h ago" },
                { title: "Chat Message Received", desc: "Meera R. sent construction schedule.", time: "2h ago" }
              ].map((notif, idx) => (
                <div key={idx} className="p-3 border border-slate-50 dark:border-slate-800 rounded-xl space-y-1">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{notif.title}</h4>
                    <span className="text-[9px] text-slate-400">{notif.time}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">{notif.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => triggerToast("Marked all as read")} className="w-full bg-slate-50 border text-slate-700 text-xs font-bold py-2 rounded-xl">
            Mark all as Read
          </button>
        </div>
      )}

      {/* -------------------------------------------------------------
          QUICK ADD MODAL DIALOG
          ------------------------------------------------------------- */}
      {quickAddOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-100 dark:border-slate-800 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-950 dark:text-slate-100">Add Lead Record</h3>
              <button onClick={() => setQuickAddOpen(false)} className="text-xs text-slate-400 font-bold">✕</button>
            </div>
            
            <form onSubmit={handleQuickAddLead} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Lead Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahadev Mehta"
                  value={newLeadForm.name}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-850 text-xs border-0 rounded-lg p-3 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={newLeadForm.phone}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-850 text-xs border-0 rounded-lg p-3 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Interested Property</label>
                <input
                  type="text"
                  placeholder="e.g. Stanza Living Flats"
                  value={newLeadForm.property}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, property: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-850 text-xs border-0 rounded-lg p-3 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Budget Limit</label>
                <input
                  type="text"
                  placeholder="e.g. ₹18,000/mo"
                  value={newLeadForm.budget}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, budget: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-850 text-xs border-0 rounded-lg p-3 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setQuickAddOpen(false)} className="px-4 py-2 border rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold">Create Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TOAST NOTIFICATION CORNER
          ------------------------------------------------------------- */}
      <div className="fixed bottom-5 right-5 space-y-2 z-50">
        {toasts.map((t) => (
          <div key={t.id} className="bg-slate-900 text-white text-xs px-4.5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-left">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <p className="font-medium pr-2">{t.text}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
