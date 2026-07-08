export const ACCENT = '#C9A970'; // global UI accent — warm refined gold

export const USERS = [
  { name: "Yash",    pin: "1111", color: "#C9A970", isAdmin: true  },
  { name: "Soya",    pin: "2222", color: "#7BAF92", isAdmin: false },
  { name: "Anurag",  pin: "3333", color: "#7B9EC4", isAdmin: false },
  { name: "Shaurya", pin: "4444", color: "#A48CC4", isAdmin: false },
  { name: "Aastha",  pin: "5555", color: "#C47878", isAdmin: false },
  { name: "Manit",   pin: "6666", color: "#C4B78A", isAdmin: false },
];

export const SECTIONS = [
  { name: "Morning",        color: "#C4B78A", habits: ["Morning Setup"] },
  { name: "Health",         color: "#7BAF92", habits: ["Physical Health"] },
  { name: "Cleanse",        color: "#7AAFBB", habits: ["Cleanse"] },
  { name: "Creative Work",  color: "#A48CC4", habits: ["Creative Work"] },
  { name: "Learning",       color: "#7B9EC4", habits: ["Learning"] },
  { name: "Food",           color: "#C47878", habits: ["Food"] },
  { name: "Expression",     color: "#C9A970", habits: ["Expression"] },
  { name: "Work",           color: "#7B9EC4", habits: [] },
  { name: "Hobby Project",  color: "#A48CC4", habits: [] },
  { name: "Home",           color: "#C9A970", habits: [] },
  { name: "Finance",        color: "#C4B78A", habits: [] },
  { name: "People",         color: "#C47878", habits: [] },
  { name: "Upcoming Event", color: "#7AAFBB", habits: [] },
  { name: "Someday",        color: "#8A8F9E", habits: [] },
];

export const TASK_SECTIONS = SECTIONS.map(s => s.name);

export const HABIT_CATEGORIES = [
  { name: "Morning Setup", section: "Morning", activities: [
    { name: "Wake Up",          xp: 10, trackTime: false },
    { name: "Make Bed",         xp: 3,  trackTime: false },
    { name: "Cold Shower",      xp: 8,  trackTime: false },
    { name: "Sunlight",         xp: 5,  trackTime: false },
    { name: "Breathing",        xp: 10, trackTime: true  },
    { name: "Protein Intake",   xp: 3,  trackTime: false },
    { name: "Morning Journal",  xp: 6,  trackTime: false },
    { name: "Gratitude",        xp: 3,  trackTime: false },
  ]},
  { name: "Physical Health", section: "Health", activities: [
    { name: "Workout",          xp: 25, trackTime: true  },
    { name: "Walk / Cardio",    xp: 10, trackTime: true  },
    { name: "Stretching",       xp: 5,  trackTime: true  },
    { name: "Hydration",        xp: 5,  trackTime: false },
    { name: "C + MM + Omega",   xp: 2,  trackTime: false },
    { name: "Sleep 8h",         xp: 8,  trackTime: false },
  ]},
  { name: "Cleanse", section: "Cleanse", activities: [
    { name: "Morning Wash",     xp: 2,  trackTime: false },
    { name: "Dental Care",      xp: 2,  trackTime: false },
    { name: "Skincare",         xp: 3,  trackTime: false },
    { name: "Grooming",         xp: 2,  trackTime: false },
    { name: "Evening Routine",  xp: 3,  trackTime: false },
  ]},
  { name: "Creative Work", section: "Creative Work", activities: [
    { name: "Typography",       xp: 5,  trackTime: true  },
    { name: "Deep Work 1",      xp: 20, trackTime: true  },
    { name: "Deep Work 2",      xp: 20, trackTime: true  },
    { name: "Deep Work 3",      xp: 15, trackTime: true  },
    { name: "Sketching",        xp: 8,  trackTime: true  },
    { name: "Color Study",      xp: 5,  trackTime: true  },
    { name: "Design Critique",  xp: 5,  trackTime: false },
    { name: "Photo / Picture",  xp: 3,  trackTime: false },
    { name: "Portfolio Update", xp: 4,  trackTime: false },
  ]},
  { name: "Learning", section: "Learning", activities: [
    { name: "Book Reading",     xp: 10, trackTime: true  },
    { name: "Deep Study",       xp: 15, trackTime: true  },
    { name: "Course / Tutorial",xp: 10, trackTime: true  },
    { name: "Finance & Research",xp:10, trackTime: true  },
    { name: "Podcast / Audio",  xp: 5,  trackTime: true  },
    { name: "Wind Down Read",   xp: 8,  trackTime: true  },
  ]},
  { name: "Food", section: "Food", activities: [
    { name: "Breakfast",        xp: 3,  trackTime: false },
    { name: "Lunch",            xp: 2,  trackTime: false },
    { name: "Dinner",           xp: 2,  trackTime: false },
    { name: "Fruits & Greens",  xp: 4,  trackTime: false },
    { name: "No Junk",          xp: 5,  trackTime: false },
    { name: "Meal Prep",        xp: 4,  trackTime: false },
  ]},
  { name: "Expression", section: "Expression", activities: [
    { name: "Writing",          xp: 20, trackTime: true  },
    { name: "Journaling",       xp: 8,  trackTime: true  },
    { name: "Communication",    xp: 10, trackTime: true  },
    { name: "Social Post",      xp: 4,  trackTime: false },
    { name: "Voice Memo",       xp: 3,  trackTime: false },
  ]},
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
