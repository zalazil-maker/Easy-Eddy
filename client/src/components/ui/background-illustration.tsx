import React from 'react';

export default function BackgroundIllustration() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-blue-50 opacity-60"></div>
      
      {/* AI Robot with CVs SVG Illustration */}
      <svg 
        className="absolute bottom-0 right-0 w-96 h-96 opacity-20 transform translate-x-12 translate-y-12"
        viewBox="0 0 400 400" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Robot Body */}
        <rect x="150" y="200" width="100" height="120" rx="20" fill="#22c55e" opacity="0.8"/>
        
        {/* Robot Head */}
        <rect x="160" y="160" width="80" height="60" rx="15" fill="#16a34a" opacity="0.8"/>
        
        {/* Robot Eyes */}
        <circle cx="175" cy="180" r="6" fill="#ffffff"/>
        <circle cx="225" cy="180" r="6" fill="#ffffff"/>
        <circle cx="175" cy="180" r="3" fill="#1f2937"/>
        <circle cx="225" cy="180" r="3" fill="#1f2937"/>
        
        {/* Robot Arms */}
        <rect x="120" y="220" width="20" height="60" rx="10" fill="#22c55e" opacity="0.8"/>
        <rect x="260" y="220" width="20" height="60" rx="10" fill="#22c55e" opacity="0.8"/>
        
        {/* CV Documents floating around */}
        <g opacity="0.6">
          {/* CV 1 */}
          <rect x="80" y="120" width="40" height="50" rx="4" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2"/>
          <line x1="85" y1="130" x2="115" y2="130" stroke="#9ca3af" strokeWidth="2"/>
          <line x1="85" y1="140" x2="110" y2="140" stroke="#9ca3af" strokeWidth="1"/>
          <line x1="85" y1="150" x2="115" y2="150" stroke="#9ca3af" strokeWidth="1"/>
          
          {/* CV 2 */}
          <rect x="300" y="100" width="40" height="50" rx="4" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2"/>
          <line x1="305" y1="110" x2="335" y2="110" stroke="#9ca3af" strokeWidth="2"/>
          <line x1="305" y1="120" x2="330" y2="120" stroke="#9ca3af" strokeWidth="1"/>
          <line x1="305" y1="130" x2="335" y2="130" stroke="#9ca3af" strokeWidth="1"/>
          
          {/* CV 3 */}
          <rect x="50" y="250" width="40" height="50" rx="4" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2"/>
          <line x1="55" y1="260" x2="85" y2="260" stroke="#9ca3af" strokeWidth="2"/>
          <line x1="55" y1="270" x2="80" y2="270" stroke="#9ca3af" strokeWidth="1"/>
          <line x1="55" y1="280" x2="85" y2="280" stroke="#9ca3af" strokeWidth="1"/>
          
          {/* CV 4 */}
          <rect x="320" y="240" width="40" height="50" rx="4" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2"/>
          <line x1="325" y1="250" x2="355" y2="250" stroke="#9ca3af" strokeWidth="2"/>
          <line x1="325" y1="260" x2="350" y2="260" stroke="#9ca3af" strokeWidth="1"/>
          <line x1="325" y1="270" x2="355" y2="270" stroke="#9ca3af" strokeWidth="1"/>
        </g>
        
        {/* Magnifying glass in robot hand */}
        <circle cx="130" cy="270" r="15" fill="none" stroke="#22c55e" strokeWidth="3"/>
        <line x1="120" y1="280" x2="115" y2="285" stroke="#22c55e" strokeWidth="3"/>
        
        {/* Analysis lines from robot to CVs */}
        <g opacity="0.4">
          <line x1="200" y1="180" x2="100" y2="145" stroke="#22c55e" strokeWidth="2" strokeDasharray="5,5"/>
          <line x1="200" y1="180" x2="320" y2="125" stroke="#22c55e" strokeWidth="2" strokeDasharray="5,5"/>
          <line x1="200" y1="200" x2="70" y2="275" stroke="#22c55e" strokeWidth="2" strokeDasharray="5,5"/>
        </g>
        
        {/* Floating data points */}
        <g opacity="0.3">
          <circle cx="120" cy="80" r="3" fill="#22c55e"/>
          <circle cx="280" cy="60" r="3" fill="#22c55e"/>
          <circle cx="60" cy="180" r="3" fill="#22c55e"/>
          <circle cx="340" cy="180" r="3" fill="#22c55e"/>
          <circle cx="100" cy="320" r="3" fill="#22c55e"/>
          <circle cx="300" cy="320" r="3" fill="#22c55e"/>
        </g>
      </svg>
      
      {/* Additional decorative elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-green-100 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 left-40 w-24 h-24 bg-blue-100 rounded-full opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-40 right-40 w-20 h-20 bg-green-200 rounded-full opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
    </div>
  );
}