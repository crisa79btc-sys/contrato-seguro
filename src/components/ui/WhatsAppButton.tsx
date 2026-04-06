'use client';

import { useState, useEffect } from 'react';

const WHATSAPP_NUMBER = '5500000000000';
const WHATSAPP_MESSAGE = encodeURIComponent(
  'Olá! Tenho uma dúvida sobre o ContratoSeguro.'
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

export default function WhatsAppButton() {
  const [showPulse, setShowPulse] = useState(true);

  useEffect(() => {
    // Stop pulse animation after 3 pulses (~2.4s at 0.8s each)
    const timer = setTimeout(() => setShowPulse(false), 2400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 group">
      {/* Tooltip */}
      <span
        className="pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap
          rounded-lg bg-gray-900 px-3 py-1.5 text-sm text-white opacity-0 shadow-md
          transition-opacity duration-200 group-hover:opacity-100"
      >
        Dúvidas? Fale conosco
      </span>

      {/* Pulse ring */}
      {showPulse && (
        <span
          className="absolute inset-0 rounded-full bg-green-400 opacity-50 animate-whatsapp-pulse"
          aria-hidden="true"
        />
      )}

      {/* Button */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Fale conosco pelo WhatsApp"
        className="relative flex h-14 w-14 items-center justify-center rounded-full
          bg-[#25D366] shadow-lg transition-transform duration-200 hover:scale-110
          md:h-[60px] md:w-[60px]"
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7 md:h-8 md:w-8"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16 3C8.82 3 3 8.82 3 16c0 2.29.6 4.44 1.64 6.32L3 29l6.88-1.6A12.94 12.94 0 0016 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm0 23.5c-2.07 0-4.01-.57-5.68-1.56l-.4-.24-4.15.97.99-3.97-.27-.42A10.46 10.46 0 015.5 16C5.5 10.2 10.2 5.5 16 5.5S26.5 10.2 26.5 16 21.8 26.5 16 26.5zm7.26-7.83c-.4-.2-2.35-1.16-2.72-1.29-.36-.13-.63-.2-.89.2s-1.02 1.29-1.26 1.56c-.23.27-.46.3-.86.1-.4-.2-1.68-.62-3.2-1.97-1.18-1.06-1.98-2.36-2.21-2.76-.23-.4-.02-.61.18-.81.18-.18.4-.46.6-.7.2-.23.26-.4.4-.66.13-.27.06-.5-.04-.7-.1-.2-.89-2.15-1.22-2.94-.32-.78-.65-.67-.89-.68h-.76c-.27 0-.7.1-1.06.5-.36.4-1.39 1.36-1.39 3.32s1.42 3.85 1.62 4.12c.2.27 2.8 4.27 6.79 5.99.95.41 1.69.65 2.26.84.95.3 1.82.26 2.5.16.76-.12 2.35-.96 2.68-1.89.34-.93.34-1.72.23-1.89-.1-.17-.36-.27-.76-.46z"
            fill="white"
          />
        </svg>
      </a>

      <style jsx>{`
        @keyframes whatsapp-pulse {
          0% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
        .animate-whatsapp-pulse {
          animation: whatsapp-pulse 0.8s ease-out 3;
        }
      `}</style>
    </div>
  );
}
