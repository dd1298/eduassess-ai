import React, { useState, useEffect } from "react";
import { Search, Filter, Edit2, Trash2, Plus, CheckCircle, Loader2, X, Save } from "lucide-react";
import { db } from "../firebase";
import { collection, query, getDocs, deleteDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

export default function QuestionBank() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    subject: "Physics",
    topic: "",
    marks: 2,
    type: "MCQ",
    options: ["", "", "", ""],
    correct: ""
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "questions"));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (docs.length > 0) {
        setQuestions(docs);
      } else {
        throw new Error("No questions found");
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      setQuestions([
        { id: "1", text: "What is the principle of conservation of energy?", subject: "Physics", topic: "Mechanics", marks: 5, type: "Short Answer", correct: "Energy cannot be created or destroyed, only transformed." },
        { id: "2", text: "Solve for x: 2x + 5 = 15", subject: "Mathematics", topic: "Algebra", marks: 2, type: "MCQ", options: ["5", "10", "15", "20"], correct: "5" },
        { id: "3", text: "Explain the process of photosynthesis.", subject: "Biology", topic: "Botany", marks: 10, type: "Long Answer", correct: "Process by which green plants use sunlight to synthesize nutrients." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingQuestion) {
        await updateDoc(doc(db, "questions", editingQuestion.id), newQuestion);
      } else {
        await addDoc(collection(db, "questions"), newQuestion);
      }
      setIsModalOpen(false);
      setEditingQuestion(null);
      setNewQuestion({ text: "", subject: "Physics", topic: "", marks: 2, type: "MCQ", options: ["", "", "", ""], correct: "" });
      fetchQuestions();
    } catch (error) {
      console.error("Error saving question:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await deleteDoc(doc(db, "questions", id));
        fetchQuestions();
      } catch (error) {
        console.error("Error deleting question:", error);
      }
    }
  };

  const filteredQuestions = questions.filter(q => 
    (filterSubject === "All" || q.subject === filterSubject) &&
    (q.text.toLowerCase().includes(searchTerm.toLowerCase()) || q.topic?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-6xl">
      <header className="mb-12 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-light tracking-tight">Question Bank</h2>
          <p className="mt-2 text-gray-500 italic">Manage and curate your repository of assessment questions.</p>
        </div>
        <button 
          onClick={() => { setEditingQuestion(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-[#141414] px-6 py-3 text-white transition-transform hover:scale-105 rounded-xl shadow-lg"
        >
          <Plus size={18} />
          Add Question
        </button>
      </header>

      <div className="mb-8 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by keyword or topic..."
            className="w-full border border-gray-200 bg-white py-4 pl-12 pr-4 rounded-2xl outline-none focus:border-[#141414] shadow-sm transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select 
            className="border border-gray-200 bg-white px-6 py-4 rounded-2xl outline-none focus:border-[#141414] shadow-sm transition-all"
            value={filterSubject}
            onChange={e => setFilterSubject(e.target.value)}
          >
            <option value="All">All Subjects</option>
            <option value="Physics">Physics</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Biology">Biology</option>
            <option value="Chemistry">Chemistry</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredQuestions.map((q) => (
            <div key={q.id} className="group flex items-start gap-6 border border-gray-100 bg-white p-8 rounded-[2rem] transition-all hover:border-[#141414] hover:shadow-xl">
              <div className="flex-1">
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#141414] opacity-40 bg-gray-50 px-2 py-1 rounded">{q.subject}</span>
                  <span className="h-1 w-1 rounded-full bg-gray-300" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{q.topic}</span>
                </div>
                <p className="text-xl font-medium leading-relaxed text-gray-800 mb-6">{q.text}</p>
                {q.options && (
                  <div className="grid grid-cols-2 gap-4">
                    {q.options.map((opt: string, i: number) => (
                      <div key={i} className={`flex items-center gap-3 text-sm p-3 rounded-xl border ${q.correct === opt ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-100 text-gray-500"}`}>
                        <span className="font-bold opacity-30">{String.fromCharCode(65 + i)}.</span>
                        {opt}
                        {q.correct === opt && <CheckCircle size={14} className="ml-auto" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-6">
                <span className="text-xs font-bold bg-[#141414] text-white px-4 py-2 rounded-full">[{q.marks}M]</span>
                <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button 
                    onClick={() => { setEditingQuestion(q); setNewQuestion(q); setIsModalOpen(true); }}
                    className="p-3 bg-gray-50 text-gray-400 hover:text-[#141414] hover:bg-white hover:shadow-md rounded-xl transition-all"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(q.id)}
                    className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-white hover:shadow-md rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredQuestions.length === 0 && (
            <div className="py-24 text-center text-gray-400 italic border-2 border-dashed border-gray-100 rounded-[3rem]">
              No questions found matching your criteria.
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-3xl font-light">{editingQuestion ? "Edit" : "Add"} Question</h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Question Text</label>
                    <textarea 
                      className="w-full border border-gray-100 bg-gray-50 p-6 rounded-2xl outline-none focus:bg-white focus:border-[#141414] transition-all min-h-[120px]"
                      placeholder="Type your question here..."
                      value={newQuestion.text}
                      onChange={e => setNewQuestion({...newQuestion, text: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Subject</label>
                      <select 
                        className="w-full border border-gray-100 bg-gray-50 p-4 rounded-xl outline-none focus:bg-white focus:border-[#141414]"
                        value={newQuestion.subject}
                        onChange={e => setNewQuestion({...newQuestion, subject: e.target.value})}
                      >
                        <option>Physics</option>
                        <option>Mathematics</option>
                        <option>Biology</option>
                        <option>Chemistry</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Topic</label>
                      <input 
                        type="text"
                        className="w-full border border-gray-100 bg-gray-50 p-4 rounded-xl outline-none focus:bg-white focus:border-[#141414]"
                        placeholder="e.g. Mechanics"
                        value={newQuestion.topic}
                        onChange={e => setNewQuestion({...newQuestion, topic: e.target.value})}
                      />
                    </div>
                  </div>

                  {newQuestion.type === "MCQ" && (
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Options & Correct Answer</label>
                      <div className="grid grid-cols-1 gap-3">
                        {newQuestion.options.map((opt, i) => (
                          <div key={i} className="flex gap-3">
                            <input 
                              type="text"
                              className="flex-1 border border-gray-100 bg-gray-50 p-4 rounded-xl outline-none focus:bg-white focus:border-[#141414]"
                              placeholder={`Option ${String.fromCharCode(65 + i)}`}
                              value={opt}
                              onChange={e => {
                                const opts = [...newQuestion.options];
                                opts[i] = e.target.value;
                                setNewQuestion({...newQuestion, options: opts});
                              }}
                            />
                            <button 
                              onClick={() => setNewQuestion({...newQuestion, correct: opt})}
                              className={`px-4 rounded-xl border transition-all ${newQuestion.correct === opt ? "bg-green-500 text-white border-green-500" : "bg-gray-50 text-gray-300 border-gray-100"}`}
                            >
                              <CheckCircle size={20} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-10 flex gap-4">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 border border-gray-200 rounded-2xl font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="flex-1 py-4 bg-[#141414] text-white rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <Save size={18} />
                    Save Question
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
