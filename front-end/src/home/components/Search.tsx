interface SearchProps {
  setSearchKey: (value: string) => void;
  searchKey: string;
}
const Search = (props: SearchProps) => {
  return (
    <div className="user-search-area">
      <input
        type="text"
        className="user-search-text"
        value={props.searchKey}
        onChange={(e) => {
          props.setSearchKey(e.target.value);
        }}
      />
      <i className="fa fa-search user-search-btn" aria-hidden="true"></i>
    </div>
  );
};

export default Search;
