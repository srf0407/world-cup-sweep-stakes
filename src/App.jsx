import { useReducer, useEffect, useState } from 'react';
import { reducer, getInitialState } from './utils/reducer';
import { saveState } from './utils/storage';
import TabBar from './components/TabBar';
import Leaderboard from './components/Leaderboard';
import PlayerCards from './components/PlayerCards';
import Fixtures from './components/Fixtures';
import TeamStats from './components/TeamStats';
import Admin from './components/Admin';
import DrawRandomiser from './components/DrawRandomiser';
import Rules from './components/Rules';
import './App.css';

export default function App() {
  const [state, dispatch] = useReducer(reducer, null, getInitialState);
  const [activeTab, setActiveTab] = useState('leaderboard');

  useEffect(() => {
    saveState(state);
  }, [state]);

  const renderTab = () => {
    switch (activeTab) {
      case 'leaderboard':
        return <Leaderboard state={state} dispatch={dispatch} />;
      case 'players':
        return <PlayerCards state={state} />;
      case 'fixtures':
        return <Fixtures state={state} />;
      case 'rules':
        return <Rules />;
      case 'teams':
        return <TeamStats state={state} />;
      case 'admin':
        return <Admin state={state} dispatch={dispatch} />;
      case 'draw':
        return <DrawRandomiser state={state} dispatch={dispatch} />;
      default:
        return <Leaderboard state={state} dispatch={dispatch} />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__brand">
          <span className="app-header__icon">⚽</span>
          <div>
            <h1>World Cup Sweepstake</h1>
            <p>2026 · 8 Players · R4,000 Pool</p>
          </div>
        </div>
      </header>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="app-main">{renderTab()}</main>

      <footer className="app-footer">
        <p>1st: R2,700 · 2nd: R1,300 · Win +4 · Draw +2 · Goal +0.5</p>
      </footer>
    </div>
  );
}
