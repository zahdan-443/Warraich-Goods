import React from 'react';
import { PublicImage } from '../assets/dashboardIcons';

interface AlHadiLogoProps {
  className?: string;
  showText?: boolean;
}

export const AlHadiLogo: React.FC<AlHadiLogoProps> = ({ className = "w-32 h-32" }) => {
  return (
    <div className={`relative rounded-full overflow-hidden shadow-md border-2 border-[#c59b27] bg-white flex items-center justify-center shrink-0 ${className}`}>
      <PublicImage
        fileName="app-icon.png"
        alt="Driver Dost Transport Official Emblem"
        width={128}
        height={128}
        className="w-full h-full object-contain p-0.5"
        fallbackIcon={
          <PublicImage
            fileName="logo.png"
            alt="Warraich Goods Transport Company Logo"
            width={128}
            height={128}
            className="w-full h-full object-contain p-0.5"
            fallbackIcon={
              <PublicImage
                fileName="icon-192.png"
                alt="Driver Dost Transport Logistics"
                width={128}
                height={128}
                className="w-full h-full object-contain p-0.5"
              />
            }
          />
        }
      />
    </div>
  );
};


