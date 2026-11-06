const scene = document.getElementById('community-loom');
const toggle = document.getElementById('loom-motion');
const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
let paused = false, visible = true;
const labels = {
  ug: { pause: 'ھەرىكەتنى توختىتىش', play: 'ھەرىكەتنى داۋاملاشتۇرۇش', reduced: 'ھەرىكەت ئازايتىلغان' },
  en: { pause: 'Pause motion', play: 'Resume motion', reduced: 'Motion reduced' },
};
function syncMotion() {
  const stopped = paused || preference.matches;
  scene.dataset.motion = stopped || document.hidden || !visible ? 'paused' : 'running';
  document.documentElement.dataset.decorativeMotion = stopped ? 'paused' : 'running';
  const lang = document.documentElement.lang === 'en' ? 'en' : 'ug';
  toggle.lang = lang;
  toggle.disabled = preference.matches;
  toggle.setAttribute('aria-pressed', String(stopped));
  toggle.textContent = labels[lang][preference.matches ? 'reduced' : paused ? 'play' : 'pause'];
  if (stopped) { scene.style.removeProperty('--tilt-x'); scene.style.removeProperty('--tilt-y'); }
}
toggle.hidden = false;
toggle.addEventListener('click', () => { paused = !paused; syncMotion(); });
preference.addEventListener('change', syncMotion);
document.addEventListener('visibilitychange', syncMotion);
const language = new MutationObserver(syncMotion);
language.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
scene.addEventListener('pointermove', (event) => {
  if (scene.dataset.motion !== 'running' || event.pointerType === 'touch') return;
  const rect = scene.getBoundingClientRect();
  scene.style.setProperty('--tilt-x', `${(event.clientX - rect.left - rect.width / 2) / rect.width * 12}deg`);
  scene.style.setProperty('--tilt-y', `${(event.clientY - rect.top - rect.height / 2) / rect.height * -9}deg`);
});
scene.addEventListener('pointerleave', () => { scene.style.removeProperty('--tilt-x'); scene.style.removeProperty('--tilt-y'); });
const grid = document.getElementById('project-grid');
grid.addEventListener('pointermove', (event) => {
  if (paused || preference.matches || event.pointerType === 'touch') return;
  const card = event.target.closest('.project-card');
  if (!card) return;
  const rect = card.getBoundingClientRect();
  card.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
  card.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
});
let visibility, entrance, catalog;
if ('IntersectionObserver' in window) {
  visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncMotion(); }, { threshold: .05 });
  visibility.observe(scene);
  entrance = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    if (!paused && !preference.matches) entry.target.classList.add('motion-enter');
    entrance.unobserve(entry.target);
  }), { threshold: .08 });
  document.querySelectorAll('.section-heading,.install-panel,.contribution-paths').forEach((node) => entrance.observe(node));
  const seen = new WeakSet();
  function observeCards() {
    grid.querySelectorAll('.project-card').forEach((card, index) => {
      if (seen.has(card)) return;
      seen.add(card);
      card.style.setProperty('--entry-delay', `${index % 3 * 80}ms`);
      entrance.observe(card);
    });
  }
  catalog = new MutationObserver(observeCards);
  catalog.observe(grid, { childList: true });
  observeCards();
}
window.addEventListener('pagehide', (event) => { if (!event.persisted) { visibility?.disconnect(); entrance?.disconnect(); catalog?.disconnect(); language.disconnect(); } });
syncMotion();
