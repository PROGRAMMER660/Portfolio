// Navigation System
function navigateTo(sectionId) {
    document.querySelectorAll('.section-view').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(`section-${sectionId}`);
    if (target) target.classList.remove('hidden');

    document.querySelectorAll('header nav button').forEach(btn => btn.classList.remove('active'));
    // Handle desktop nav button highlighting
    const navBtn = document.getElementById(`nav-${sectionId}`);
    if (navBtn) navBtn.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
}

// Practice Zone Tabs
function switchPracticeTab(tab) {
    ['writing', 'speed', 'dictation'].forEach(t => {
        const el = document.getElementById(`pzone-${t}`);
        const btn = document.getElementById(`ptab-${t}`);
        if (el) el.classList.add('hidden');
        if (btn) btn.className = "pb-3 text-sm font-semibold text-slate-500 hover:text-brand-600 border-b-2 border-transparent whitespace-nowrap";
    });
    const targetEl = document.getElementById(`pzone-${tab}`);
    const targetBtn = document.getElementById(`ptab-${tab}`);
    if (targetEl) targetEl.classList.remove('hidden');
    if (targetBtn) targetBtn.className = "pb-3 text-sm font-semibold text-brand-600 border-b-2 border-brand-600 whitespace-nowrap";
}

// Canvas Drawing Pad Logic
let canvas, ctx, isDrawing = false, penColor = '#0284c7';

function initCanvas() {
    canvas = document.getElementById('steno-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height || 350;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseleave', stopDraw);

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', { clientX: touch.clientX, clientY: touch.clientY });
        canvas.dispatchEvent(mouseEvent);
    });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', { clientX: touch.clientX, clientY: touch.clientY });
        canvas.dispatchEvent(mouseEvent);
    });
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        const mouseEvent = new MouseEvent('mouseup', {});
        canvas.dispatchEvent(mouseEvent);
    });

    updateCanvasTarget();
}

function startDraw(e) {
    isDrawing = true;
    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function draw(e) {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = document.getElementById('pen-size').value;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
}

function stopDraw() {
    isDrawing = false;
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function setPenColor(color) {
    penColor = color;
}

function downloadCanvas() {
    const link = document.createElement('a');
    link.download = 'steno-practice.png';
    link.href = canvas.toDataURL();
    link.click();
}

function updateCanvasTarget() {
    const target = document.getElementById('canvas-target-select').value;
    const guideSvg = document.getElementById('canvas-guide-svg');
    const guideDesc = document.getElementById('canvas-guide-desc');

    if (target === 'K') {
        guideSvg.innerHTML = `<svg class="w-32 h-16" viewBox="0 0 120 60"><path d="M20,35 Q60,20 100,35" stroke="#0284c7" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;
        guideDesc.innerText = "Write a shallow, smooth forward curve resting on the line.";
    } else if (target === 'S') {
        guideSvg.innerHTML = `<svg class="w-32 h-16" viewBox="0 0 120 60"><path d="M50,20 Q60,35 55,45" stroke="#059669" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;
        guideDesc.innerText = "Tiny downward curve resembling a comma.";
    } else if (target === 'F') {
        guideSvg.innerHTML = `<svg class="w-32 h-16" viewBox="0 0 120 60"><path d="M50,15 Q65,35 55,50" stroke="#059669" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;
        guideDesc.innerText = "Medium downward curve (half space height).";
    } else if (target === 'V') {
        guideSvg.innerHTML = `<svg class="w-32 h-16" viewBox="0 0 120 60"><path d="M50,10 Q75,35 50,55" stroke="#dc2626" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;
        guideDesc.innerText = "Large downward curve (full space height).";
    } else {
        guideSvg.innerHTML = `<svg class="w-32 h-16" viewBox="0 0 120 60"><circle cx="60" cy="30" r="14" stroke="#dc2626" stroke-width="3" fill="none"/></svg>`;
        guideDesc.innerText = "Write a balanced circle stroke.";
    }
}

// Passage Typing Test Logic
const passageQuotesPool = [
    "Business letters should be written clearly and concisely with proper steno form adherence.",
    "Executive assistants must transcribe dictation with precision and confidentiality in modern corporate settings.",
    "Mastering Gregg shorthand requires consistent daily practice with light fluid stroke movements.",
    "Phrasography enables high speed shorthand transcription by eliminating pen lifts between common words.",
    "Accuracy in shorthand transcription builds executive trust and prepares students for administrative success."
];

let currentQuoteIndex = 0;
let startTime = null;
let testActive = false;

document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    loadQuote(0);

    const speedInput = document.getElementById('speed-input');
    if (speedInput) {
        speedInput.addEventListener('input', handleTypingInput);
    }
});

function loadQuote(index) {
    currentQuoteIndex = index % passageQuotesPool.length;
    document.getElementById('speed-prompt-text').innerText = passageQuotesPool[currentQuoteIndex];
    resetSpeedTrainer();
}

function loadNewQuote() {
    let nextIndex;
    do {
        nextIndex = Math.floor(Math.random() * passageQuotesPool.length);
    } while (nextIndex === currentQuoteIndex && passageQuotesPool.length > 1);
    
    loadQuote(nextIndex);
}

function handleTypingInput() {
    const promptText = document.getElementById('speed-prompt-text').innerText;
    const typedText = document.getElementById('speed-input').value;

    if (!testActive && typedText.length > 0) {
        testActive = true;
        startTime = new Date();
    }

    if (!testActive) return;

    let mistakes = 0;
    for (let i = 0; i < typedText.length; i++) {
        if (typedText[i] !== promptText[i]) {
            mistakes++;
        }
    }

    const accuracy = typedText.length > 0 ? Math.max(0, Math.round(((typedText.length - mistakes) / typedText.length) * 100)) : 100;
    const timeElapsedSeconds = (new Date() - startTime) / 1000;
    const wordsTyped = typedText.trim().split(/\s+/).filter(Boolean).length;
    const currentWPM = timeElapsedSeconds > 0 ? Math.round((wordsTyped / timeElapsedSeconds) * 60) : 0;

    document.getElementById('speed-wpm').innerText = `${currentWPM} WPM`;
    document.getElementById('speed-accuracy').innerText = `${accuracy}%`;
    document.getElementById('speed-mistakes').innerText = mistakes;

    if (typedText.length >= promptText.length) {
        finishTypingTest(currentWPM, accuracy, mistakes, timeElapsedSeconds);
    }
}

function finishTypingTest(wpm, accuracy, mistakes, timeSeconds) {
    testActive = false;
    document.getElementById('speed-input').disabled = true;
    document.getElementById('speed-status-msg').innerText = "Passage complete! Check your results below.";

    document.getElementById('res-wpm').innerText = `${wpm} WPM`;
    document.getElementById('res-accuracy').innerText = `${accuracy}%`;
    document.getElementById('res-mistakes').innerText = mistakes;
    document.getElementById('res-time').innerText = `${Math.round(timeSeconds)}s`;
    
    document.getElementById('typing-results-modal').classList.remove('hidden');
}

function resetSpeedTrainer() {
    testActive = false;
    startTime = null;
    document.getElementById('speed-wpm').innerText = "0 WPM";
    document.getElementById('speed-accuracy').innerText = "100%";
    document.getElementById('speed-mistakes').innerText = "0";
    
    const input = document.getElementById('speed-input');
    input.value = "";
    input.disabled = false;
    
    document.getElementById('speed-status-msg').innerText = "Type the complete passage to calculate final results.";
    document.getElementById('typing-results-modal').classList.add('hidden');
}

// Audio Dictation Studio Logic
function updateTTSWPM() {
    const wpmVal = document.getElementById('tts-wpm-select').value;
    document.getElementById('tts-wpm-label').innerText = wpmVal;
}

function startTTSDictation() {
    if (!('speechSynthesis' in window)) {
        alert("Sorry, your browser doesn't support text-to-speech dictation.");
        return;
    }
    
    window.speechSynthesis.cancel();

    const textToRead = document.getElementById('tts-user-text').value;
    if (!textToRead.trim()) {
        alert("Please paste or type some text to dictate.");
        return;
    }

    const utterance = new SpeechSynthesisUtterance(textToRead);
    const selectedWPM = parseInt(document.getElementById('tts-wpm-select').value) || 40;
    utterance.rate = Math.max(0.2, Math.min(2.0, selectedWPM / 90));

    utterance.onstart = () => {
        document.getElementById('tts-status-box').classList.remove('hidden');
    };

    utterance.onend = () => {
        document.getElementById('tts-status-box').classList.add('hidden');
    };

    window.speechSynthesis.speak(utterance);
}

function stopTTSDictation() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        document.getElementById('tts-status-box').classList.add('hidden');
    }
}

// Contact Form Handler
function handleContactSubmit(e) {
    e.preventDefault();
    document.getElementById('contact-success').classList.remove('hidden');
    e.target.reset();
}