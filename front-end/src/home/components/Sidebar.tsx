import { useState } from "react";
import Search from "./Search";

const Sidebar = () => {
    const [searchKey, setSearchKey] = useState<string>("");
  return (
    <div className="app-sidebar">
      <Search setSearchKey={setSearchKey} searchKey={searchKey} />
    {/* <!--USER LIST-->  */}
    </div>
  );
};

export default Sidebar;
