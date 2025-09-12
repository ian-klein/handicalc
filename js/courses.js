// Functions for managing the Courses page

import { getHomeClub, getHomeCourseId } from "./home.js";
import { getLocalClubs, getCoursesForClub, isLocalClub, addLocalClub, deleteLocalClub, saveLocalCourses, isClubNameTaken, getLocalCourses } from "./course-data.js";
import { clearNode, optionFor } from "./uilib.js";

// DOM elements
const clubSelect = document.getElementById('courses-club-name');
const coursesAdd = document.getElementById('courses-add');
const teesAdd = document.getElementById('tees-add');
const genderChoice = document.querySelector('#courses .gender-choice');
const coursesTbody = document.getElementById('courses-tbody');

// New club modal elements
const newClubModal = document.getElementById('new-club-modal');
const newClubNameInput = document.getElementById('new-club-name-input');
const cancelNewClubBtn = document.getElementById('cancel-new-club');
const addNewClubBtn = document.getElementById('add-new-club');
const newClubErrorElement = document.getElementById('new-club-error');

// New tee modal elements
const newTeeModal = document.getElementById('new-tee-modal');
const newTeeNameInput = document.getElementById('new-teee-name-input');
const cancelNewTeeBtn = document.getElementById('cancel-new-tee');
const addNewTeeBtn = document.getElementById('add-new-tee');
const newTeeErrorElement = document.getElementById('new-tee-error');

const newBtn = document.getElementById('courses-new');
const deleteBtn = document.getElementById('courses-delete');

export function wireCoursesEvents() {
    clubSelect.addEventListener('change', onClubSelect_Change);
    coursesTbody.addEventListener('change', onCoursesTbody_Change);
    genderChoice.addEventListener('change', onGenderChoice_Change);

    coursesAdd.addEventListener('click', onCoursesAdd_Click);
    document.querySelectorAll('#courses-tbody tr').forEach(row => {
        row.querySelector('.course-name').addEventListener('change', onCourseName_Change);
        row.querySelector('.courses-remove').addEventListener('click', onCoursesRemove_Click);
    });

    teesAdd.addEventListener('click', onTeesAdd_Click);
    document.querySelectorAll('#tees-tbody tr').forEach(row => {
        row.querySelector('.tee-slope').addEventListener('change', onTeeData_Change);
        row.querySelector('.tee-cr').addEventListener('change', onTeeData_Change);
        row.querySelector('.tee-par').addEventListener('change', onTeeData_Change);
        row.querySelector('.tees-remove').addEventListener('click', onTeesRemove_Click);
    });

    newBtn.addEventListener('click', onNewBtn_Click);
    deleteBtn.addEventListener('click', onDeleteBtn_Click);
    
    cancelNewClubBtn.addEventListener('click', onCancelNewClubBtn_Click);
    addNewClubBtn.addEventListener('click', onAddNewClubBtn_Click);
    newClubNameInput.addEventListener('input', onNewClubNameInput_Input);

    cancelNewTeeBtn.addEventListener('click', onCancelNewTeeBtn_Click);
    addNewTeeBtn.addEventListener('click', onAddNewTeeBtn_Click);
    newTeeNameInput.addEventListener('input', onNewTeeNameInput_Input);
}

export function renderCoursesPage() {
    renderClub(getHomeClub(), getHomeCourseId());
}

function renderClub(clubName, courseId) {
    // Populate the club select options 
    const localClubs = getLocalClubs();
    clearNode(clubSelect);
    for (const club of localClubs) {
        clubSelect.appendChild(optionFor(club, club));
    }
    // Always include the club name from the Home page
    const homeClubName = getHomeClub();
    if (!localClubs.includes(homeClubName)) {
        clubSelect.appendChild(optionFor(homeClubName, homeClubName));
    }
    clubSelect.value = clubName;

    // Having selected the club, render the rest of the page
    renderCoursesTable(courseId);
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

        const isNew = isNewCourse(course);
        const btn = row.querySelector('.icon-cell img[alt="Remove"]');
        btn.style.display = isNew && courses.length > 1 ? '' : 'none';
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
        row.querySelector('.icon-cell img[alt="Remove"]').style.display = isLocal ? '' : 'none';

    });
}

function renderButtons() {
    const clubName = clubSelect.value;
    const isLocal = isLocalClub(clubName);
    deleteBtn.textContent = isLocal ? 'Delete' : 'Edit';

}

function onClubSelect_Change() {
    renderCoursesTable();
    renderTeesTable('male');
}

function onCoursesTbody_Change(e) {
    if (e.target.matches('input[type="radio"][name="course-select"]')) {
        renderTeesTable('male');
    }
}

function onGenderChoice_Change(e) {
    const r = e.target.closest('input[type="radio"][name="courses-gender"]');
    if (!r) return;
    const gender = r.value;

    renderTeesTable(gender);
}

function onCoursesAdd_Click(e) {
    const clubName = clubSelect.value;
    const course = createNewCourse(clubName);
    const courses = getCoursesForClub(clubName);
    courses.push(course);
    saveLocalCourses();
    renderCoursesTable(course.id);
    renderTeesTable('male');
}

function onCoursesRemove_Click(e) {
    const course = getCourseForEvent(e);
    if (!course) return;

    // Remove the course
    const courses = getCoursesForClub(clubSelect.value);
    courses.splice(courses.indexOf(course), 1);
    saveLocalCourses();
    renderCoursesTable();
}

function onCourseName_Change(e) {
    const course = getCourseForEvent(e);
    if (!course) return;

    // Update the course
    course.course_name = e.target.value;
    saveLocalCourses();
}

function getCourseForEvent(e) {
    const row = e.target.closest('tr');
    if (!row) return null;

    const idx = row.dataset.index;
    const courses = getCoursesForClub(clubSelect.value);
    return courses[idx];
}

function onTeesAdd_Click() {
    newTeeNameInput.value = '';
    newTeeErrorElement.textContent = '';
    addNewTeeBtn.disabled = true;
    newTeeModal.hidden = false;
    document.body.style.overflow = 'hidden';
    newTeeNameInput.focus();
}

function onTeeData_Change(e) {
    const className = e.target.className;
    const value = e.target.value;
    const { tee } = getTeeForEvent(e);
    if (!tee) return;

    // Update the tee
    if (className === 'tee-slope') {
        tee.slope_rating = value;
    }
    else if (className === 'tee-cr') {
        tee.course_rating = value;
    }
    else if (className === 'tee-par') {
        tee.par_total = value;
    }
    saveLocalCourses();
}

function onTeesRemove_Click(e) {
    const { gender, tees, tee } = getTeeForEvent(e);
    if (!tee) return;

    // Remove the tee
    tees.splice(tees.indexOf(tee), 1);
    saveLocalCourses();
    renderTeesTable(gender);
}

function onNewBtn_Click(e) {
    e.preventDefault();
    newClubNameInput.value = '';
    newClubErrorElement.textContent = '';
    addNewClubBtn.disabled = true;
    newClubModal.hidden = false;
    document.body.style.overflow = 'hidden';
    newClubNameInput.focus();

}

function onDeleteBtn_Click() {
    const clubName = clubSelect.value;
    const isLocal = isLocalClub(clubName);

    if (isLocal) {
        deleteLocalClub(clubName);
        renderCoursesPage();
    }
    else  {
        // It is a global club - make a local copy
        const courses = getCoursesForClub(clubName);
        const localCourses = [];
        for (const course of courses) {
            const localCourse = structuredClone(course);
            localCourses.push(localCourse);
        }
        addLocalClub(clubName, localCourses);
        renderCoursesPage();
    }
}

function onNewClubNameInput_Input() {
    const name = newClubNameInput.value.trim();
    addNewClubBtn.disabled = name.length === 0;
    
    if (name.length > 0 && isClubNameTaken(name)) {
      newClubErrorElement.textContent = 'Club name already exists';
      addNewClubBtn.disabled = true;
    } else {
      newClubErrorElement.textContent = '';
    }
}
function onCancelNewClubBtn_Click() {
    newClubModal.hidden = true;
    document.body.style.overflow = '';
}

function onAddNewClubBtn_Click() {
    const clubName = newClubNameInput.value.trim();
    const courses = [];
    courses.push(createNewCourse(clubName));
    addLocalClub(clubName, courses);
    renderClub(clubName, courses[0].id);

    newClubModal.hidden = true;
    document.body.style.overflow = '';
}

function onNewTeeNameInput_Input() {
    const name = newTeeNameInput.value.trim();
    addNewTeeBtn.disabled = name.length === 0;
    
    if (name.length > 0 && isTeeNameTaken(name)) {
      newTeeErrorElement.textContent = 'Tee name already exists';
      addNewTeeBtn.disabled = true;
    } else {
      newTeeErrorElement.textContent = '';
    }
}

function onCancelNewTeeBtn_Click() {
    newTeeModal.hidden = true;
    document.body.style.overflow = '';
}

function onAddNewTeeBtn_Click() {
    const teeName = newTeeNameInput.value.trim();
    const { gender, tees } = getTees();
    tees.push(createNewTee(teeName));
    saveLocalCourses();
    renderTeesTable(gender);

    newTeeModal.hidden = true;
    document.body.style.overflow = '';
}

function createNewCourse(clubName) {
    const newId = 100000 + getLocalCourses().length + 1;
    return {
        id: newId,
        club_name: clubName,
        course_name: clubName,
        location: {
            address: '',
            city: '',
            state: '',
            country: 'United Kingdom',
            latitude: 0,
            longitude: 0
        },
        tees: {
            male: [
                {
                    tee_name: 'White',
                    course_rating: 0,
                    slope_rating: 0,
                    bogey_rating: 0,
                    total_yards: 0,
                    total_meters: 0,
                    number_of_holes: 0,
                    par_total: 0,
                    front_course_rating: 0,
                    front_slope_rating: 0,
                    front_bogey_rating: 0,
                    back_course_rating: 0,
                    back_slope_rating: 0,
                    back_bogey_rating: 0
                },
                {
                    tee_name: 'Yellow',
                    course_rating: 0,
                    slope_rating: 0,
                    bogey_rating: 0,
                    total_yards: 0,
                    total_meters: 0,
                    number_of_holes: 0,
                    par_total: 0,
                    front_course_rating: 0,
                    front_slope_rating: 0,
                    front_bogey_rating: 0,
                    back_course_rating: 0,
                    back_slope_rating: 0,
                    back_bogey_rating: 0
                }
            ],
            female: [
                {
                    tee_name: 'Red',
                    course_rating: 0,
                    slope_rating: 0,
                    bogey_rating: 0,
                    total_yards: 0,
                    total_meters: 0,
                    number_of_holes: 0,
                    par_total: 0,
                    front_course_rating: 0,
                    front_slope_rating: 0,
                    front_bogey_rating: 0,
                    back_course_rating: 0,
                    back_slope_rating: 0,
                    back_bogey_rating: 0
                }
            ]
        }
    };
}

function createNewTee(name) {
    return {
        tee_name: name,
        course_rating: 0,
        slope_rating: 0,
        bogey_rating: 0,
        total_yards: 0,
        total_meters: 0,
        number_of_holes: 0,
        par_total: 0,
        front_course_rating: 0,
        front_slope_rating: 0,
        front_bogey_rating: 0,
        back_course_rating: 0,
        back_slope_rating: 0,
        back_bogey_rating: 0
    };
}

function getTeeForEvent(e) {
    const target = e.target;
    const row = target.closest('tr');
    if (!row) return null;

    // Get the tee name
    const teeName = row.querySelector('.tee-name').value;

    // Get the selected tees array
    const { gender, tees } = getTees();

    // Find the tee
    const tee = tees.find(t => t.tee_name === teeName);
    return { gender, tees, tee };
}

function getTees() {
    const course = getCourse();
    const gender = document.querySelector('input[name="courses-gender"]:checked').value;
    const tees = gender === 'male' ? course.tees.male : course.tees.female;
    return { gender, tees };
}

function getCourse() {
    const courseSelect = document.querySelector('input[name="course-select"]:checked');
    const courses = getCoursesForClub(clubSelect.value);
    const course = courseSelect ? courses.find(c => String(c.id) === String(courseSelect.value)) : courses[0];
    return course;
}

function isNewCourse(course) {
    return course.id >= 100000;
}

function isTeeNameTaken(teeName) {
    const { tees } = getTees();
    return tees.some(t => t.tee_name === teeName);
}
