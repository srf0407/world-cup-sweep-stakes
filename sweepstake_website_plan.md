# World Cup Sweepstake Website – Agent Build Plan

## Project Overview

Build and deploy a **free-hosted React app** for an 8-person World Cup sweepstake competition. The site must be live as quickly as possible. Use **Create React App + GitHub Pages** (free, ~5 min setup).

---

## Hosting & Deployment Instructions

### Stack
- **React** (Create React App)
- **GitHub Pages** via the `gh-pages` npm package


### Setup Steps
```bash
npx create-react-app worldcup-sweepstake
cd worldcup-sweepstake
npm install gh-pages
```

In `package.json`, add:
```json
"homepage": "https://<username>.github.io/worldcup-sweepstake",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}
```

Deploy:
```bash
git init && git remote add origin https://github.com/<username>/worldcup-sweepstake.git
npm run deploy
```

Site will be live at `https://<username>.github.io/worldcup-sweepstake` within ~2 minutes.

### React Architecture
- Single `App.jsx` with tab state controlling which view renders
- All data in a top-level `useReducer` + `localStorage` sync via `useEffect`
- No routing library needed — simple conditional rendering per tab
- Tailwind CSS via CDN or plain CSS modules for styling

---

## Competition Rules (Encode These Exactly)

### Participants & Buy-In
- **8 players** at **R500 each** = **R4,000 prize pool**
- Prize structure:
  - 1st place: **R2,700**
  - 2nd place: **R1,300**

### Team Allocation
Each player receives **6 teams**, one randomly drawn from each tier:

| Tier | Teams |
|------|-------|
| **Tier 1** | France, Spain, Argentina, England, Portugal, Brazil, Germany, Holland |
| **Tier 2** | Mexico, Uruguay, Norway, Belgium, USA, Morocco, Colombia, Croatia |
| **Tier 3** | Switzerland, Turkey, Japan, Iran, Ecuador, South Korea, Senegal, Austria |
| **Tier 4** | Algeria, Egypt, Sweden, Canada, Ivory Coast, Paraguay, Panama, Australia |
| **Tier 5** | Scotland, Czechia, South Africa, Iraq, Qatar, Bosnia, DR Congo, Saudi Arabia |
| **Tier 6** | New Zealand, Haiti, Ghana, Curacao, Cape Verde, Uzbekistan, Tunisia, Jordan |

> Each tier has exactly 8 teams — one per player. The draw assigns one team per tier to each player.

### Points System

| Event | Points |
|-------|--------|
| Match win | +4 |
| Draw | +2 |
| Draw (with penalties) | +2 for both teams, +1 bonus for penalty winner |
| Goal scored | +0.5 per goal |
| Goal conceded | −0.5 per goal |
| Advance to next round | +1 |
| Win by 4+ goals | +1 bonus |
| Lose by 4+ goals | Goals conceded for that match = 0 (nullifies the −0.5 penalty) |

---

## Website Structure & Pages

The site is a **single HTML page** with tab/section navigation (no page reloads).

### Sections

#### 1. Leaderboard (default view)
- Table showing: Rank | Player Name | Teams (6 flags/names) | Total Points
- Sort by total points descending
- Highlight 1st (gold) and 2nd (silver)
- Show R2,700 / R1,300 prize next to top 2

#### 2. Player Cards
- One card per player showing their 6 teams (one per tier)
- Each card shows each team's current points contribution
- Tier label next to each team name

#### 3. Match Results Entry (Admin)
- Protected by a simple PIN (hardcoded, e.g. `1234`)
- Form to enter a match result:
  - Team A (dropdown of all 48 teams)
  - Team B (dropdown)
  - Score A / Score B
  - Did match go to penalties? (checkbox)
  - If penalties: who won? (radio)
  - Which round? (Group Stage / Round of 16 / Quarter-Final / Semi-Final / Final)
  - Was this team's first match in this round? (for the +1 advance point — trigger once per round per team)
- On submit: auto-calculate all points per the rules above and update the leaderboard

#### 4. Team Stats
- Table: Team | Player Owner | Matches Played | Goals For | Goals Against | Points
- Sorted by points

#### 5. Draw Randomiser (one-time use)
- Button: "Run the Draw"
- Randomly assigns one team per tier to each of the 8 players
- Displays the result in a dramatic animated reveal (one tier at a time)
- "Lock Draw" button saves the result to `localStorage`
- Once locked, the button is hidden and the draw cannot be re-run

---

## Data Model (JavaScript, stored in `localStorage`)

```js
// Players
players: [
  { id: 1, name: "Player 1", teams: ["France", "Mexico", "Switzerland", "Algeria", "Scotland", "New Zealand"] },
  // ... 7 more
]

// Teams
teams: {
  "France": { tier: 1, owner: 1, matchesPlayed: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
  // ... all 48 teams
}

// Match log (for audit trail)
matches: [
  { id: 1, teamA: "France", teamB: "Argentina", scoreA: 2, scoreB: 1, penalties: false, round: "Quarter-Final", timestamp: "..." },
  // ...
]
```

All state lives in `localStorage` so the site persists across refreshes with no backend.

---

## Flag Emoji Reference (all 48 teams)

```
France 🇫🇷, Mexico 🇲🇽, Switzerland 🇨🇭, Algeria 🇩🇿, Scotland 🏴󠁧󠁢󠁳󠁣󠁴󠁿, New Zealand 🇳🇿,
Spain 🇪🇸, Uruguay 🇺🇾, Turkey 🇹🇷, Egypt 🇪🇬, Czechia 🇨🇿, Haiti 🇭🇹,
Argentina 🇦🇷, Norway 🇳🇴, Japan 🇯🇵, Sweden 🇸🇪, South Africa 🇿🇦, Curacao 🇨🇼,
England 🏴󠁧󠁢󠁥󠁮󠁧󠁿, Belgium 🇧🇪, Iran 🇮🇷, Canada 🇨🇦, Iraq 🇮🇶, Ghana 🇬🇭,
Portugal 🇵🇹, USA 🇺🇸, Ecuador 🇪🇨, Ivory Coast 🇨🇮, Qatar 🇶🇦, Cape Verde 🇨🇻,
Brazil 🇧🇷, Morocco 🇲🇦, South Korea 🇰🇷, Paraguay 🇵🇾, Uzbekistan 🇺🇿, Bosnia 🇧🇦,
Holland 🇳🇱, Croatia 🇭🇷, Austria 🇦🇹, Australia 🇦🇺, Tunisia 🇹🇳, Jordan 🇯🇴,
Germany 🇩🇪, Colombia 🇨🇴, Senegal 🇸🇳, Panama 🇵🇦, DR Congo 🇨🇩, Saudi Arabia 🇸🇦
```

---

## Points Calculation Logic (Pseudocode for Agent)

```
function processMatch(teamA, teamB, scoreA, scoreB, penalties, penaltyWinner, round):

  marginA = scoreA - scoreB
  marginB = scoreB - scoreA

  # Determine result
  if scoreA > scoreB:
    resultA = "win", resultB = "loss"
  elif scoreB > scoreA:
    resultA = "loss", resultB = "win"
  else:
    resultA = "draw", resultB = "draw"

  # Base points
  pointsA = 0, pointsB = 0

  if resultA == "win":  pointsA += 4
  if resultB == "win":  pointsB += 4
  if resultA == "draw": pointsA += 2; pointsB += 2

  # Penalty bonus
  if penalties:
    if penaltyWinner == teamA: pointsA += 1
    else: pointsB += 1

  # Goals scored
  pointsA += scoreA * 0.5
  pointsB += scoreB * 0.5

  # Goals conceded — apply loss-by-4 rule first
  if resultA == "loss" and marginB >= 4:
    # goals conceded by A = 0, no deduction
    pass
  else:
    pointsA -= scoreB * 0.5  # goals conceded by A

  if resultB == "loss" and marginA >= 4:
    pass
  else:
    pointsB -= scoreA * 0.5  # goals conceded by B

  # Big win bonus
  if marginA >= 4: pointsA += 1
  if marginB >= 4: pointsB += 1

  # Round advancement (+1 per team, triggered manually or auto on non-group matches)
  # Add +1 to both teams when they play a knockout round for the first time

  update teams[teamA].points += pointsA
  update teams[teamB].points += pointsB
  recalculate player totals
```

---

## Acceptance Criteria

- [ ] Draw randomiser works and locks correctly
- [ ] All 48 teams are assigned, one per tier per player
- [ ] Match entry form correctly calculates points for all edge cases (penalty win, 4-goal margin, etc.)
- [ ] Leaderboard ranks players by total points across all their 6 teams
- [ ] Fixtures tab shows all 72 group stage matches, filterable by group, with scores once entered
- [ ] localStorage persists all data across page refreshes
- [ ] Site is fully functional on mobile
- [ ] Deployed and accessible via GitHub Pages URL

---

## UI Design Requirements

- **Mobile-first**, responsive layout (works on phones)
- Dark football/soccer theme: dark green or dark navy background, white text, gold accents
- Flag emojis next to team names (use Unicode flag emojis — no image dependencies)
- Simple tab bar at the top for navigation between sections
- Clean table styling with alternating row colours
- Animate the leaderboard when points change (highlight updated rows briefly)
- No external CSS framework required — plain CSS modules or inline styles are fine

### React Component Structure
```
App
├── TabBar (Leaderboard | Players | Fixtures | Admin | Draw)
├── Leaderboard
│   └── PlayerRow (rank, name, 6 team badges, total points)
├── PlayerCards
│   └── PlayerCard (6 TeamBadge components, one per tier)
├── Fixtures
│   ├── GroupFilter (tabs for Group A–L)
│   └── MatchRow (date, teams, score if played, or kickoff time)
├── Admin (PIN-gated)
│   └── MatchEntryForm
└── DrawRandomiser
```

---

## World Cup 2026 Group Data

```json
{
  "groups": [
    { "name": "Group A", "teams": ["Mexico", "South Africa", "South Korea", "Czech Republic"] },
    { "name": "Group B", "teams": ["Canada", "Bosnia & Herzegovina", "Qatar", "Switzerland"] },
    { "name": "Group C", "teams": ["Brazil", "Morocco", "Haiti", "Scotland"] },
    { "name": "Group D", "teams": ["USA", "Paraguay", "Australia", "Turkey"] },
    { "name": "Group E", "teams": ["Germany", "Curaçao", "Ivory Coast", "Ecuador"] },
    { "name": "Group F", "teams": ["Netherlands", "Japan", "Sweden", "Tunisia"] },
    { "name": "Group G", "teams": ["Belgium", "Egypt", "Iran", "New Zealand"] },
    { "name": "Group H", "teams": ["Spain", "Cape Verde", "Saudi Arabia", "Uruguay"] },
    { "name": "Group I", "teams": ["France", "Senegal", "Iraq", "Norway"] },
    { "name": "Group J", "teams": ["Argentina", "Algeria", "Austria", "Jordan"] },
    { "name": "Group K", "teams": ["Portugal", "DR Congo", "Uzbekistan", "Colombia"] },
    { "name": "Group L", "teams": ["England", "Croatia", "Ghana", "Panama"] }
  ]
}
```

> **Name normalisation note:** The sweepstake tiers use some alternate spellings. Map these when looking up group membership:
> - "Holland" → "Netherlands"
> - "Czechia" → "Czech Republic"
> - "Curacao" → "Curaçao"
> - "Bosnia" → "Bosnia & Herzegovina"

---

## World Cup 2026 Full Match Schedule (Group Stage)

All times are UTC offsets as listed. Store as-is and convert to local time in the UI if desired.

```json
[
  {"round":"Matchday 1","date":"2026-06-11","time":"13:00 UTC-6","team1":"Mexico","team2":"South Africa","group":"Group A","ground":"Mexico City"},
  {"round":"Matchday 1","date":"2026-06-11","time":"20:00 UTC-6","team1":"South Korea","team2":"Czech Republic","group":"Group A","ground":"Guadalajara (Zapopan)"},
  {"round":"Matchday 8","date":"2026-06-18","time":"12:00 UTC-4","team1":"Czech Republic","team2":"South Africa","group":"Group A","ground":"Atlanta"},
  {"round":"Matchday 8","date":"2026-06-18","time":"19:00 UTC-6","team1":"Mexico","team2":"South Korea","group":"Group A","ground":"Guadalajara (Zapopan)"},
  {"round":"Matchday 14","date":"2026-06-24","time":"19:00 UTC-6","team1":"Czech Republic","team2":"Mexico","group":"Group A","ground":"Mexico City"},
  {"round":"Matchday 14","date":"2026-06-24","time":"19:00 UTC-6","team1":"South Africa","team2":"South Korea","group":"Group A","ground":"Monterrey (Guadalupe)"},
  {"round":"Matchday 2","date":"2026-06-12","time":"15:00 UTC-4","team1":"Canada","team2":"Bosnia & Herzegovina","group":"Group B","ground":"Toronto"},
  {"round":"Matchday 3","date":"2026-06-13","time":"12:00 UTC-7","team1":"Qatar","team2":"Switzerland","group":"Group B","ground":"San Francisco Bay Area (Santa Clara)"},
  {"round":"Matchday 8","date":"2026-06-18","time":"12:00 UTC-7","team1":"Switzerland","team2":"Bosnia & Herzegovina","group":"Group B","ground":"Los Angeles (Inglewood)"},
  {"round":"Matchday 8","date":"2026-06-18","time":"15:00 UTC-7","team1":"Canada","team2":"Qatar","group":"Group B","ground":"Vancouver"},
  {"round":"Matchday 14","date":"2026-06-24","time":"12:00 UTC-7","team1":"Switzerland","team2":"Canada","group":"Group B","ground":"Vancouver"},
  {"round":"Matchday 14","date":"2026-06-24","time":"12:00 UTC-7","team1":"Bosnia & Herzegovina","team2":"Qatar","group":"Group B","ground":"Seattle"},
  {"round":"Matchday 3","date":"2026-06-13","time":"18:00 UTC-4","team1":"Brazil","team2":"Morocco","group":"Group C","ground":"New York/New Jersey (East Rutherford)"},
  {"round":"Matchday 3","date":"2026-06-13","time":"21:00 UTC-4","team1":"Haiti","team2":"Scotland","group":"Group C","ground":"Boston (Foxborough)"},
  {"round":"Matchday 9","date":"2026-06-19","time":"18:00 UTC-4","team1":"Scotland","team2":"Morocco","group":"Group C","ground":"Boston (Foxborough)"},
  {"round":"Matchday 9","date":"2026-06-19","time":"20:30 UTC-4","team1":"Brazil","team2":"Haiti","group":"Group C","ground":"Philadelphia"},
  {"round":"Matchday 14","date":"2026-06-24","time":"18:00 UTC-4","team1":"Scotland","team2":"Brazil","group":"Group C","ground":"Miami (Miami Gardens)"},
  {"round":"Matchday 14","date":"2026-06-24","time":"18:00 UTC-4","team1":"Morocco","team2":"Haiti","group":"Group C","ground":"Atlanta"},
  {"round":"Matchday 2","date":"2026-06-12","time":"18:00 UTC-7","team1":"USA","team2":"Paraguay","group":"Group D","ground":"Los Angeles (Inglewood)"},
  {"round":"Matchday 3","date":"2026-06-13","time":"21:00 UTC-7","team1":"Australia","team2":"Turkey","group":"Group D","ground":"Vancouver"},
  {"round":"Matchday 9","date":"2026-06-19","time":"12:00 UTC-7","team1":"USA","team2":"Australia","group":"Group D","ground":"Seattle"},
  {"round":"Matchday 9","date":"2026-06-19","time":"20:00 UTC-7","team1":"Turkey","team2":"Paraguay","group":"Group D","ground":"San Francisco Bay Area (Santa Clara)"},
  {"round":"Matchday 15","date":"2026-06-25","time":"19:00 UTC-7","team1":"Turkey","team2":"USA","group":"Group D","ground":"Los Angeles (Inglewood)"},
  {"round":"Matchday 15","date":"2026-06-25","time":"19:00 UTC-7","team1":"Paraguay","team2":"Australia","group":"Group D","ground":"San Francisco Bay Area (Santa Clara)"},
  {"round":"Matchday 4","date":"2026-06-14","time":"12:00 UTC-5","team1":"Germany","team2":"Curaçao","group":"Group E","ground":"Houston"},
  {"round":"Matchday 4","date":"2026-06-14","time":"19:00 UTC-4","team1":"Ivory Coast","team2":"Ecuador","group":"Group E","ground":"Philadelphia"},
  {"round":"Matchday 10","date":"2026-06-20","time":"16:00 UTC-4","team1":"Germany","team2":"Ivory Coast","group":"Group E","ground":"Toronto"},
  {"round":"Matchday 10","date":"2026-06-20","time":"19:00 UTC-5","team1":"Ecuador","team2":"Curaçao","group":"Group E","ground":"Kansas City"},
  {"round":"Matchday 15","date":"2026-06-25","time":"16:00 UTC-4","team1":"Curaçao","team2":"Ivory Coast","group":"Group E","ground":"Philadelphia"},
  {"round":"Matchday 15","date":"2026-06-25","time":"16:00 UTC-4","team1":"Ecuador","team2":"Germany","group":"Group E","ground":"New York/New Jersey (East Rutherford)"},
  {"round":"Matchday 4","date":"2026-06-14","time":"15:00 UTC-5","team1":"Netherlands","team2":"Japan","group":"Group F","ground":"Dallas (Arlington)"},
  {"round":"Matchday 4","date":"2026-06-14","time":"20:00 UTC-6","team1":"Sweden","team2":"Tunisia","group":"Group F","ground":"Monterrey (Guadalupe)"},
  {"round":"Matchday 10","date":"2026-06-20","time":"12:00 UTC-5","team1":"Netherlands","team2":"Sweden","group":"Group F","ground":"Houston"},
  {"round":"Matchday 10","date":"2026-06-20","time":"22:00 UTC-6","team1":"Tunisia","team2":"Japan","group":"Group F","ground":"Monterrey (Guadalupe)"},
  {"round":"Matchday 15","date":"2026-06-25","time":"18:00 UTC-5","team1":"Japan","team2":"Sweden","group":"Group F","ground":"Dallas (Arlington)"},
  {"round":"Matchday 15","date":"2026-06-25","time":"18:00 UTC-5","team1":"Tunisia","team2":"Netherlands","group":"Group F","ground":"Kansas City"},
  {"round":"Matchday 5","date":"2026-06-15","time":"12:00 UTC-7","team1":"Belgium","team2":"Egypt","group":"Group G","ground":"Seattle"},
  {"round":"Matchday 5","date":"2026-06-15","time":"18:00 UTC-7","team1":"Iran","team2":"New Zealand","group":"Group G","ground":"Los Angeles (Inglewood)"},
  {"round":"Matchday 11","date":"2026-06-21","time":"12:00 UTC-7","team1":"Belgium","team2":"Iran","group":"Group G","ground":"Los Angeles (Inglewood)"},
  {"round":"Matchday 11","date":"2026-06-21","time":"18:00 UTC-7","team1":"New Zealand","team2":"Egypt","group":"Group G","ground":"Vancouver"},
  {"round":"Matchday 16","date":"2026-06-26","time":"20:00 UTC-7","team1":"Egypt","team2":"Iran","group":"Group G","ground":"Seattle"},
  {"round":"Matchday 16","date":"2026-06-26","time":"20:00 UTC-7","team1":"New Zealand","team2":"Belgium","group":"Group G","ground":"Vancouver"},
  {"round":"Matchday 5","date":"2026-06-15","time":"12:00 UTC-4","team1":"Spain","team2":"Cape Verde","group":"Group H","ground":"Atlanta"},
  {"round":"Matchday 5","date":"2026-06-15","time":"18:00 UTC-4","team1":"Saudi Arabia","team2":"Uruguay","group":"Group H","ground":"Miami (Miami Gardens)"},
  {"round":"Matchday 11","date":"2026-06-21","time":"12:00 UTC-4","team1":"Spain","team2":"Saudi Arabia","group":"Group H","ground":"Atlanta"},
  {"round":"Matchday 11","date":"2026-06-21","time":"18:00 UTC-4","team1":"Uruguay","team2":"Cape Verde","group":"Group H","ground":"Miami (Miami Gardens)"},
  {"round":"Matchday 16","date":"2026-06-26","time":"19:00 UTC-5","team1":"Cape Verde","team2":"Saudi Arabia","group":"Group H","ground":"Houston"},
  {"round":"Matchday 16","date":"2026-06-26","time":"18:00 UTC-6","team1":"Uruguay","team2":"Spain","group":"Group H","ground":"Guadalajara (Zapopan)"},
  {"round":"Matchday 6","date":"2026-06-16","time":"15:00 UTC-4","team1":"France","team2":"Senegal","group":"Group I","ground":"New York/New Jersey (East Rutherford)"},
  {"round":"Matchday 6","date":"2026-06-16","time":"18:00 UTC-4","team1":"Iraq","team2":"Norway","group":"Group I","ground":"Boston (Foxborough)"},
  {"round":"Matchday 12","date":"2026-06-22","time":"17:00 UTC-4","team1":"France","team2":"Iraq","group":"Group I","ground":"Philadelphia"},
  {"round":"Matchday 12","date":"2026-06-22","time":"20:00 UTC-4","team1":"Norway","team2":"Senegal","group":"Group I","ground":"New York/New Jersey (East Rutherford)"},
  {"round":"Matchday 16","date":"2026-06-26","time":"15:00 UTC-4","team1":"Norway","team2":"France","group":"Group I","ground":"Boston (Foxborough)"},
  {"round":"Matchday 16","date":"2026-06-26","time":"15:00 UTC-4","team1":"Senegal","team2":"Iraq","group":"Group I","ground":"Toronto"},
  {"round":"Matchday 6","date":"2026-06-16","time":"20:00 UTC-5","team1":"Argentina","team2":"Algeria","group":"Group J","ground":"Kansas City"},
  {"round":"Matchday 6","date":"2026-06-16","time":"21:00 UTC-7","team1":"Austria","team2":"Jordan","group":"Group J","ground":"San Francisco Bay Area (Santa Clara)"},
  {"round":"Matchday 12","date":"2026-06-22","time":"12:00 UTC-5","team1":"Argentina","team2":"Austria","group":"Group J","ground":"Dallas (Arlington)"},
  {"round":"Matchday 12","date":"2026-06-22","time":"20:00 UTC-7","team1":"Jordan","team2":"Algeria","group":"Group J","ground":"San Francisco Bay Area (Santa Clara)"},
  {"round":"Matchday 17","date":"2026-06-27","time":"21:00 UTC-5","team1":"Algeria","team2":"Austria","group":"Group J","ground":"Kansas City"},
  {"round":"Matchday 17","date":"2026-06-27","time":"21:00 UTC-5","team1":"Jordan","team2":"Argentina","group":"Group J","ground":"Dallas (Arlington)"},
  {"round":"Matchday 7","date":"2026-06-17","time":"12:00 UTC-5","team1":"Portugal","team2":"DR Congo","group":"Group K","ground":"Houston"},
  {"round":"Matchday 7","date":"2026-06-17","time":"20:00 UTC-6","team1":"Uzbekistan","team2":"Colombia","group":"Group K","ground":"Mexico City"},
  {"round":"Matchday 13","date":"2026-06-23","time":"12:00 UTC-5","team1":"Portugal","team2":"Uzbekistan","group":"Group K","ground":"Houston"},
  {"round":"Matchday 13","date":"2026-06-23","time":"20:00 UTC-6","team1":"Colombia","team2":"DR Congo","group":"Group K","ground":"Guadalajara (Zapopan)"},
  {"round":"Matchday 17","date":"2026-06-27","time":"19:30 UTC-4","team1":"Colombia","team2":"Portugal","group":"Group K","ground":"Miami (Miami Gardens)"},
  {"round":"Matchday 17","date":"2026-06-27","time":"19:30 UTC-4","team1":"DR Congo","team2":"Uzbekistan","group":"Group K","ground":"Atlanta"},
  {"round":"Matchday 7","date":"2026-06-17","time":"15:00 UTC-5","team1":"England","team2":"Croatia","group":"Group L","ground":"Dallas (Arlington)"},
  {"round":"Matchday 7","date":"2026-06-17","time":"19:00 UTC-4","team1":"Ghana","team2":"Panama","group":"Group L","ground":"Toronto"},
  {"round":"Matchday 13","date":"2026-06-23","time":"16:00 UTC-4","team1":"England","team2":"Ghana","group":"Group L","ground":"Boston (Foxborough)"},
  {"round":"Matchday 13","date":"2026-06-23","time":"19:00 UTC-4","team1":"Panama","team2":"Croatia","group":"Group L","ground":"Toronto"},
  {"round":"Matchday 17","date":"2026-06-27","time":"17:00 UTC-4","team1":"Panama","team2":"England","group":"Group L","ground":"New York/New Jersey (East Rutherford)"},
  {"round":"Matchday 17","date":"2026-06-27","time":"17:00 UTC-4","team1":"Croatia","team2":"Ghana","group":"Group L","ground":"Philadelphia"}
]
```

---

## Fixtures Tab Behaviour

- Show all group stage matches by default, filterable by group (A–L)
- Each match row shows: date, kickoff time, team flags + names, venue
- Once a result is entered via Admin, show the score inline on the fixture row
- Matches are pre-loaded from the static data above — no API needed
- Knockout fixtures (Round of 16 onward) are added manually via the Admin tab as they are determined

---

## Quick-Start Commands

```bash
npx create-react-app worldcup-sweepstake
cd worldcup-sweepstake
npm install gh-pages
# Add homepage + deploy scripts to package.json (see above)
npm run deploy
```
