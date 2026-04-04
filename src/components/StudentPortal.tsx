import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Clock, CheckCircle2, AlertCircle, Play, ChevronRight, FileText, Timer, Award } from "lucide-react";

export default function StudentPortal() {
  const [view, setView] = useState<"dashboard" | "config" | "exam" | "results">("dashboard");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [examConfig, setExamConfig] = useState({
    subject: "",
    duration: 30,
    topics: [] as string[]
  });
  const [examQuestions, setExamQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subjects = [
    { name: "Physics", icon: "⚛️", topics: ["Mechanics", "Thermodynamics", "Optics"] },
    { name: "Mathematics", icon: "🔢", topics: ["Algebra", "Calculus", "Geometry"] },
    { name: "Biology", icon: "🧬", topics: ["Cell Biology", "Genetics", "Ecology"] },
    { name: "Chemistry", icon: "🧪", topics: ["Organic", "Inorganic", "Physical"] },
  ];

  useEffect(() => {
    let timer: any;
    if (view === "exam" && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && view === "exam") {
      finishExam();
    }
    return () => clearInterval(timer);
  }, [view, timeLeft]);

  const startExam = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...examConfig,
          difficulty: { easy: 50, medium: 30, hard: 20 },
          totalMarks: 50,
          questionTypes: ["MCQ"]
        })
      });
      const data = await res.json();
      if (data.error && !Array.isArray(data)) throw new Error(data.error);
      
      const questions = Array.isArray(data)
        ? data
        : data?.sets?.[0]?.questions || [
            { text: "What is the SI unit of force?", options: ["Newton", "Joule", "Watt", "Pascal"], correct: "Newton", marks: 2 },
            { text: "Which of the following is a scalar quantity?", options: ["Velocity", "Acceleration", "Speed", "Force"], correct: "Speed", marks: 2 },
            { text: "The rate of change of momentum is equal to?", options: ["Work", "Power", "Force", "Energy"], correct: "Force", marks: 2 },
          ];
      
      setExamQuestions(questions);
      setTimeLeft(examConfig.duration * 60);
      setView("exam");
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const finishExam = () => {
    const score = examQuestions.reduce((acc, q, i) => {
      const correctAnswer = q.correct ?? q.correctAnswer;
      return acc + (answers[i] === correctAnswer ? q.marks : 0);
    }, 0);
    const totalMarks = examQuestions.reduce((acc, q) => acc + q.marks, 0);
    setResults({
      score,
      totalMarks,
      percentage: totalMarks > 0 ? (score / totalMarks) * 100 : 0,
      timeTaken: examConfig.duration * 60 - timeLeft
    });
    setView("results");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="max-w-6xl">
      <AnimatePresence mode="wait">
        {view === "dashboard" && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <header className="mb-12">
              <h2 className="text-4xl font-light tracking-tight">Student Portal</h2>
              <p className="mt-2 text-gray-500 italic">Practice, assess, and master your subjects.</p>
            </header>

            {error && (
              <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {subjects.map((s) => (
                <div 
                  key={s.name}
                  onClick={() => { setSelectedSubject(s.name); setExamConfig({...examConfig, subject: s.name}); setView("config"); }}
                  className="group bg-white p-8 border border-gray-100 rounded-2xl shadow-sm hover:border-[#141414] hover:shadow-xl transition-all cursor-pointer"
                >
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{s.icon}</div>
                  <h3 className="text-xl font-medium mb-1">{s.name}</h3>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">3 Practice Exams Available</p>
                </div>
              ))}
            </div>

            <div className="bg-white p-8 border border-gray-100 rounded-2xl shadow-sm">
              <h3 className="text-xl font-medium mb-6 flex items-center gap-2">
                <Clock size={20} className="text-gray-400" />
                Recent Performance
              </h3>
              <div className="space-y-4">
                {[
                  { name: "Physics Mock #1", score: "85%", date: "Yesterday", status: "Excellent" },
                  { name: "Math Algebra Quiz", score: "62%", date: "3 days ago", status: "Needs Improvement" },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                        r.score.startsWith("8") ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                      }`}>
                        {r.score}
                      </div>
                      <div>
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs text-gray-400">{r.date}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">{r.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {view === "config" && (
          <motion.div key="config" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-2xl mx-auto">
            <button onClick={() => setView("dashboard")} className="mb-8 text-sm text-gray-400 hover:text-[#141414]">← Back to Dashboard</button>
            <div className="bg-white p-12 border border-gray-100 rounded-3xl shadow-xl">
              <h3 className="text-3xl font-light mb-8">Configure Mock Exam: <span className="font-bold">{selectedSubject}</span></h3>
              
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-50">Select Topics</label>
                  <div className="grid grid-cols-1 gap-2">
                    {subjects.find(s => s.name === selectedSubject)?.topics.map(t => (
                      <label key={t} className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                        <input 
                          type="checkbox" 
                          checked={examConfig.topics.includes(t)}
                          onChange={(e) => {
                            const newTopics = e.target.checked 
                              ? [...examConfig.topics, t]
                              : examConfig.topics.filter(x => x !== t);
                            setExamConfig({...examConfig, topics: newTopics});
                          }}
                          className="accent-[#141414]"
                        />
                        <span className="text-sm font-medium">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-50">Duration (Minutes)</label>
                  <div className="flex gap-4">
                    {[15, 30, 45, 60].map(d => (
                      <button 
                        key={d}
                        onClick={() => setExamConfig({...examConfig, duration: d})}
                        className={`flex-1 py-3 border rounded-xl text-sm transition-all ${
                          examConfig.duration === d ? "bg-[#141414] text-white border-[#141414]" : "bg-white text-gray-500 hover:border-[#141414]"
                        }`}
                      >
                        {d}m
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={startExam}
                  disabled={isGenerating}
                  className="w-full bg-[#141414] py-5 text-white rounded-2xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isGenerating ? "Generating Exam..." : <><Play size={20} /> Start Mock Exam</>}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {view === "exam" && (
          <motion.div key="exam" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-[#F9F9F9] z-50 p-12 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <header className="flex items-center justify-between mb-12 border-b pb-8">
                <div>
                  <h2 className="text-2xl font-bold">{selectedSubject} Mock Exam</h2>
                  <p className="text-sm text-gray-500 uppercase tracking-widest font-bold opacity-40">Section A: Multiple Choice Questions</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-full border shadow-sm">
                    <Timer size={18} className="text-red-500" />
                    <span className={`font-mono text-xl font-bold ${timeLeft < 300 ? "text-red-500 animate-pulse" : ""}`}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                  <button onClick={finishExam} className="bg-red-500 text-white px-8 py-3 rounded-full font-bold hover:bg-red-600 transition-colors">
                    Finish Exam
                  </button>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="md:col-span-3 space-y-12">
                  <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-8">
                      <span className="text-xs font-bold bg-gray-100 px-3 py-1 rounded">Question {currentQuestionIndex + 1} of {examQuestions.length}</span>
                      <span className="text-xs font-bold opacity-30">[{examQuestions[currentQuestionIndex]?.marks} Marks]</span>
                    </div>
                    <h3 className="text-2xl font-medium leading-relaxed mb-12">
                      {examQuestions[currentQuestionIndex]?.text}
                    </h3>
                    <div className="space-y-4">
                      {examQuestions[currentQuestionIndex]?.options?.map((opt: string, i: number) => (
                        <button 
                          key={i}
                          onClick={() => setAnswers({...answers, [currentQuestionIndex]: opt})}
                          className={`w-full text-left p-6 border rounded-2xl transition-all flex items-center gap-4 ${
                            answers[currentQuestionIndex] === opt 
                              ? "bg-[#141414] text-white border-[#141414] shadow-lg translate-x-2" 
                              : "bg-white hover:bg-gray-50 border-gray-100"
                          }`}
                        >
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center border font-bold text-sm ${
                            answers[currentQuestionIndex] === opt ? "border-white/30" : "border-gray-200"
                          }`}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button 
                      disabled={currentQuestionIndex === 0}
                      onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                      className="px-8 py-4 border rounded-xl font-bold disabled:opacity-30 hover:bg-gray-50 transition-colors"
                    >
                      Previous
                    </button>
                    <button 
                      onClick={() => {
                        if (currentQuestionIndex < examQuestions.length - 1) {
                          setCurrentQuestionIndex(prev => prev + 1);
                        } else {
                          finishExam();
                        }
                      }}
                      className="px-12 py-4 bg-[#141414] text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
                    >
                      {currentQuestionIndex === examQuestions.length - 1 ? "Submit Exam" : "Next Question"}
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-4">Question Navigator</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {examQuestions.map((_, i) => (
                        <button 
                          key={i}
                          onClick={() => setCurrentQuestionIndex(i)}
                          className={`h-10 w-10 rounded-lg border text-xs font-bold transition-all ${
                            currentQuestionIndex === i ? "bg-[#141414] text-white border-[#141414]" :
                            answers[i] ? "bg-green-50 text-green-600 border-green-200" :
                            "bg-white text-gray-400 border-gray-100"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                    <div className="flex items-center gap-2 text-amber-700 mb-2">
                      <AlertCircle size={16} />
                      <span className="text-xs font-bold uppercase tracking-widest">Exam Mode</span>
                    </div>
                    <p className="text-[10px] text-amber-600 leading-relaxed">
                      Distraction-free mode is active. Please do not switch tabs or minimize the window.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {view === "results" && results && (
          <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto text-center">
            <div className="bg-white p-16 rounded-[3rem] shadow-2xl border border-gray-100">
              <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-full bg-green-50 text-green-500">
                <Award size={48} />
              </div>
              <h3 className="text-4xl font-light mb-2">Assessment Complete</h3>
              <p className="text-gray-500 italic mb-12">Great effort! Here is your performance breakdown.</p>

              <div className="grid grid-cols-3 gap-8 mb-12">
                <div className="p-6 bg-gray-50 rounded-3xl">
                  <div className="text-3xl font-bold mb-1">{results.score}/{results.totalMarks}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">Score</div>
                </div>
                <div className="p-6 bg-gray-50 rounded-3xl">
                  <div className="text-3xl font-bold mb-1">{Math.round(results.percentage)}%</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">Accuracy</div>
                </div>
                <div className="p-6 bg-gray-50 rounded-3xl">
                  <div className="text-3xl font-bold mb-1">{Math.floor(results.timeTaken / 60)}m</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">Time Taken</div>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => setView("dashboard")}
                  className="w-full bg-[#141414] py-5 text-white rounded-2xl font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
                >
                  Return to Dashboard
                </button>
                <button className="w-full py-5 border border-gray-200 rounded-2xl font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors">
                  Review Answers
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
