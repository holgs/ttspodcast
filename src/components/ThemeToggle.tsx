 "use client";
 import React from 'react';
 import { useEffect, useState } from "react";
 import { Sun, Moon } from "lucide-react";
 import { Button } from "@/components/ui/button";
 
 const THEME_KEY = "COLOR_THEME";
 
 export default function ThemeToggle() {
   const [dark, setDark] = useState<boolean>(() =>
     typeof window !== "undefined"
       ? document.documentElement.classList.contains("dark")
       : false,
   );
 
   // sync with localStorage on mount
   useEffect(() => {
     const saved = localStorage.getItem(THEME_KEY);
     if (saved === "dark") {
       document.documentElement.classList.add("dark");
       setDark(true);
     } else if (saved === "light") {
       document.documentElement.classList.remove("dark");
       setDark(false);
     }
   }, []);
 
   function toggle() {
     setDark((d) => {
       const next = !d;
       if (next) {
         document.documentElement.classList.add("dark");
         localStorage.setItem(THEME_KEY, "dark");
       } else {
         document.documentElement.classList.remove("dark");
         localStorage.setItem(THEME_KEY, "light");
       }
       return next;
     });
   }
 
   return (
     <Button
       onClick={toggle}
       variant="ghost"
       size="icon"
       aria-label="Toggle theme"
       className="rounded-full bg-yellow-400/80 text-white hover:bg-yellow-400"
     >
       {dark ? <Moon size={18} /> : <Sun size={18} />}
     </Button>
   );
 }