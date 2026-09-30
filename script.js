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
