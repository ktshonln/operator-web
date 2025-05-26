import { useRef } from "react";
import { AiOutlineSearch } from "react-icons/ai";
interface Props {
  label: string;
  onSearch: (searchText: string) => void;
  alt?: boolean;
}
const Search = ({ onSearch, label, alt }: Props) => {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className={`flex items-center space-x-3  border-1 border-neutral-200 dark:border-neutral-800  text-sm dark:text-white ${alt ? 'rounded-full p-1 w-full' :'rounded-xl p-3 max-w-2xl'}`}>
      <AiOutlineSearch size={20} />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (ref.current) onSearch(ref.current.value);
        }}
        className="grow"
      >
        <input
          ref={ref}
          type="text"
          placeholder={label}
          className="placeholder:text-brand2 outline-none w-full"
        />
      </form>
    </div>
  );
};

export default Search;
