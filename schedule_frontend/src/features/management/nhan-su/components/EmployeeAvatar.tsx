import React from "react";
import { resolveImageUrl } from "../utils";

/** Ảnh minh họa mặc định khi nhân viên chưa có avatar. */
export function DefaultAvatarIllustration({ className = "w-full h-full", gender }: { className?: string; gender?: string | null }) {
  const isFemale = gender?.toUpperCase() === "FEMALE";
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>
        <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#bgGrad)" />
      <path d="M18 96C18 78 32 68 50 68C68 68 82 78 82 96" fill="url(#shirtGrad)" />
      <path d="M42 56H58V69C58 73.4 54.4 77 50 77C45.6 77 42 73.4 42 69V56Z" fill="#fed7aa" />
      <path d="M40 68L50 79L60 68" stroke="#ffedd5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="50" cy="42" r="19" fill="#fde68a" />
      {isFemale ? (
        <path
          d="M31 43C29 30 38 21 50 21C62 21 71 30 69 43C69 49 67 55 65 58C63 53 61 38 50 38C39 38 37 53 35 58C33 55 31 49 31 43Z"
          fill="#451a03"
        />
      ) : (
        <path
          d="M31 41C31 29 40 22 50 22C60 22 69 29 69 41C69 42 65 37 60 36C54 35 51 37 50 37C49 37 46 35 40 36C35 37 31 42 31 41Z"
          fill="#374151"
        />
      )}
      <circle cx="44" cy="44" r="2.2" fill="#1f2937" />
      <circle cx="56" cy="44" r="2.2" fill="#1f2937" />
      <circle cx="41" cy="48" r="2" fill="#fca5a5" opacity="0.6" />
      <circle cx="59" cy="48" r="2" fill="#fca5a5" opacity="0.6" />
      <path d="M46 50C48 52.5 52 52.5 54 50" stroke="#1f2937" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/** Avatar nhân viên: ảnh thật nếu có, ngược lại ảnh minh họa. */
export function EmployeeAvatar({ src, gender, alt }: { src?: string | number | null; gender?: string | null; alt?: string }) {
  const url = resolveImageUrl(src);
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element -- ảnh từ backend, không qua next/image
    <img src={url} alt={alt || "Avatar"} className="h-full w-full object-cover" />
  ) : (
    <DefaultAvatarIllustration gender={gender} />
  );
}
