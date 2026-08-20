'use strict';

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT_DIR = path.join(__dirname, '..');
const FILE_PATH = path.join(ROOT_DIR, 'index.html');

describe('index.html', () => {
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
      expect(document.title).toBe('My Gym Workouts');
    });

    test('declares UTF-8 charset', () => {
      const meta = document.querySelector('meta[charset]');
      expect(meta).not.toBeNull();
      expect(meta.getAttribute('charset').toLowerCase()).toBe('utf-8');
    });

    test('declares a responsive viewport', () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      expect(viewport).not.toBeNull();
      expect(viewport.getAttribute('content')).toContain('width=device-width');
    });

    test('declares a description meta tag mentioning workouts', () => {
      const description = document.querySelector('meta[name="description"]');
      expect(description).not.toBeNull();
      expect(description.getAttribute('content')).toMatch(/gym workout/i);
    });

    test('declares the expected theme-color', () => {
      const themeColor = document.querySelector('meta[name="theme-color"]');
      expect(themeColor).not.toBeNull();
      expect(themeColor.getAttribute('content')).toBe('#111827');
    });
  });

  describe('accessibility skip link', () => {
    test('renders a skip link targeting #main-content', () => {
      const skipLink = document.querySelector('a.skip-link');
      expect(skipLink).not.toBeNull();
      expect(skipLink.getAttribute('href')).toBe('#main-content');
      expect(skipLink.textContent.trim()).toBe('Skip to main content');
    });

    test('main content region exists and is focusable', () => {
      const main = document.querySelector('main#main-content');
      expect(main).not.toBeNull();
      expect(main.getAttribute('tabindex')).toBe('-1');
    });
  });

  describe('header', () => {
    test('renders the site heading and subtitle', () => {
      const h1 = document.querySelector('header h1');
      const subtitle = document.querySelector('header p');
      expect(h1).not.toBeNull();
      expect(h1.textContent.trim()).toBe('My Gym Workouts');
      expect(subtitle.textContent.trim()).toBe('Quick access to your workout plans');
    });
  });

  describe('intro section', () => {
    test('has an intro heading referenced by the workout-grid aria-label region', () => {
      const heading = document.querySelector('#workout-heading');
      expect(heading).not.toBeNull();
      expect(heading.tagName).toBe('H2');
      expect(heading.textContent.trim()).toBe('Workout Plans');

      const intro = document.querySelector('.intro');
      expect(intro.getAttribute('aria-labelledby')).toBe('workout-heading');
    });
  });

  describe('workout cards', () => {
    let cards;

    beforeAll(() => {
      cards = Array.from(document.querySelectorAll('.workout-grid .workout-card'));
    });

    test('renders exactly four workout cards', () => {
      expect(cards.length).toBe(4);
    });

    test('each card has an icon and at least one badge', () => {
      cards.forEach((card) => {
        expect(card.querySelector('.workout-icon')).not.toBeNull();
        expect(card.querySelectorAll('.badge').length).toBeGreaterThan(0);
      });
    });

    test('Upper Body Pull card links to upper_body_pull.html and the target file exists', () => {
      const pullCard = cards.find(
        (card) => card.querySelector('h3').textContent.trim() === 'Upper Body Pull'
      );
      expect(pullCard).toBeDefined();

      const badgeTexts = Array.from(pullCard.querySelectorAll('.badge')).map((b) =>
        b.textContent.trim()
      );
      expect(badgeTexts).toEqual(['Pull', 'Upper Body', 'Gym']);

      const link = pullCard.querySelector('a.workout-button');
      expect(link).not.toBeNull();
      expect(link.getAttribute('href')).toBe('upper_body_pull.html');
      expect(link.getAttribute('aria-label')).toBe('Open Upper Body Pull workout');
      expect(link.textContent.trim()).toBe('Open Pull Workout');

      const target = path.join(ROOT_DIR, link.getAttribute('href'));
      expect(fs.existsSync(target)).toBe(true);
    });

    test('Upper Body Push card links to upper_body_push.html and the target file exists', () => {
      const pushCard = cards.find(
        (card) => card.querySelector('h3').textContent.trim() === 'Upper Body Push'
      );
      expect(pushCard).toBeDefined();

      const badgeTexts = Array.from(pushCard.querySelectorAll('.badge')).map((b) =>
        b.textContent.trim()
      );
      expect(badgeTexts).toEqual(['Push', 'Upper Body', 'Gym']);

      const link = pushCard.querySelector('a.workout-button');
      expect(link).not.toBeNull();
      expect(link.getAttribute('href')).toBe('upper_body_push.html');
      expect(link.getAttribute('aria-label')).toBe('Open Upper Body Push workout');
      expect(link.textContent.trim()).toBe('Open Push Workout');

      const target = path.join(ROOT_DIR, link.getAttribute('href'));
      expect(fs.existsSync(target)).toBe(true);
    });

    // Regression / negative test: this PR replaces the single "Upper Body"
    // card (which linked to Upper_Body.html) with separate Pull and Push
    // cards. Pin down that the old combined card/heading and its link are
    // both gone from the grid, so a future revert wouldn't silently
    // reintroduce a duplicate/conflicting card.
    test('does not render a standalone "Upper Body" card or link to Upper_Body.html', () => {
      const headings = cards.map((card) => card.querySelector('h3').textContent.trim());
      expect(headings).not.toContain('Upper Body');

      const hrefs = cards
        .map((card) => card.querySelector('a.workout-button'))
        .filter(Boolean)
        .map((link) => link.getAttribute('href'));
      expect(hrefs).not.toContain('Upper_Body.html');
    });

    test('Lower Body card renders its expected label, badges and link markup', () => {
      const lowerCard = cards.find(
        (card) => card.querySelector('h3').textContent.trim() === 'Lower Body'
      );
      expect(lowerCard).toBeDefined();

      const badgeTexts = Array.from(lowerCard.querySelectorAll('.badge')).map((b) =>
        b.textContent.trim()
      );
      expect(badgeTexts).toEqual(['Friday', 'Lower Body', 'Gym']);

      const link = lowerCard.querySelector('a.workout-button');
      expect(link).not.toBeNull();
      expect(link.getAttribute('aria-label')).toBe('Open Friday Lower Body workout');
      expect(link.textContent.trim()).toBe('Open Lower Body Workout');
    });

    // Regression / negative test: the Lower Body workout link is expected to
    // resolve to a file that actually exists in the repository. The shipped
    // markup currently points to "Lower-Body.html" (hyphen) while the file
    // committed in this PR is named "Lower_Body.html" (underscore), so this
    // link is broken today. This test intentionally encodes the *correct*
    // expectation and will fail until the href/filename mismatch is fixed.
    test('Lower Body link target file exists on disk', () => {
      const lowerCard = cards.find(
        (card) => card.querySelector('h3').textContent.trim() === 'Lower Body'
      );
      const link = lowerCard.querySelector('a.workout-button');
      const href = link.getAttribute('href');
      const target = path.join(ROOT_DIR, href);

      expect(fs.existsSync(target)).toBe(true);
    });

    test('Future Workout card is rendered as a disabled placeholder', () => {
      const futureCard = cards.find(
        (card) => card.querySelector('h3').textContent.trim() === 'Future Workout'
      );
      expect(futureCard).toBeDefined();
      expect(futureCard.classList.contains('coming-soon')).toBe(true);

      const placeholder = futureCard.querySelector('.workout-button');
      expect(placeholder).not.toBeNull();
      expect(placeholder.tagName).toBe('SPAN');
      expect(placeholder.getAttribute('aria-disabled')).toBe('true');
      expect(placeholder.textContent.trim()).toBe('Coming Soon');

      // A disabled placeholder should not be an actual navigable link.
      expect(placeholder.hasAttribute('href')).toBe(false);
    });

    test('none of the workout-button anchors point to an empty or javascript: href', () => {
      cards.forEach((card) => {
        const link = card.querySelector('a.workout-button');
        if (!link) return; // the "coming soon" card intentionally has no <a>
        const href = link.getAttribute('href');
        expect(href).toBeTruthy();
        expect(href.trim().toLowerCase()).not.toMatch(/^javascript:/);
      });
    });
  });

  describe('footer', () => {
    test('renders the expected footer text', () => {
      const footer = document.querySelector('footer');
      expect(footer).not.toBeNull();
      expect(footer.textContent).toMatch(/Personal gym workout library/);
    });
  });

  describe('raw source integrity', () => {
    // Regression / negative test: the file committed in this PR contains
    // literal Markdown code-fence markers ("```html" / "```") wrapped around
    // the actual document, most likely left over from pasting a Markdown
    // code block. That means the real first/last bytes of the file are not
    // <!DOCTYPE ...> / </html>, which is invalid HTML. This test pins the
    // *correct* expectation and will fail until the stray fences are removed.
    test('file does not contain markdown code-fence markers', () => {
      expect(rawHtml).not.toMatch(/```/);
    });

    test('file starts with a DOCTYPE declaration', () => {
      expect(rawHtml.trimStart().toLowerCase().startsWith('<!doctype html>')).toBe(true);
    });

    test('file ends with the closing </html> tag', () => {
      expect(rawHtml.trimEnd().toLowerCase().endsWith('</html>')).toBe(true);
    });
  });
});