'use strict';

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT_DIR = path.join(__dirname, '..');
const FILE_PATH = path.join(ROOT_DIR, 'Lower_Body.html');

describe('Lower_Body.html', () => {
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
      expect(document.title).toBe('Friday Lower Body | Final Gym Workout');
    });

    test('declares UTF-8 charset and a responsive viewport', () => {
      const charset = document.querySelector('meta[charset]');
      expect(charset.getAttribute('charset').toLowerCase()).toBe('utf-8');

      const viewport = document.querySelector('meta[name="viewport"]');
      expect(viewport.getAttribute('content')).toContain('width=device-width');
      expect(viewport.getAttribute('content')).toContain('viewport-fit=cover');
    });

    test('declares the expected theme-color', () => {
      const themeColor = document.querySelector('meta[name="theme-color"]');
      expect(themeColor.getAttribute('content')).toBe('#111827');
    });
  });

  describe('accessibility skip link', () => {
    test('renders a skip link targeting #main-content', () => {
      const skipLink = document.querySelector('a.skip-link');
      expect(skipLink).not.toBeNull();
      expect(skipLink.getAttribute('href')).toBe('#main-content');
    });

    test('main content region exists and is focusable', () => {
      const main = document.querySelector('main#main-content');
      expect(main).not.toBeNull();
      expect(main.getAttribute('tabindex')).toBe('-1');
    });
  });

  describe('section navigation', () => {
    const EXPECTED_LINKS = [
      { href: '#quick', label: 'Quick view' },
      { href: '#warmup', label: 'Warm-up' },
      { href: '#workout', label: 'Workout' },
      { href: '#cooldown', label: 'Cooldown' },
      { href: '#notes', label: 'Progress' },
    ];

    test('renders exactly five nav links with the expected labels/targets', () => {
      const links = Array.from(document.querySelectorAll('nav.nav > a'));
      expect(links.length).toBe(EXPECTED_LINKS.length);

      links.forEach((link, i) => {
        expect(link.getAttribute('href')).toBe(EXPECTED_LINKS[i].href);
        expect(link.textContent.trim()).toBe(EXPECTED_LINKS[i].label);
      });
    });

    // Regression / negative test: every nav link's fragment identifier
    // should resolve to an element with a matching id somewhere in the
    // document, otherwise clicking it does nothing. This pins the *current*
    // resolvability of each link so any change (fix or regression) to the
    // set of anchor targets is caught by this test. Today, "#notes" does not
    // resolve because the corresponding section uses id="progress" instead.
    test('nav link fragment resolution map matches current document ids', () => {
      const links = Array.from(document.querySelectorAll('nav.nav > a'));
      const resolvedMap = {};
      links.forEach((link) => {
        const href = link.getAttribute('href');
        const targetId = href.slice(1);
        resolvedMap[href] = document.getElementById(targetId) !== null;
      });

      expect(resolvedMap).toEqual({
        '#quick': true,
        '#warmup': true,
        '#workout': true,
        '#cooldown': true,
        '#notes': false,
      });
    });
  });

  describe('quick view summary', () => {
    test('renders three summary stats', () => {
      const stats = document.querySelectorAll('#quick .stat');
      expect(stats.length).toBe(3);
      expect(stats[0].textContent).toMatch(/6/);
      expect(stats[0].textContent).toMatch(/main exercises/i);
    });
  });

  describe('warm-up section', () => {
    test('renders seven warm-up drills', () => {
      const warmItems = document.querySelectorAll('#warmup .warm');
      expect(warmItems.length).toBe(7);
    });

    test('every warm-up image (except the cardio-only entry) has alt text and lazy loading', () => {
      const images = document.querySelectorAll('#warmup .warm img');
      // 6 of the 7 warm-up entries include a reference image (cardio does not).
      expect(images.length).toBe(6);
      images.forEach((img) => {
        expect(img.getAttribute('alt')).toBeTruthy();
        expect(img.getAttribute('loading')).toBe('lazy');
      });
    });
  });

  describe('main workout exercises', () => {
    let articles;

    beforeAll(() => {
      articles = Array.from(document.querySelectorAll('#workout article.card'));
    });

    test('renders exactly six main exercises', () => {
      expect(articles.length).toBe(6);
    });

    test('exercises are numbered #1 through #6 in order', () => {
      const tags = articles.map((a) => a.querySelector('.top .tag').textContent.trim());
      expect(tags).toEqual(['#1', '#2', '#3', '#4', '#5', '#6']);
    });

    test('each exercise has a name, a starting weight, a form video link and step-by-step instructions', () => {
      articles.forEach((article) => {
        expect(article.querySelector('h2').textContent.trim().length).toBeGreaterThan(0);
        expect(article.querySelector('.weight')).not.toBeNull();

        const videoLink = article.querySelector('a.btn');
        expect(videoLink).not.toBeNull();
        expect(videoLink.getAttribute('href')).toMatch(/^https:\/\//);
        expect(videoLink.getAttribute('target')).toBe('_blank');
        expect(videoLink.getAttribute('rel')).toBe('noopener');

        const steps = article.querySelectorAll('h3 + ol > li');
        expect(steps.length).toBeGreaterThan(0);
      });
    });

    test('each exercise photo has non-empty alt text and lazy loading', () => {
      articles.forEach((article) => {
        const img = article.querySelector('.photo img');
        expect(img).not.toBeNull();
        expect(img.getAttribute('alt')).toBeTruthy();
        expect(img.getAttribute('loading')).toBe('lazy');
        expect(img.getAttribute('src')).toMatch(/^https:\/\//);
      });
    });

    test('exercise names match the expected list in order', () => {
      const names = articles.map((a) => a.querySelector('h2').textContent.trim());
      expect(names).toEqual([
        'Squat',
        'Romanian Deadlift',
        'Leg Press',
        'Leg Press Calf Raise',
        'Leg Extension',
        'Stability Ball Hamstring Curl',
      ]);
    });
  });

  describe('cooldown section', () => {
    test('renders six stretches, each with a labeled photo', () => {
      const cards = document.querySelectorAll('#cooldown .cool-card');
      expect(cards.length).toBe(6);
      cards.forEach((card) => {
        const img = card.querySelector('img.exercise-photo');
        expect(img).not.toBeNull();
        expect(img.getAttribute('alt')).toBeTruthy();
      });
    });

    test('the hamstring stretch includes an additional animated GIF reference', () => {
      const gifImgs = document.querySelectorAll('#cooldown .cool-card img.exercise-gif');
      expect(gifImgs.length).toBe(1);
      expect(gifImgs[0].getAttribute('alt')).toMatch(/Hamstring stretch/i);
    });
  });

  describe('progress table', () => {
    test('has a caption and renders one row per main exercise', () => {
      const table = document.querySelector('#progress table');
      expect(table).not.toBeNull();
      expect(table.querySelector('caption').textContent).toMatch(/progression/i);

      const rows = table.querySelectorAll('tbody tr');
      expect(rows.length).toBe(6);
      expect(rows[0].querySelector('td').textContent.trim()).toBe('Squat');
    });

    test('column headers use scope="col" for accessibility', () => {
      const headers = document.querySelectorAll('#progress table thead th');
      expect(headers.length).toBe(3);
      headers.forEach((th) => expect(th.getAttribute('scope')).toBe('col'));
    });
  });

  describe('footer disclosures', () => {
    test('mentions image verification and the technical limitation notice', () => {
      const footer = document.querySelector('footer');
      expect(footer.textContent).toMatch(/Image verification/);
      expect(footer.textContent).toMatch(/Technical limitation/);
    });
  });

  describe('image count sanity check', () => {
    test('total image count matches warm-up + exercises + cooldown images', () => {
      // 6 warm-up + 6 exercises + 6 cooldown photos + 1 cooldown gif = 19
      const images = document.querySelectorAll('img');
      expect(images.length).toBe(19);
    });

    test('every <img> in the document declares loading="lazy"', () => {
      const images = document.querySelectorAll('img');
      images.forEach((img) => {
        expect(img.getAttribute('loading')).toBe('lazy');
      });
    });
  });
});

describe('Lower_Body.html inline image-fallback script', () => {
  // The inline <script> at the bottom of the page attaches a one-time
  // 'error' listener to every <img> present at parse time. When an image
  // fails to load, the script hides the broken image and appends an
  // accessible fallback message. We execute the real script via jsdom's
  // "dangerously" script runner (no network access is triggered because
  // jsdom does not fetch image resources unless explicitly configured to).
  let window;
  let document;

  beforeEach(() => {
    const rawHtml = fs.readFileSync(FILE_PATH, 'utf8');
    const dom = new JSDOM(rawHtml, { runScripts: 'dangerously' });
    window = dom.window;
    document = window.document;
  });

  test('hides the image and appends an accessible fallback message on error', () => {
    const img = document.querySelector('.photo img');
    expect(img.hidden).toBe(false);

    img.dispatchEvent(new window.Event('error'));

    expect(img.hidden).toBe(true);

    const fallback = img.parentNode.querySelector('.image-fallback');
    expect(fallback).not.toBeNull();
    expect(fallback.tagName).toBe('P');
    expect(fallback.getAttribute('role')).toBe('status');
    expect(fallback.textContent).toBe('Exercise photo unavailable. Use the written form instructions.');
  });

  test('only appends a single fallback message even if error fires more than once', () => {
    const img = document.querySelector('.photo img');

    img.dispatchEvent(new window.Event('error'));
    img.dispatchEvent(new window.Event('error'));
    img.dispatchEvent(new window.Event('error'));

    const fallbacks = img.parentNode.querySelectorAll('.image-fallback');
    expect(fallbacks.length).toBe(1);
  });

  test('handles error events independently for each image', () => {
    const images = document.querySelectorAll('img');
    expect(images.length).toBeGreaterThan(1);

    const [firstImg, secondImg] = images;
    firstImg.dispatchEvent(new window.Event('error'));

    expect(firstImg.hidden).toBe(true);
    expect(secondImg.hidden).toBe(false);
    expect(secondImg.parentNode.querySelector('.image-fallback')).toBeNull();
  });

  test('images that never error remain visible with no fallback message', () => {
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      expect(img.hidden).toBe(false);
    });
    expect(document.querySelectorAll('.image-fallback').length).toBe(0);
  });
});