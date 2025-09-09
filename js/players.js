// Players page functions

const PLAYERS_STORAGE_KEY = 'players';

// The list of players - loaded from local storage
let playerList = null;

function loadPlayers() {
    try {
        const raw = localStorage.getItem(PLAYERS_STORAGE_KEY);
        if (!raw) return;

        const parsed = JSON.parse(raw);

        // Accept either { players: [...] } or a bare array [...]
        if (Array.isArray(parsed)) {
            playerList = parsed;
        }
        else if (parsed.players && Array.isArray(parsed.players)) {
            playerList = parsed.players;
        }
        else {
            playerList = [];
        }
    } catch (e) {
        console.warn('Failed to load players', e);
        playerList = [];
    }
}

  function savePlayers() {
    localStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(playerList));
  }

  export function getPlayers() {
    if (!playerList) loadPlayers();
    return playerList;
  }

  export function getPlayer(name) {
    const players = getPlayers();
    const p = players.find(x => x.name  === name);
    return p;
  }
    
  export function hasIncompletePlayers() {
    const players = getPlayers();
    return players.some(p => !p.name || !p.gender || !p.hi && p.hi !== 0);
  }

  export function renderPlayersPage() {

  }
