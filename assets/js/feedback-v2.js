const labels = ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'];
const submissionUrl = 'https://script.google.com/macros/s/AKfycbwEI6a8HfX-i46GYGFufgxBW-6tR5N5ru-j4siaoXm_qA8NdaaFdXo5c1BHnq4Z7hMl/exec';
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

const submitWithHiddenForm = (data) => {
  const frameName = `survey-submit-${Date.now()}`;
  const frame = document.createElement('iframe');
  frame.name = frameName;
  frame.hidden = true;
  frame.setAttribute('aria-hidden', 'true');

  const relay = document.createElement('form');
  relay.method = 'POST';
  relay.action = submissionUrl;
  relay.target = frameName;
  relay.hidden = true;

  data.forEach((value, key) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = String(value);
    relay.append(input);
  });

  document.body.append(frame, relay);
  relay.submit();
  window.setTimeout(() => { relay.remove(); frame.remove(); }, 15000);
};

const queueSubmission = (data) => {
  const payload = new URLSearchParams();
  data.forEach((value, key) => payload.append(key, String(value)));

  if (typeof navigator.sendBeacon === 'function' && navigator.sendBeacon(submissionUrl, payload)) return;
  submitWithHiddenForm(data);
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
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Sending…';
  queueSubmission(new FormData(form));
  form.hidden = true;
  document.querySelector('.survey-intro').hidden = true;
  document.querySelector('.survey-progress').hidden = true;
  finish.hidden = false;
  status.textContent = 'Your response has been sent successfully.';
  window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
});

updateProgress();
