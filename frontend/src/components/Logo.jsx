import React from 'react';

export default function Logo({ className = '', onClick }) {
  return (
    <div onClick={onClick} className={`flex items-center gap-2.5 ${className}`}>
      {/* Abstract geometric balance scale representing justice and ops */}
      <svg className="w-5.5 h-5.5 text-[#4a3728] shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="18" width="18" height="1.5" fill="currentColor" />
        <path d="M12 4V18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M6 7H18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M6 7L4 12H8L6 7Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
        <path d="M18 7L16 12H20L18 7Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
      </svg>
      <span className="font-sans font-extrabold text-[13px] tracking-widest uppercase text-[#4a3728] select-none">
        legal<span className="text-[#8a7c6e]">.</span>ops
      </span>
    </div>
  );
}
