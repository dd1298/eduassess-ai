import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Plus, FileText, CheckCircle, AlertCircle, Loader2, ChevronRight, Save, Download } from "lucide-react";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const steps = [
  { id: 1, label: "Class", description: "Target audience" },
  { id: 2, label: "Subject", description: "Core discipline" },
  { id: 3, label: "Topics", description: "Curriculum focus" },
  { id: 4, label: "Difficulty", description: "Cognitive load" },
  { id: 5, label: "Marks", description: "Total weightage" },
  { id: 6, label: "Question Type", description: "Assessment mix" },
  { id: 7, label: "Duration", description: "Time limit" },
  { id: 8, label: "Format", description: "Visual style" }
];

export default function TeacherPortal() {
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState({
    title: "",
    className: "",
    subject: "",
    topics: [] as string[],
    difficulty: { easy: 30, medium: 50, hard: 20 },
    totalMarks: 100,
    duration: 60,
    questionTypes: ["MCQ", "SHORT", "LONG"],
    format: "CBSE",
    sets: 1
  });

  const [generatedSets, setGeneratedSets] = useState<{setName: string, questions: any[]}[] | null>(null);
  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [sources, setSources] = useState<{name: string, date: string}[]>([]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("subjectId", config.subject || "general");

    try {
      const res = await fetch("/api/ingest-pdf", {
        method: "POST",
        body: formData
      });
      
      const contentType = res.headers.get("content-type");
      if (!res.ok) {
        let errorMsg = "Upload failed";
        if (contentType && contentType.includes("application/json")) {
          const errData = await res.json();
          errorMsg = errData.error || errorMsg;
        } else {
          errorMsg = `Server error: ${res.status} ${res.statusText}`;
        }
        throw new Error(errorMsg);
      }

      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response. Please check server logs.");
      }

      const data = await res.json();
      if (data.error && !data.isMock) throw new Error(data.error);
      if (data.isMock) setIsMock(true);
      
      setSources(prev => [...prev, { name: file.name, date: new Date().toLocaleDateString() }]);
      console.log("Ingested:", data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const saveToLibrary = async () => {
    if (!generatedSets || !auth.currentUser) {
      if (!auth.currentUser) setError("Please sign in to save papers.");
      return;
    }
    setIsSaving(true);
    try {
      const activeSet = generatedSets[activeSetIndex];
      await addDoc(collection(db, "papers"), {
        title: config.title || `${config.subject} - ${config.className} Final`,
        setName: activeSet.setName,
        subjectId: config.subject,
        teacherId: auth.currentUser.uid,
        questions: activeSet.questions,
        totalMarks: config.totalMarks,
        duration: config.duration,
        className: config.className,
        topics: config.topics,
        difficulty: config.difficulty,
        format: config.format,
        createdAt: serverTimestamp(),
      });
      alert("Paper saved to library successfully!");
    } catch (err: any) {
      console.error(err);
      setError("Failed to save paper: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const generatePaper = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });

      const contentType = res.headers.get("content-type");
      if (!res.ok) {
        let errorMsg = "Generation failed";
        if (contentType && contentType.includes("application/json")) {
          const errData = await res.json();
          errorMsg = errData.error || errorMsg;
        } else {
          errorMsg = `Server error: ${res.status} ${res.statusText}`;
        }
        throw new Error(errorMsg);
      }

      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response. Please check server logs.");
      }

      const data = await res.json();
      
      if (data.error && !data.sets) throw new Error(data.error);
      
      if (data.sets) {
        setGeneratedSets(data.sets);
      } else if (Array.isArray(data)) {
        // Fallback for mock or old format
        setGeneratedSets([{ setName: "Set A", questions: data }]);
      } else {
        setGeneratedSets([]);
      }
      
      setStep(9); // Move to preview step
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-widest opacity-50">Paper Title</label>
              <input 
                type="text" 
                placeholder="e.g. Mid-Term Physics 2026"
                value={config.title}
                onChange={e => setConfig({...config, title: e.target.value})}
                className="w-full bg-gray-50 border-b-2 border-gray-100 p-4 text-xl font-medium outline-none focus:border-[#141414] transition-all"
              />
            </div>
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-widest opacity-50">Select Class</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {["Class 8", "Class 10", "Class 12", "B.Sc Year 1", "B.Sc Year 2"].map(c => (
                  <button 
                    key={c}
                    onClick={() => { setConfig({...config, className: c}); }}
                    className={`border-2 p-6 text-sm font-bold transition-all rounded-2xl ${config.className === c ? "bg-[#141414] text-white border-[#141414] shadow-lg" : "bg-white hover:border-[#141414] border-gray-100"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <button 
              onClick={() => setStep(2)} 
              disabled={!config.className || !config.title}
              className="w-full bg-[#141414] py-5 text-white rounded-2xl font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <label className="block text-xs font-bold uppercase tracking-widest opacity-50">Step 2: Select Subject</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["Physics", "Chemistry", "Biology", "Mathematics"].map(s => (
                <button 
                  key={s}
                  onClick={() => { setConfig({...config, subject: s}); setStep(3); }}
                  className={`border-2 p-6 text-sm font-bold transition-all rounded-2xl ${config.subject === s ? "bg-[#141414] text-white border-[#141414] shadow-lg" : "bg-white hover:border-[#141414] border-gray-100"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <label className="block text-xs font-bold uppercase tracking-widest opacity-50">Step 3: Select Topics</label>
            <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto border border-gray-100 p-6 bg-gray-50 rounded-2xl custom-scrollbar">
              {["Mechanics", "Thermodynamics", "Optics", "Electromagnetism", "Modern Physics", "Quantum Mechanics", "Nuclear Physics"].map(t => (
                <label key={t} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:border-[#141414] cursor-pointer transition-all">
                  <input 
                    type="checkbox" 
                    checked={config.topics.includes(t)}
                    onChange={(e) => {
                      const newTopics = e.target.checked 
                        ? [...config.topics, t]
                        : config.topics.filter(x => x !== t);
                      setConfig({...config, topics: newTopics});
                    }}
                    className="h-5 w-5 accent-[#141414]"
                  />
                  <span className="text-sm font-medium">{t}</span>
                </label>
              ))}
            </div>
            <button onClick={() => setStep(4)} disabled={config.topics.length === 0} className="mt-4 w-full bg-[#141414] py-5 text-white rounded-2xl font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50">Continue</button>
          </div>
        );
      case 4:
        return (
          <div className="space-y-8">
            <label className="block text-xs font-bold uppercase tracking-widest opacity-50">Step 4: Difficulty Distribution (%)</label>
            <div className="space-y-8 bg-white p-10 border border-gray-100 rounded-[2rem] shadow-sm">
              {Object.entries(config.difficulty).map(([level, val]) => (
                <div key={level} className="space-y-4">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="opacity-40">{level}</span>
                    <span className="text-[#141414]">{val}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" value={val}
                    onChange={(e) => setConfig({...config, difficulty: {...config.difficulty, [level]: parseInt(e.target.value)}})}
                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#141414]"
                  />
                </div>
              ))}
              <div className="pt-6 text-center text-[10px] font-bold uppercase tracking-widest opacity-30">Total: {config.difficulty.easy + config.difficulty.medium + config.difficulty.hard}%</div>
            </div>
            <button onClick={() => setStep(5)} className="w-full bg-[#141414] py-5 text-white rounded-2xl font-bold uppercase tracking-widest hover:opacity-90 transition-opacity">Continue</button>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <label className="block text-xs font-bold uppercase tracking-widest opacity-50">Step 5: Mark Distribution</label>
            <div className="bg-white p-10 border border-gray-100 rounded-[2rem] space-y-6 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total Marks</span>
                <input 
                  type="number" value={config.totalMarks}
                  onChange={e => setConfig({...config, totalMarks: parseInt(e.target.value)})}
                  className="w-24 border-b-2 border-[#141414] text-center text-3xl font-bold outline-none pb-2"
                />
              </div>
              <p className="text-xs text-gray-400 italic leading-relaxed">AI will intelligently distribute marks across selected topics based on standard curriculum weightage and difficulty levels.</p>
            </div>
            <button onClick={() => setStep(6)} className="w-full bg-[#141414] py-5 text-white rounded-2xl font-bold uppercase tracking-widest hover:opacity-90 transition-opacity">Continue</button>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <label className="block text-xs font-bold uppercase tracking-widest opacity-50">Step 6: Question Type Mix</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["MCQ", "Short Answer", "Long Answer", "Fill in Blank", "Case Study"].map(type => (
                <label key={type} className="flex items-center gap-4 p-5 border border-gray-100 bg-white rounded-2xl cursor-pointer hover:border-[#141414] transition-all">
                  <input 
                    type="checkbox" 
                    checked={config.questionTypes.includes(type)}
                    onChange={(e) => {
                      const newTypes = e.target.checked 
                        ? [...config.questionTypes, type]
                        : config.questionTypes.filter(x => x !== type);
                      setConfig({...config, questionTypes: newTypes});
                    }}
                    className="h-5 w-5 accent-[#141414]"
                  />
                  <span className="text-sm font-medium">{type}</span>
                </label>
              ))}
            </div>
            <button onClick={() => setStep(7)} className="mt-6 w-full bg-[#141414] py-5 text-white rounded-2xl font-bold uppercase tracking-widest hover:opacity-90 transition-opacity">Continue</button>
          </div>
        );
      case 7:
        return (
          <div className="space-y-6">
            <label className="block text-xs font-bold uppercase tracking-widest opacity-50">Step 7: Duration (Minutes)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[30, 60, 90, 120, 180].map(d => (
                <button 
                  key={d}
                  onClick={() => { setConfig({...config, duration: d}); setStep(8); }}
                  className={`border-2 p-6 text-sm font-bold transition-all rounded-2xl ${config.duration === d ? "bg-[#141414] text-white border-[#141414] shadow-lg" : "bg-white hover:border-[#141414] border-gray-100"}`}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>
        );
      case 8:
        return (
          <div className="space-y-8">
            <div className="space-y-6">
              <label className="block text-xs font-bold uppercase tracking-widest opacity-50">Step 8: Paper Format</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["CBSE Style", "University Style", "Custom Template", "Competitive Exam Style"].map(f => (
                  <button 
                    key={f}
                    onClick={() => { setConfig({...config, format: f}); }}
                    className={`border-2 p-6 text-sm text-left font-bold transition-all rounded-2xl ${config.format === f ? "bg-[#141414] text-white border-[#141414] shadow-lg" : "bg-white hover:border-[#141414] border-gray-100"}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <label className="block text-xs font-bold uppercase tracking-widest opacity-50">Number of Sets</label>
              <div className="flex gap-4">
                {[1, 2, 3].map(n => (
                  <button 
                    key={n}
                    onClick={() => setConfig({...config, sets: n})}
                    className={`h-14 w-14 rounded-full border-2 font-bold transition-all ${config.sets === n ? "bg-[#141414] text-white border-[#141414]" : "bg-white border-gray-100 hover:border-[#141414]"}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 italic">Generate multiple distinct sets with no overlapping questions.</p>
            </div>

            <button 
              onClick={generatePaper}
              disabled={isGenerating}
              className="mt-10 w-full bg-[#141414] py-6 text-white rounded-2xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="animate-spin" /> : <FileText size={20} />}
              Generate {config.sets > 1 ? `${config.sets} Sets` : "Final Paper"}
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-12">
        <h2 className="text-4xl font-light tracking-tight">Teacher Portal</h2>
        <p className="mt-2 text-gray-500 italic">Configure and generate assessment papers with AI precision.</p>
      </header>

      {/* Progress Stepper */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Configuration Progress</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#141414]">{Math.round((step / steps.length) * 100)}% Complete</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar">
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              <div 
                onClick={() => step > i + 1 && setStep(i + 1)}
                className={`group relative flex flex-col items-center min-w-[100px] cursor-pointer transition-all ${
                  step === i + 1 ? "opacity-100" : step > i + 1 ? "opacity-100" : "opacity-30"
                }`}
              >
                <div className={`h-1 w-full mb-3 rounded-full transition-all duration-500 ${
                  step >= i + 1 ? "bg-[#141414]" : "bg-gray-100"
                }`} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-center">{s.label}</span>
                {step === i + 1 && (
                  <motion.span 
                    layoutId="activeStep"
                    className="absolute -bottom-2 h-1 w-1 bg-[#141414] rounded-full"
                  />
                )}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {isMock && (
        <div className="mb-8 flex items-center gap-3 rounded-2xl bg-amber-50 p-6 text-sm text-amber-700 border border-amber-200 shadow-sm">
          <AlertCircle size={20} />
          <span><strong>Mock Mode Active:</strong> Using high-quality sample data. Configure <code>GEMINI_API_KEY</code> in Secrets for real AI generation.</span>
        </div>
      )}

      {error && (
        <div className="mb-8 flex items-center gap-3 rounded-2xl bg-red-50 p-6 text-sm text-red-600 border border-red-100 shadow-sm">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <motion.div 
            key={step}
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-white p-12 shadow-xl border border-gray-50 rounded-[3rem]"
          >
            {step <= 8 ? renderStepContent() : (
              <div className="space-y-12">
                <div className="flex items-center justify-between border-b border-gray-100 pb-8">
                  <div>
                    <h3 className="text-3xl font-light">Final Paper Preview</h3>
                    <div className="flex items-center gap-4 mt-4">
                      {generatedSets && generatedSets.length > 1 && (
                        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                          {generatedSets.map((s, idx) => (
                            <button
                              key={idx}
                              onClick={() => setActiveSetIndex(idx)}
                              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeSetIndex === idx ? "bg-white text-[#141414] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                            >
                              {s.setName}
                            </button>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-gray-400 font-medium uppercase tracking-widest">
                        {config.subject} • {config.className} • {config.totalMarks} Marks
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => window.print()}
                      className="flex items-center gap-2 border-2 border-[#141414] px-6 py-3 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"
                    >
                      <Download size={18} /> Export PDF
                    </button>
                    <button 
                      onClick={saveToLibrary}
                      disabled={isSaving}
                      className="flex items-center gap-2 bg-[#141414] px-6 py-3 rounded-xl text-sm text-white font-bold hover:opacity-90 transition-all shadow-lg disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                      Save to Library
                    </button>
                  </div>
                </div>

                <div className="space-y-12">
                  <div className="text-center border-b border-gray-100 pb-12">
                    <h4 className="text-2xl font-bold uppercase tracking-[0.2em] mb-6">{config.subject} Final Examination</h4>
                    {generatedSets && generatedSets.length > 1 && (
                      <div className="mb-4 text-xs font-bold text-[#141414] uppercase tracking-widest">
                        --- {generatedSets[activeSetIndex].setName} ---
                      </div>
                    )}
                    <div className="flex justify-center gap-12 text-[10px] font-bold uppercase tracking-widest opacity-40">
                      <span>Time: {config.duration} Mins</span>
                      <span>Max Marks: {config.totalMarks}</span>
                      <span>Format: {config.format}</span>
                    </div>
                  </div>

                  {generatedSets && generatedSets[activeSetIndex] ? (
                    <div className="space-y-12">
                      {generatedSets[activeSetIndex].questions.map((q: any, i: number) => (
                        <div key={i} className="group relative border-b border-gray-50 pb-12 last:border-0">
                          <div className="flex items-start justify-between gap-8">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-4">
                                <span className="text-[10px] font-bold bg-[#141414] text-white px-3 py-1 rounded-full">Q{i + 1}</span>
                                <span className="text-[10px] uppercase tracking-widest font-bold opacity-30">{q.type || 'Question'}</span>
                              </div>
                              <p className="mb-8 text-xl leading-relaxed text-gray-800">{q.text}</p>
                              {q.options && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {q.options.map((opt: string, j: number) => (
                                    <div key={j} className="flex items-center gap-4 p-5 bg-gray-50 border border-gray-100 rounded-2xl hover:border-gray-300 transition-all">
                                      <span className="h-8 w-8 rounded-full bg-white border flex items-center justify-center text-xs font-bold opacity-40">{String.fromCharCode(65 + j)}</span>
                                      <span className="text-sm font-medium">{opt}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <span className="text-xs font-bold bg-gray-100 px-4 py-2 rounded-full border border-gray-100">[{q.marks}M]</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-32 text-center text-gray-400 italic border-2 border-dashed border-gray-100 rounded-[3rem]">
                      No questions generated yet. Complete the configuration to generate your paper.
                    </div>
                  )}
                </div>
                
                <div className="flex justify-start pt-8">
                  <button onClick={() => setStep(8)} className="text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-[#141414] transition-colors">← Back to Configuration</button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-10 border border-gray-100 rounded-[2.5rem] shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[#141414]">
                <Upload size={24} />
              </div>
              <h3 className="text-xl font-medium">Knowledge Base</h3>
            </div>
            
            {sources.length > 0 && (
              <div className="mb-8 space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-30">Ingested Sources</label>
                {sources.map((src, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText size={16} className="shrink-0 opacity-40" />
                      <span className="text-xs font-medium truncate">{src.name}</span>
                    </div>
                    <span className="text-[10px] font-bold opacity-30 shrink-0">{src.date}</span>
                  </div>
                ))}
              </div>
            )}

            <p className="text-sm text-gray-500 mb-8 leading-relaxed italic">Upload curriculum PDFs or notes to ground the AI generation in specific content.</p>
            <label className="flex w-full cursor-pointer items-center justify-center gap-3 bg-gray-50 border-2 border-dashed border-gray-200 p-8 rounded-3xl transition-all hover:border-[#141414] hover:bg-white group">
              <Plus size={20} className="text-gray-400 group-hover:text-[#141414]" />
              <span className="text-sm font-bold uppercase tracking-widest text-gray-400 group-hover:text-[#141414]">
                {isUploading ? "Processing..." : "Add PDF Source"}
              </span>
              <input type="file" className="hidden" accept=".pdf" onChange={handleUpload} disabled={isUploading} />
            </label>
          </div>

          <div className="bg-[#141414] p-10 rounded-[2.5rem] text-white shadow-2xl">
            <h3 className="text-xl font-medium mb-6">Quick Tips</h3>
            <ul className="space-y-4 text-sm opacity-70 leading-relaxed">
              <li className="flex gap-3">
                <span className="text-amber-400">•</span>
                Select at least 3 topics for balanced question distribution.
              </li>
              <li className="flex gap-3">
                <span className="text-amber-400">•</span>
                Use "Case Study" type for higher-order thinking assessments.
              </li>
              <li className="flex gap-3">
                <span className="text-amber-400">•</span>
                Upload a syllabus PDF to ensure curriculum alignment.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
