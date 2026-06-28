export const USERS = [
  { name: "Yash",    pin: "1111", color: "#e8b34e", isAdmin: true  },
  { name: "Soya",    pin: "2222", color: "#7ad6a0", isAdmin: false },
  { name: "Anurag",  pin: "3333", color: "#7eb8f7", isAdmin: false },
  { name: "Shaurya", pin: "4444", color: "#c4a0f5", isAdmin: false },
  { name: "Aastha",  pin: "5555", color: "#f08b8b", isAdmin: false },
  { name: "Manit",   pin: "6666", color: "#f5a623", isAdmin: false },
];

export const SECTIONS = [
  { name: "Morning",        color: "#f3c873", habits: ["Morning Setup"] },
  { name: "Health",         color: "#7ad6a0", habits: ["Physical Health"] },
  { name: "Cleanse",        color: "#a0d8f5", habits: ["Cleanse"] },
  { name: "Creative Work",  color: "#c4a0f5", habits: ["Creative Work"] },
  { name: "Learning",       color: "#7eb8f7", habits: ["Learning"] },
  { name: "Food",           color: "#f08b8b", habits: ["Food"] },
  { name: "Expression",     color: "#e8b34e", habits: ["Expression"] },
  { name: "Work",           color: "#7eb8f7", habits: [] },
  { name: "Hobby Project",  color: "#c4a0f5", habits: [] },
  { name: "Home",           color: "#e8b34e", habits: [] },
  { name: "Finance",        color: "#f3c873", habits: [] },
  { name: "People",         color: "#f08b8b", habits: [] },
  { name: "Upcoming Event", color: "#a0d8f5", habits: [] },
  { name: "Someday",        color: "#9aa1ad", habits: [] },
];

export const TASK_SECTIONS = SECTIONS.map(s => s.name);

export const HABIT_CATEGORIES = [
  { name: "Morning Setup",   section: "Morning",       activities: [{ name: "Wake Up", xp: 10, trackTime: false }, { name: "Protein Intake", xp: 2, trackTime: false }, { name: "Breathing", xp: 10, trackTime: true }] },
  { name: "Physical Health", section: "Health",        activities: [{ name: "Workout", xp: 25, trackTime: true }, { name: "Breakfast", xp: 5, trackTime: false }, { name: "Hydration", xp: 5, trackTime: false }, { name: "C+MM+Omega", xp: 2, trackTime: false }] },
  { name: "Cleanse",         section: "Cleanse",       activities: [{ name: "Morning", xp: 2, trackTime: false }, { name: "Care", xp: 2, trackTime: false }] },
  { name: "Creative Work",   section: "Creative Work", activities: [{ name: "Typography", xp: 5, trackTime: true }, { name: "Block 1 90m", xp: 20, trackTime: true }, { name: "Block 2 90m", xp: 20, trackTime: true }, { name: "Block 3 90m", xp: 15, trackTime: true }, { name: "Picture", xp: 2, trackTime: false }] },
  { name: "Learning",        section: "Learning",      activities: [{ name: "Light", xp: 8, trackTime: true }, { name: "Heavy", xp: 15, trackTime: true }, { name: "Exploration/Finance 60m", xp: 10, trackTime: true }, { name: "Wind Down", xp: 8, trackTime: true }] },
  { name: "Food",            section: "Food",          activities: [{ name: "Lunch", xp: 2, trackTime: false }, { name: "Dinner", xp: 2, trackTime: false }] },
  { name: "Expression",      section: "Expression",    activities: [{ name: "Writing 60m", xp: 20, trackTime: true }, { name: "Communication 45m", xp: 10, trackTime: true }] },
];

export const TOTAL_XP = HABIT_CATEGORIES.reduce((s, c) => s + c.activities.reduce((a, x) => a + x.xp, 0), 0);

export const MEASUREMENT_AREAS = [
  { name: "Neck",                note: "Around Adam's apple" },
  { name: "Shoulders (around)",  note: "Widest point, around both" },
  { name: "Chest",               note: "Across nipples, normal breath" },
  { name: "Upper Arm (Bicep)",   note: "Flexed" },
  { name: "Forearm",             note: "Thickest part" },
  { name: "Waist (Narrowest)",   note: "1 inch above belly button" },
  { name: "Lower Waist (Belly)", note: "At the belly button" },
  { name: "Hips",                note: "Widest part of glutes" },
  { name: "Thigh",               note: "Thickest part, near groin" },
  { name: "Calves",              note: "Thickest part of calf" },
  { name: "Weight",              note: "kg" },
];
