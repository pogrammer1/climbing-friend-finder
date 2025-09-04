"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompatibilityScore = getCompatibilityScore;
// Adjust weights as needed (must sum to 1.0)
const WEIGHTS = {
    location: 0.20,
    style: 0.15,
    experience: 0.12,
    grade: 0.10,
    availability: 0.13,
    gyms: 0.10,
    goals: 0.05,
    age: 0.15
};
// Helper: Jaccard similarity for array overlap
function jaccardSimilarity(arr1, arr2) {
    if (!arr1.length || !arr2.length)
        return 0;
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
}
// Location: simple string match (upgrade to geo distance if you add coordinates)
function locationScore(a, b) {
    if (!a.location || !b.location)
        return 0;
    return a.location.trim().toLowerCase() === b.location.trim().toLowerCase() ? 1 : 0;
}
// Climbing style/type: array overlap
function styleScore(a, b) {
    return jaccardSimilarity(a.climbingType, b.climbingType);
}
// Experience: exact match = 1, adjacent = 0.5, else 0
const expLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
function experienceScore(a, b) {
    const idxA = expLevels.indexOf(a.experience);
    const idxB = expLevels.indexOf(b.experience);
    if (idxA === -1 || idxB === -1)
        return 0;
    if (idxA === idxB)
        return 1;
    if (Math.abs(idxA - idxB) === 1)
        return 0.5;
    return 0;
}
// Climbing grade: overlap in any discipline
function gradeScore(a, b) {
    let matches = 0, total = 0;
    const types = ['bouldering', 'sport', 'trad'];
    types.forEach(type => {
        if (a.climbingGrade && b.climbingGrade && a.climbingGrade[type] && b.climbingGrade[type]) {
            total++;
            if (a.climbingGrade[type] === b.climbingGrade[type])
                matches++;
        }
    });
    if (!total)
        return 0;
    return matches / total;
}
// Availability: overlap in any slot
function availabilityScore(a, b) {
    if (!a.availability || !b.availability)
        return 0;
    const slots = ['weekdays', 'weekends', 'evenings'];
    let overlap = 0, total = 0;
    slots.forEach(slot => {
        if (a.availability[slot] && b.availability[slot])
            overlap++;
        if (a.availability[slot] || b.availability[slot])
            total++;
    });
    if (!total)
        return 0;
    return overlap / total;
}
// Gym preferences: array overlap
function gymScore(a, b) {
    return jaccardSimilarity(a.preferredGyms, b.preferredGyms);
}
// Goals: array overlap
function goalsScore(a, b) {
    return jaccardSimilarity(a.goals || [], b.goals || []);
}
// Age: exact match = 1, within 5 years = 0.7, within 10 years = 0.4, else 0
function ageScore(a, b) {
    if (!a.age || !b.age)
        return 0;
    const diff = Math.abs(a.age - b.age);
    if (diff === 0)
        return 1;
    if (diff <= 5)
        return 0.7;
    if (diff <= 10)
        return 0.4;
    return 0;
}
function getCompatibilityScore(userA, userB) {
    let score = 0;
    score += WEIGHTS.location * locationScore(userA, userB);
    score += WEIGHTS.style * styleScore(userA, userB);
    score += WEIGHTS.experience * experienceScore(userA, userB);
    score += WEIGHTS.grade * gradeScore(userA, userB);
    score += WEIGHTS.availability * availabilityScore(userA, userB);
    score += WEIGHTS.gyms * gymScore(userA, userB);
    score += WEIGHTS.goals * goalsScore(userA, userB);
    score += WEIGHTS.age * ageScore(userA, userB);
    return Math.round(score * 100); // as a percentage
}
