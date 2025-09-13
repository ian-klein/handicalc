// Players page functions
'use strict';

const PLAYERS_STORAGE_KEY = 'players';

// DOM Elements
const playersTbody = document.getElementById('players-tbody');
const addIcon = document.getElementById('players-add');

//Player structure
class Player{
    constructor() {
        this.name = '';
        this.gender = 'M';
        this.hi = '';
    }
}

// The list of players - loaded from local storage
let playerList = null;

function loadPlayers() {
    try {
        const raw = localStorage.getItem(PLAYERS_STORAGE_KEY);
        if (!raw) {
            playerList = [];
            return;
        }

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

export function savePlayers() {
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

export function wirePlayersEvents() {
    addIcon?.addEventListener('click', onAddIcon_Click);
    document.querySelectorAll('#players-tbody tr').forEach(row => {
        row.querySelector('.player-name').addEventListener('change', (e) => { onPlayer_Change(e); });
        row.querySelector('.player-gender').addEventListener('change', (e) => { onPlayer_Change(e); });
        row.querySelector('.player-hi').addEventListener('change', (e) => { onPlayer_Change(e); });
        row.querySelector('.players-remove').addEventListener('click', (e) => { onRemoveIcon_Click(e); });
    });
}

export function renderPlayersPage() {
    const players = getPlayers();

    // Hide all rows first
    document.querySelectorAll('#players-tbody tr').forEach(row => {
        row.style.display = 'none';
    });
  
    // Display as many players as we have rows for
    players.forEach((player, idx) => {
        const row = document.getElementById(`player-row-${idx}`);
        if (row) {
          row.style.display = '';
          row.querySelector('.player-name').value = player.name || '';
          row.querySelector('.player-gender').value = player.gender || 'M';
          row.querySelector('.player-hi').value = player.hi ?? '';
        }
    });
}

function addPlayer() {
    const player = new Player();
    getPlayers().push(player);
    savePlayers();
    renderPlayersPage();
}

function onAddIcon_Click() {
    const players = getPlayers();
    const idx = players.length;
    const row = document.getElementById(`player-row-${idx}`);

    if (row) {
        addPlayer();
        row.querySelector('.player-name')?.focus();
    }
}

function onPlayer_Change(e) {
    const target = e.target;
    const row = target.closest('tr');
    if (!row) return;

    const idx = parseInt(row.dataset.index, 10);
    const player = getPlayers()[idx];

    player.name = row.querySelector('.player-name').value;
    player.gender = row.querySelector('.player-gender').value;
    player.hi = row.querySelector('.player-hi').value;

    savePlayers();
}   

function onRemoveIcon_Click(e) {
    const row = e.target.closest('tr');
    if (!row) return;
    const idx = parseInt(row.dataset.index, 10);
    getPlayers().splice(idx, 1);
    savePlayers();
    renderPlayersPage();
}
