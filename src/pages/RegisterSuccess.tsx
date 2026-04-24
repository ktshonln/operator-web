import { BsChevronCompactRight } from "react-icons/bs";
import { LuPartyPopper } from "react-icons/lu";
import { Link, useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";

const RegisterSuccess = () => {
  const [searchParams] = useSearchParams();
  const orgName = searchParams.get("org_name") || "Your organization";
  const orgType = searchParams.get("org_type") || "";

  // Determine next steps based on org type
  const isCoopMember = orgType === "coop_member";

  return (
    <div className="relative bg-[#0A4370] font-heebo min-h-screen">
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
            <h1 className="w-fit mx-auto font-bold text-2xl -mt-5 mb-3 text-brand">
              Application Submitted!
            </h1>

            <div className="text-sm text-center">
              <div className="animate-bounce rotate-45">
                <LuPartyPopper
                  size={60}
                  className="text-[#32CD32] stroke-1 w-fit mx-auto mb-5 -rotate-45"
                />
              </div>
              
              <p className="text-lg font-semibold text-neutral-700 mb-4">{orgName}</p>
              
              <p className="mb-2">Your application has been successfully submitted and verified.</p>
              
              <div className="bg-brand/15 border border-brand rounded-full p-1 pr-5 pl-5 w-fit text-sm font-semibold flex items-center justify-center justify-self-center mt-8 mb-6">
                <p className="text-brand">What&apos;s Next</p>
              </div>
              
              {isCoopMember ? (
                // Coop member flow: cooperative pre-approval first, then Katisha review
                <>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-7 mb-10">
                    <div>
                      <p className="font-semibold text-brand">Step 1:</p>
                      <p>Cooperative Pre-Approval</p>
                    </div>
                    <BsChevronCompactRight size={42} className="text-neutral-400" />
                    <div>
                      <p className="font-semibold text-brand">Step 2:</p>
                      <p>Katisha Review</p>
                    </div>
                    <BsChevronCompactRight size={42} className="text-neutral-400" />
                    <div>
                      <p className="font-semibold text-brand">Step 3:</p>
                      <p>Confirmation Email</p>
                    </div>
                  </div>
                  <p className="text-neutral-600">
                    Your parent cooperative will review your application first. Once approved by them, 
                    Katisha admins will conduct a final review.
                  </p>
                </>
              ) : (
                // Company/Cooperative flow: straight to Katisha review
                <>
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
                  <p className="text-neutral-600">
                    Katisha admins will review your application and verify your documents.
                  </p>
                </>
              )}
              
              <p className="mt-6 text-neutral-600">
                A confirmation email will reach you no later than 5 business days from now.
              </p>
              
              <p className="text-base font-bold text-brand mt-10">
                We can't wait to have you onboard!
              </p>
              
              <Link to="/login">
                <button className="mt-8 bg-brand text-white py-3 px-8 rounded-lg font-medium hover:brightness-110 active:scale-95 transition-all">
                  Done
                </button>
              </Link>
            </div>
            
            <p className="text-xs w-fit pb-3 mt-10 mx-auto text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-brand cursor-pointer hover:underline">
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
