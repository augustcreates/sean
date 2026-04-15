/* =========================================================
   SEAN NYGREN PT — main.js v3
   Full SPA: Router · Quiz · Nutrition Calc · Plan Generator · Library
   ========================================================= */
(function () {
'use strict';

/* =========================================================
   STATE
   ========================================================= */
const profile = {
  goal:       null,   // 'strength' | 'hypertrophy' | 'cardio' | 'health'
  gender:     'male',
  age:        null,
  weight:     null,   // kg
  height:     null,   // cm
  activity:   null,   // 'sedentary' | 'light' | 'moderate' | 'active'
  experience: null,   // 'beginner' | 'intermediate' | 'advanced'
  equipment:  new Set(),
  days:       null,   // 3 | 4 | 5 | 6
};
let currentStep = 1;
const TOTAL_STEPS = 5;

/* =========================================================
   ROUTER
   ========================================================= */
function showView(name) {
  document.querySelectorAll('.view').forEach(v => {
    v.classList.remove('view--active');
    v.style.animation = '';
  });
  const target = document.getElementById('view-' + name);
  if (target) {
    target.classList.add('view--active');
    // retrigger animation
    void target.offsetWidth;
    target.style.animation = '';
  }
  document.querySelectorAll('.nav__link').forEach(l => l.classList.remove('active'));
  const activeLink = document.querySelector(`.nav__link[data-view="${name}"]`);
  if (activeLink) activeLink.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'instant' });
  // Close mobile nav
  const nl = document.getElementById('navLinks');
  const bg = document.getElementById('burger');
  if (nl) nl.classList.remove('open');
  if (bg) { bg.classList.remove('open'); document.body.style.overflow = ''; }
  if (name === 'library') renderLibrary('all');
}

// Wire all [data-view] elements
document.addEventListener('click', e => {
  const el = e.target.closest('[data-view]');
  if (!el) return;
  const view = el.getAttribute('data-view');
  if (view === 'quiz') { resetQuiz(); showView('quiz'); }
  else showView(view);
});

/* =========================================================
   NAV
   ========================================================= */
const burger   = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
const nav      = document.getElementById('nav');

burger?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  burger.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

window.addEventListener('scroll', () => {
  nav?.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* =========================================================
   QUIZ — STEP MANAGEMENT
   ========================================================= */
function resetQuiz() {
  currentStep = 1;
  profile.goal       = null;
  profile.gender     = 'male';
  profile.age        = null;
  profile.weight     = null;
  profile.height     = null;
  profile.activity   = null;
  profile.experience = null;
  profile.equipment  = new Set();
  profile.days       = null;
  document.querySelectorAll('.goal-card, .exp-card, .equip-card, .days-card')
    .forEach(el => el.classList.remove('selected'));
  document.querySelectorAll('.activity-btn').forEach(el => el.classList.remove('selected'));
  document.querySelectorAll('.toggle-btn').forEach(el => {
    el.classList.remove('active', 'toggle-btn--active');
  });
  document.querySelector('.toggle-btn[data-value="male"]')
    ?.classList.add('active', 'toggle-btn--active');
  document.querySelectorAll('input[type="number"]').forEach(el => el.value = '');
  goToStep(1, false);
}

function goToStep(n, animate = true) {
  const steps = document.querySelectorAll('.quiz-step');

  if (animate) {
    // Animate current step out first
    const current = document.getElementById('step-' + currentStep);
    if (current && !current.classList.contains('quiz-step--hidden')) {
      current.classList.add('quiz-step--exit');
      setTimeout(() => {
        current.classList.remove('quiz-step--exit');
        current.classList.add('quiz-step--hidden');
        showStep(n);
      }, 180);
    } else {
      showStep(n);
    }
  } else {
    steps.forEach(el => el.classList.add('quiz-step--hidden'));
    showStep(n);
  }

  currentStep = n;
  updateProgress();
}

function showStep(n) {
  const el = document.getElementById('step-' + n);
  if (!el) return;
  el.classList.remove('quiz-step--hidden', 'quiz-step--exit');
  // retrigger animation
  void el.offsetWidth;
  el.style.animation = '';
}

function updateProgress() {
  const pct   = ((currentStep - 1) / TOTAL_STEPS) * 100;
  const fill  = document.getElementById('progFill');
  const label = document.getElementById('stepLabel');
  if (fill)  fill.style.width = pct + '%';
  if (label) label.textContent = `Step ${currentStep} of ${TOTAL_STEPS}`;
  const back = document.getElementById('quizBack');
  if (back)  back.style.visibility = currentStep > 1 ? 'visible' : 'hidden';
}

document.getElementById('quizBack')?.addEventListener('click', () => {
  if (currentStep > 1) goToStep(currentStep - 1);
  else showView('home');
});

/* =========================================================
   QUIZ — STEP 1: GOAL
   ========================================================= */
document.querySelectorAll('.goal-card[data-field="goal"]').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.goal-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    profile.goal = card.dataset.value;
    setTimeout(() => goToStep(2), 280);
  });
});

/* =========================================================
   QUIZ — STEP 2: BODY STATS
   ========================================================= */
document.querySelectorAll('.toggle-btn[data-field="gender"]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.toggle-btn[data-field="gender"]')
      .forEach(b => b.classList.remove('active', 'toggle-btn--active'));
    btn.classList.add('active', 'toggle-btn--active');
    profile.gender = btn.dataset.value;
  });
});

document.querySelectorAll('.activity-btn[data-field="activity"]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.activity-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    profile.activity = btn.dataset.value;
  });
});

document.getElementById('step2Next')?.addEventListener('click', () => {
  const age    = parseInt(document.getElementById('inp-age')?.value);
  const weight = parseFloat(document.getElementById('inp-weight')?.value);
  const height = parseFloat(document.getElementById('inp-height')?.value);

  if (!age || !weight || !height) { showError('Please fill in age, weight, and height.'); return; }
  if (!profile.activity)          { showError('Please select your activity level.'); return; }

  profile.age    = age;
  profile.weight = weight;
  profile.height = height;
  goToStep(3);
});

/* =========================================================
   QUIZ — STEP 3: EXPERIENCE
   ========================================================= */
document.querySelectorAll('.exp-card[data-field="experience"]').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.exp-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    profile.experience = card.dataset.value;
    setTimeout(() => goToStep(4), 280);
  });
});

/* =========================================================
   QUIZ — STEP 4: EQUIPMENT
   ========================================================= */
document.querySelectorAll('.equip-card[data-field="equipment"]').forEach(card => {
  card.addEventListener('click', () => {
    card.classList.toggle('selected');
    const val = card.dataset.value;
    if (profile.equipment.has(val)) profile.equipment.delete(val);
    else profile.equipment.add(val);
  });
});

document.getElementById('step4Next')?.addEventListener('click', () => {
  if (profile.equipment.size === 0) {
    showError('Please select at least one equipment option.');
    return;
  }
  goToStep(5);
});

/* =========================================================
   QUIZ — STEP 5: DAYS
   ========================================================= */
document.querySelectorAll('.days-card[data-field="days"]').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.days-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    profile.days = parseInt(card.dataset.value);
    setTimeout(() => {
      generateDashboard();
      showView('dashboard');
    }, 350);
  });
});

/* =========================================================
   ERROR HELPER
   ========================================================= */
function showError(msg) {
  const existing = document.querySelector('.quiz-error');
  if (existing) existing.remove();
  const div = document.createElement('div');
  div.className = 'quiz-error';
  div.style.cssText = [
    'color:var(--accent)',
    'font-size:0.85rem',
    'font-weight:600',
    'padding:12px 0',
    'text-align:center',
    'opacity:0',
    'transition:opacity 200ms',
  ].join(';');
  div.textContent = '⚠ ' + msg;
  document.querySelector('#step-' + currentStep)?.appendChild(div);
  requestAnimationFrame(() => { div.style.opacity = '1'; });
  setTimeout(() => {
    div.style.opacity = '0';
    setTimeout(() => div.remove(), 200);
  }, 3000);
}

/* =========================================================
   NUTRITION CALCULATOR
   Mifflin-St Jeor BMR + TDEE + Goal Macros
   ========================================================= */
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light:     1.375,
  moderate:  1.55,
  active:    1.725,
};

const GOAL_CONFIG = {
  strength:    { modifier: 1.10, proteinPerKg: 2.2, fatPerKg: 1.0, label: 'Slight caloric surplus for strength gain',       goalLabel: 'Your Strength Plan' },
  hypertrophy: { modifier: 1.10, proteinPerKg: 2.0, fatPerKg: 0.9, label: 'Slight caloric surplus for muscle growth',        goalLabel: 'Your Muscle Building Plan' },
  cardio:      { modifier: 0.95, proteinPerKg: 1.8, fatPerKg: 0.8, label: 'Slight deficit — optimised for performance',      goalLabel: 'Your Cardio & Endurance Plan' },
  health:      { modifier: 1.0,  proteinPerKg: 1.8, fatPerKg: 0.9, label: 'Maintenance calories for general health',         goalLabel: 'Your General Health Plan' },
};

function calcNutrition(p) {
  const bmr = p.gender === 'male'
    ? (10 * p.weight) + (6.25 * p.height) - (5 * p.age) + 5
    : (10 * p.weight) + (6.25 * p.height) - (5 * p.age) - 161;

  const tdee      = Math.round(bmr * ACTIVITY_MULTIPLIERS[p.activity]);
  const cfg       = GOAL_CONFIG[p.goal];
  const targetCal = Math.round(tdee * cfg.modifier);

  const protein      = Math.round(p.weight * cfg.proteinPerKg);
  const fat          = Math.round(p.weight * cfg.fatPerKg);
  const proteinKcal  = protein * 4;
  const fatKcal      = fat * 9;
  const carbKcal     = Math.max(0, targetCal - proteinKcal - fatKcal);
  const carbs        = Math.round(carbKcal / 4);

  return { bmr: Math.round(bmr), tdee, targetCal, protein, fat, carbs, proteinKcal, fatKcal, carbKcal, cfg };
}

/* =========================================================
   WORKOUT PLAN DATA
   ========================================================= */
const PLANS = {
  strength: {
    beginner: {
      split: '3-Day Full Body Strength',
      schedule: [
        { day: 'Monday',    session: 'Full Body A', rest: false, exercises: [
          { name: 'Barbell Squat',     sets: 3, reps: '5',   rest: '3 min' },
          { name: 'Bench Press',       sets: 3, reps: '5',   rest: '3 min' },
          { name: 'Barbell Row',       sets: 3, reps: '5',   rest: '3 min' },
          { name: 'Overhead Press',    sets: 2, reps: '8',   rest: '2 min' },
          { name: 'Plank',             sets: 3, reps: '45s', rest: '45s'   },
        ]},
        { day: 'Tuesday',   session: 'Rest / Active Recovery', rest: true },
        { day: 'Wednesday', session: 'Full Body B', rest: false, exercises: [
          { name: 'Deadlift',          sets: 3, reps: '5',    rest: '4 min' },
          { name: 'Incline Press',     sets: 3, reps: '6–8',  rest: '3 min' },
          { name: 'Pull-ups',          sets: 3, reps: 'Max',  rest: '2 min' },
          { name: 'Romanian Deadlift', sets: 3, reps: '8',    rest: '2 min' },
          { name: 'Dips',              sets: 2, reps: '8–10', rest: '90s'   },
        ]},
        { day: 'Thursday',  session: 'Rest / Active Recovery', rest: true },
        { day: 'Friday',    session: 'Full Body A', rest: false, exercises: [
          { name: 'Front Squat',       sets: 3, reps: '5',  rest: '3 min' },
          { name: 'Close Grip Bench',  sets: 3, reps: '6',  rest: '3 min' },
          { name: 'Pendlay Row',       sets: 3, reps: '5',  rest: '3 min' },
          { name: 'Lateral Raises',    sets: 3, reps: '12', rest: '60s'   },
          { name: 'Ab Wheel Rollout',  sets: 3, reps: '10', rest: '60s'   },
        ]},
        { day: 'Saturday',  session: 'Rest', rest: true },
        { day: 'Sunday',    session: 'Rest', rest: true },
      ]
    },
    intermediate: {
      split: '4-Day Upper/Lower',
      schedule: [
        { day: 'Monday',    session: 'Upper A', rest: false, exercises: [
          { name: 'Bench Press',       sets: 4, reps: '4–6', rest: '3 min' },
          { name: 'Barbell Row',       sets: 4, reps: '5',   rest: '3 min' },
          { name: 'Overhead Press',    sets: 3, reps: '6–8', rest: '3 min' },
          { name: 'Weighted Pull-ups', sets: 3, reps: '5',   rest: '3 min' },
          { name: 'Barbell Curl',      sets: 3, reps: '10',  rest: '60s'   },
        ]},
        { day: 'Tuesday',   session: 'Lower A', rest: false, exercises: [
          { name: 'Squat',             sets: 4, reps: '4–6',  rest: '4 min' },
          { name: 'Romanian Deadlift', sets: 3, reps: '8',    rest: '3 min' },
          { name: 'Leg Press',         sets: 3, reps: '8–10', rest: '2 min' },
          { name: 'Calf Raises',       sets: 4, reps: '12',   rest: '60s'   },
          { name: 'Planks',            sets: 3, reps: '60s',  rest: '45s'   },
        ]},
        { day: 'Wednesday', session: 'Rest / Light Cardio', rest: true },
        { day: 'Thursday',  session: 'Upper B', rest: false, exercises: [
          { name: 'Incline Press',    sets: 4, reps: '5–7', rest: '3 min' },
          { name: 'Cable Row',        sets: 4, reps: '6–8', rest: '3 min' },
          { name: 'Dumbbell OHP',     sets: 3, reps: '8',   rest: '2 min' },
          { name: 'Lat Pulldown',     sets: 3, reps: '8',   rest: '2 min' },
          { name: 'Tricep Pushdown',  sets: 3, reps: '12',  rest: '60s'   },
        ]},
        { day: 'Friday',    session: 'Lower B', rest: false, exercises: [
          { name: 'Deadlift',         sets: 4, reps: '4–5',     rest: '4 min' },
          { name: 'Front Squat',      sets: 3, reps: '6',       rest: '3 min' },
          { name: 'Leg Curl',         sets: 3, reps: '10',      rest: '90s'   },
          { name: 'Walking Lunges',   sets: 3, reps: '12 each', rest: '90s'   },
          { name: 'Ab Circuit',       sets: 1, reps: '8 min',   rest: '—'     },
        ]},
        { day: 'Saturday',  session: 'Rest', rest: true },
        { day: 'Sunday',    session: 'Rest', rest: true },
      ]
    },
    advanced: {
      split: '5-Day Push / Pull / Legs',
      schedule: [
        { day: 'Monday',    session: 'Push', rest: false, exercises: [
          { name: 'Bench Press',       sets: 5, reps: '3–5',  rest: '4 min' },
          { name: 'Overhead Press',    sets: 4, reps: '5',    rest: '3 min' },
          { name: 'Incline DB Press',  sets: 3, reps: '8',    rest: '2 min' },
          { name: 'Lateral Raises',    sets: 4, reps: '15',   rest: '60s'   },
          { name: 'Tricep Pushdown',   sets: 3, reps: '12',   rest: '60s'   },
        ]},
        { day: 'Tuesday',   session: 'Pull', rest: false, exercises: [
          { name: 'Deadlift',          sets: 5, reps: '3–5',  rest: '4 min' },
          { name: 'Weighted Pull-ups', sets: 4, reps: '5',    rest: '3 min' },
          { name: 'Pendlay Row',       sets: 4, reps: '5',    rest: '3 min' },
          { name: 'Face Pulls',        sets: 3, reps: '15',   rest: '60s'   },
          { name: 'Barbell Curl',      sets: 3, reps: '10',   rest: '60s'   },
        ]},
        { day: 'Wednesday', session: 'Legs', rest: false, exercises: [
          { name: 'Squat',             sets: 5, reps: '3–5',  rest: '4 min' },
          { name: 'Romanian Deadlift', sets: 4, reps: '8',    rest: '3 min' },
          { name: 'Leg Press',         sets: 3, reps: '10',   rest: '2 min' },
          { name: 'Leg Curl',          sets: 3, reps: '12',   rest: '90s'   },
          { name: 'Calf Raises',       sets: 5, reps: '15',   rest: '60s'   },
        ]},
        { day: 'Thursday',  session: 'Rest', rest: true },
        { day: 'Friday',    session: 'Push + Accessory', rest: false, exercises: [
          { name: 'Close Grip Bench',  sets: 4, reps: '6',     rest: '3 min' },
          { name: 'Dumbbell OHP',      sets: 3, reps: '10',    rest: '2 min' },
          { name: 'Cable Flyes',       sets: 3, reps: '15',    rest: '60s'   },
          { name: 'Skull Crushers',    sets: 3, reps: '10',    rest: '90s'   },
          { name: 'Core Circuit',      sets: 1, reps: '10 min',rest: '—'     },
        ]},
        { day: 'Saturday',  session: 'Pull + Accessory', rest: false, exercises: [
          { name: 'Rack Pull',         sets: 4, reps: '5',    rest: '3 min' },
          { name: 'Cable Row',         sets: 4, reps: '10',   rest: '2 min' },
          { name: 'Lat Pulldown',      sets: 3, reps: '12',   rest: '90s'   },
          { name: 'Rear Delt Flyes',   sets: 3, reps: '15',   rest: '60s'   },
          { name: 'Hammer Curl',       sets: 3, reps: '12',   rest: '60s'   },
        ]},
        { day: 'Sunday',    session: 'Rest', rest: true },
      ]
    },
  },
  hypertrophy: {
    beginner: {
      split: '3-Day Push / Pull / Legs',
      schedule: [
        { day: 'Monday',    session: 'Push (Chest, Shoulders, Triceps)', rest: false, exercises: [
          { name: 'Incline DB Press',  sets: 3, reps: '10–12', rest: '90s' },
          { name: 'Flat Bench Press',  sets: 3, reps: '10–12', rest: '90s' },
          { name: 'Lateral Raises',    sets: 3, reps: '15',    rest: '60s' },
          { name: 'Overhead Press',    sets: 2, reps: '12',    rest: '90s' },
          { name: 'Tricep Pushdown',   sets: 3, reps: '15',    rest: '60s' },
        ]},
        { day: 'Tuesday',   session: 'Rest', rest: true },
        { day: 'Wednesday', session: 'Pull (Back & Biceps)', rest: false, exercises: [
          { name: 'Lat Pulldown',      sets: 4, reps: '10–12', rest: '90s'   },
          { name: 'Seated Cable Row',  sets: 3, reps: '12',    rest: '90s'   },
          { name: 'Pull-ups',          sets: 3, reps: 'Max',   rest: '2 min' },
          { name: 'Face Pulls',        sets: 3, reps: '15',    rest: '60s'   },
          { name: 'DB Bicep Curl',     sets: 3, reps: '12–15', rest: '60s'   },
        ]},
        { day: 'Thursday',  session: 'Rest', rest: true },
        { day: 'Friday',    session: 'Legs & Core', rest: false, exercises: [
          { name: 'Leg Press',         sets: 4, reps: '12–15', rest: '90s' },
          { name: 'Romanian Deadlift', sets: 3, reps: '12',    rest: '90s' },
          { name: 'Leg Curl',          sets: 3, reps: '12–15', rest: '60s' },
          { name: 'Calf Raises',       sets: 4, reps: '15–20', rest: '60s' },
          { name: 'Plank Holds',       sets: 3, reps: '45s',   rest: '45s' },
        ]},
        { day: 'Saturday',  session: 'Rest', rest: true },
        { day: 'Sunday',    session: 'Rest', rest: true },
      ]
    },
    intermediate: {
      split: '4-Day Body Part Split',
      schedule: [
        { day: 'Monday',    session: 'Chest & Triceps', rest: false, exercises: [
          { name: 'Flat Bench Press',  sets: 4, reps: '8–10',  rest: '90s' },
          { name: 'Incline DB Press',  sets: 3, reps: '10–12', rest: '90s' },
          { name: 'Cable Flyes',       sets: 3, reps: '12–15', rest: '60s' },
          { name: 'Dips',              sets: 3, reps: '10–12', rest: '90s' },
          { name: 'Skull Crushers',    sets: 3, reps: '12',    rest: '60s' },
        ]},
        { day: 'Tuesday',   session: 'Back & Biceps', rest: false, exercises: [
          { name: 'Pull-ups',          sets: 4, reps: 'Max',   rest: '2 min' },
          { name: 'Barbell Row',       sets: 4, reps: '8–10',  rest: '90s'   },
          { name: 'Lat Pulldown',      sets: 3, reps: '10–12', rest: '90s'   },
          { name: 'DB Bicep Curl',     sets: 3, reps: '12–15', rest: '60s'   },
          { name: 'Hammer Curl',       sets: 3, reps: '12',    rest: '60s'   },
        ]},
        { day: 'Wednesday', session: 'Rest / Light Cardio', rest: true },
        { day: 'Thursday',  session: 'Legs', rest: false, exercises: [
          { name: 'Squat',             sets: 4, reps: '10–12', rest: '2 min' },
          { name: 'Romanian Deadlift', sets: 3, reps: '10–12', rest: '90s'   },
          { name: 'Leg Press',         sets: 3, reps: '12–15', rest: '90s'   },
          { name: 'Leg Curl',          sets: 3, reps: '12–15', rest: '60s'   },
          { name: 'Calf Raises',       sets: 4, reps: '15–20', rest: '60s'   },
        ]},
        { day: 'Friday',    session: 'Shoulders & Arms', rest: false, exercises: [
          { name: 'Overhead Press',    sets: 4, reps: '8–10',  rest: '90s' },
          { name: 'Lateral Raises',    sets: 4, reps: '15–20', rest: '60s' },
          { name: 'Rear Delt Flyes',   sets: 3, reps: '15',    rest: '60s' },
          { name: 'EZ Bar Curl',       sets: 3, reps: '12',    rest: '60s' },
          { name: 'Tricep Overhead',   sets: 3, reps: '12',    rest: '60s' },
        ]},
        { day: 'Saturday',  session: 'Rest / Cardio', rest: true },
        { day: 'Sunday',    session: 'Rest', rest: true },
      ]
    },
    advanced: {
      split: '5-Day Body Part Split',
      schedule: [
        { day: 'Monday',    session: 'Chest', rest: false, exercises: [
          { name: 'Flat Bench Press',  sets: 5, reps: '6–8',    rest: '2 min' },
          { name: 'Incline DB Press',  sets: 4, reps: '8–10',   rest: '90s'   },
          { name: 'Low Cable Fly',     sets: 3, reps: '12–15',  rest: '60s'   },
          { name: 'Dips',              sets: 3, reps: '12–15',  rest: '90s'   },
          { name: 'Push-ups',          sets: 2, reps: 'Failure',rest: '60s'   },
        ]},
        { day: 'Tuesday',   session: 'Back', rest: false, exercises: [
          { name: 'Deadlift',          sets: 4, reps: '5–6',   rest: '3 min' },
          { name: 'Pull-ups',          sets: 4, reps: 'Max',   rest: '2 min' },
          { name: 'Barbell Row',       sets: 4, reps: '8',     rest: '90s'   },
          { name: 'Cable Row',         sets: 3, reps: '12',    rest: '60s'   },
          { name: 'Pullovers',         sets: 3, reps: '15',    rest: '60s'   },
        ]},
        { day: 'Wednesday', session: 'Legs', rest: false, exercises: [
          { name: 'Squat',             sets: 5, reps: '8–10',  rest: '2 min' },
          { name: 'Romanian Deadlift', sets: 4, reps: '10–12', rest: '90s'   },
          { name: 'Leg Press',         sets: 4, reps: '12–15', rest: '90s'   },
          { name: 'Leg Curl',          sets: 3, reps: '12–15', rest: '60s'   },
          { name: 'Calf Raises',       sets: 5, reps: '15–20', rest: '60s'   },
        ]},
        { day: 'Thursday',  session: 'Shoulders', rest: false, exercises: [
          { name: 'OHP (Barbell)',     sets: 4, reps: '6–8',   rest: '2 min' },
          { name: 'Lateral Raises',    sets: 5, reps: '15–20', rest: '45s'   },
          { name: 'Rear Delt Flyes',   sets: 4, reps: '15',    rest: '60s'   },
          { name: 'Front Raises',      sets: 3, reps: '12',    rest: '60s'   },
          { name: 'Face Pulls',        sets: 3, reps: '20',    rest: '45s'   },
        ]},
        { day: 'Friday',    session: 'Arms & Core', rest: false, exercises: [
          { name: 'EZ Bar Curl',       sets: 4, reps: '10–12', rest: '60s' },
          { name: 'Incline DB Curl',   sets: 3, reps: '12',    rest: '60s' },
          { name: 'Skull Crushers',    sets: 4, reps: '10–12', rest: '60s' },
          { name: 'Tricep Overhead',   sets: 3, reps: '12',    rest: '60s' },
          { name: 'Ab Circuit',        sets: 1, reps: '12 min',rest: '—'   },
        ]},
        { day: 'Saturday',  session: 'Rest / Light Cardio', rest: true },
        { day: 'Sunday',    session: 'Rest', rest: true },
      ]
    },
  },
  cardio: {
    beginner: {
      split: '3-Day Cardio Foundation',
      schedule: [
        { day: 'Monday',    session: 'Zone 2 Run', rest: false, exercises: [
          { name: 'Warm-up Walk',      sets: 1, reps: '5 min',      rest: '—' },
          { name: 'Easy Jog',          sets: 1, reps: '20–25 min',  rest: '—' },
          { name: 'Cool-down Walk',    sets: 1, reps: '5 min',      rest: '—' },
          { name: 'Static Stretching', sets: 1, reps: '5 min',      rest: '—' },
        ]},
        { day: 'Tuesday',   session: 'Rest / Mobility', rest: true },
        { day: 'Wednesday', session: 'HIIT Intro', rest: false, exercises: [
          { name: 'Warm-up',           sets: 1, reps: '5 min',          rest: '—'     },
          { name: 'Sprint Intervals',  sets: 6, reps: '30s on/30s off', rest: '2 min' },
          { name: 'Steady State',      sets: 1, reps: '10 min',         rest: '—'     },
          { name: 'Cool-down',         sets: 1, reps: '5 min',          rest: '—'     },
        ]},
        { day: 'Thursday',  session: 'Rest', rest: true },
        { day: 'Friday',    session: 'Long Slow Distance', rest: false, exercises: [
          { name: 'Warm-up Walk',      sets: 1, reps: '5 min',      rest: '—' },
          { name: 'Easy Jog / Walk',   sets: 1, reps: '35–40 min',  rest: '—' },
          { name: 'Cool-down',         sets: 1, reps: '5 min',      rest: '—' },
        ]},
        { day: 'Saturday',  session: 'Rest', rest: true },
        { day: 'Sunday',    session: 'Rest / Walk', rest: true },
      ]
    },
    intermediate: {
      split: '4-Day Run & HIIT Program',
      schedule: [
        { day: 'Monday',    session: 'HIIT Intervals', rest: false, exercises: [
          { name: 'Warm-up',           sets: 1, reps: '8 min',          rest: '—'     },
          { name: 'Sprint Intervals',  sets: 8, reps: '40s on/20s off', rest: '3 min' },
          { name: 'Cool-down Run',     sets: 1, reps: '8 min',          rest: '—'     },
        ]},
        { day: 'Tuesday',   session: 'Rest / Mobility', rest: true },
        { day: 'Wednesday', session: 'Tempo Run', rest: false, exercises: [
          { name: 'Warm-up',           sets: 1, reps: '10 min',    rest: '—' },
          { name: 'Tempo Effort',      sets: 1, reps: '20–25 min', rest: '—' },
          { name: 'Cool-down',         sets: 1, reps: '10 min',    rest: '—' },
        ]},
        { day: 'Thursday',  session: 'Zone 2 Run', rest: false, exercises: [
          { name: 'Conversational Jog',sets: 1, reps: '35–45 min', rest: '—' },
          { name: 'Stretch',           sets: 1, reps: '10 min',    rest: '—' },
        ]},
        { day: 'Friday',    session: 'Rest', rest: true },
        { day: 'Saturday',  session: 'Long Run', rest: false, exercises: [
          { name: 'Easy Pace Run',     sets: 1, reps: '50–60 min', rest: '—' },
          { name: 'Post-run Stretch',  sets: 1, reps: '10 min',    rest: '—' },
        ]},
        { day: 'Sunday',    session: 'Rest', rest: true },
      ]
    },
    advanced: {
      split: '5-Day Advanced Endurance',
      schedule: [
        { day: 'Monday',    session: 'HIIT + Core', rest: false, exercises: [
          { name: 'Sprint Intervals',  sets: 10, reps: '45s on/15s off', rest: '3 min' },
          { name: 'Core Circuit',      sets: 3,  reps: '3 rounds',       rest: '60s'   },
        ]},
        { day: 'Tuesday',   session: 'Tempo Run', rest: false, exercises: [
          { name: 'Warm-up',           sets: 1, reps: '10 min',    rest: '—' },
          { name: 'Tempo Effort',      sets: 1, reps: '30–35 min', rest: '—' },
          { name: 'Cool-down',         sets: 1, reps: '10 min',    rest: '—' },
        ]},
        { day: 'Wednesday', session: 'Easy Recovery Run', rest: false, exercises: [
          { name: 'Easy Zone 1–2 Run', sets: 1, reps: '35 min', rest: '—' },
        ]},
        { day: 'Thursday',  session: 'Track Intervals', rest: false, exercises: [
          { name: '400m Repeats',      sets: 8, reps: '400m',   rest: '90s' },
          { name: 'Cool-down',         sets: 1, reps: '10 min', rest: '—'   },
        ]},
        { day: 'Friday',    session: 'Rest / Mobility', rest: true },
        { day: 'Saturday',  session: 'Long Run', rest: false, exercises: [
          { name: 'Long Slow Run',     sets: 1, reps: '70–80 min', rest: '—' },
          { name: 'Post-run stretch',  sets: 1, reps: '15 min',    rest: '—' },
        ]},
        { day: 'Sunday',    session: 'Rest', rest: true },
      ]
    },
  },
  health: {
    beginner: {
      split: '3-Day Full Body + Cardio',
      schedule: [
        { day: 'Monday',    session: 'Full Body Strength', rest: false, exercises: [
          { name: 'Goblet Squat',      sets: 3, reps: '12',     rest: '90s' },
          { name: 'DB Press',          sets: 3, reps: '12',     rest: '90s' },
          { name: 'Lat Pulldown',      sets: 3, reps: '12',     rest: '90s' },
          { name: 'Romanian Deadlift', sets: 2, reps: '12',     rest: '90s' },
          { name: 'Plank',             sets: 3, reps: '30s',    rest: '30s' },
        ]},
        { day: 'Tuesday',   session: 'Rest / Walk 30 min', rest: true },
        { day: 'Wednesday', session: 'Cardio + Core', rest: false, exercises: [
          { name: 'Bike or Jog',       sets: 1, reps: '25 min',  rest: '—'   },
          { name: 'Dead Bug',          sets: 3, reps: '10 each', rest: '60s' },
          { name: 'Bird Dog',          sets: 3, reps: '10 each', rest: '60s' },
          { name: 'Hip Bridge',        sets: 3, reps: '15',      rest: '45s' },
        ]},
        { day: 'Thursday',  session: 'Rest / Walk', rest: true },
        { day: 'Friday',    session: 'Full Body Strength', rest: false, exercises: [
          { name: 'Split Squat',       sets: 3, reps: '10 each', rest: '90s' },
          { name: 'DB Row',            sets: 3, reps: '12 each', rest: '90s' },
          { name: 'Push-ups',          sets: 3, reps: '12–15',   rest: '60s' },
          { name: 'Hip Thrust',        sets: 3, reps: '12',      rest: '90s' },
          { name: 'Pallof Press',      sets: 3, reps: '12',      rest: '45s' },
        ]},
        { day: 'Saturday',  session: 'Active Recovery / Walk', rest: true },
        { day: 'Sunday',    session: 'Rest', rest: true },
      ]
    },
    intermediate: {
      split: '4-Day Strength + Cardio',
      schedule: [
        { day: 'Monday',    session: 'Upper Body Strength', rest: false, exercises: [
          { name: 'Bench Press',       sets: 3, reps: '8–10',  rest: '90s' },
          { name: 'Pull-ups / Row',    sets: 3, reps: '8–10',  rest: '90s' },
          { name: 'OHP',               sets: 3, reps: '10',    rest: '90s' },
          { name: 'Bicep Curl',        sets: 2, reps: '12',    rest: '60s' },
          { name: 'Tricep Extension',  sets: 2, reps: '12',    rest: '60s' },
        ]},
        { day: 'Tuesday',   session: 'Cardio + Core', rest: false, exercises: [
          { name: 'Cardio (choice)',   sets: 1, reps: '30–40 min', rest: '—' },
          { name: 'Core Circuit',      sets: 3, reps: '10 min',    rest: '—' },
        ]},
        { day: 'Wednesday', session: 'Rest', rest: true },
        { day: 'Thursday',  session: 'Lower Body Strength', rest: false, exercises: [
          { name: 'Squat',             sets: 3, reps: '10',    rest: '90s' },
          { name: 'Romanian Deadlift', sets: 3, reps: '10',    rest: '90s' },
          { name: 'Leg Press',         sets: 3, reps: '12',    rest: '90s' },
          { name: 'Hip Thrust',        sets: 3, reps: '12',    rest: '60s' },
          { name: 'Calf Raises',       sets: 3, reps: '15',    rest: '60s' },
        ]},
        { day: 'Friday',    session: 'Cardio + Mobility', rest: false, exercises: [
          { name: 'Easy Jog or Bike',  sets: 1, reps: '35 min',  rest: '—' },
          { name: 'Full Body Stretch', sets: 1, reps: '10 min',  rest: '—' },
        ]},
        { day: 'Saturday',  session: 'Active Recovery', rest: true },
        { day: 'Sunday',    session: 'Rest', rest: true },
      ]
    },
    advanced: {
      split: '5-Day Strength & Conditioning',
      schedule: [
        { day: 'Monday',    session: 'Upper Body Power', rest: false, exercises: [
          { name: 'Bench Press',       sets: 4, reps: '6',     rest: '2 min' },
          { name: 'Pull-ups',          sets: 4, reps: '8',     rest: '2 min' },
          { name: 'OHP',               sets: 3, reps: '8',     rest: '90s'   },
          { name: 'Finisher Circuit',  sets: 3, reps: '5 min', rest: '—'     },
        ]},
        { day: 'Tuesday',   session: 'HIIT Conditioning', rest: false, exercises: [
          { name: 'Sprint Intervals',  sets: 8, reps: '30s on/30s off', rest: '3 min' },
          { name: 'Core Stability',    sets: 3, reps: '8 min',          rest: '—'     },
        ]},
        { day: 'Wednesday', session: 'Lower Body Strength', rest: false, exercises: [
          { name: 'Squat',             sets: 4, reps: '8',     rest: '2 min' },
          { name: 'Romanian Deadlift', sets: 4, reps: '10',    rest: '90s'   },
          { name: 'Leg Press',         sets: 3, reps: '12',    rest: '90s'   },
          { name: 'Calf Raises',       sets: 4, reps: '15',    rest: '60s'   },
        ]},
        { day: 'Thursday',  session: 'Zone 2 Cardio', rest: false, exercises: [
          { name: 'Easy Run or Bike',  sets: 1, reps: '40–50 min', rest: '—' },
        ]},
        { day: 'Friday',    session: 'Full Body + Mobility', rest: false, exercises: [
          { name: 'Full Body Circuit', sets: 4, reps: '12 min', rest: '—'   },
          { name: 'Yoga / Stretching', sets: 1, reps: '20 min', rest: '—'   },
        ]},
        { day: 'Saturday',  session: 'Rest', rest: true },
        { day: 'Sunday',    session: 'Rest', rest: true },
      ]
    },
  },
};

/* =========================================================
   CARDIO RECOMMENDATIONS
   ========================================================= */
const CARDIO_RECS = {
  strength: [
    { type: 'Zone 2',   title: 'Low-Intensity Cardio',   detail: '2–3 sessions per week. Keep heart rate at 60–70% max. Supports recovery and cardiovascular health without impacting strength gains.',   tags: ['2–3×/week', '20–30 min', 'Easy pace'] },
    { type: 'Optional', title: 'Post-Workout Walk',       detail: '10–15 minute walk after lifting sessions helps with blood flow, recovery, and keeping daily activity high without added fatigue.',       tags: ['Daily', '10–15 min', 'Low effort'] },
    { type: 'Limit',    title: 'Avoid High-Impact HIIT',  detail: 'Excessive HIIT will interfere with strength adaptations and recovery. Prioritise steady state cardio while building your strength base.', tags: ['Limit frequency', 'Manage fatigue'] },
  ],
  hypertrophy: [
    { type: 'Zone 2',  title: 'Low-Intensity Cardio',    detail: '2–3 sessions per week, 20–30 min. Improves nutrient partitioning and recovery. Never do cardio to the point of fatigue before lifting.',       tags: ['2–3×/week', '20–30 min', 'HR: 60–70%'] },
    { type: 'Timing',  title: 'Cardio Timing Matters',   detail: 'Always do cardio AFTER weight training, or on separate days. Cardio before lifting significantly reduces performance and muscle stimulus.',     tags: ['Post-lifting', 'Or separate days'] },
    { type: 'HIIT',    title: 'Weekly HIIT Session',     detail: '1 HIIT session per week is beneficial for heart health and caloric expenditure. Keep it short (15–20 min) and on rest days from lifting.',    tags: ['1×/week', '15–20 min', 'Rest days'] },
  ],
  cardio: [
    { type: 'Zone 2',    title: 'Build Your Aerobic Base', detail: '3–4 sessions per week at 60–70% max heart rate. This is the foundation of all endurance gains. Most beginners skip this — don\'t.', tags: ['3–4×/week', '30–60 min', 'Conversational pace'] },
    { type: 'HIIT',      title: 'High-Intensity Intervals',detail: '1–2 sessions per week. Sprint intervals, rowing, or cycling. 20–30 min total including warm-up. Builds VO2 max and anaerobic capacity.',  tags: ['1–2×/week', '20–30 min', 'Max effort'] },
    { type: 'Recovery',  title: 'Active Recovery',         detail: 'At least 1 full rest day with optional light walking. Adequate sleep and nutrition are as important as training for endurance development.',  tags: ['1×/week rest', 'Light walking OK'] },
  ],
  health: [
    { type: 'Daily',   title: '8,000+ Steps per Day', detail: 'The single highest-ROI health habit. Daily step count has strong evidence for cardiovascular health, metabolic health, and longevity.',     tags: ['Daily', '8,000–10,000 steps'] },
    { type: 'Zone 2',  title: 'Steady State Cardio',   detail: '2 sessions per week, 30–45 min. Running, cycling, swimming — any sustained aerobic activity at a conversational pace.',                 tags: ['2×/week', '30–45 min'] },
    { type: 'HIIT',    title: 'Optional HIIT',          detail: 'Once per week if you enjoy it. 20 min of HIIT provides excellent cardiovascular stimulus in minimal time — ideal for busy schedules.', tags: ['Optional', '1×/week', '20 min'] },
  ],
};

/* =========================================================
   TIPS — SVG icons instead of emoji
   ========================================================= */
const ICON_TREND  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`;
const ICON_MOON   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`;
const ICON_PROTEIN= `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2z"/><path d="M8 12h8M12 8v8"/></svg>`;
const ICON_STAR   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
const ICON_RULER  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 118 2.83"/><path d="M22 12A10 10 0 0012 2v10z"/></svg>`;
const ICON_CAL    = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
const ICON_DROP   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>`;
const ICON_HEART  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`;
const ICON_CHART  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`;
const ICON_WALK   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="4" r="1"/><path d="M9 20l1.5-5.5L13 18l2-9"/><path d="M6.5 8.5L9 20M17 8l-4 .5"/></svg>`;
const ICON_ZEN    = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`;
const ICON_LEAF   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 8C8 10 5.9 16.17 3.82 19.34a1 1 0 001.66 1.05L12 15s0 5 7 7c0 0 2-11-2-14z"/></svg>`;

const TIPS = {
  strength: [
    { icon: ICON_TREND,   title: 'Progressive Overload', body: 'Add weight or reps every session. This is the only way to get stronger. Track your lifts every workout.' },
    { icon: ICON_MOON,    title: 'Sleep is Training',    body: 'Strength gains happen during recovery, not during training. Aim for 7–9 hours. Poor sleep kills progress.' },
    { icon: ICON_PROTEIN, title: 'Prioritise Protein',   body: 'Hit your protein target every day. It\'s the most important nutritional factor for strength and muscle retention.' },
    { icon: ICON_STAR,    title: 'Master the Basics First', body: 'Squat, deadlift, bench, row. Perfect technique on these moves before adding complexity or weight.' },
  ],
  hypertrophy: [
    { icon: ICON_CHART,   title: 'Train Close to Failure',   body: 'Effective reps are the last 3–5 before failure. Aim for RIR 1–2 on most working sets.' },
    { icon: ICON_RULER,   title: 'Full Range of Motion',      body: 'Stretched-position loading drives more hypertrophy than partial reps under heavier load.' },
    { icon: ICON_CAL,     title: 'Consistency Over Intensity',body: 'Showing up 4 days a week for 12 months beats any program that burns you out in 6 weeks.' },
    { icon: ICON_DROP,    title: 'Hydration & Nutrition Timing', body: 'Eat a protein-carb meal 1–2 hours before training. Post-workout nutrition matters but less than total daily intake.' },
  ],
  cardio: [
    { icon: ICON_HEART,   title: 'Zone 2 is the Foundation', body: '80% of your cardio should be easy (Zone 2). Most people go too hard too often — this limits long-term development.' },
    { icon: ICON_CHART,   title: 'Track Your Heart Rate',    body: 'Use a heart rate monitor. Zone 2: 60–70% max HR. Max HR ≈ 220 − age. Don\'t guess — measure it.' },
    { icon: ICON_TREND,   title: 'Add Strength Work',        body: '2 strength sessions per week massively improve running economy, power, and injury resistance.' },
    { icon: ICON_CAL,     title: 'Build Volume Gradually',   body: 'Increase weekly mileage by no more than 10% per week. Doing too much too soon is the top cause of running injuries.' },
  ],
  health: [
    { icon: ICON_MOON,    title: 'Sleep First',          body: 'If you only optimise one thing for health, make it sleep. 7–9 hours affects hormones, mood, metabolism, and performance.' },
    { icon: ICON_LEAF,    title: 'Eat Mostly Whole Foods',body: 'You don\'t need a perfect diet. Eat mostly whole, minimally processed foods. Get your protein. Everything else is details.' },
    { icon: ICON_WALK,    title: 'Walk More',            body: 'Daily walking is one of the most evidence-based health interventions. Take the stairs. Park further away. Get 8,000+ steps.' },
    { icon: ICON_ZEN,     title: 'Manage Stress',        body: 'Chronic stress raises cortisol, impairs recovery, and drives poor nutrition choices. Exercise is medicine — but so is rest.' },
  ],
};

/* =========================================================
   GENERATE DASHBOARD
   ========================================================= */
function generateDashboard() {
  const nut      = calcNutrition(profile);
  const expKey   = profile.experience || 'beginner';
  const planData = PLANS[profile.goal]?.[expKey] || PLANS.health.beginner;
  const cardio   = CARDIO_RECS[profile.goal] || CARDIO_RECS.health;
  const tips     = TIPS[profile.goal] || TIPS.health;

  /* Header */
  document.getElementById('db-goal-label').textContent =
    GOAL_CONFIG[profile.goal]?.goalLabel || 'Your Plan';
  document.getElementById('db-profile-line').textContent =
    `${profile.gender === 'male' ? 'Male' : 'Female'} · ${profile.age} yrs · ${profile.weight}kg · ${profile.height}cm · ${capitalize(profile.experience)}`;

  /* Nutrition */
  document.getElementById('db-calories').textContent    = nut.targetCal.toLocaleString();
  document.getElementById('db-calorie-note').textContent = GOAL_CONFIG[profile.goal]?.label;
  document.getElementById('db-bmr-line').textContent    = `BMR: ${nut.bmr} kcal · TDEE: ${nut.tdee.toLocaleString()} kcal`;

  document.getElementById('db-protein').textContent = nut.protein + 'g';
  document.getElementById('db-carbs').textContent   = nut.carbs + 'g';
  document.getElementById('db-fat').textContent     = nut.fat + 'g';
  document.getElementById('db-protein-kcal').textContent = nut.proteinKcal.toLocaleString() + ' kcal';
  document.getElementById('db-carbs-kcal').textContent   = nut.carbKcal.toLocaleString() + ' kcal';
  document.getElementById('db-fat-kcal').textContent     = nut.fatKcal.toLocaleString() + ' kcal';

  // Macro bars (animate in on next paint)
  setTimeout(() => {
    const total = nut.targetCal;
    document.getElementById('bar-protein').style.width = ((nut.proteinKcal / total) * 100) + '%';
    document.getElementById('bar-carbs').style.width   = ((nut.carbKcal / total) * 100) + '%';
    document.getElementById('bar-fat').style.width     = ((nut.fatKcal / total) * 100) + '%';
  }, 200);

  /* Workout Plan */
  document.getElementById('db-split-label').textContent = planData.split;
  const weekEl = document.getElementById('db-workout-week');
  weekEl.innerHTML = planData.schedule.map(day => renderWorkoutDay(day)).join('');

  // Wire toggle
  weekEl.querySelectorAll('.workout-day__header').forEach(header => {
    header.addEventListener('click', () => {
      const body = header.nextElementSibling;
      const tog  = header.querySelector('.workout-day__toggle');
      if (!body || body.classList.contains('workout-day--rest-body')) return;
      const isOpen = body.classList.toggle('open');
      if (tog) tog.classList.toggle('open', isOpen);
    });
  });

  /* Cardio */
  document.getElementById('db-cardio').innerHTML = cardio.map(c => `
    <div class="cardio-card">
      <div class="cardio-card__type">${c.type}</div>
      <h4>${c.title}</h4>
      <div class="cardio-card__detail">${c.detail}</div>
      <div class="cardio-card__meta">${c.tags.map(t => `<span>${t}</span>`).join('')}</div>
    </div>
  `).join('');

  /* Tips — SVG icons */
  document.getElementById('db-tips').innerHTML = tips.map(t => `
    <div class="tip-card">
      <div class="tip-card__icon">${t.icon}</div>
      <div><h4>${t.title}</h4><p>${t.body}</p></div>
    </div>
  `).join('');
}

// Toggle chevron SVG
const CHEVRON_DOWN = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>`;

function renderWorkoutDay(day) {
  const dotClass = day.rest ? '' : 'workout-day__dot--active';
  const body = day.rest ? '' : `
    <div class="workout-day__body">
      <table class="exercise-table">
        <thead><tr><th>Exercise</th><th>Sets</th><th>Reps</th><th>Rest</th></tr></thead>
        <tbody>
          ${day.exercises.map(ex => `
            <tr>
              <td>${ex.name}</td>
              <td>${ex.sets}</td>
              <td>${ex.reps}</td>
              <td>${ex.rest}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  return `
    <div class="workout-day${day.rest ? ' workout-day--rest' : ''}">
      <div class="workout-day__header">
        <div class="workout-day__dot ${dotClass}"></div>
        <div class="workout-day__name">${day.day}</div>
        <div class="workout-day__session">${day.session}</div>
        ${!day.rest ? `<div class="workout-day__toggle">${CHEVRON_DOWN}</div>` : ''}
      </div>
      ${body}
    </div>
  `;
}

/* =========================================================
   EXERCISE LIBRARY DATA
   ========================================================= */
const EXERCISES = [
  { name: 'Barbell Squat',     cat: 'strength',    muscles: 'Quads, Glutes, Core, Lower Back',  sets: '4–5', reps: '3–5',    rest: '4 min' },
  { name: 'Deadlift',          cat: 'strength',    muscles: 'Posterior Chain, Traps, Core',     sets: '3–5', reps: '3–5',    rest: '4 min' },
  { name: 'Bench Press',       cat: 'strength',    muscles: 'Chest, Triceps, Front Delts',      sets: '4',   reps: '4–6',    rest: '3 min' },
  { name: 'Overhead Press',    cat: 'strength',    muscles: 'Shoulders, Triceps, Core',         sets: '4',   reps: '4–6',    rest: '3 min' },
  { name: 'Barbell Row',       cat: 'strength',    muscles: 'Back, Biceps, Rear Delts',         sets: '4',   reps: '5',      rest: '3 min' },
  { name: 'Romanian Deadlift', cat: 'strength',    muscles: 'Hamstrings, Glutes, Lower Back',   sets: '3',   reps: '5–8',    rest: '2 min' },
  { name: 'Front Squat',       cat: 'strength',    muscles: 'Quads, Core, Upper Back',          sets: '3',   reps: '5–8',    rest: '3 min' },
  { name: 'Close Grip Bench',  cat: 'strength',    muscles: 'Triceps, Chest, Front Delts',      sets: '4',   reps: '6–8',    rest: '2 min' },
  { name: 'Incline DB Press',  cat: 'hypertrophy', muscles: 'Upper Chest, Front Delts',         sets: '4',   reps: '10–12',  rest: '90s'   },
  { name: 'Cable Fly',         cat: 'hypertrophy', muscles: 'Chest (peak contraction)',         sets: '3',   reps: '12–15',  rest: '60s'   },
  { name: 'Lat Pulldown',      cat: 'hypertrophy', muscles: 'Lats, Biceps, Rear Delts',         sets: '4',   reps: '10–12',  rest: '90s'   },
  { name: 'Seated Cable Row',  cat: 'hypertrophy', muscles: 'Mid Back, Biceps, Rear Delts',     sets: '3',   reps: '12',     rest: '90s'   },
  { name: 'Lateral Raises',    cat: 'hypertrophy', muscles: 'Side Delts',                       sets: '4',   reps: '15–20',  rest: '60s'   },
  { name: 'Leg Press',         cat: 'hypertrophy', muscles: 'Quads, Glutes',                    sets: '4',   reps: '12–15',  rest: '90s'   },
  { name: 'Leg Curl',          cat: 'hypertrophy', muscles: 'Hamstrings',                       sets: '3',   reps: '12–15',  rest: '60s'   },
  { name: 'Calf Raises',       cat: 'hypertrophy', muscles: 'Gastrocnemius, Soleus',            sets: '4',   reps: '15–20',  rest: '60s'   },
  { name: 'EZ Bar Curl',       cat: 'hypertrophy', muscles: 'Biceps, Brachialis',               sets: '3',   reps: '12',     rest: '60s'   },
  { name: 'Skull Crushers',    cat: 'hypertrophy', muscles: 'Triceps (long head)',              sets: '3',   reps: '10–12',  rest: '60s'   },
  { name: 'HIIT Sprints',      cat: 'cardio',      muscles: 'Full Body, Cardiovascular',        sets: '8–10 rounds', reps: '30s on/30s off', rest: '2–3 min' },
  { name: 'Steady State Run',  cat: 'cardio',      muscles: 'Cardiovascular, Legs',             sets: '1',   reps: '30–45 min', rest: '—'  },
  { name: '400m Repeats',      cat: 'cardio',      muscles: 'Legs, Cardiovascular',             sets: '6–8', reps: '400m',   rest: '90s'   },
  { name: 'Rowing Machine',    cat: 'cardio',      muscles: 'Full Body, Cardiovascular',        sets: '1',   reps: '20–30 min', rest: '—'  },
  { name: 'Jump Rope',         cat: 'cardio',      muscles: 'Calves, Coordination, Cardio',     sets: '5',   reps: '3 min',  rest: '60s'   },
  { name: 'Zone 2 Cycling',    cat: 'cardio',      muscles: 'Legs, Cardiovascular',             sets: '1',   reps: '45–60 min', rest: '—'  },
  { name: 'Push-ups',          cat: 'bodyweight',  muscles: 'Chest, Triceps, Shoulders, Core',  sets: '4',   reps: '15–20',  rest: '60s'   },
  { name: 'Pull-ups',          cat: 'bodyweight',  muscles: 'Back, Biceps, Core',               sets: '3',   reps: 'Max',    rest: '2 min' },
  { name: 'Dips',              cat: 'bodyweight',  muscles: 'Chest, Triceps, Front Delts',      sets: '3',   reps: 'Max',    rest: '90s'   },
  { name: 'Bodyweight Squat',  cat: 'bodyweight',  muscles: 'Quads, Glutes, Calves',            sets: '4',   reps: '20–25',  rest: '60s'   },
  { name: 'Plank',             cat: 'bodyweight',  muscles: 'Core, Shoulders',                  sets: '3',   reps: '45–60s', rest: '45s'   },
  { name: 'Inverted Row',      cat: 'bodyweight',  muscles: 'Back, Biceps',                     sets: '3',   reps: '12–15',  rest: '60s'   },
  { name: 'Pistol Squat',      cat: 'bodyweight',  muscles: 'Quads, Glutes, Balance',           sets: '3',   reps: '8 each', rest: '90s'   },
  { name: 'Mountain Climbers', cat: 'bodyweight',  muscles: 'Core, Shoulders, Cardio',          sets: '3',   reps: '30s',    rest: '30s'   },
];

const TAG_LABELS = {
  strength:    'Strength',
  hypertrophy: 'Hypertrophy',
  cardio:      'Cardio',
  bodyweight:  'Bodyweight',
};

function renderLibrary(filter) {
  const grid = document.getElementById('exerciseGrid');
  if (!grid) return;
  const list = filter === 'all' ? EXERCISES : EXERCISES.filter(e => e.cat === filter);
  grid.innerHTML = list.map(ex => `
    <div class="ex-card" data-cat="${ex.cat}">
      <div class="ex-card__top">
        <div class="ex-card__name">${ex.name}</div>
        <div class="ex-card__tag ex-card__tag--${ex.cat}">${TAG_LABELS[ex.cat]}</div>
      </div>
      <div class="ex-card__muscles">${ex.muscles}</div>
      <div class="ex-card__stats">
        <div class="ex-stat">
          <div class="ex-stat__val">${ex.sets}</div>
          <div class="ex-stat__label">Sets</div>
        </div>
        <div class="ex-stat">
          <div class="ex-stat__val">${ex.reps}</div>
          <div class="ex-stat__label">Reps</div>
        </div>
        <div class="ex-stat">
          <div class="ex-stat__val">${ex.rest}</div>
          <div class="ex-stat__label">Rest</div>
        </div>
      </div>
    </div>
  `).join('');
}

/* Library filters */
document.getElementById('libFilters')?.addEventListener('click', e => {
  const pill = e.target.closest('.filter-pill');
  if (!pill) return;
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('filter-pill--active'));
  pill.classList.add('filter-pill--active');
  renderLibrary(pill.dataset.filter);
});

/* =========================================================
   HELPERS
   ========================================================= */
function capitalize(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* =========================================================
   INIT
   ========================================================= */
updateProgress();
showView('home');

})();
