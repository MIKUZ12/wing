const video = document.querySelector('#hero-video');
const toggle = document.querySelector('#video-toggle');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function updateVideoButton() {
  if (video.ended) {
    toggle.innerHTML = '↻ <span>Replay video</span>';
    toggle.setAttribute('aria-label', 'Replay background video');
    return;
  }
  toggle.innerHTML = video.paused ? '▶ <span>Play video</span>' : 'Ⅱ <span>Pause video</span>';
  toggle.setAttribute('aria-label', video.paused ? 'Play background video' : 'Pause background video');
}
toggle.addEventListener('click', () => {
  if (video.paused) video.play().catch(updateVideoButton);
  else video.pause();
});
video.addEventListener('play', updateVideoButton);
video.addEventListener('pause', updateVideoButton);
video.addEventListener('ended', updateVideoButton);
function applyMotionPreference() {
  if (reducedMotion.matches) {
    video.autoplay = false;
    video.pause();
  } else if (!video.ended) video.play().catch(updateVideoButton);
  updateVideoButton();
}
reducedMotion.addEventListener('change', applyMotionPreference);
applyMotionPreference();


const sectionMenu = document.querySelector('.section-menu');
const sectionLabel = document.querySelector('#current-section');
const sectionLinks = [...document.querySelectorAll('.section-menu-links a')];
const sections = sectionLinks.map(link => document.querySelector(link.hash));
let scrollPending = false;
function updateCurrentSection() {
  const threshold = document.querySelector('.header').offsetHeight + 100;
  let index = 0;
  sections.forEach((section, i) => {
    if (section.getBoundingClientRect().top <= threshold) index = i;
  });
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) index = sections.length - 1;
  sectionLabel.textContent = sectionLinks[index].textContent;
  sectionLinks.forEach((link, i) => {
    if (i === index) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  scrollPending = false;
}
window.addEventListener('scroll', () => {
  if (!scrollPending) {
    scrollPending = true;
    requestAnimationFrame(updateCurrentSection);
  }
}, { passive: true });
window.addEventListener('resize', updateCurrentSection);
window.addEventListener('pageshow', updateCurrentSection);
sectionLinks.forEach(link => link.addEventListener('click', () => { sectionMenu.open = false; }));
document.addEventListener('click', event => {
  if (!sectionMenu.contains(event.target)) sectionMenu.open = false;
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && sectionMenu.open) {
    sectionMenu.open = false;
    sectionMenu.querySelector('summary').focus();
  }
});
updateCurrentSection();
document.querySelector('#copy-citation').addEventListener('click', async () => {
  const status = document.querySelector('#copy-status');
  try {
    await navigator.clipboard.writeText(document.querySelector('#citation-text').textContent);
    status.textContent = 'Citation copied.';
  } catch {
    status.textContent = 'Please select and copy the citation above.';
  }
});


// Extend narrow strips of the live frame into the fading margins.
const edgeCanvas = document.querySelector('.video-edge-extension');
const edgeContext = edgeCanvas.getContext('2d');
let lastEdgeFrame = -Infinity;
function drawEdgeExtension() {
  if (!edgeContext || video.readyState < 2) return;
  const width = video.videoWidth;
  const height = video.videoHeight;
  const strip = Math.max(1, Math.round(width * .012));
  const frame = video.getBoundingClientRect();
  const canvas = edgeCanvas.getBoundingClientRect();
  const scale = edgeCanvas.width / canvas.width;
  const left = (frame.left - canvas.left) * scale;
  const frameWidth = frame.width * scale;
  const right = left + frameWidth;
  edgeContext.clearRect(0, 0, edgeCanvas.width, edgeCanvas.height);
  edgeContext.drawImage(video, 0, 0, width, height, left, 0, frameWidth, 540);
  if (left > 0) edgeContext.drawImage(video, 0, 0, strip, height, 0, 0, left, 540);
  if (right < edgeCanvas.width) edgeContext.drawImage(video, width - strip, 0, strip, height, right, 0, edgeCanvas.width - right, 540);
}
if ('requestVideoFrameCallback' in video) {
  const updateEdges = (now) => {
    if (now - lastEdgeFrame > 80 || video.paused || video.ended) {
      drawEdgeExtension();
      lastEdgeFrame = now;
    }
    video.requestVideoFrameCallback(updateEdges);
  };
  video.requestVideoFrameCallback(updateEdges);
} else video.addEventListener('timeupdate', drawEdgeExtension);
['loadeddata', 'seeked', 'pause', 'ended'].forEach(event => video.addEventListener(event, drawEdgeExtension));
drawEdgeExtension();

window.addEventListener('resize', drawEdgeExtension);

const comparison = document.querySelector('.benchmark-comparison');
const benchmarkRows = [...document.querySelectorAll('.benchmark-row')];
const benchmarkTooltip = document.querySelector('#benchmark-tooltip');
let activeBenchmarkRow = null;
const benchmarkDetails = new Map(benchmarkRows.map(row => [row, JSON.parse(row.dataset.benchmarkDetail)]));
function positionBenchmarkTooltip(event) {
  if (!activeBenchmarkRow || benchmarkTooltip.hidden) return;
  const anchor = activeBenchmarkRow.getBoundingClientRect();
  const pointer = event && event.type.startsWith('pointer') && event.pointerType !== 'touch';
  let left = pointer ? event.clientX + 16 : anchor.left;
  let top = pointer ? event.clientY + 18 : anchor.bottom + 10;
  const bounds = benchmarkTooltip.getBoundingClientRect();
  if (top + bounds.height > innerHeight - 12) top = (pointer ? event.clientY : anchor.top) - bounds.height - 12;
  benchmarkTooltip.style.left = Math.max(12, Math.min(left, innerWidth - bounds.width - 12)) + 'px';
  benchmarkTooltip.style.top = Math.max(12, top) + 'px';
}
function hideBenchmarkTooltip() {
  benchmarkTooltip.hidden = true;
  comparison.classList.remove('has-highlight');
  benchmarkRows.forEach(row => {
    row.classList.remove('is-highlighted');
    row.removeAttribute('aria-describedby');
  });
  activeBenchmarkRow = null;
}
function showBenchmarkTooltip(row, event) {
  const detail = benchmarkDetails.get(row);
  activeBenchmarkRow = row;
  benchmarkTooltip.replaceChildren();
  function add(tag, text, className) {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) element.className = className;
    benchmarkTooltip.appendChild(element);
    return element;
  }
  add('h4', detail.method);
  add('p', detail.benchmark, 'tip-benchmark');
  add('p', detail.value + '%', 'tip-value');
  if (detail.details.length) {
    const list = add('dl', '');
    detail.details.forEach(([label, value]) => {
      const term = document.createElement('dt');
      const result = document.createElement('dd');
      term.textContent = label;
      result.textContent = value + '%';
      list.append(term, result);
    });
  }
  add('p', detail.comparison, 'tip-comparison');
  if (detail.note) add('p', detail.note, 'tip-note');
  add('p', detail.source, 'tip-source');
  comparison.classList.add('has-highlight');
  benchmarkRows.forEach(other => {
    other.classList.toggle('is-highlighted', other === row);
    other.removeAttribute('aria-describedby');
  });
  row.setAttribute('aria-describedby', 'benchmark-tooltip');
  benchmarkTooltip.hidden = false;
  positionBenchmarkTooltip(event);
}
benchmarkRows.forEach(row => {
  row.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') showBenchmarkTooltip(row, event); });
  row.addEventListener('pointermove', positionBenchmarkTooltip);
  row.addEventListener('pointerleave', event => { if (event.pointerType !== 'touch') hideBenchmarkTooltip(); });
  row.addEventListener('focus', event => showBenchmarkTooltip(row, event));
  row.addEventListener('blur', hideBenchmarkTooltip);
  row.addEventListener('click', event => showBenchmarkTooltip(row, event));
});
document.addEventListener('pointerdown', event => {
  if (!event.target.closest('.benchmark-row')) hideBenchmarkTooltip();
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') hideBenchmarkTooltip(); });
window.addEventListener('scroll', hideBenchmarkTooltip, { passive: true });
window.addEventListener('resize', hideBenchmarkTooltip);

// Lazy-load visible previews; expanded playback always uses the full 4K file.
const demoTrack = document.querySelector('#demo-track');
const demoDialog = document.querySelector('.demo-dialog');
const expandedDemo = document.querySelector('#expanded-demo');
const demoStatus = document.querySelector('.demo-playback-status');
const previewToggle = document.querySelector('#preview-toggle');
const previews = [...demoTrack.querySelectorAll('video')];
const visiblePreviews = new Set();
let previewsPaused = reducedMotion.matches;
let demoOpener = null;
function updatePreviews() {
  previewToggle.textContent = previewsPaused ? 'Play previews' : 'Pause previews';
  previews.forEach(preview => {
    if (visiblePreviews.has(preview) && !previewsPaused && !demoDialog.open && !document.hidden && !preview.ended) {
      if (!preview.getAttribute('src')) preview.src = preview.dataset.src;
      preview.play().catch(() => {});
    } else preview.pause();
  });
}
const previewObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) visiblePreviews.add(entry.target);
    else visiblePreviews.delete(entry.target);
  });
  updatePreviews();
}, { threshold: .25 });
previews.forEach(preview => previewObserver.observe(preview));
previewToggle.addEventListener('click', () => {
  previewsPaused = !previewsPaused;
  if (!previewsPaused) previews.forEach(preview => { if (preview.ended) preview.currentTime = 0; });
  updatePreviews();
});
reducedMotion.addEventListener('change', () => { previewsPaused = reducedMotion.matches; updatePreviews(); });
document.addEventListener('visibilitychange', updatePreviews);
updatePreviews();
const galleryPrev = document.querySelector('.gallery-prev');
const galleryNext = document.querySelector('.gallery-next');
function updateGalleryArrows() {
  galleryPrev.disabled = demoTrack.scrollLeft < 2;
  galleryNext.disabled = demoTrack.scrollLeft + demoTrack.clientWidth >= demoTrack.scrollWidth - 2;
}
function scrollGallery(direction) {
  const cards = demoTrack.querySelectorAll('.demo-card');
  const step = cards[1].offsetLeft - cards[0].offsetLeft;
  demoTrack.scrollBy({ left: direction * step, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
}
galleryPrev.addEventListener('click', () => scrollGallery(-1));
galleryNext.addEventListener('click', () => scrollGallery(1));
demoTrack.addEventListener('scroll', updateGalleryArrows, { passive: true });
window.addEventListener('resize', updateGalleryArrows);
updateGalleryArrows();
demoTrack.querySelectorAll('.demo-open').forEach(button => button.addEventListener('click', () => {
  demoOpener = button;
  document.querySelector('#demo-dialog-title').textContent = button.dataset.title;
  demoStatus.textContent = '';
  expandedDemo.poster = button.querySelector('video').poster;
  expandedDemo.src = button.dataset.video;
  demoDialog.showModal();
  updatePreviews();
  expandedDemo.play().catch(() => { if (demoDialog.open) demoStatus.textContent = 'Press play to start the video.'; });
}));
document.querySelector('.demo-close').addEventListener('click', () => demoDialog.close());
demoDialog.addEventListener('click', event => {
  const rect = demoDialog.getBoundingClientRect();
  if (event.target === demoDialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) demoDialog.close();
});
demoDialog.addEventListener('close', () => {
  expandedDemo.pause();
  expandedDemo.removeAttribute('src');
  expandedDemo.load();
  demoOpener?.focus({ preventScroll: true });
  updatePreviews();
});
expandedDemo.addEventListener('error', () => {
  if (demoDialog.open && expandedDemo.getAttribute('src')) demoStatus.textContent = 'The video could not be loaded. Please close it and try again.';
});

// Play inline as soon as the method animation enters the viewport.
const methodVideo = document.querySelector('#method-video');
const methodToggle = document.querySelector('#method-toggle');
let methodVisible = false;
let methodManuallyPaused = false;
methodVideo.muted = true;
function updateMethodToggle() {
  methodToggle.textContent = methodVideo.ended ? 'Replay animation' : methodVideo.paused ? 'Play animation' : 'Pause animation';
}
function playVisibleMethod() {
  if (methodVisible && !document.hidden && !methodManuallyPaused && !methodVideo.ended) {
    methodVideo.play().catch(updateMethodToggle);
  } else methodVideo.pause();
}
const methodObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const entering = entry.isIntersecting && !methodVisible;
    methodVisible = entry.isIntersecting;
    if (entering) {
      methodManuallyPaused = false;
      if (methodVideo.ended) methodVideo.currentTime = 0;
    }
    playVisibleMethod();
  });
}, { threshold: .15 });
methodObserver.observe(methodVideo);
methodVideo.addEventListener('canplay', playVisibleMethod);
['play', 'pause', 'ended'].forEach(event => methodVideo.addEventListener(event, updateMethodToggle));
methodToggle.addEventListener('click', () => {
  if (methodVideo.paused) {
    methodManuallyPaused = false;
    if (methodVideo.ended) methodVideo.currentTime = 0;
    methodVideo.play().catch(updateMethodToggle);
  } else {
    methodManuallyPaused = true;
    methodVideo.pause();
  }
});
document.addEventListener('visibilitychange', playVisibleMethod);

// Egocentric examples play independently when scrolled into view.
document.querySelectorAll('.ego-example').forEach(figure => {
  const clip = figure.querySelector('video');
  const button = figure.querySelector('.ego-toggle');
  let visible = false;
  let manuallyPaused = false;
  const updateLabel = () => { button.textContent = clip.ended ? 'Replay video' : clip.paused ? 'Play video' : 'Pause video'; };
  const updatePlayback = () => {
    if (visible && !document.hidden && !manuallyPaused && !clip.ended) {
      if (!clip.getAttribute('src')) clip.src = clip.dataset.egoSrc;
      clip.muted = true;
      clip.play().catch(updateLabel);
    } else clip.pause();
  };
  new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const entering = entry.isIntersecting && !visible;
      visible = entry.isIntersecting;
      if (entering) {
        manuallyPaused = false;
        if (clip.ended) clip.currentTime = 0;
      }
      updatePlayback();
    });
  }, { threshold: .2 }).observe(clip);
  button.addEventListener('click', () => {
    manuallyPaused = !clip.paused;
    if (clip.ended) clip.currentTime = 0;
    updatePlayback();
  });
  ['play', 'pause', 'ended'].forEach(event => clip.addEventListener(event, updateLabel));
  document.addEventListener('visibilitychange', updatePlayback);
});

// Keep the contents rail in document order, with one active subsection.
const contentsMenu = document.querySelector('.contents-menu');
const sidebarLinks = [...document.querySelectorAll('.sidebar-nav a')];
const sidebarTargets = sidebarLinks.map(link => document.querySelector(link.hash));
const desktopContents = matchMedia('(min-width: 1101px)');
function setContentsMode() { contentsMenu.open = desktopContents.matches; }
setContentsMode();
desktopContents.addEventListener('change', setContentsMode);
let contentsPending = false;
function updateContents() {
  const threshold = document.querySelector('.header').offsetHeight + 110;
  let active = 0;
  sidebarTargets.forEach((target, index) => { if (target.getBoundingClientRect().top <= threshold) active = index; });
  if (scrollY + innerHeight >= document.documentElement.scrollHeight - 2) active = sidebarLinks.length - 1;
  sidebarLinks.forEach((link, index) => {
    if (index === active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  document.querySelectorAll('.sidebar-nav > ul > li').forEach(item => item.classList.toggle('is-active-group', item.contains(sidebarLinks[active])));
  contentsPending = false;
}
window.addEventListener('scroll', () => { if (!contentsPending) { contentsPending = true; requestAnimationFrame(updateContents); } }, { passive: true });
window.addEventListener('resize', updateContents);
window.addEventListener('pageshow', updateContents);
sidebarLinks.forEach(link => link.addEventListener('click', () => { if (!desktopContents.matches) contentsMenu.open = false; }));
updateContents();

// An illustrative, orthonormal DCT of one latent dimension (not experimental data).
(() => {
  const panel = document.querySelector('.spectral-explorer');
  if (!panel) return;
  const stages = [...panel.querySelectorAll('.spectral-stage')];
  const slider = panel.querySelector('#spectral-k');
  const play = panel.querySelector('.spectral-play');
  const count = 16;
  const signal = Array.from({length: count}, (_, n) => .6 * Math.cos(Math.PI * (n + .5) / count) + .3 * Math.cos(2 * Math.PI * (n + .5) / count) + .16 * Math.cos(9 * Math.PI * (n + .5) / count) + .09 * Math.cos(13 * Math.PI * (n + .5) / count));
  const coefficients = signal.map((_, k) => Math.sqrt((k === 0 ? 1 : 2) / count) * signal.reduce((sum, value, n) => sum + value * Math.cos(Math.PI * (n + .5) * k / count), 0));
  const details = [
    ['Encode interactions over time', 'WING-LAM encodes successive frame pairs. The resulting sequence contains both slowly varying structure and rapid temporal changes.'],
    ['Separate temporal frequencies', 'A temporal DCT expresses each latent dimension as frequency coefficients, ordered from slow to fast variation. No coefficients have been discarded at this stage.'],
    ['Retain the shared slow structure', 'Only the first K coefficients form the guidance target. At inference, a predictor estimates these coefficients from the current context; the action model uses them to generate fine-grained controls.']
  ];
  let active = 0, running = false, visible = false, timer;
  const axis = '<path d="M8 95H232" fill="none" stroke="#bdc8c0" stroke-width="1"/>';
  panel.querySelector('.spectral-signal').innerHTML = axis + `<path d="${signal.map((v,n) => `${n ? 'L' : 'M'}${8+n*224/(count-1)},${52-v*40}`).join(' ')}" fill="none" stroke="#678e9f" stroke-width="2.5"/>`;
  function drawSpectrum(selector, truncate) {
    panel.querySelector(selector).innerHTML = axis + coefficients.map((c,k) => `<rect x="${9+k*14}" y="${94-Math.max(2,Math.abs(c)*37)}" width="9" height="${Math.max(2,Math.abs(c)*37)}" rx="1" fill="${truncate && k < Number(slider.value) ? '#377fa8' : '#91a09a'}" opacity="${truncate && k >= Number(slider.value) ? '.17' : '1'}"/>`).join('') + '<text x="8" y="109" fill="#7c877f" font-size="8" font-family="monospace">low</text><text x="210" y="109" fill="#7c877f" font-size="8" font-family="monospace">high</text>';
  }
  drawSpectrum('.spectral-spectrum', false);
  drawSpectrum('.spectral-retained', true);
  function select(index) {
    active = index;
    stages.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    panel.querySelector('.spectral-detail-title').textContent = details[index][0];
    panel.querySelector('.spectral-detail-copy').textContent = details[index][1];
  }
  function schedule() {
    clearInterval(timer);
    if (running && visible && !document.hidden) timer = setInterval(() => select((active + 1) % stages.length), 2000);
    play.textContent = running ? 'Pause sequence' : 'Play sequence';
    play.setAttribute('aria-pressed', String(running));
  }
  stages.forEach((button, index) => button.addEventListener('click', () => {running = false; schedule(); select(index);}));
  slider.addEventListener('input', () => {
    running = false; schedule(); select(2);
    panel.querySelector('#spectral-k-value').value = `K = ${slider.value} / ${count}`;
    drawSpectrum('.spectral-retained', true);
  });
  play.addEventListener('click', () => {running = !running; schedule();});
  let entered = false;
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible && !entered) {entered = true; running = !matchMedia('(prefers-reduced-motion: reduce)').matches;}
    schedule();
  }, {threshold: .25}).observe(panel);
  document.addEventListener('visibilitychange', schedule);
})();

// Frame-pair presentation: preserve the original decoded trajectories as images.
(() => {
  const gallery = document.querySelector('.interaction-gallery');
  if (!gallery) return;
  const stages = [...gallery.querySelectorAll('.interaction-stages button')];
  const examples = [...gallery.querySelectorAll('.interaction-images')];
  const play = gallery.querySelector('.interaction-play');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0, running = !reducedMotion.matches, visible = false, timer;
  function select(index) {
    active = index;
    stages.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    examples.forEach(example => [...example.children].forEach((img, i) => { img.hidden = i !== index; }));
  }
  function schedule() {
    clearTimeout(timer);
    play.textContent = running ? 'Pause sequence' : 'Play sequence';
    play.setAttribute('aria-pressed', String(running));
    if (running && visible && !document.hidden) timer = setTimeout(() => { select((active + 1) % 3); schedule(); }, active === 2 ? 3000 : 2000);
  }
  stages.forEach((button, index) => button.addEventListener('click', () => { running = false; select(index); schedule(); }));
  play.addEventListener('click', () => { running = !running; schedule(); });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }, {threshold: .15}).observe(gallery);
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) running = false; schedule(); });
  schedule();
})();

// Load only the selected original clip; thumbnails keep the gallery lightweight.
(() => {
  const gallery = document.querySelector('.generalization-gallery');
  if (!gallery) return;
  const tasks = {
    insertion: { title: 'Battery Insertion', types: ['app', 'spatial'] },
    assembly: { title: 'Battery Assembly', types: ['app', 'bg', 'spatial'] },
    pack3: { title: 'Pack Objects', types: ['app', 'bg', 'spatial', 'geo'] },
    stack: { title: 'Stack Cups', types: ['app', 'bg', 'spatial', 'geo'] }
  };
  const labels = { app: 'Appearance', bg: 'Background', spatial: 'Spatial', geo: 'Geometry' };
  const tabs = [...gallery.querySelectorAll('[data-task]')];
  const previews = gallery.querySelector('.gen-previews');
  const video = gallery.querySelector('.gen-video');
  const error = gallery.querySelector('.gen-error');
  let task = 'pack3', type = 'app', visible = false, loaded = false, resume = true;
  function playIfVisible() {
    if (!visible || document.hidden) { video.pause(); return; }
    if (!loaded) { video.src = `gen/${task}_${type}.MP4`; loaded = true; video.load(); }
    if (resume) video.play().catch(() => {});
  }
  function selectClip(next) {
    video.pause(); type = next; loaded = false; resume = true;
    error.hidden = true;
    error.querySelector('a').href = `gen/${task}_${type}.MP4`;
    video.poster = `assets/generalization/${task}_${type}.jpg`;
    video.setAttribute('aria-label', `${tasks[task].title}: ${labels[type]} generalization`);
    gallery.querySelector('.gen-title').textContent = tasks[task].title;
    gallery.querySelector('.gen-type').textContent = `${labels[type]} generalization`;
    [...previews.children].forEach(button => button.setAttribute('aria-pressed', String(button.dataset.type === type)));
    playIfVisible();
  }
  function selectTask(next) {
    task = next;
    tabs.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.task === task)));
    previews.replaceChildren();
    tasks[task].types.forEach(key => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'gen-preview'; button.dataset.type = key;
      button.setAttribute('aria-label', `Play ${tasks[task].title}: ${labels[key]} generalization`);
      const img = document.createElement('img'); img.src = `assets/generalization/${task}_${key}.jpg`; img.alt = ''; img.width = 480; img.height = 270;
      const label = document.createElement('span'); label.textContent = labels[key];
      button.append(img, label); button.addEventListener('click', () => selectClip(key)); previews.append(button);
    });
    previews.scrollTop = 0; previews.scrollLeft = 0;
    selectClip(tasks[task].types.includes(type) ? type : tasks[task].types[0]);
  }
  tabs.forEach(button => button.addEventListener('click', () => selectTask(button.dataset.task)));
  video.addEventListener('error', () => { error.hidden = false; });
  new IntersectionObserver(entries => {
    const next = entries[0].isIntersecting;
    if (!next && visible && loaded) resume = !video.paused;
    visible = next; playIfVisible();
  }, {threshold: .15}).observe(video);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && visible && loaded) resume = !video.paused;
    playIfVisible();
  });
  selectTask(task);
})();
