import { useState, useEffect } from "react";
import { auth, db, isAuthReady } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import Auth from "./components/Auth";
import Layout from "./components/Layout";
import TeacherPortal from "./components/TeacherPortal";
import StudentPortal from "./components/StudentPortal";
import QuestionBank from "./components/QuestionBank";
import { Loader2, LayoutDashboard, BookOpen, FileText, TrendingUp, Users, Clock, Plus, Database, ChevronRight } from "lucide-react";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    isAuthReady.then(async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data());
        } else {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: "student",
            displayName: firebaseUser.displayName
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F9F9]">
        <Loader2 className="animate-spin text-[#141414]" size={48} />
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={(u) => setUser(u)} />;
  }

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      {activeTab === "dashboard" && (
        <div className="max-w-6xl">
          <header className="mb-12">
            <h2 className="text-4xl font-light tracking-tight">Welcome, {user.displayName || "Professor"}</h2>
            <p className="mt-2 text-gray-500 italic">Your assessment ecosystem is ready.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              { label: "Active Exams", value: "12", icon: Clock, color: "text-blue-500" },
              { label: "Total Students", value: "450", icon: Users, color: "text-purple-500" },
              { label: "Average Score", value: "78%", icon: TrendingUp, color: "text-green-500" },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 border border-gray-100 shadow-sm rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className={stat.color} size={24} />
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">Live</span>
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-xs text-gray-400 uppercase tracking-tighter">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-2xl">
              <h3 className="text-xl font-medium mb-6 flex items-center gap-2">
                <FileText size={20} className="text-gray-400" />
                Quick Actions
              </h3>
              <div className="space-y-4">
                <button 
                  onClick={() => setActiveTab("teacher")}
                  className="w-full flex items-center justify-between p-4 border border-gray-100 hover:border-[#141414] transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-50 p-3 rounded-xl group-hover:bg-[#141414] group-hover:text-white transition-colors">
                      <Plus size={20} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Generate New Paper</div>
                      <div className="text-xs text-gray-400">AI-powered assessment creation</div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-300" />
                </button>
                <button 
                  onClick={() => setActiveTab("bank")}
                  className="w-full flex items-center justify-between p-4 border border-gray-100 hover:border-[#141414] transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-50 p-3 rounded-xl group-hover:bg-[#141414] group-hover:text-white transition-colors">
                      <Database size={20} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Question Bank</div>
                      <div className="text-xs text-gray-400">Manage 1,240+ questions</div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-300" />
                </button>
              </div>
            </div>

            <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-2xl">
              <h3 className="text-xl font-medium mb-6 flex items-center gap-2">
                <Clock size={20} className="text-gray-400" />
                Recent Papers
              </h3>
              <div className="space-y-4">
                {[
                  { name: "Physics Mid-Term 2024", date: "2 days ago", status: "Published" },
                  { name: "Chemistry Quiz #4", date: "5 days ago", status: "Draft" },
                  { name: "Biology Final Prep", date: "1 week ago", status: "Published" },
                ].map((paper, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0">
                    <div>
                      <div className="font-medium">{paper.name}</div>
                      <div className="text-xs text-gray-400">{paper.date}</div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
                      paper.status === "Published" ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-500"
                    }`}>
                      {paper.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "teacher" && <TeacherPortal />}
      {activeTab === "student" && <StudentPortal />}
      {activeTab === "bank" && <QuestionBank />}
    </Layout>
  );
}
