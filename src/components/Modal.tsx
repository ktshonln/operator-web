import { ReactElement } from "react";

interface Props {
  children?: ReactElement;
  form?:boolean;
  title: string;
  message?:boolean;
  actionOne: string;
  actionTwo: string;
  effectOne: () => void;
  effectTwo: () => void;
}
const Modal = ({
    children,
    form,
  title,
  message,
  actionOne,
  actionTwo,
  effectOne,
  effectTwo,
}: Props) => {
    const handleSubmit = (e:React.FormEvent)=>{
        e.preventDefault();
        effectOne()
    }
  return (
    <div className="fixed inset-0 bg-black/50 flex  items-center justify-center">
      <div className="bg-white sm:min-w-80 lg:min-w-sm p-5 rounded-lg">
        {message ?
        <p className=" w-fit mx-auto mb-3 mt-6 text-brand2">{title}</p>:
        <p className="font-bold text-lg w-fit mx-auto mb-3">{title}</p>
        
      }
        {form? <form className="text-sm" onSubmit={(e)=>handleSubmit(e)}>
        {children}

        <div className="text-sm font-medium flex items-center gap-14 mx-3">
          <button
          type="submit"
            className="bg-brand p-1.5 w-full text-white mt-10 rounded-xs cursor-pointer active:scale-95"
            >
            {actionOne}
          </button>
          <button onClick={effectTwo} className="bg-neutral-300 p-1.5 w-full mt-10 rounded-xs cursor-pointer active:scale-95">
            {actionTwo}
          </button>
        </div>
        </form>: 
        <div className="text-sm">
            {children}

            <div className="text-sm font-medium flex items-center gap-14 mx-60">
          <button
          type="submit"
            className="bg-brand p-1.5 w-full text-white mt-10 rounded-xs cursor-pointer active:scale-95"
            >
            {actionOne}
          </button>
          <button onClick={effectTwo} className="bg-neutral-300 p-1.5 w-full mt-10 rounded-xs cursor-pointer active:scale-95">
            {actionTwo}
          </button>
        </div>

        </div>
        }
      </div>
    </div>
  );
};

export default Modal;
