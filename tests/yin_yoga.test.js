const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(
  path.resolve(__dirname, '..', 'yin_yoga.html'),
  'utf-8'
);

let document;

beforeAll(() => {
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM(html, { url: 'http://localhost/' });
  document = dom.window.document;
});

describe('yin_yoga.html', () => {
  test('has lang="en" attribute', () => {
    expect(document.documentElement.getAttribute('lang')).toBe('en');
  });

  test('has exactly one h1 with correct title', () => {
    const h1s = document.querySelectorAll('h1');
    expect(h1s.length).toBe(1);
    expect(h1s[0].textContent).toContain('Yin Yoga');
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

  test('has YouTube playlist link', () => {
    const btn = document.querySelector('a.video-btn');
    expect(btn).not.toBeNull();
    expect(btn.getAttribute('href')).toContain('PLJv5ruPOIH44');
    expect(btn.getAttribute('target')).toBe('_blank');
    expect(btn.getAttribute('rel')).toContain('noopener');
  });

  test('has accessible video button label', () => {
    const btn = document.querySelector('a.video-btn');
    expect(btn.getAttribute('aria-label')).toBeTruthy();
  });

  test('has about section explaining yin yoga', () => {
    const about = document.querySelector('.about');
    expect(about).not.toBeNull();
    expect(about.textContent).toContain('connective tissues');
  });

  test('has nav toggle with aria attributes', () => {
    const toggle = document.querySelector('.nav-toggle');
    expect(toggle).not.toBeNull();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });
});
