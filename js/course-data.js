'use strict';

// Course cache
const courseCache = {
    globalCourses: [],
    localCourses: [],
    clubIndex: null
};
      
// Local storage keys
const LOCAL_COURSES_KEY = 'local_courses_v1';

// Load the global courses from disk
export async function loadCourseCache() {
    const res = await fetch('data/courses.json');
    const globalData = await res.json();
    courseCache.globalCourses = Array.isArray(globalData.courses) ? globalData.courses : [];
  
    const raw = localStorage.getItem(LOCAL_COURSES_KEY);
    const localData = raw ? JSON.parse(raw) : [];
    courseCache.localCourses = Array.isArray(localData) ? localData : [];

    courseCache.clubIndex = new Map();
    // Add local courses
    for (const c of courseCache.localCourses) {
        const key = c.club_name || '';
        if (!courseCache.clubIndex.has(key)) courseCache.clubIndex.set(key, []);
        courseCache.clubIndex.get(key).push(c);
    }
    // Add global courses
    for (const c of courseCache.globalCourses) {
        const local = courseCache.localCourses.find(lc => String(lc.id) === String(c.id)) || null;
        if (local) continue;

        const key = c.club_name || '';
        if (!courseCache.clubIndex.has(key)) courseCache.clubIndex.set(key, []);
        courseCache.clubIndex.get(key).push(c);
    }

}

export function getClubIndex() {
    return courseCache.clubIndex;
}

// Save the local courses to disk and update cache
export function saveLocalCourses(localCourses) {
    const courseList = Array.isArray(localCourses) ? localCourses : [];
    localStorage.setItem(LOCAL_COURSES_KEY, JSON.stringify(courseList));
    courseCache.localCourses = courseList;
}

// Return the local courses
export function getLocalCourses() {
    return courseCache.localCourses;
}

// Return the course with the given ID
export function getCourse(id, clubName) {
    if (clubName == undefined) {
        let course = courseCache.localCourses.find(c => String(c.id) === String(id)) || null;
        if (!course) course = courseCache.globalCourses.find(c => String(c.id) === String(id)) || null;
        return course;
    }
    else {
        return courseCache.clubIndex.get(clubName)?.find(c => String(c.id) === String(id)) || null;
    }
}

export function getCoursesForClub(clubName) {
    return courseCache.clubIndex.get(clubName) || [];
}

export function findClubs(prefix) {
    const matches = new Set();
    for (const club of courseCache.clubIndex.keys()) {
        if (club.toLowerCase().startsWith(prefix.toLowerCase())) {
            matches.add(club);
            if (matches.size >= 10) break;
        }
    }
    return Array.from(matches);
}

export function getLocalClubs() {
    return [ ...new Set(courseCache.localCourses.map(c => c.club_name)) ];
}

export function isLocalClub(clubName) {
    return courseCache.localCourses.some(c => c.club_name === clubName);
}
