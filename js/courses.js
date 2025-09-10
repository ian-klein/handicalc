// Functions for managing the Courses page

import { getHomeClub, getHomeCourseId } from "./home.js";
import { getLocalClubs, getCoursesForClub, isLocalClub } from "./course-data.js";
import { clearNode, optionFor } from "./uilib.js";

// DOM elements
const clubSelect = document.getElementById('courses-club-name');
const coursesTbody = document.getElementById('courses-tbody');
const coursesAdd = document.getElementById('courses-add');
const teesTbody = document.getElementById('tees-tbody');
const teesAdd = document.getElementById('tees-add');
const genderChoice = document.querySelector('#courses .gender-choice');

const newBtn = document.getElementById('courses-new');
const deleteBtn = document.getElementById('courses-delete');

export function wireCoursesEvents() {
    clubSelect.addEventListener('change', onClubSelect_Change);
    genderChoice.addEventListener('change', (e) => { onGenderChange(e); });
}

export function renderCoursesPage() {
    // Populate the club select options
    const localClubs = getLocalClubs();
    clearNode(clubSelect);
    for (const club of localClubs) {
        clubSelect.appendChild(optionFor(club, club));
    }
    // Always use the club name from the Home page
    const clubName = getHomeClub();
    if (!localClubs.includes(clubName)) {
        clubSelect.appendChild(optionFor(clubName, clubName));
    }
    clubSelect.value = clubName;

    // Having selected the club, render the rest of the page
    renderCoursesTable(getHomeCourseId());
    renderTeesTable('male');
    renderButtons();
}

function renderCoursesTable(courseId) {
    const clubName = clubSelect.value;
    const courses = getCoursesForClub(clubName);

    const isLocal = isLocalClub(clubName);
    if (!courseId) courseId = courses[0].id;

    // Hide all rows first
    document.querySelectorAll('#courses-tbody tr').forEach(row => {
        row.style.display = 'none';
    });

    courses.forEach((course, idx) => {
        const row = document.getElementById(`course-row-${idx}`);
        row.style.display = '';
        row.querySelector('.course-name').value = course.course_name;
        row.querySelector('input[type=radio]').value = course.id;
        row.querySelector('input[type=radio]').checked = String(course.id) === String(courseId);

        // Set control status
        row.querySelector('.course-name').disabled = !isLocal;
    });
}

function renderTeesTable(gender) {
    const courseSelect = document.querySelector('input[name="course-select"]:checked');
    const courses = getCoursesForClub(clubSelect.value);
    const course = courseSelect ? courses.find(c => String(c.id) === String(courseSelect.value)) : courses[0];
    const tees = gender === 'male' ? course.tees.male : course.tees.female;

    const clubName = clubSelect.value;
    const isLocal = isLocalClub(clubName);


    // Set gender radio button
    const genderRadio = document.querySelector('input[name="courses-gender"][value="' + gender + '"]');
    if (genderRadio) genderRadio.checked = true;

    // Hide all rows first
    document.querySelectorAll('#tees-tbody tr').forEach(row => {
        row.style.display = 'none';
    });
    tees.forEach((tee, idx) => {
        const row = document.getElementById(`tee-row-${idx}`);
        row.style.display = '';
        row.querySelector('.tee-name').value = tee.tee_name;
        row.querySelector('.tee-slope').value = tee.slope_rating;
        row.querySelector('.tee-cr').value = tee.course_rating;
        row.querySelector('.tee-par').value = tee.par_total;

        //Set control status
        row.querySelector('.tee-name').disabled = !isLocal;
        row.querySelector('.tee-slope').disabled = !isLocal;
        row.querySelector('.tee-cr').disabled = !isLocal;
        row.querySelector('.tee-par').disabled = !isLocal;
    });
}

function renderButtons() {
    const clubName = clubSelect.value;
    const isLocal = isLocalClub(clubName);
    deleteBtn.textContent = isLocal ? 'Delete' : 'Edit';

    document.querySelectorAll('.icon-cell img[alt="Add"]').forEach(btn => {
        btn.style.display = isLocal ? '' : 'none';
      });
      
      // Show/hide remove buttons
      document.querySelectorAll('.icon-cell img[alt="Remove"]').forEach(btn => {
        btn.style.display = isLocal ? '' : 'none';
      });
}

function onClubSelect_Change() {
    renderCoursesTable();
    renderTeesTable('male');
    renderButtons();
}

function onGenderChange(e) {
    const r = e.target.closest('input[type="radio"][name="courses-gender"]');
    if (!r) return;
    const gender = r.value;

    renderTeesTable(gender);
}

