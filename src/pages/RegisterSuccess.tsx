import { BsChevronCompactRight } from "react-icons/bs";
import { LuPartyPopper } from "react-icons/lu";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";

const RegisterSuccess = () => {
  return (
    <div className="relative bg-[#0A4370] font-heebo">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="aspect-[614/1024] absolute lg:w-1/2 bottom-0 "
        viewBox="0 0 614 1024"
        fill="none"
      >
        <path d="M0 0H614L436.5 1024H0V0Z" fill="#041D33" />
      </svg>
      <div className="relative p-4 pt-8 sm:p-10">
        <div className="bg-white relative drop-shadow-lg drop-shadow-black/25 rounded-2xl w-full max-w-2xl mx-auto">
          <div className="p-8 sm:p-12">
            <img
              src="/logoOne.svg"
              className="w-20 ml-5 mt-2 "
              alt="Katisha-logo"
            />
            <h1 className="w-fit mx-auto font-bold text-2xl -mt-5 mb-5 text-[#0A4370]">
              Thank you for registering!
            </h1>

            <div className="text-sm text-center">
              <div className="animate-bounce rotate-45">
                <LuPartyPopper
                  size={60}
                  className="text-[#32CD32] stroke-1 w-fit mx-auto mb-5 -rotate-45"
                />
              </div>
              <p>Meanwhile,</p>
              <p>
                You can start organizing how you will manage your branches and
                agents while you wait!
              </p>
              <div className="bg-brand/15 border border-brand rounded-full p-1 pr-5 pl-5 w-fit text-sm font-semibold flex  items-center justify-center justify-self-center mt-10">
                <p className="text-brand">What&apos;s Next</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-7 mb-10">
                <div>
                  <p className="font-semibold text-brand">Step 1:</p>
                  <p>Information Review</p>
                </div>
                <BsChevronCompactRight size={42} className="text-neutral-400" />
                <div>
                  <p className="font-semibold text-brand">Step 2:</p>
                  <p>Information Verification</p>
                </div>
                <BsChevronCompactRight size={42} className="text-neutral-400" />
                <div>
                  <p className="font-semibold text-brand">Step 3:</p>
                  <p>Confirmation Email</p>
                </div>
              </div>
              <p>
                A confirmation email will reach you no later that 5 business
                days from now.
              </p>
              <p className="text-base font-bold text-[#0A4370] mt-16">
                We can’t wait to have you onboard!
              </p>
            </div>
            <p className="text-xs w-fit pb-3 mt-10 mx-auto sm:ml-12">
              Already have an account?
              <Link to={"/"} className="text-brand cursor-pointer">
                {" "}
                Login
              </Link>
            </p>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default RegisterSuccess;
