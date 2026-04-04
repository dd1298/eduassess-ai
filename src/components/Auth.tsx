import React, { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, UserPlus, Mail, Lock, Loader2 } from "lucide-react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function Auth({ onAuthSuccess }: { onAuthSuccess: (user: any) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
    role: "student"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isLogin) {
        const cred = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        onAuthSuccess(cred.user);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await updateProfile(cred.user, { displayName: formData.displayName });
        
        const userData = {
          uid: cred.user.uid,
          email: formData.email,
          displayName: formData.displayName,
          role: formData.role,
          createdAt: new Date().toISOString()
        };
        
        await setDoc(doc(db, "users", cred.user.uid), userData);
        onAuthSuccess(userData);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F0] p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white p-12 shadow-2xl"
      >
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold italic tracking-tight">EduAssess AI</h1>
          <p className="mt-2 text-sm text-gray-500 uppercase tracking-widest">
            {isLogin ? "Welcome Back" : "Create Account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-50">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  className="w-full border-b border-gray-200 py-2 outline-none focus:border-[#141414]"
                  value={formData.displayName}
                  onChange={e => setFormData({...formData, displayName: e.target.value})}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest opacity-50">Email Address</label>
            <input
              type="email"
              required
              className="w-full border-b border-gray-200 py-2 outline-none focus:border-[#141414]"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest opacity-50">Password</label>
            <input
              type="password"
              required
              className="w-full border-b border-gray-200 py-2 outline-none focus:border-[#141414]"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-50">I am a...</label>
              <div className="flex gap-4 pt-2">
                {["student", "teacher"].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFormData({...formData, role: r})}
                    className={`flex-1 border py-2 text-xs uppercase tracking-widest transition-all ${
                      formData.role === r ? "bg-[#141414] text-white border-[#141414]" : "border-gray-200 text-gray-400"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 bg-[#141414] py-4 text-white transition-all hover:bg-black disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
            {isLogin ? "Sign In" : "Register"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="font-bold text-[#141414] underline underline-offset-4"
          >
            {isLogin ? "Register Now" : "Sign In"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
