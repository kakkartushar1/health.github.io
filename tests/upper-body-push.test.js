'use strict';

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT_DIR = path.join(__dirname, '..');
const FILE_PATH = path.join(ROOT_DIR, 'upper_body_push.html');

// This file embeds several images as base64 data URIs and is a few MB in
// size, so we parse it once in beforeAll and reuse the resulting document
// across all assertions in this suite.
describe('upper_body_push.html', () => {
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
      expect(document.title).toBe('Upper Body Push Day');
    });

    test('declares UTF-8 charset and a responsive viewport', () => {
      const charset = document.querySelector('meta[charset]');
      expect(charset.getAttribute('charset').toLowerCase()).toBe('utf-8');

      const viewport = document.querySelector('meta[name="viewport"]');
      expect(viewport).not.toBeNull();
      expect(viewport.getAttribute('content')).toContain('width=device-width');
    });
  });

  describe('hero section', () => {
    test('renders the expected heading and push-focused summary', () => {
      const h1 = document.querySelector('.hero h1');
      expect(h1).not.toBeNull();
      expect(h1.textContent.trim()).toBe('Wednesday • Upper Body Push Workout');

      const summary = document.querySelector('.hero p');
      expect(summary.textContent).toMatch(/Push-focused upper-body session covering chest, shoulders and triceps/);
    });
  });

  describe('warm-up exercises', () => {
    let warmupCards;

    beforeAll(() => {
      const warmupHeading = Array.from(document.querySelectorAll('h2')).find((h) =>
        h.textContent.startsWith('2. Warm-up')
      );
      expect(warmupHeading).not.toBeUndefined();
      const warmupSection = warmupHeading.closest('section');
      warmupCards = Array.from(warmupSection.querySelectorAll('.exercise'));
    });

    test('renders exactly six warm-up exercise cards in the expected order', () => {
      expect(warmupCards.length).toBe(6);
      const titles = warmupCards.map((c) => c.querySelector('h3').textContent.trim());
      expect(titles).toEqual([
        'Arm Circles',
        'Shoulder-Blade Squeezes',
        'Wall Slides',
        'Scapular Push-ups',
        'Band Pull-Aparts',
        'Light Lat Pulldown',
      ]);
    });
  });

  describe('WOD summary table', () => {
    let rows;

    beforeAll(() => {
      const wodHeading = Array.from(document.querySelectorAll('h2')).find((h) =>
        h.textContent.startsWith('3. WOD')
      );
      const table = wodHeading.closest('section').querySelector('table');
      rows = Array.from(table.querySelectorAll('tr')).slice(1); // skip header row
    });

    test('lists exactly five push exercises', () => {
      expect(rows.length).toBe(5);
    });

    test('rows contain exercise name, sets x reps and rest time in the expected columns', () => {
      const firstCells = rows[0].querySelectorAll('td');
      expect(firstCells[0].textContent.trim()).toBe('1');
      expect(firstCells[1].textContent.trim()).toBe('Dumbbell Bench Press');
      expect(firstCells[2].textContent.trim()).toBe('2 × 10');
      expect(firstCells[3].textContent.trim()).toBe('90 sec');

      const lastCells = rows[rows.length - 1].querySelectorAll('td');
      expect(lastCells[1].textContent.trim()).toBe('Band Triceps Pushdown');
      expect(lastCells[2].textContent.trim()).toBe('2 × 12–15');
      expect(lastCells[3].textContent.trim()).toBe('45 sec');
    });

    test('exercise numbers are sequential starting at 1', () => {
      const numbers = rows.map((r) => Number(r.querySelector('td').textContent.trim()));
      expect(numbers).toEqual([1, 2, 3, 4, 5]);
    });

    test('exercise names match the expected push-day list in order', () => {
      const names = rows.map((r) => r.querySelectorAll('td')[1].textContent.trim());
      expect(names).toEqual([
        'Dumbbell Bench Press',
        'Pec Deck Fly',
        'Dumbbell Lateral Raise',
        'Cable Triceps Pushdown',
        'Band Triceps Pushdown',
      ]);
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

    test('renders exactly five exercise cards matching the summary table', () => {
      expect(cards.length).toBe(5);
      const titles = cards.map((c) => c.querySelector('h3').textContent.trim());
      expect(titles).toEqual([
        'Dumbbell Bench Press',
        'Pec Deck Fly',
        'Dumbbell Lateral Raise',
        'Cable Triceps Pushdown',
        'Band Triceps Pushdown',
      ]);
    });

    test('each card uses a valid local, base64 or external HTTPS image source', () => {
      cards.forEach((card) => {
        const img = card.querySelector('.photo img');
        expect(img).not.toBeNull();
        const src = img.getAttribute('src');
        if (src.startsWith('data:image/')) {
          expect(src).toMatch(
            /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/
          );
        } else if (src.startsWith('https://')) {
          expect(src).toMatch(/^https:\/\//);
        } else {
          expect(src).toMatch(/^assets\/images\/exercises\/[^/?#\s]+\.(?:jpe?g|png|webp)$/i);
          const fs = require('fs');
          const filePath = path.join(ROOT_DIR, src);
          expect(fs.existsSync(filePath)).toBe(true);
        }
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

    test('Cable Triceps Pushdown card explicitly warns against elbow drift', () => {
      const pushdownCard = cards.find(
        (c) => c.querySelector('h3').textContent.trim() === 'Cable Triceps Pushdown'
      );
      expect(pushdownCard.querySelector('.note').textContent).toMatch(/elbows/i);
    });
  });

  describe('cardio finish section', () => {
    test('renders the stationary bike cardio finisher', () => {
      const cardioHeading = Array.from(document.querySelectorAll('h2')).find((h) =>
        h.textContent.startsWith('5. Cardio Finish')
      );
      expect(cardioHeading).not.toBeUndefined();
      const section = cardioHeading.closest('section');
      expect(section.textContent).toMatch(/Stationary bike/);
      expect(section.textContent).toMatch(/10 min/);
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

    test('renders exactly five cool-down stretches in the expected order', () => {
      expect(cards.length).toBe(5);
      const titles = cards.map((c) => c.querySelector('h3').textContent.trim());
      expect(titles).toEqual([
        'Doorway Chest Stretch',
        'Cross-body Shoulder Stretch',
        'Overhead Triceps Stretch',
        'Upper Trap / Neck Stretch',
        "Child's Pose",
      ]);
    });

    test('correctly decodes the HTML entity in "Child\'s Pose"', () => {
      const childsPoseCard = cards.find((c) => c.querySelector('h3').textContent.trim() === "Child's Pose");
      expect(childsPoseCard).toBeDefined();
      const img = childsPoseCard.querySelector('.photo img');
      expect(img).not.toBeNull();
    });
  });

  describe('exercise name uniqueness (data integrity)', () => {
    test('all sixteen exercise names across the page are unique', () => {
      const names = Array.from(document.querySelectorAll('h3')).map((h) => h.textContent.trim());
      expect(names.length).toBe(16);
      expect(new Set(names).size).toBe(names.length);
    });
  });

  describe('print / cheat-sheet button', () => {
    test('renders a print button wired to window.print()', () => {
      const button = document.querySelector('button[onclick="window.print()"]');
      expect(button).not.toBeNull();
      expect(button.textContent.trim()).toBe('Print / Save as PDF');
    });
  });

  describe('shared navigation and controls', () => {
    test('loads shared navigation styles and behavior', () => {
      expect(document.querySelector('link[href="assets/workout-navigation.css"]')).not.toBeNull();
      expect(document.querySelector('script[src="assets/workout-navigation.js"]')).not.toBeNull();
    });

    test('renders the required navigation links, home button and section anchors', () => {
      const links = Array.from(document.querySelectorAll('.nav a')).map((link) => [
        link.textContent.trim(),
        link.getAttribute('href'),
      ]);
      expect(links).toEqual([
        ['Quick View', '#quick'],
        ['Warm Up', '#warmup'],
        ['Workout', '#workout'],
        ['Cool Down', '#cooldown'],
        ['Progress', '#progress'],
      ]);
      expect(document.querySelector('.home-button').getAttribute('href')).toBe('index.html');
      ['quick', 'warmup', 'workout', 'cooldown', 'progress'].forEach((id) => {
        expect(document.getElementById(id)).not.toBeNull();
      });
      expect(document.querySelector('#scroll-to-top')).not.toBeNull();
    });
  });

  describe('overall image inventory', () => {
    test('keeps sixteen images total (eleven embedded + five local assets)', () => {
      const images = document.querySelectorAll('img');
      expect(images.length).toBe(16);

      const base64Images = Array.from(images).filter((img) =>
        img.getAttribute('src').startsWith('data:image/')
      );
      expect(base64Images.length).toBe(11);

      const localImages = Array.from(images).filter((img) =>
        img.getAttribute('src').startsWith('assets/images/exercises/')
      );
      expect(localImages.length).toBe(5);
      localImages.forEach((img) => {
        expect(fs.existsSync(path.join(ROOT_DIR, img.getAttribute('src')))).toBe(true);
      });
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

  describe('WOD summary/card data consistency (regression)', () => {
    test('summary table exercise names exactly match the main WOD card titles, in the same order', () => {
      const wodTableHeading = Array.from(document.querySelectorAll('h2')).find((h) =>
        h.textContent.startsWith('3. WOD')
      );
      const table = wodTableHeading.closest('section').querySelector('table');
      const tableNames = Array.from(table.querySelectorAll('tr'))
        .slice(1)
        .map((r) => r.querySelectorAll('td')[1].textContent.trim());

      const cardsHeading = Array.from(document.querySelectorAll('h2')).find((h) =>
        h.textContent.startsWith('4. WOD')
      );
      const cardNames = Array.from(cardsHeading.closest('section').querySelectorAll('.exercise')).map((c) =>
        c.querySelector('h3').textContent.trim()
      );

      expect(tableNames).toEqual(cardNames);
    });
  });

  describe('scheduling guidance', () => {
    test('recommends spacing Pull and Push sessions 2-3 days apart', () => {
      const schedulingHeading = Array.from(document.querySelectorAll('h2')).find((h) =>
        h.textContent.trim() === 'Scheduling Guidance'
      );
      expect(schedulingHeading).not.toBeUndefined();
      const section = schedulingHeading.closest('section');
      expect(section.textContent).toMatch(/Monday Pull.*Wednesday Push.*Friday Lower Body/);
    });
  });

  describe('image accessibility attributes', () => {
    test('all images declare alt text', () => {
      const images = document.querySelectorAll('img');
      images.forEach((img) => {
        expect(img.hasAttribute('alt')).toBe(true);
      });
    });
  });
});
