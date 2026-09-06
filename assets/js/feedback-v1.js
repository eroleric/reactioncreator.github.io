const header = document.querySelector('[data-header]');
const navToggle = document.querySelector('[data-nav-toggle]');
const navMenu = document.querySelector('[data-nav-menu]');
const study = {
  profile: {},
  tasks: [],
  overall: {},
  startedAt: new Date().toISOString()
};

document.querySelectorAll('[data-year]').forEach((node) => { node.textContent = new Date().getFullYear(); });

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
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
}

let headerFrame = 0;
const updateHeader = () => {
  headerFrame = 0;
  if (header) header.classList.toggle('is-scrolled', window.scrollY > 28);
};
window.addEventListener('scroll', () => {
  if (headerFrame) return;
  headerFrame = requestAnimationFrame(updateHeader);
}, { passive: true });

const tasks = [
  { label: 'Frame + source', title: 'Create a vertical reaction.', description: 'Choose the format you would use for a Short or Reel, then add any source video.' },
  { label: 'Prepare the canvas', title: 'Position the reaction.', description: 'Adjust the creator and source so the composition looks ready to record. Find the swap and mirror controls.' },
  { label: 'Source + camera', title: 'Record with control.', description: 'Start a take, pause the source, pause the recording, resume both, then finish the take.' },
  { label: 'Direct export', title: 'Finish without editing.', description: 'Export the take without opening Editor Mode, then find the finished video again.' },
  { label: 'Projects', title: 'Return to unfinished work.', description: 'Leave a reaction unfinished, find it again, and continue from where you stopped.' }
];

const views = Array.from(document.querySelectorAll('[data-view]'));
const progress = document.querySelector('[data-progress]');
const progressBar = document.querySelector('[data-progress-bar]');
const progressLabel = document.querySelector('[data-progress-label]');
const progressCount = document.querySelector('[data-progress-count]');
const totalSteps = tasks.length + 2;
let step = 1;
let taskIndex = 0;
let seconds = 0;
let timerId = 0;
let taskRunning = false;

const showView = (name) => {
  views.forEach((view) => {
    const active = view.dataset.view === name;
    view.hidden = !active;
    view.classList.toggle('is-active', active);
  });
  window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
};

const updateProgress = (label) => {
  const value = Math.min(step, totalSteps);
  progress.setAttribute('aria-valuemax', String(totalSteps));
  progress.setAttribute('aria-valuenow', String(value));
  progressBar.style.width = `${(value / totalSteps) * 100}%`;
  progressLabel.textContent = label;
  progressCount.textContent = `Step ${value} of ${totalSteps}`;
};

const profileForm = document.querySelector('[data-profile-form]');
const profileError = document.querySelector('[data-profile-error]');
profileForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!profileForm.reportValidity()) return;
  const data = new FormData(profileForm);
  study.profile = Object.fromEntries(data.entries());
  profileError.textContent = '';
  step = 2;
  taskIndex = 0;
  renderTask();
  showView('task');
});

const taskKicker = document.querySelector('[data-task-kicker]');
const taskNumber = document.querySelector('[data-task-number]');
const taskLabel = document.querySelector('[data-task-label]');
const taskTitle = document.querySelector('[data-task-title]');
const taskDescription = document.querySelector('[data-task-description]');
const timer = document.querySelector('[data-timer]');
const taskToggle = document.querySelector('[data-task-toggle]');
const taskStop = document.querySelector('[data-task-stop]');
const taskForm = document.querySelector('[data-task-form]');
const taskError = document.querySelector('[data-task-error]');

const renderTimer = () => {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const remainder = String(seconds % 60).padStart(2, '0');
  timer.textContent = `${minutes}:${remainder}`;
};

const stopTimer = () => {
  if (timerId) window.clearInterval(timerId);
  timerId = 0;
  taskRunning = false;
};

const resetTaskForm = () => {
  stopTimer();
  seconds = 0;
  renderTimer();
  taskForm.reset();
  taskForm.hidden = true;
  taskToggle.disabled = false;
  taskToggle.textContent = 'Start task';
  taskStop.disabled = false;
  taskError.textContent = '';
};

const renderTask = () => {
  const task = tasks[taskIndex];
  resetTaskForm();
  taskKicker.textContent = `Task ${taskIndex + 1} of ${tasks.length}`;
  taskNumber.textContent = String(taskIndex + 1).padStart(2, '0');
  taskLabel.textContent = task.label;
  taskTitle.textContent = task.title;
  taskDescription.textContent = task.description;
  updateProgress(task.label);
};

const revealTaskQuestions = (completion) => {
  stopTimer();
  taskForm.hidden = false;
  taskToggle.disabled = true;
  taskToggle.textContent = 'Task finished';
  taskStop.disabled = true;
  const completionInput = taskForm.querySelector(`input[name="completion"][value="${completion}"]`);
  if (completionInput) completionInput.checked = true;
  taskForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

taskToggle.addEventListener('click', () => {
  if (!taskRunning) {
    taskRunning = true;
    taskToggle.textContent = 'I finished the task';
    timerId = window.setInterval(() => { seconds += 1; renderTimer(); }, 1000);
    return;
  }
  revealTaskQuestions('Yes');
});
taskStop.addEventListener('click', () => revealTaskQuestions('No'));

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!taskForm.reportValidity()) return;
  const data = new FormData(taskForm);
  study.tasks.push({
    task: taskIndex + 1,
    label: tasks[taskIndex].label,
    seconds,
    completion: data.get('completion'),
    ease: data.get('ease'),
    confidence: data.get('confidence'),
    hesitation: String(data.get('hesitation') || '').trim(),
    expectation: String(data.get('expectation') || '').trim()
  });
  if (taskIndex < tasks.length - 1) {
    taskIndex += 1;
    step += 1;
    renderTask();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  stopTimer();
  step = totalSteps;
  buildStatementRatings();
  updateProgress('Final reflection');
  showView('overall');
});

const buildStatementRatings = () => {
  document.querySelectorAll('[data-statement]').forEach((host) => {
    if (host.childElementCount) return;
    host.className = 'statement-rating';
    const key = host.dataset.statement;
    for (let value = 1; value <= 5; value += 1) {
      const label = document.createElement('label');
      label.innerHTML = `<input type="radio" name="statement-${key}" value="${value}" required><span>${value}</span>`;
      host.append(label);
    }
  });
};

const overallForm = document.querySelector('[data-overall-form]');
overallForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!overallForm.reportValidity()) return;
  const data = new FormData(overallForm);
  study.overall = Object.fromEntries(data.entries());
  study.completedAt = new Date().toISOString();
  updateProgress('Ready to share');
  showView('finish');
});

const buildReport = () => {
  const lines = [
    'REACTION CREATOR USABILITY STUDY',
    `Started: ${study.startedAt}`,
    `Completed: ${study.completedAt || new Date().toISOString()}`,
    '',
    'TESTER CONTEXT',
    `Device: ${study.profile.device || ''}`,
    `Android: ${study.profile.android || ''}`,
    `Creation frequency: ${study.profile.cadence || ''}`,
    `Current tool: ${study.profile.currentTool || ''}`,
    '',
    'TASK RESULTS'
  ];
  study.tasks.forEach((result) => {
    lines.push('', `${result.task}. ${result.label}`, `Completion: ${result.completion}`, `Time: ${result.seconds}s`, `Ease: ${result.ease}/7`, `Confidence: ${result.confidence}/5`, `Hesitation: ${result.hesitation || 'None provided'}`, `Expected: ${result.expectation || 'None provided'}`);
  });
  lines.push('', 'OVERALL', `Clear without instructions: ${study.overall['statement-clear']}/5`, `Fast source-to-export flow: ${study.overall['statement-fast']}/5`, `Labels matched expectations: ${study.overall['statement-labels']}/5`, `Confident work was saved: ${study.overall['statement-saved']}/5`, `Would use this workflow: ${study.overall['statement-use']}/5`, `Clearest: ${study.overall.clearest || ''}`, `Most confusing: ${study.overall.confusing || ''}`, `First change: ${study.overall.change || ''}`, `Missing: ${study.overall.missing || 'Nothing provided'}`, `Other: ${study.overall.other || 'Nothing provided'}`);
  return lines.join('\n');
};

const finishStatus = document.querySelector('[data-finish-status]');
document.querySelector('[data-send-feedback]').addEventListener('click', () => {
  const subject = encodeURIComponent('Reaction Creator usability study');
  const body = encodeURIComponent(buildReport());
  finishStatus.textContent = 'Opening your email app…';
  window.location.href = `mailto:reactioncreatorteam@gmail.com?subject=${subject}&body=${body}`;
});

document.querySelector('[data-copy-feedback]').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(buildReport());
    finishStatus.textContent = 'Report copied. Paste it into an email to reactioncreatorteam@gmail.com.';
  } catch {
    finishStatus.textContent = 'Copy was blocked by the browser. Use “Send feedback by email” instead.';
  }
});

updateProgress('About you');
