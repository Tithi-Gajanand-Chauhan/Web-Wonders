import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import Browse from './pages/Browse';
import MovieDetail from './pages/MovieDetail';
import './App.css';
import CreateGroup from './pages/CreateGroup';
import JoinGroup from './pages/JoinGroup';
import GroupLobby from './pages/GroupLobby';
import Preferences from './pages/Preferences';
import Recommendation from './pages/Recommendation';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/create-group" element={<CreateGroup />} />
        <Route path="/join-group" element={<JoinGroup />} />
        <Route path="/lobby" element={<GroupLobby />} />
        <Route path="/preferences" element={<Preferences />} />
        <Route path="/recommendation" element={<Recommendation />} />
      </Routes>
    </>
  );
}

export default App;