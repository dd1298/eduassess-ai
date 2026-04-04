import React from "react";
import { motion } from "framer-motion";
import { LogOut, User, BookOpen, FileText, LayoutDashboard, Database, Settings } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Layout({ children, user, onLogout, activeTab, setActiveTab }: LayoutProps) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "teacher", label: "Teacher Portal", icon: BookOpen, role: "teacher" },
    { id: "bank", label: "Question Bank", icon: Database, role: "teacher" },
    { id: "student", label: "Student Portal", icon: FileText, role: "student" },
  ];

  const filteredTabs = tabs.filter(tab => !tab.role || tab.role === user?.role || user?.role === "admin");

  return (
    <div className="min-h-screen bg-[#F9F9F9] font-sans text-[#141414]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-72 border-r border-gray-100 bg-white p-8">
        <div className="mb-12">
          <h1 className="text-3xl font-light tracking-tighter">EduAssess<span className="font-bold">AI</span></h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-30">Assessment Ecosystem</p>
        </div>

        <nav className="space-y-2">
          {filteredTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex w-full items-center gap-4 px-4 py-3 text-sm transition-all ${
                activeTab === tab.id
                  ? "bg-[#141414] text-white shadow-lg"
                  : "text-gray-400 hover:bg-gray-50 hover:text-[#141414]"
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-8 left-8 right-8 space-y-4">
          <div className="flex items-center gap-4 border-t border-gray-100 pt-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 font-bold">
              {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{user?.displayName || user?.email}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-30">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-4 px-4 py-3 text-sm text-red-400 hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 p-16">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
