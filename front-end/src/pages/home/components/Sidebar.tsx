import { useState } from "react";
import Search from "./Search";
import UsersList from "./UsersList";

const Sidebar = () => {
  const [searchKey, setSearchKey] = useState<string>("");
  const clearSearchKey = () => setSearchKey("");
  return (
    <div className="app-sidebar">
      <Search setSearchKey={setSearchKey} searchKey={searchKey} />
      <UsersList searchKey={searchKey} clearSearchKey={clearSearchKey} />
    </div>
  );
};

export default Sidebar;
