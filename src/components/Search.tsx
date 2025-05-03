import { useRef } from "react";
import { AiOutlineSearch } from "react-icons/ai";
interface Props {
    onSearch: (searchText: string) => void
}
const Search = ({onSearch}: Props) => {
  const ref = useRef<HTMLInputElement>(null);

    return (
        <div className="flex items-center space-x-3 p-3 border-1 border-neutral-200 rounded-xl text-sm max-w-2xl">
                <AiOutlineSearch size={20} />
                <form onSubmit={(event)=>{
                    event.preventDefault()
                    if(ref.current) onSearch(ref.current.value)
                }} className="grow">
                  <input
                  ref={ref}
                    type="text"
                    placeholder="Enter  destination..."
                    className="placeholder:text-brand2 outline-none w-full"
                  />
                </form>
              </div>
    )
}

export default Search
