const labels = ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'];
const titles = {
  'getting-started': 'Getting Started',
  'audio-setup': 'Audio Setup',
  'starting-recording': 'Starting a Recording',
  'recording-controls': 'Recording Controls',
  'video-layout': 'Video Layout',
  editor: 'Editor',
  timeline: 'Timeline',
  exporting: 'Exporting',
  'final-video': 'Final Video',
  'overall-experience': 'Overall Experience'
};

const header = document.querySelector('[data-header]');
const navToggle = document.querySelector('[data-nav-toggle]');
const navMenu = document.querySelector('[data-nav-menu]');
const form = document.querySelector('[data-survey-form]');
const progress = document.querySelector('[data-progress]');
const progressBar = document.querySelector('[data-progress-bar]');
const completed = document.querySelector('[data-completed]');
const error = document.querySelector('[data-form-error]');
const finish = document.querySelector('[data-finish]');
const status = document.querySelector('[data-status]');
let report = '';

document.querySelectorAll('[data-year]').forEach((node) => {
  node.textContent = new Date().getFullYear();
});

const closeMenu = () => {
  if (!navToggle || !navMenu) return;
  navToggle.classList.remove('is-open');
  navMenu.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
};

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const open = !navMenu.classList.contains('is-open');
    navToggle.classList.toggle('is-open', open);
    navMenu.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
  });
  navMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
}

let headerFrame = 0;
window.addEventListener('scroll', () => {
  if (headerFrame) return;
  headerFrame = requestAnimationFrame(() => {
    headerFrame = 0;
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 28);
  });
}, { passive: true });

document.querySelectorAll('[data-rating]').forEach((host) => {
  const key = host.dataset.rating;
  labels.forEach((label, index) => {
    const value = index + 1;
    const option = document.createElement('label');
    option.innerHTML = `<input type="radio" name="rating-${key}" value="${value}" required><span><strong>${value}</strong><small>${label}</small></span>`;
    host.append(option);
  });
});

const updateProgress = () => {
  const rated = document.querySelectorAll('.rating input:checked').length;
  completed.textContent = `${rated} of 10 rated`;
  progress.setAttribute('aria-valuenow', String(rated));
  progressBar.style.width = `${rated * 10}%`;
  if (rated === 10) completed.textContent = 'All 10 rated';
};

form.addEventListener('change', (event) => {
  if (event.target.matches('.rating input')) updateProgress();
});

const buildReport = (data) => {
  const lines = [
    'REACTION CREATOR — PREMIUM BETA UX SURVEY',
    `Completed: ${new Date().toISOString()}`
  ];

  Object.keys(titles).forEach((key, index) => {
    const rating = data.get(`rating-${key}`);
    const feedback = String(data.get(`feedback-${key}`) || '').trim();
    lines.push(
      '',
      `${index + 1}. ${titles[key]}`,
      `Rating: ${rating}/5 — ${labels[Number(rating) - 1]}`,
      `Feedback: ${feedback || 'No written feedback'}`
    );
  });

  return lines.join('\n');
};

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) {
    error.textContent = 'Please choose a rating for every statement.';
    const firstMissing = form.querySelector('.rating input:invalid');
    if (firstMissing) firstMissing.closest('.question-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  error.textContent = '';
  report = buildReport(new FormData(form));
  form.hidden = true;
  document.querySelector('.survey-intro').hidden = true;
  document.querySelector('.survey-progress').hidden = true;
  finish.hidden = false;
  window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
});

document.querySelector('[data-send]').addEventListener('click', () => {
  const subject = encodeURIComponent('Reaction Creator Premium Beta UX Survey');
  const body = encodeURIComponent(report);
  status.textContent = 'Opening your email app…';
  window.location.href = `mailto:reactioncreatorteam@gmail.com?subject=${subject}&body=${body}`;
});

document.querySelector('[data-copy]').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(report);
    status.textContent = 'Answers copied. Paste them into an email to reactioncreatorteam@gmail.com.';
  } catch {
    status.textContent = 'Copy was blocked. Use “Send by email” instead.';
  }
});

updateProgress();
