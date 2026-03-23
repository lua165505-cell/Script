const navToggle = document.querySelector('.nav__toggle');
const navMenu = document.querySelector('.nav__links');
const ctaForm = document.querySelector('.cta-form');
const toast = document.querySelector('.toast');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navMenu.classList.toggle('is-open', !expanded);
    document.body.classList.toggle('menu-open', !expanded);
  });

  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('is-open');
      document.body.classList.remove('menu-open');
    });
  });
}

if (ctaForm && toast) {
  ctaForm.addEventListener('submit', (event) => {
    event.preventDefault();
    toast.textContent = 'Thanks! Your private beta request has been captured in this front-end demo.';
    toast.classList.add('is-visible');
    ctaForm.reset();

    window.clearTimeout(window.__toastTimer);
    window.__toastTimer = window.setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 2800);
  });
}
