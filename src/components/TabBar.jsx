const TABS = [
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'players', label: 'Players' },
  { id: 'fixtures', label: 'Fixtures' },
  { id: 'rules', label: 'Rules' },
  { id: 'teams', label: 'Team Stats' },
  { id: 'admin', label: 'Admin' },
  { id: 'draw', label: 'Draw' },
];

export default function TabBar({ activeTab, onTabChange }) {
  return (
    <nav className="tab-bar" role="tablist">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`tab-bar__btn ${activeTab === tab.id ? 'tab-bar__btn--active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
