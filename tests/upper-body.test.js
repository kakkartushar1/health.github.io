'use strict';

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT_DIR = path.join(__dirname, '..');
const FILE_PATH = path.join(ROOT_DIR, 'Upper_Body.html');

// This file embeds ~15 images as base64 data URIs and is several MB in size,
// so we parse it once in beforeAll and reuse the resulting document across
// all assertions in this suite.
describe('Upper_Body.html', () => {
  let rawHtml;
  let document;

  beforeAll(() => {
    rawHtml = fs.readFileSync(FILE_PATH, 'utf8');
    document = new JSDOM(rawHtml).window.document;
  });

  describe('document head', () => {
    test('declares lang="en" on the root <html> element', () => {
      expect(document.documentElement.getAttribute('lang')).toBe('en');
    });

    test('has the expected page title', () => {
      expect(document.title).toBe('Monday Upper Body Workout - Correct Research Images');
    });

    test('declares UTF-8 charset and a responsive viewport', () => {
      const charset = document.querySelector('meta[charset]');
      expect(charset.getAttribute('charset').toLowerCase()).toBe('utf-8');

      const viewport = document.querySelector('meta[name="viewport"]');
      expect(viewport.getAttribute('content')).toContain('width=device-width');
    });
  });

  describe('hero section', () => {
    test('renders the expected heading', () => {
      const h1 = document.querySelector('.hero h1');
      expect(h1).not.toBeNull();
      expect(h1.textContent.trim()).toBe('Monday • Upper Body Workout');
    });
  });

  describe('warm-up exercises', () => {
    test('renders exactly five warm-up exercise cards in the correct order', () => {
      const warmupHeading = Array.from(document.querySelectorAll('h2')).find((h) =>
        h.textContent.startsWith('2. Warm-up')
      );
      expect(warmupHeading).not.toBeUndefined();

      const warmupSection = warmupHeading.closest('section');
      const warmupCards = warmupSection.querySelectorAll('.exercise');
      expect(warmupCards.length).toBe(5);

      const titles = Array.from(warmupCards).map((c) => c.querySelector('h3').textContent.trim());
      expect(titles).toEqual([
        'Arm Circles',
        'Shoulder-Blade Squeezes',
        'Wall Slides',
        'Scapular Push-ups',
        'Light Lat Pulldown',
      ]);
    });
  });

  describe('WOD summary table', () => {
    let table;
    let rows;

    beforeAll(() => {
      const wodHeading = Array.from(document.querySelectorAll('h2')).find((h) =>
        h.textContent.startsWith('3. WOD')
      );
      table = wodHeading.closest('section').querySelector('table');
      rows = Array.from(table.querySelectorAll('tr')).slice(1); // skip header row
    });

    test('lists exactly eight exercises', () => {
      expect(rows.length).toBe(8);
    });

    test('rows contain exercise name, sets x reps and rest time in the expected columns', () => {
      const firstCells = rows[0].querySelectorAll('td');
      expect(firstCells[0].textContent.trim()).toBe('1');
      expect(firstCells[1].textContent.trim()).toBe('Lat Pulldown');
      expect(firstCells[2].textContent.trim()).toBe('2 × 10–12');
      expect(firstCells[3].textContent.trim()).toBe('60–90 sec');

      const lastCells = rows[rows.length - 1].querySelectorAll('td');
      expect(lastCells[1].textContent.trim()).toBe('Cable Triceps Pushdown');
    });

    test('exercise numbers are sequential starting at 1', () => {
      const numbers = rows.map((r) => Number(r.querySelector('td').textContent.trim()));
      expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });
  });

  describe('main WOD exercise cards (research pictures + instructions)', () => {
    let cards;

    beforeAll(() => {
      const wodHeading = Array.from(document.querySelectorAll('h2')).find((h) =>
        h.textContent.startsWith('4. WOD')
      );
      cards = Array.from(wodHeading.closest('section').querySelectorAll('.exercise'));
    });

    test('renders exactly eight exercise cards matching the summary table', () => {
      expect(cards.length).toBe(8);
      const titles = cards.map((c) => c.querySelector('h3').textContent.trim());
      expect(titles).toEqual([
        'Lat Pulldown',
        'Chest-Supported Dumbbell Row',
        'Bird Dog',
        'Dumbbell Bench Press',
        'Pec Deck Fly',
        'Dumbbell Lateral Raise',
        'Dumbbell Curl',
        'Cable Triceps Pushdown',
      ]);
    });

    test('each card embeds a base64 data-URI image with non-empty alt text', () => {
      cards.forEach((card) => {
        const img = card.querySelector('.photo img');
        expect(img).not.toBeNull();
        expect(img.getAttribute('src')).toMatch(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/);
        expect(img.getAttribute('alt')).toBeTruthy();
      });
    });

    test('each card links to an external HTTPS source reference with safe link attributes', () => {
      cards.forEach((card) => {
        const source = card.querySelector('a.source');
        expect(source).not.toBeNull();
        expect(source.getAttribute('href')).toMatch(/^https:\/\//);
        expect(source.getAttribute('target')).toBe('_blank');
        expect(source.getAttribute('rel')).toBe('noopener');
      });
    });

    test('each card contains at least one instructional step', () => {
      cards.forEach((card) => {
        const steps = card.querySelectorAll('details ol > li');
        expect(steps.length).toBeGreaterThan(0);
      });
    });
  });

  describe('cool-down exercises', () => {
    let cards;

    beforeAll(() => {
      const coolHeading = Array.from(document.querySelectorAll('h2')).find((h) =>
        h.textContent.startsWith('6. Cool-down')
      );
      cards = Array.from(coolHeading.closest('section').querySelectorAll('.exercise'));
    });

    test('renders exactly five cool-down stretches', () => {
      expect(cards.length).toBe(5);
    });

    test('correctly decodes the HTML entity in "Child\'s Pose"', () => {
      const titles = cards.map((c) => c.querySelector('h3').textContent.trim());
      expect(titles).toContain("Child's Pose");

      const childsPoseCard = cards.find((c) => c.querySelector('h3').textContent.trim() === "Child's Pose");
      const img = childsPoseCard.querySelector('.photo img');
      expect(img.getAttribute('alt')).toBe("Child's Pose form");
    });
  });

  describe('exercise name uniqueness (data integrity)', () => {
    test('all eighteen exercise names across the page are unique', () => {
      const names = Array.from(document.querySelectorAll('h3')).map((h) => h.textContent.trim());
      expect(names.length).toBe(18);
      expect(new Set(names).size).toBe(names.length);
    });
  });

  describe('print / cheat-sheet button', () => {
    test('renders a print button wired to window.print()', () => {
      const button = document.querySelector('button');
      expect(button).not.toBeNull();
      expect(button.textContent.trim()).toBe('Print / Save as PDF');
      expect(button.getAttribute('onclick')).toBe('window.print()');
    });
  });

  describe('no executable script tags', () => {
    // Unlike Lower_Body.html (which ships an inline fallback-image script),
    // Upper_Body.html relies purely on embedded base64 images and markup.
    // This guards against an unexpected/unaudited <script> being introduced.
    test('the document does not contain any <script> elements', () => {
      expect(document.querySelectorAll('script').length).toBe(0);
    });
  });

  describe('overall image inventory', () => {
    test('embeds eighteen images total (fifteen base64 + three external warm-up references)', () => {
      const images = document.querySelectorAll('img');
      expect(images.length).toBe(18);

      const base64Images = Array.from(images).filter((img) =>
        img.getAttribute('src').startsWith('data:image/')
      );
      expect(base64Images.length).toBe(15);
    });

    // Boundary/regression check: a broken embed step could leave behind a
    // technically well-formed but empty/near-empty data URI (e.g. a 1x1
    // placeholder). Requiring a substantial base64 payload guards against
    // that without needing to decode and inspect actual pixel data.
    test('every embedded base64 image payload is substantial (not an empty/placeholder stub)', () => {
      const images = Array.from(document.querySelectorAll('img')).filter((img) =>
        img.getAttribute('src').startsWith('data:image/')
      );
      images.forEach((img) => {
        const src = img.getAttribute('src');
        const base64Payload = src.slice(src.indexOf('base64,') + 'base64,'.length);
        expect(base64Payload.length).toBeGreaterThan(1000);
      });
    });
  });
});