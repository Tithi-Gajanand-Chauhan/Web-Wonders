import { BrowserRouter, Routes, Route } from "react-router-dom";

import CreateGroup from "./pages/CreateGroup";
import JoinGroup from "./pages/JoinGroup";
import GroupLobby from "./pages/GroupLobby";
import Preferences from "./pages/Preferences";
import Recommendation from "./pages/Recommendation";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/create-group" element={<CreateGroup />} />
        <Route path="/join-group" element={<JoinGroup />} />
        <Route path="/lobby" element={<GroupLobby />} />
        <Route path="/preferences" element={<Preferences />} />
        <Route path="/recommendation" element={<Recommendation />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;