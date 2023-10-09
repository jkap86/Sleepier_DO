import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Homepage from './components/Home/homepage';
import Main from './components/Home/main';
import MainROF from './components/ROF/mainROF';
import PickTracker from './components/Leagues/picktracker';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Homepage />} />
          <Route path='/:username' element={<Main />} />
          <Route path='/picktracker/:league_id' element={<PickTracker />} />
          <Route path='/pools/rof' element={<MainROF pool={'rof'} title={'Ring of Fire'} startSeason={2021} />} />
          <Route path='/pools/osr' element={<MainROF pool={'osr'} title={'Save the Sharks'} startSeason={2020} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
