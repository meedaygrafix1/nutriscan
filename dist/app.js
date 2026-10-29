const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const navHeader = $('.nav');
const menuToggle = $('.menu-toggle');
const navContent = $('#nav-content');
const compactNav = matchMedia('(max-width: 900px)');
function closeMenu(restoreFocus = false) {
  navHeader.classList.remove('menu-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation menu');
  if (restoreFocus) menuToggle.focus();
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  navHeader.classList.toggle('menu-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
document.addEventListener('click', event => {
  if (!navHeader.contains(event.target)) closeMenu();
});
navHeader.addEventListener('focusout', event => {
  if (event.relatedTarget && !navHeader.contains(event.relatedTarget)) closeMenu();
});
$$('a', navContent).forEach(link => link.addEventListener('click', () => {
  if (!compactNav.matches) return;
  closeMenu();
  const target = $(link.hash);
  if (target) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
}));
compactNav.addEventListener('change', event => {
  const focusWasInMenu = navContent.contains(document.activeElement);
  const focusWasOnToggle = document.activeElement === menuToggle;
  closeMenu();
  if (event.matches && focusWasInMenu) menuToggle.focus();
  if (!event.matches && focusWasOnToggle) $('.logo', navHeader).focus();
});
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reducedMotion.matches;
const samples = [
  { name: 'Jollof rice & chicken', image: '75084.png', energy: 489, protein: 37, carbs: 74, fat: 5 },
  { name: 'Fresh salad', image: 'd96a1.png', energy: 240, protein: 8, carbs: 26, fat: 12 },
  { name: 'Eggs for breakfast', image: 'c02b5.png', energy: 156, protein: 13, carbs: 1, fat: 11 }
];
let portion = 1, selected = 0;
let saved = [];
try { const data = JSON.parse(localStorage.getItem('nutrisnap-preview') || '[]'); if (Array.isArray(data)) saved = data.filter(item => item && typeof item.name === 'string' && Number.isFinite(item.energy) && Number.isFinite(item.portion)).slice(-20); } catch { /* Storage is optional; the demo also works in memory. */ }

function phoneMarkup() {
  return `<div class="phone"><div class="phone-island"></div><div class="phone-screen"><img class="phone-backdrop" src="assets/73b10.svg" alt=""><div class="status-bar"><span>9:41</span><img src="assets/6960d.svg" alt=""><img src="assets/198cf.svg" alt=""><img src="assets/b8bd1.svg" alt=""></div><div class="phone-title"><img src="assets/b309c.svg" alt="">Review your meal</div><div class="meal-content"><img class="meal-photo" src="assets/01bfe.png" alt="Chicken, rice and vegetables"><h4>Chicken, rice &amp; vegetables</h4><p class="meal-time">Lunch · Today, 1:20 pm</p><div class="energy-card"><div><small>Estimated energy</small><strong>489 kcal</strong></div><img src="assets/74eb3.svg" alt=""></div><div class="macro" style="--macro:#85c700;--amount:30%"><div class="macro-label"><span>● Protein</span><b>37 g</b></div><i></i></div><div class="macro" style="--macro:#ff9b00;--amount:61%"><div class="macro-label"><span>● Carbs</span><b>74 g</b></div><i></i></div><div class="macro" style="--macro:#25c6a2;--amount:9%"><div class="macro-label"><span>● Fat</span><b>5 g</b></div><i></i></div><p class="phone-note">AI estimate · Check ingredients and portions.</p></div><div class="phone-actions"><button data-explore>Edit details</button><button data-explore>Save meal</button></div><div class="phone-home"></div></div></div>`;
}
$$('[data-phone]').forEach(el => el.innerHTML = phoneMarkup());

const dialog = $('#preview');
function updateNutrition() {
  const meal = samples[selected];
  $$('.portion-label').forEach(el => el.textContent = `${portion} ${portion === 1 ? 'serving' : 'servings'}`);
  $$('[data-portion="-1"]').forEach(el => el.disabled = portion <= .5);
  $$('[data-portion="1"]').forEach(el => el.disabled = portion >= 4);
  $('#energy').textContent = `${Math.round(meal.energy * portion)} kcal`;
  $('#macros').textContent = `${Math.round(meal.protein * portion)} g protein · ${Math.round(meal.carbs * portion)} g carbs · ${Math.round(meal.fat * portion)} g fat`;
  $('.portion > img').style.transform = paused ? '' : `scale(${.9 + portion * .1})`;
}
function chooseMeal(index) {
  selected = index;
  const meal = samples[index];
  $('#sample-meal').value = String(index);
  $('#meal-name').value = meal.name;
  $('#preview-image').src = `assets/${meal.image}`;
  $('#preview-image').alt = meal.name;
  $('.save-status').textContent = '';
  updateNutrition();
}
function renderHistory() {
  $('#history').replaceChildren();
  $('#empty-history').hidden = saved.length > 0;
  [...saved].reverse().forEach(meal => {
    const row = document.createElement('li');
    const name = document.createElement('span');
    const energy = document.createElement('strong');
    name.textContent = `${meal.name} · ${meal.portion} ${meal.portion === 1 ? 'serving' : 'servings'}`;
    energy.textContent = `${meal.energy} kcal`;
    row.append(name, energy);
    $('#history').append(row);
  });
}
function explore(index = 0) {
  if (compactNav.matches && navHeader.classList.contains('menu-open')) closeMenu(true);
  chooseMeal(index);
  renderHistory();
  dialog.showModal();
  document.body.style.overflow = 'hidden';
}
$$('[data-explore]').forEach(button => button.addEventListener('click', () => explore()));
$$('[data-meal]').forEach(button => button.addEventListener('click', () => explore(Number(button.dataset.meal))));
$$('[data-portion]').forEach(button => button.addEventListener('click', () => {
  portion = Math.max(.5, Math.min(4, portion + Number(button.dataset.portion) * .5));
  updateNutrition();
}));
$('#sample-meal').addEventListener('change', event => chooseMeal(Number(event.target.value)));
$('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => document.body.style.overflow = '');
dialog.addEventListener('click', event => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
});
$('.save-preview').addEventListener('click', () => {
  const name = $('#meal-name').value.trim();
  if (!name) { $('#meal-name').focus(); $('.save-status').textContent = 'Give your meal a name before saving.'; return; }
  saved.push({ name, portion, energy: Math.round(samples[selected].energy * portion) });
  saved = saved.slice(-20);
  let persisted = true;
  try { localStorage.setItem('nutrisnap-preview', JSON.stringify(saved)); } catch { persisted = false; }
  renderHistory();
  $('.save-status').textContent = persisted ? 'Meal saved! Your preview history stays in this browser.' : 'Meal saved for this visit. Browser storage is unavailable.';
});

function setMotion(value) {
  paused = value;
  document.documentElement.classList.toggle('motion-paused', paused);
  if (paused) { document.documentElement.style.setProperty('--mx', '0px'); document.documentElement.style.setProperty('--my', '0px'); }
}
reducedMotion.addEventListener('change', event => setMotion(event.matches));
setMotion(paused);

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: .08 });
  $$('.reveal').forEach(el => observer.observe(el));
  document.documentElement.classList.add('motion-ready');
}
let scrollTick = false;
function paintScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  $('.scroll-progress').style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  scrollTick = false;
}
addEventListener('scroll', () => { if (!scrollTick) { scrollTick = true; requestAnimationFrame(paintScroll); } }, { passive: true });
function resizeScene() { document.documentElement.style.setProperty('--scene-scale', document.documentElement.clientWidth / 1440); paintScroll(); }
addEventListener('resize', resizeScene, { passive: true });
resizeScene();
$('.hero').addEventListener('pointermove', event => {
  if (paused || event.pointerType !== 'mouse') return;
  document.documentElement.style.setProperty('--mx', `${(event.clientX / innerWidth - .5) * 45}px`);
  document.documentElement.style.setProperty('--my', `${(event.clientY / innerHeight - .5) * 30}px`);
}, { passive: true });
$('.hero').addEventListener('pointerleave', () => { document.documentElement.style.setProperty('--mx', '0px'); document.documentElement.style.setProperty('--my', '0px'); });
$$('.headline-line').forEach(line => {
  const original = line.textContent;
  line.setAttribute('aria-label', original);
  line.textContent = '';
  [...original].forEach((character, index) => {
    const letter = document.createElement('span');
    letter.textContent = character === ' ' ? '\u00a0' : character;
    letter.className = 'letter';
    letter.setAttribute('aria-hidden', 'true');
    letter.style.setProperty('--letter-turn', `${index % 2 ? 8 : -8}deg`);
    line.append(letter);
  });
});
updateNutrition();
