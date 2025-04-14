import { Link } from "react-router-dom";
import Footer from "../components/Footer";

const RegisterPage = () => {
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
      <div className="p-2 pt-10 sm:p-10 sm:pr-32 sm:pl-32">
        <div className="bg-white relative drop-shadow-lg drop-shadow-black/25 rounded-2xl w-full max-w-screen flex justify-between">
          <div className="w-full">
            <img
              src="/logoOne.svg"
              className="w-20 ml-5 mt-2 "
              alt="Katisha-logo"
            />
            <h1 className="w-fit mx-auto font-bold text-2xl -mt-5 mb-5">
              Create your account
            </h1>

            <form className="text-xs justify-self-center w-full px-32">
              <div className="flex gap-48 ">
                <div className="w-full">
                  <h2 className="font-bold text-base mb-8">Company information</h2>
                  <label
                    htmlFor="companyName"
                    className="text-[#6A717D] block mb-0.5 text-xs"
                  >
                    Name
                  </label>
                  <div className="ring ring-gray-200 mb-5 p-2 rounded-xs bg-white">
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      className=" outline-none w-full"
                    />
                  </div>
                  <label
                    htmlFor="regNo"
                    className="text-[#6A717D] block mb-0.5 text-xs"
                  >
                    Registration Number
                  </label>
                  <div className="ring ring-gray-200 mb-5 p-2 rounded-xs bg-white">
                    <input
                      type="text"
                      id="regNo"
                      name="regNo"
                      className=" outline-none w-full"
                    />
                  </div>
                  <label
                    htmlFor="address"
                    className="text-[#6A717D] block mb-0.5 text-xs"
                  >
                    Address
                  </label>
                  <div className="ring ring-gray-200 mb-5 p-2 rounded-xs bg-white">
                    <input
                      type="text"
                      id="address"
                      name="address"
                      className=" outline-none w-full"
                    />
                  </div>
                  <label
                    htmlFor="contact"
                    className="text-[#6A717D] block mb-0.5 text-xs"
                  >
                    Contact information
                  </label>
                  <div className="ring ring-gray-200 mb-5 p-2 rounded-xs bg-white">
                    <input
                      type="text"
                      id="contact"
                      name="contact"
                      className="outline-none w-full"
                    />
                  </div>
                </div>
                <div className="w-full">
                  <h2 className="font-bold mb-8">Admin information</h2>
                  <label
                    htmlFor="firstName"
                    className="text-[#6A717D] block mb-0.5 text-xs"
                  >
                    First Name
                  </label>
                  <div className="ring ring-gray-200 mb-5 p-2 rounded-xs bg-white">
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className=" outline-none w-full"
                    />
                  </div>
                  <label
                    htmlFor="lastName"
                    className="text-[#6A717D] block mb-0.5 text-xs"
                  >
                    Last Name
                  </label>
                  <div className="ring ring-gray-200 mb-5 p-2 rounded-xs bg-white">
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="outline-none w-full"
                    />
                  </div>
                  <label
                    htmlFor="email"
                    className="text-[#6A717D] block mb-0.5 text-xs"
                  >
                    Email
                  </label>
                  <div className="ring ring-gray-200 mb-5 p-2 rounded-xs bg-white">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="outline-none w-full"
                    />
                  </div>
                  <label
                    htmlFor="password"
                    className="text-[#6A717D] block mb-0.5 text-xs"
                  >
                    Password
                  </label>
                  <div className="ring ring-gray-200 mb-5 p-2 rounded-xs bg-white">
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className="outline-none w-full"
                    />
                  </div>
                </div>
              </div>
              <button className="bg-[#0A4370] p-2 block pl-20 pr-20 w-fit mx-auto text-white mt-10 rounded-sm">
                REGISTER
              </button>
            </form>
            <p className="text-xs w-fit pb-3 mt-10 mx-auto sm:ml-12">
              Already have an account?
              <Link to={'/'} className="text-brand cursor-pointer"> Login</Link>
            </p>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default RegisterPage;
