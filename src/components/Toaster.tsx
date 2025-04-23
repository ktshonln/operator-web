import { gsap } from "gsap";
import React, { useEffect, useRef } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { BsInfo } from "react-icons/bs";
import { IoCheckmarkSharp, IoClose, IoWarningOutline } from "react-icons/io5";
import { useToastStore } from "../stores/toastStore";
import { camelCaseToTitle } from "../utils/helpers";



const Toaster = () => {
  const { message, type, show, hideToast } = useToastStore();
  const toastRef = useRef(null);

  useEffect(() => {
    if (show && toastRef.current) {
         // Kill existing animations to avoid conflicts
    gsap.killTweensOf(toastRef.current);

      // Start hidden above the screen
      gsap.fromTo(
        toastRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
      );

      // After delay, animate back up and call hideToast
      const timeout = setTimeout(() => {
        gsap.to(toastRef.current, {
          y: -100,
          opacity: 0,
          duration: 0.5,
          ease: "power2.in",
          onComplete: hideToast,
        });
      }, 3000);
      return () => {
        clearTimeout(timeout);
        gsap.killTweensOf(toastRef.current); // Cleanup animations
    }
    }
  }, [show, hideToast, message]);

  // Only render if show is true
  if (!show) return null;
  const color = {
    error: { main: 'text-red-500', bg: 'bg-[#ffe6e6]', bgAlt:'bg-red-500' , border: 'border-red-500', Icon: IoClose },
    warning: { main: 'text-[#FFA500]', bg: 'bg-[#fff6e6]', bgAlt:'bg-[#FFA500]', border: 'border-[#FFA500]', Icon: IoWarningOutline },
    success: { main: 'text-[#32CD32]', bg: 'bg-[#ebfaeb]', bgAlt:'bg-[#32CD32]' , border: 'border-[#32CD32]', Icon: IoCheckmarkSharp },
    info: { main: 'text-[#1E90FF]', bg: 'bg-[#E9F4FF]', bgAlt:'bg-[#1E90FF]', border: 'border-[#1E90FF]', Icon: BsInfo },
  };
  return (
    <div
      ref={toastRef}
      className={`text-xs font-heebo ${color[type].main} ${color[type].bg} p-2 border ${color[type].border} rounded-lg fixed top-2 left-1/2 -translate-x-1/2 flex items-center space-x-3 max-w-[90vw] w-fit break-words whitespace-pre-line z-50`}
    >
      <div className={`${color[type].bgAlt} rounded-md p-1.5`}>
        <div className="rounded-full p-1 bg-white">
          {React.createElement(color[type].Icon)}
        </div>
      </div>
      <div className="">
        <p className="font-bold">{camelCaseToTitle(type)}</p>
        <p className="break-words text-wrap max-w-[80vw]">{message}</p>
      </div>
      <hr className="w-5 size-2 rotate-90 flex-1 grow" />
      <div onClick={hideToast} className="flex items-center cursor-pointer">
        <AiOutlineClose size={15} />
      </div>
    </div>
  );
};

export default Toaster;
