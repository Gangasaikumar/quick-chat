import { useState } from "react";
import Search from "./Search";
import UsersList from "./UsersList";

const Sidebar = () => {
  const [searchKey, setSearchKey] = useState<string>("");
  return (
    <div className="app-sidebar">
      <Search setSearchKey={setSearchKey} searchKey={searchKey} />
      <UsersList searchKey={searchKey} />
    </div>
  );
};

export default Sidebar;
