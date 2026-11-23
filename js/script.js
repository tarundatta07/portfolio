/* =========================================================
   CONFIG — fill these in to enable optional features.
   Anything left empty stays hidden, so no broken links ship.
   ========================================================= */
const CONFIG = {
    // Public contact email. Shows the email links and enables the mailto fallback.
    email: 'tarundatt4@gmail.com',
    // Form backend endpoint (e.g. https://formspree.io/f/xxxxxxx). Takes priority over mailto.
    formEndpoint: '',
    // Per-project links. Leave a value empty to hide that link.
    projects: {
        ecommerce: { github: '', demo: '' },
        chat: { github: '', demo: '' },
        billing: { github: '', demo: '' }
    }
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const storage = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } }
};

/* ---------------- Loader ---------------- */
const loader = $('#loader');
const hideLoader = () => loader && loader.classList.add('done');
window.addEventListener('load', hideLoader);
setTimeout(hideLoader, 1200); // never hold content hostage to slow assets

/* ---------------- Theme ---------------- */
const themeBtn = $('#theme-btn');
const themeIcon = $('i', themeBtn);

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    themeIcon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    $('meta[name="theme-color"]').setAttribute('content', theme === 'dark' ? '#05070f' : '#f5f7fc');
}

applyTheme(document.documentElement.dataset.theme || 'dark');
themeBtn.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    storage.set('theme', next);
});

/* ---------------- Mobile nav ---------------- */
const header = $('#header');
const nav = $('#nav');
const menuBtn = $('#menu-btn');

function setMenu(open) {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
}

menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
$$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
window.addEventListener('resize', () => { if (window.innerWidth > 1080) setMenu(false); });

/* ---------------- Scroll: header, progress, back-to-top ---------------- */
const progress = $('#scroll-progress');
const backTop = $('#back-top');
let ticking = false;

function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('scrolled', y > 20);
    backTop.classList.toggle('show', y > 600);
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
}, { passive: true });
onScroll();

/* ---------------- Active section tracking ---------------- */
const navLinks = $$('.nav-link');
const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(l => {
            const active = l.getAttribute('href') === `#${id}`;
            l.classList.toggle('active', active);
            if (active) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
        });
    });
}, { rootMargin: '-45% 0px -50% 0px' });
$$('main section[id]').forEach(s => sectionObserver.observe(s));

/* ---------------- Reveal on scroll ---------------- */
const revealEls = $$('.reveal');
if (reducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('visible'));
} else {
    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            el.style.transitionDelay = `${el.dataset.delay || 0}ms`;
            el.classList.add('visible');
            obs.unobserve(el);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));
}

/* ---------------- Typing effect ---------------- */
const typingEl = $('#typing-text');
const roles = ['Software Engineer', 'Full Stack Developer', 'DevOps Engineer', 'Python Backend Developer'];

if (typingEl && !reducedMotion) {
    let roleIndex = 0, charIndex = roles[0].length, deleting = true;
    const tick = () => {
        const role = roles[roleIndex];
        charIndex += deleting ? -1 : 1;
        typingEl.textContent = role.slice(0, charIndex);
        let delay = deleting ? 45 : 90;
        if (!deleting && charIndex === role.length) { delay = 1800; deleting = true; }
        else if (deleting && charIndex === 0) { deleting = false; roleIndex = (roleIndex + 1) % roles.length; delay = 350; }
        setTimeout(tick, delay);
    };
    setTimeout(tick, 2200);
}

/* ---------------- Cursor glow (desktop pointers only) ---------------- */
const glow = $('#cursor-glow');
if (glow && !reducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let gx = 0, gy = 0, raf = null;
    window.addEventListener('pointermove', e => {
        gx = e.clientX; gy = e.clientY;
        glow.classList.add('on');
        if (!raf) raf = requestAnimationFrame(() => {
            glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
            raf = null;
        });
    }, { passive: true });
    document.addEventListener('pointerleave', () => glow.classList.remove('on'));
}

/* ---------------- Optional links from CONFIG ---------------- */
if (CONFIG.email) {
    $$('[data-email-only]').forEach(el => { el.hidden = false; });
    $$('.js-email-link').forEach(a => { a.href = `mailto:${CONFIG.email}`; });
    $$('.js-email-text').forEach(a => { a.textContent = CONFIG.email; });
}

$$('.project-card[data-project]').forEach(card => {
    const links = CONFIG.projects[card.dataset.project] || {};
    const box = $('.project-links', card);
    const add = (href, icon, label) => {
        const a = document.createElement('a');
        a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer';
        a.innerHTML = `<i class="${icon}"></i> ${label}`;
        box.appendChild(a);
    };
    if (links.github) add(links.github, 'fa-brands fa-github', 'Source');
    if (links.demo) add(links.demo, 'fa-solid fa-arrow-up-right-from-square', 'Live Demo');
});

/* ---------------- Contact form ---------------- */
const form = $('#contact-form');
const statusEl = $('#form-status');
const submitBtn = $('#submit-btn');

const messages = {
    valueMissing: 'This field is required.',
    typeMismatch: 'Please enter a valid email address.',
    patternMismatch: 'Please enter a valid phone number.',
    tooShort: el => `Please enter at least ${el.minLength} characters.`
};

function validateField(el) {
    const field = el.closest('.field');
    if (!field) return true;
    const err = $('.field-error', field);
    el.value = el.value.trimStart();
    let msg = '';
    if (!el.value.trim() && el.required) msg = messages.valueMissing;
    else if (el.validity.typeMismatch) msg = messages.typeMismatch;
    else if (el.validity.patternMismatch) msg = messages.patternMismatch;
    else if (el.validity.tooShort) msg = messages.tooShort(el);
    field.classList.toggle('invalid', !!msg);
    el.setAttribute('aria-invalid', String(!!msg));
    err.textContent = msg;
    return !msg;
}

function setStatus(text, type = '') {
    statusEl.textContent = text;
    statusEl.className = `form-status ${type}`;
}

function setLoading(on) {
    submitBtn.disabled = on;
    $('.btn-label', submitBtn).textContent = on ? 'Sending…' : 'Send Message';
    $('i', submitBtn).className = on ? 'fa-solid fa-spinner' : 'fa-solid fa-paper-plane';
}

if (form) {
    const inputs = $$('input:not(.hp), textarea', form);
    inputs.forEach(el => {
        el.addEventListener('blur', () => validateField(el));
        el.addEventListener('input', () => { if (el.closest('.field').classList.contains('invalid')) validateField(el); });
    });

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const results = inputs.map(validateField);
        if (results.includes(false)) {
            inputs[results.indexOf(false)].focus();
            setStatus('Please fix the highlighted fields.', 'error');
            return;
        }
        const data = new FormData(form);
        if (data.get('_gotcha')) return; // bot

        if (CONFIG.formEndpoint) {
            setLoading(true);
            setStatus('');
            try {
                const res = await fetch(CONFIG.formEndpoint, {
                    method: 'POST',
                    body: data,
                    headers: { Accept: 'application/json' }
                });
                if (!res.ok) throw new Error(res.statusText);
                form.reset();
                setStatus('Thanks! Your message has been sent. I\'ll get back to you soon.', 'success');
            } catch {
                setStatus('Something went wrong sending your message. Please try again later.', 'error');
            } finally {
                setLoading(false);
            }
        } else if (CONFIG.email) {
            const body = `${data.get('message')}\n\n— ${data.get('name')}\n${data.get('email')}\n${data.get('phone')}`;
            window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(data.get('subject'))}&body=${encodeURIComponent(body)}`;
            setStatus('Opening your email app to finish sending…', 'success');
        } else {
            setStatus('The contact form isn\'t connected yet. Please reach out via LinkedIn in the meantime.', 'error');
        }
    });
}
