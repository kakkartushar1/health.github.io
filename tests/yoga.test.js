const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(
  path.resolve(__dirname, '..', 'yoga.html'),
  'utf-8'
);

let document;

beforeAll(() => {
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/' });
  document = dom.window.document;
});

describe('yoga.html', () => {
  test('has lang="en" attribute', () => {
    expect(document.documentElement.getAttribute('lang')).toBe('en');
  });

  test('has exactly one h1', () => {
    const h1s = document.querySelectorAll('h1');
    expect(h1s.length).toBe(1);
    expect(h1s[0].textContent).toContain('Yoga Routine');
  });

  test('has skip link targeting #main-content', () => {
    const skip = document.querySelector('.skip-link');
    expect(skip).not.toBeNull();
    expect(skip.getAttribute('href')).toBe('#main-content');
  });

  test('main element has id main-content', () => {
    const main = document.getElementById('main-content');
    expect(main).not.toBeNull();
    expect(main.tagName.toLowerCase()).toBe('main');
  });

  test('has Home link to index.html', () => {
    const link = document.querySelector('a.home-button');
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe('index.html');
  });

  test('renders all 38 exercise cards', () => {
    const cards = document.querySelectorAll('.exercise-card');
    expect(cards.length).toBe(38);
  });

  test('exercise cards are in correct order 1 through 38', () => {
    const checkboxes = document.querySelectorAll('.exercise-card input[type="checkbox"]');
    const ids = Array.from(checkboxes).map(cb => parseInt(cb.getAttribute('data-id'), 10));
    expect(ids.length).toBe(38);
    for (let i = 0; i < 38; i++) {
      expect(ids[i]).toBe(i + 1);
    }
  });

  test('follow-along table has 38 rows', () => {
    const rows = document.querySelectorAll('#follow-body tr');
    expect(rows.length).toBe(38);
  });

  test('follow-along table has proper scope on headers', () => {
    const ths = document.querySelectorAll('.follow-table thead th');
    ths.forEach(th => {
      expect(th.getAttribute('scope')).toBe('col');
    });
  });

  test('checkboxes have aria-label attributes', () => {
    const boxes = document.querySelectorAll('.exercise-card input[type="checkbox"]');
    boxes.forEach(cb => {
      expect(cb.getAttribute('aria-label')).toBeTruthy();
    });
  });

  test('nav toggle button has aria attributes', () => {
    const toggle = document.querySelector('.nav-toggle');
    expect(toggle).not.toBeNull();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-label')).toBeTruthy();
  });

  test('scroll region has accessible attributes', () => {
    const region = document.querySelector('.scroll-region');
    expect(region).not.toBeNull();
    expect(region.getAttribute('role')).toBe('region');
    expect(region.getAttribute('aria-label')).toBeTruthy();
    expect(region.getAttribute('tabindex')).toBe('0');
  });

  test('reset button exists and is a real button', () => {
    const btn = document.getElementById('reset-btn');
    expect(btn).not.toBeNull();
    expect(btn.tagName.toLowerCase()).toBe('button');
  });

  test('timeline section exists', () => {
    const timeline = document.getElementById('timeline');
    expect(timeline).not.toBeNull();
    expect(timeline.querySelectorAll('.timeline-seg').length).toBeGreaterThan(0);
  });

  test('no duplicate IDs', () => {
    const allIds = Array.from(document.querySelectorAll('[id]')).map(el => el.id);
    const unique = new Set(allIds);
    expect(allIds.length).toBe(unique.size);
  });

  test('source note is present', () => {
    const note = document.querySelector('.source-note');
    expect(note).not.toBeNull();
    expect(note.textContent).toContain('approximate');
  });

  test('heading hierarchy is valid (no skipped levels)', () => {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let lastLevel = 0;
    headings.forEach(h => {
      const level = parseInt(h.tagName.charAt(1), 10);
      expect(level).toBeLessThanOrEqual(lastLevel + 1);
      lastLevel = level;
    });
  });
});
