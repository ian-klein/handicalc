// Functions for managing the Courses page

import { getHomeClub, getHomeCourseId } from "./home.js";
import { getLocalClubs, getCoursesForClub, isLocalClub, saveLocalCourses } from "./course-data.js";
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
    genderChoice.addEventListener('change', (e) => { onGenderChoice_Change(e); });

    coursesAdd.addEventListener('click', onCoursesAdd_Click);
    document.querySelectorAll('#courses-tbody tr').forEach(row => {
        row.querySelector('.courses-remove').addEventListener('click', (e) => { onCoursesRemove_Click(e); });
    });

    teesAdd.addEventListener('click', onTeesAdd_Click);
    document.querySelectorAll('#tees-tbody tr').forEach(row => {
        row.querySelector('.tee-slope').addEventListener('change', (e) => { onTeeData_Change(e); });
        row.querySelector('.tee-cr').addEventListener('change', (e) => { onTeeData_Change(e); });
        row.querySelector('.tee-par').addEventListener('change', (e) => { onTeeData_Change(e); });
        row.querySelector('.tees-remove').addEventListener('click', (e) => { onTeesRemove_Click(e); });
    });

    newBtn.addEventListener('click', onNewBtn_Click);
    deleteBtn.addEventListener('click', onDeleteBtn_Click);
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
        row.querySelector('.course-name').disabled = true; // We dont allow the course name to be changed
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
        row.querySelector('.tee-name').disabled = true; // We dont allow the tee name to be changed
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

function onGenderChoice_Change(e) {
    const r = e.target.closest('input[type="radio"][name="courses-gender"]');
    if (!r) return;
    const gender = r.value;

    renderTeesTable(gender);
}

function onCoursesAdd_Click() {

}

function onCoursesRemove_Click(e) {

}

function onTeesAdd_Click() {

}

function onTeeData_Change(e) {
    const target = e.target;
    const row = target.closest('tr');
    if (!row) return;

    // Get the tee name
    const teeName = row.querySelector('.tee-name').value;

    // Get the selected tees array
    const courseSelect = document.querySelector('input[name="course-select"]:checked');
    const courses = getCoursesForClub(clubSelect.value);
    const course = courseSelect ? courses.find(c => String(c.id) === String(courseSelect.value)) : courses[0];
    const gender = document.querySelector('input[name="courses-gender"]:checked').value;
    const tees = gender === 'male' ? course.tees.male : course.tees.female;

    // Find the tee and update it
    const tee = tees.find(t => t.tee_name === teeName);
    if (!tee) return;

    // Update the tee
    tee.slope_rating = row.querySelector('.tee-slope').value;
    tee.course_rating = row.querySelector('.tee-cr').value;
    tee.par_total = row.querySelector('.tee-par').value;
    saveLocalCourses();
}

function onTeesRemove_Click(e) {

}

function onNewBtn_Click() {

}

function onDeleteBtn_Click() {
    
}

