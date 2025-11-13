import { useState } from "react";
import Search from "./Search";

const Sidebar = () => {
    const [searchKey, setSearchKey] = useState<string>("");
  return (
    <div className="app-sidebar">
      <Search setSearchKay={setSearchKey} serachKey={searchKey} />
    {/* <!--USER LIST-->  */}
    </div>
  );
};

export default Sidebar;
