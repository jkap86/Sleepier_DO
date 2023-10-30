import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Homepage from './components/Homepage/homepage';
import Index from './components/View/index';
import Main from './componentsX/Home/main';
import MainROF from './componentsX/ROF/mainROF';
import PickTracker from './componentsX/Leagues/picktracker';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Homepage />} />
          <Route path='/:username' element={<Index />} />
          <Route path='/picktracker/:league_id' element={<PickTracker />} />
          <Route path='/pools/rof' element={<MainROF pool={'rof'} title={'Ring of Fire'} startSeason={2021} />} />
          <Route path='/pools/osr' element={<MainROF pool={'osr'} title={'Save the Sharks'} startSeason={2020} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
