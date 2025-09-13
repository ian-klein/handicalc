// Functions relevant for the Home page
'use strict';

import { getCourse, findClubs, getCoursesForClub } from "./course-data.js";  
import { clearNode, optionFor } from "./uilib.js"
import { getPlayer, getPlayers, savePlayers } from "./players.js";
import { computeCH, calculatePH, messageForCH } from "./handicap.js";

// Local storage key for the home state
const HOME_STORAGE_KEY = 'home_state_v1';

// DOM elements
const clubInput = document.getElementById('club-search');
const clubSuggest = document.getElementById('club-suggest');
const clubClear = document.getElementById('club-clear');
const homeCourseSel = document.getElementById('home-course-list');
const menTeeSel = document.getElementById('men-tee');
const ladiesTeeSel = document.getElementById('ladies-tee');
const menSlope = document.getElementById('men-slope');
const ladiesSlope = document.getElementById('ladies-slope');
const menRating = document.getElementById('men-rating');
const ladiesRating = document.getElementById('ladies-rating');
const menPar = document.getElementById('men-par');
const ladiesPar = document.getElementById('ladies-par');
const formatSelect = document.getElementById('format');
const formatHelper = document.getElementById('format-helper');


// Class that encapsulates the Home page state
class HomeState {
    constructor() {
        this.format = 'General play';
        this.courseText = null;
        this.selectedClub = null;
        this.selectedCourseId = null;
        this.menTee = null;
        this.ladiesTee = null;
        this.players = [];
    }
}

// The Home page state - saved and loaded from local storage
let homeState = new HomeState();

const formatText = {
  'General play': 'Each player gets 100% of their course handicap',
  'Individual': 'Each player gets 95% of their course handicap',
  '4B better-ball': 'Each player gets 85% of their course handicap',
  'Foursomes': 'Team handicap is the sum of 50% of the course handicap for each player',
  'Greensomes': 'Team handicap is the sum of 60% course handicap for the lower plus 40% course handicap for the higher',
  '2B match-play': 'The highest handicapped player gets 100% of the difference in course handicaps',
  '4B match-play': 'Each player gets 90% of the difference between their course handicap and the course handicap of the lowest handicapped player',
  'Foursomes match-play': 'Team handicap is 50% of the difference in the sum of the course handicaps for each player in the team'
};

export function wireHomeEvents() {
  // Club search
  clubInput.addEventListener('input', onClubInput_Input);
  clubInput.addEventListener('change', onClubInput_Change);
  clubClear.addEventListener('click', onClubClear_Click);
  clubSuggest.addEventListener('mousedown', onClubSuggest_Mousedown);

  // If the suggest box is shown and the user clicks outside of it, hide it
  document.addEventListener('click', (e) => {
    if (!clubSuggest.contains(e.target) && e.target !== clubInput) {
      clubSuggest.hidden = true;
    }
  });

  // Format
  formatSelect.addEventListener('change', onFormatSelect_Change);

  // Courses
  homeCourseSel.addEventListener('change', onHomeCourseSel_Change);

  // Tees
  menTeeSel.addEventListener('change', onMenTeeSel_Change);
  ladiesTeeSel.addEventListener('change', onLadiesTeeSel_Change);

  // Players
  const rows = getHomePlayerRows();
  for (const row of rows) {
    row.select.addEventListener('change', onPlayerSel_Change);
    row.hiInput.addEventListener('change', onPlayerHiInput_Change);
    row.phSpan.addEventListener('click', onPlayerPhSpan_Click);
  }
}

function saveHomeState() {
    try {
      homeState.format = formatSelect ? formatSelect.value : 'General play';
      homeState.courseText = null; //Defunct, but maintained for backward compatibility
      homeState.selectedClub = clubInput.value;
      homeState.selectedCourseId = homeCourseSel.value;
      homeState.menTee = menTeeSel.value
      homeState.ladiesTee = ladiesTeeSel.value;
      homeState.players = getHomePlayers();

      localStorage.setItem(HOME_STORAGE_KEY, JSON.stringify(homeState));
    } catch (err) {
      console.warn('Failed to save home state', err);
    }
}

export function loadHomeState() {
    try {
        const raw = localStorage.getItem(HOME_STORAGE_KEY);
        if (raw) {
            homeState = JSON.parse(raw);
        }
        else {
            homeState = new HomeState();
        }
    } catch (err) {
        console.warn('Failed to load home state', err);
    }
}

export function getHomeClub() {
    return homeState.selectedClub;
}

export function getHomeCourseId() {
    return homeState.selectedCourseId;
}

// Render the Home page, given the state in homeState
export function renderHomePage() {
    // Club
    clubInput.value = homeState.selectedClub;
    clubSuggest.hidden = true;

    // Courses
    const courses = getCoursesForClub(homeState.selectedClub);
    populatehomeCourseSel(courses);
    if (homeState.selectedCourseId) {
        homeCourseSel.value = homeState.selectedCourseId;
    }

    // Tees
    const course = courses.find(c => String(c.id) === String(homeState.selectedCourseId)) || null;
    populateHomeTees(course);

    menTeeSel.value = homeState.menTee || '';
    ladiesTeeSel.value = homeState.ladiesTee || '';
  
    updateMaleTees(course?.tees?.male || []);
    updateFemaleTees(course?.tees?.female || []);

    // Format
    formatSelect.value = homeState.format;
    renderFormatHelper();

    // Players
    renderHomePlayers();

    recalcPHAll();
}

function renderFormatHelper() {
  const v = formatSelect.value;
  formatHelper.textContent = formatText[v] || '';
}

function populatePlayerSelect(selectEl) {
  if (!selectEl) return;
  const prev = selectEl.value || '';


  const players = getPlayers();
  clearNode(selectEl);
  selectEl.appendChild(optionFor('', ''));

  players.forEach(p => {
    selectEl.appendChild(optionFor(p.name, p.name));
  });

  // Preserve previous selection if still present, else blank
  const hasPrev = Array.from(selectEl.options).some(o => o.value === prev);
  selectEl.value = hasPrev ? prev : '';
}

function populatehomeCourseSel(courses) {
    if (!homeCourseSel) return;

    homeCourseSel.innerHTML = '';
    courses.forEach(c => {
      const o = document.createElement('option');
      o.value = String(c.id);
      o.textContent = c.course_name || '';
      homeCourseSel.appendChild(o);
    });
}

function populateHomeTees(course) {
    if (!course) return;

    const maleTees = (course.tees?.male || [])
    const femaleTees = (course.tees?.female || [])
    if (menTeeSel) {
      clearNode(menTeeSel);
      maleTees.forEach(t => menTeeSel.appendChild(optionFor(t.tee_name, t.tee_name)));
    }
    if (ladiesTeeSel) {
      clearNode(ladiesTeeSel);
      femaleTees.forEach(t => ladiesTeeSel.appendChild(optionFor(t.tee_name, t.tee_name)));
    }
}

function renderHomePlayers() {
  const rows = getHomePlayerRows();
  rows.forEach((r, i) => {
      const player = (i < homeState.players.length) ? homeState.players[i] : { name: '', hi: '' };

      // Add all the players as options to the select
      populatePlayerSelect(r.select);

      r.select.value = player.name;
      r.hiInput.value = String(player.hi);
  });
}

function getHomePlayerRows() {
    const table = document.querySelector('.players-table');
    if (!table) return [];
    const rows = [];
    const selects = table.querySelectorAll('tbody tr select[aria-label^="Player"]');
    selects.forEach(sel => {
        const tr = sel.closest('tr');
        if (!tr) return;
        rows.push({
            row: tr,
            select: sel,
            hiInput: tr.querySelector('.hi-input'),
            phSpan: tr.querySelector('.ph-value'),
        });
    });
    return rows;
}

function getHomePlayers() {
    const homePlayerRows = getHomePlayerRows();

    const players = [];
    for (const r of homePlayerRows) {
      const name = r.select.value;
      const hi = r.hiInput ? Number(r.hiInput.value) : null;
      if (name !== '') {
        players.push({ name, hi });
      }
    }
    return players;
}

function recalcPHAll() {
  const rows = calculateAllPH();

  // Update the PH display
  for (const row of rows)
  {
    if (row.ph || row.ph === 0) {
      row.phSpan.textContent = String(Math.round(row.ph));
    }
    else {
      row.phSpan.textContent = '';
    }
  }
}

function calculateAllPH() {
  const rows = getHomePlayerRows();
  
  const course = getCourse(homeState.selectedCourseId, homeState.selectedClub);
  if (!course) return rows;

  const fmt = formatSelect ? formatSelect.value : 'General play';

  // Get the selected tee data
  const maleTees = course.tees?.male || [];
  const femaleTees = course.tees?.female || [];
  const maleTee = maleTees.find(t => t.tee_name === homeState.menTee) || maleTees[0] || null;
  const femaleTee = femaleTees.find(t => t.tee_name === homeState.ladiesTee) || femaleTees[0] || null;

  //Compute the course handicap for each player
  rows.forEach(r => {
    const player = getPlayer(r.select.value);
    if (player && player !== '') {
      const hi = r.hiInput ? Number(r.hiInput.value) : null;
      r.gender = player.gender;
      const tee = r.gender === 'M' ? maleTee : femaleTee;
      r.ch = computeCH(hi, tee?.slope_rating, tee?.course_rating, tee?.par_total);
      r.msg = messageForCH(player, tee);
    }
    else {
      r.ch = null;
      r.gender = null;
    }
  });

  //Compute the playing handicap for each player
  calculatePH(fmt, rows);

  return rows;
}

function updateMaleTees(tees) {
  const name = menTeeSel.value;
  const t = tees.find(x => x.tee_name === name);

  menSlope.textContent = t?.slope_rating ?? '';
  menRating.textContent = t?.course_rating ?? '';
  menPar.textContent = t?.par_total ?? '';
}

function updateFemaleTees(tees) {
  const name = ladiesTeeSel.value;
  const t = tees.find(x => x.tee_name === name);
  
  ladiesSlope.textContent = t?.slope_rating ?? '';
  ladiesRating.textContent = t?.course_rating ?? '';
  ladiesPar.textContent = t?.par_total ?? '';
}

function showSuggest(items) {
  if (!clubSuggest) return;

  clubSuggest.innerHTML = '';
  for (const it of items) {
    const div = document.createElement('div');
    div.className = 'suggest-item';
    div.textContent = it;
    clubSuggest.appendChild(div);
  }
  clubSuggest.hidden = (items.length === 0);
}

function onClubInput_Input() {
  // If we have a selected club and the input is being changed, revert it
  // This discards additional characters that were typed afterwards
  const selectedClubName = homeState.selectedClub;
  if (selectedClubName && selectedClubName.length > 0 && clubInput.value.trim() !== selectedClubName) {
    clubInput.value = selectedClubName;
    return;
  }

  // See if we have a match
  const prefix = clubInput.value.trim();
  const clubs = findClubs(prefix);
  if (clubs.length === 1) {
    selectClub(clubs[0]);
    return;
  }
  
  // Show suggestions only if we have at least 3 characters
  if (prefix.length < 3) {
    clubSuggest.hidden = true;
  } else {
    showSuggest(clubs);
  }
}

function selectClub(clubName) {
  homeState.selectedClub = clubName;  
  homeState.selectedCourseId = null;
  homeState.menTee = null;
  homeState.ladiesTee = null;

  const courses = getCoursesForClub(clubName);
  if (courses?.length > 0) {
    homeState.selectedCourseId = courses[0].id;

    const maleTees = courses[0].tees?.male || [];
    if (maleTees?.length > 0) {
      homeState.menTee = maleTees[0].tee_name;
    }

    const femaleTees = courses[0].tees?.female || [];
    if (femaleTees?.length > 0) {
      homeState.ladiesTee = femaleTees[0].tee_name;
    }
  }

  renderHomePage();
  saveHomeState();
}

function onClubSuggest_Mousedown(e) {
  const item = e.target.closest('.suggest-item');
  if (!item) return;
  selectClub(item.textContent.trim());
}

function onClubInput_Change() {
  selectClub(clubInput.value.trim());
} 

function onClubClear_Click() {
  selectClub(null);
  clubInput.focus();
}

function onFormatSelect_Change() {
  homeState.format = formatSelect.value;
  renderFormatHelper();
  saveHomeState();
  recalcPHAll();
}

function onHomeCourseSel_Change() {
  homeState.selectedCourseId = homeCourseSel.value;
  renderHomePage();
  saveHomeState();
}

function onMenTeeSel_Change() {
  homeState.menTee = menTeeSel.value;
  saveHomeState();

  const course = getCourse(homeState.selectedCourseId, homeState.selectedClub);
  updateMaleTees(course?.tees?.male || []);
  recalcPHAll();
}

function onLadiesTeeSel_Change() {
  homeState.ladiesTee = ladiesTeeSel.value;
  saveHomeState();

  const course = getCourse(homeState.selectedCourseId, homeState.selectedClub);
  updateFemaleTees(course?.tees?.male || []);
  recalcPHAll();
}

function onPlayerSel_Change(e) {
  const name = e.target.value;

  if (name === '') {
    // Recreate the home state players with no gaps
    homeState.players = getHomePlayers();
    renderHomePlayers();
  }
  else {
    // Set the corresponding HI from the player DB
    const tr = e.target.closest('tr');
    const hiInput = tr?.querySelector('.hi-input');
            
    if (hiInput) {
      const player = getPlayer(name);
      hiInput.value = player?.hi ?? '';
    }
  }

  saveHomeState();
  recalcPHAll();
}

function onPlayerHiInput_Change(e) {
  const target = e.target;

  //Update player on Players Page
  const row = target.closest('tr');
  if (!row) return;

  const idx = parseInt(row.dataset.index, 10);
  const rows = getHomePlayerRows();
  const playerName = rows[idx].select.value;

  const player = getPlayer(playerName);
  if (player) {
    player.hi = target.value;
    savePlayers();
  }

  saveHomeState();
  recalcPHAll();
}

function onPlayerPhSpan_Click(e) {
  const target = e.target;

  const row = target.closest('tr');
  if (!row) return;

  const idx = parseInt(row.dataset.index, 10);
  const rows = calculateAllPH();

  const msg = rows[idx].msg;
  alert(msg);
}


