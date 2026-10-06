const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(
  path.resolve(__dirname, '..', 'swimming_skating.html'),
  'utf-8'
);

let document;

beforeAll(() => {
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM(html, { url: 'http://localhost/' });
  document = dom.window.document;
});

describe('swimming_skating.html', () => {
  test('has lang="en" attribute', () => {
    expect(document.documentElement.getAttribute('lang')).toBe('en');
  });

  test('has exactly one h1 with correct title', () => {
    const h1s = document.querySelectorAll('h1');
    expect(h1s.length).toBe(1);
    expect(h1s[0].textContent).toContain('Swimming');
  });

  test('has skip link targeting #main-content', () => {
    const skip = document.querySelector('.skip-link');
    expect(skip).not.toBeNull();
    expect(skip.getAttribute('href')).toBe('#main-content');
  });

  test('has Home link to index.html', () => {
    const link = document.querySelector('a.home-button');
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe('index.html');
  });

  test('has placeholder indicator', () => {
    const placeholder = document.querySelector('.placeholder-section');
    expect(placeholder).not.toBeNull();
    expect(placeholder.textContent).toContain('Coming Soon');
  });

  test('has both activity cards', () => {
    const cards = document.querySelectorAll('.activity-card');
    expect(cards.length).toBe(2);
    const text = Array.from(cards).map(c => c.textContent);
    expect(text.join(' ')).toContain('Swimming');
    expect(text.join(' ')).toContain('Skating');
  });

  test('has nav toggle with aria attributes', () => {
    const toggle = document.querySelector('.nav-toggle');
    expect(toggle).not.toBeNull();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });
});
