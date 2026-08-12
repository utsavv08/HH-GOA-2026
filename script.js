// ===== HH GOA 2026 PFP GENERATOR & STUDIO =====

const SIZE = 1080;
const CENTER = SIZE / 2;

// State
let userPhoto = null;
let builderBadge = 'BUILD • SHIP • REPEAT';
let builderName = '';
let builderRole = '';
let photoScale = 1.0;
let photoOffsetX = 0;
let photoOffsetY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;

// DOM elements
const heroSection = document.getElementById('hero-section');
const genSection = document.getElementById('generator-section');
const canvas = document.getElementById('pfp-canvas');
const ctx = canvas.getContext('2d');
const createBtn = document.getElementById('create-btn');
const backBtn = document.getElementById('back-btn');
const uploadDropzone = document.getElementById('upload-dropzone');
const photoInput = document.getElementById('photo-upload');
const downloadBtn = document.getElementById('download-btn');
const shareBtn = document.getElementById('share-btn');
const badgeInput = document.getElementById('builder-badge');
const nameInput = document.getElementById('builder-name');
const roleInput = document.getElementById('builder-role');
const randomBadgeBtn = document.getElementById('random-badge-btn');
const samplePhotoBtn = document.getElementById('sample-photo-btn');
const badgeChipDisplay = document.getElementById('badge-chip-display');
const photoToolbar = document.getElementById('photo-toolbar');
const zoomInBtn = document.getElementById('zoom-in-btn');
const zoomOutBtn = document.getElementById('zoom-out-btn');
const zoomResetBtn = document.getElementById('zoom-reset-btn');
const canvasDropzone = document.getElementById('canvas-dropzone');

// Initialize Canvas Size
canvas.width = SIZE;
canvas.height = SIZE;

// ===== PRE-PROCESS GOA FRAME ARTWORK =====
let processedFrame = null;
const frameImage = new Image();
frameImage.src = 'assets/goa_frame_art.jpg';

frameImage.onload = () => {
  const offCanvas = document.createElement('canvas');
  offCanvas.width = SIZE;
  offCanvas.height = SIZE;
  const offCtx = offCanvas.getContext('2d');

  offCtx.drawImage(frameImage, 0, 0, SIZE, SIZE);

  try {
    const imgData = offCtx.getImageData(0, 0, SIZE, SIZE);
    const data = imgData.data;
    const centerRadius = 300;
    const outerScallopRadius = 492;

    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const idx = (y * SIZE + x) * 4;
        const dx = x - CENTER;
        const dy = y - CENTER;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        const isNeutral = (Math.abs(r - g) < 32 && Math.abs(g - b) < 32 && Math.abs(r - b) < 32 && r > 115);

        // Center cutout
        if (dist < centerRadius) {
          if (isNeutral || dist < centerRadius - 15) {
            data[idx + 3] = 0;
          }
        }

        // Outside cutout
        if (dist > outerScallopRadius) {
          if (isNeutral || dist > outerScallopRadius + 12) {
            data[idx + 3] = 0;
          }
        }
      }
    }

    offCtx.putImageData(imgData, 0, 0);
    processedFrame = offCanvas;
  } catch (err) {
    console.warn('Canvas pixel processing fallback', err);
    processedFrame = frameImage;
  }

  drawFrame();
};

// ===== PAGE TRANSITIONS =====
if (createBtn) {
  createBtn.addEventListener('click', () => {
    heroSection.classList.add('hidden');
    genSection.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => drawFrame(), 100);
  });
}

if (backBtn) {
  backBtn.addEventListener('click', () => {
    genSection.classList.add('hidden');
    heroSection.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===== PHOTO PROCESSOR (SUPPORTS JPG, PNG, WEBP, HEIC/HEIF) =====
async function processUploadedFile(file) {
  if (!file) return;

  // Check if file is HEIC/HEIF from iPhone
  const isHeic = file.type === 'image/heic' || 
                 file.type === 'image/heif' || 
                 file.name.toLowerCase().endsWith('.heic') || 
                 file.name.toLowerCase().endsWith('.heif');

  let imageBlob = file;

  if (isHeic && typeof heic2any === 'function') {
    try {
      if (uploadDropzone) {
        uploadDropzone.querySelector('.dropzone-title').textContent = 'Converting iPhone HEIC...';
      }
      const conversionResult = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.92
      });
      imageBlob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
    } catch (err) {
      console.warn('HEIC conversion failed, trying direct load', err);
    }
  }

  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      userPhoto = img;
      photoScale = 1.0;
      photoOffsetX = 0;
      photoOffsetY = 0;

      if (uploadDropzone) {
        uploadDropzone.classList.add('has-photo');
        uploadDropzone.querySelector('.dropzone-title').textContent = '✓ Photo Loaded';
        uploadDropzone.querySelector('.dropzone-subtitle').innerHTML = 'Click or drop another photo to change';
      }

      if (photoToolbar) photoToolbar.style.display = 'flex';
      drawFrame();
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(imageBlob);
}

// ===== PHOTO UPLOAD LISTENERS =====
if (uploadDropzone && photoInput) {
  uploadDropzone.addEventListener('click', () => photoInput.click());

  photoInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  });

  // Dropzone drag & drop
  uploadDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadDropzone.classList.add('dragover');
  });

  uploadDropzone.addEventListener('dragleave', () => {
    uploadDropzone.classList.remove('dragover');
  });

  uploadDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadDropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  });
}

// ===== SAMPLE PHOTO HANDLER =====
if (samplePhotoBtn) {
  samplePhotoBtn.addEventListener('click', () => {
    // Generate an instant high quality sample portrait avatar
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 600;
    sampleCanvas.height = 600;
    const sCtx = sampleCanvas.getContext('2d');

    // Background gradient
    const bgGrad = sCtx.createLinearGradient(0, 0, 600, 600);
    bgGrad.addColorStop(0, '#1B4332');
    bgGrad.addColorStop(0.5, '#2D6A4F');
    bgGrad.addColorStop(1, '#52B788');
    sCtx.fillStyle = bgGrad;
    sCtx.fillRect(0, 0, 600, 600);

    // Warm silhouette lighting
    sCtx.beginPath();
    sCtx.arc(300, 240, 110, 0, Math.PI * 2);
    sCtx.fillStyle = '#FAF4E8';
    sCtx.fill();

    // Body curve
    sCtx.beginPath();
    sCtx.arc(300, 520, 180, Math.PI, 0, false);
    sCtx.fillStyle = '#FAF4E8';
    sCtx.fill();

    // Sunglasses for builder vibe
    sCtx.fillStyle = '#0B3D0B';
    sCtx.beginPath();
    sCtx.roundRect ? sCtx.roundRect(230, 220, 55, 30, 6) : sCtx.rect(230, 220, 55, 30);
    sCtx.roundRect ? sCtx.roundRect(315, 220, 55, 30, 6) : sCtx.rect(315, 220, 55, 30);
    sCtx.fill();

    sCtx.strokeStyle = '#0B3D0B';
    sCtx.lineWidth = 4;
    sCtx.beginPath();
    sCtx.moveTo(285, 235);
    sCtx.lineTo(315, 235);
    sCtx.stroke();

    const img = new Image();
    img.onload = () => {
      userPhoto = img;
      photoScale = 1.0;
      photoOffsetX = 0;
      photoOffsetY = 0;

      if (uploadDropzone) {
        uploadDropzone.classList.add('has-photo');
        uploadDropzone.querySelector('.dropzone-title').textContent = '✓ Sample Photo Active';
        uploadDropzone.querySelector('.dropzone-subtitle').innerHTML = 'Click or drop your photo to replace';
      }

      if (downloadBtn) {
        downloadBtn.innerHTML = '<span class="btn-icon">⬇</span> DOWNLOAD HIGH-RES PFP (1080×1080)';
      }

      if (photoToolbar) photoToolbar.style.display = 'flex';
      drawFrame();
    };
    img.src = sampleCanvas.toDataURL('image/png');
  });
}

// ===== CANVAS DRAG & DROP =====
if (canvasDropzone) {
  canvasDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    canvasDropzone.style.borderColor = '#FF1493';
  });

  canvasDropzone.addEventListener('dragleave', () => {
    canvasDropzone.style.borderColor = '';
  });

  canvasDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    canvasDropzone.style.borderColor = '';
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  });
}

// ===== PHOTO ZOOM CONTROLS =====
if (zoomInBtn) {
  zoomInBtn.addEventListener('click', () => {
    photoScale = Math.min(3.0, photoScale + 0.15);
    if (zoomResetBtn) zoomResetBtn.textContent = `${Math.round(photoScale * 100)}%`;
    drawFrame();
  });
}

if (zoomOutBtn) {
  zoomOutBtn.addEventListener('click', () => {
    photoScale = Math.max(0.5, photoScale - 0.15);
    if (zoomResetBtn) zoomResetBtn.textContent = `${Math.round(photoScale * 100)}%`;
    drawFrame();
  });
}

if (zoomResetBtn) {
  zoomResetBtn.addEventListener('click', () => {
    photoScale = 1.0;
    photoOffsetX = 0;
    photoOffsetY = 0;
    zoomResetBtn.textContent = '100%';
    drawFrame();
  });
}

// ===== INTERACTIVE DRAG & PAN =====
canvas.addEventListener('mousedown', (e) => {
  if (!userPhoto) return;
  isDragging = true;
  startX = e.clientX - photoOffsetX;
  startY = e.clientY - photoOffsetY;
  canvas.style.cursor = 'grabbing';
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging || !userPhoto) return;
  photoOffsetX = e.clientX - startX;
  photoOffsetY = e.clientY - startY;
  drawFrame();
});

window.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    canvas.style.cursor = 'grab';
  }
});

// Touch support for mobile
canvas.addEventListener('touchstart', (e) => {
  if (!userPhoto || e.touches.length === 0) return;
  isDragging = true;
  startX = e.touches[0].clientX - photoOffsetX;
  startY = e.touches[0].clientY - photoOffsetY;
}, { passive: true });

canvas.addEventListener('touchmove', (e) => {
  if (!isDragging || !userPhoto || e.touches.length === 0) return;
  photoOffsetX = e.touches[0].clientX - startX;
  photoOffsetY = e.touches[0].clientY - startY;
  drawFrame();
}, { passive: true });

canvas.addEventListener('touchend', () => {
  isDragging = false;
});

// ===== BADGE & FORMAT B INPUTS (NEAR INSTANT RE-RENDER) =====
function getEffectiveTag() {
  if (builderName && builderRole) {
    return `${builderName} // ${builderRole}`;
  } else if (builderName) {
    return builderName;
  } else if (builderRole) {
    return `BUILDER // ${builderRole}`;
  }
  return builderBadge || 'BUILD • SHIP • REPEAT';
}

function updateBadge(newText) {
  builderBadge = newText;
  if (badgeInput) badgeInput.value = builderBadge;
  if (badgeChipDisplay) badgeChipDisplay.textContent = getEffectiveTag();
  drawFrame();
}

if (badgeInput) {
  badgeInput.addEventListener('input', (e) => {
    updateBadge(e.target.value);
  });
}

if (nameInput) {
  nameInput.addEventListener('input', (e) => {
    builderName = e.target.value.trim();
    if (badgeChipDisplay) badgeChipDisplay.textContent = getEffectiveTag();
    drawFrame();
  });
}

if (roleInput) {
  roleInput.addEventListener('input', (e) => {
    builderRole = e.target.value.trim();
    if (badgeChipDisplay) badgeChipDisplay.textContent = getEffectiveTag();
    drawFrame();
  });
}

const randomPresets = [
  'BUILD • SHIP • REPEAT',
  'SOLANA // RUST',
  'AI × CRYPTO',
  'FOUNDER // GOA',
  'RESIDENT // 247',
  'SMART CONTRACTS',
  'SHIP OR DIE',
  'FULL STACK DEV',
  'DECENTRALIZED // 2026',
  'BUILDER // 404'
];

if (randomBadgeBtn) {
  randomBadgeBtn.addEventListener('click', () => {
    const randomPick = randomPresets[Math.floor(Math.random() * randomPresets.length)];
    updateBadge(randomPick);
  });
}

// ===== TOAST HELPER =====
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// ===== DOWNLOAD IMAGE =====
if (downloadBtn) {
  downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'hh-goa-2026-pfp.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('✨ PFP image downloaded successfully (1080×1080)!');
  });
}

// ===== UPLOAD TICKET TO BACKEND =====
async function uploadToTicketBackend(dataUrl) {
  // 1. Try local server API endpoint first (instant, 2ms)
  try {
    const res = await fetch('/api/upload-ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: dataUrl })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.ticket_id) {
        const baseOrigin = window.location.origin;
        return `${baseOrigin}/ticket/${data.ticket_id}`;
      }
    }
  } catch (e) {
    /* fallback to external */
  }

  // 2. Try external duckdns endpoint (with 3s timeout)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch('https://hh-goa-tickets.duckdns.org/api/upload-ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: dataUrl }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (response.ok) {
      const data = await response.json();
      if (data && data.ticket_id) {
        return `https://hh-goa-tickets.duckdns.org/ticket/${data.ticket_id}`;
      }
    }
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('External backend timeout/error:', err);
  }

  // 3. Guaranteed client-side fallback URL so "Check out my PFP" is NEVER missing
  const fallbackId = 'pfp-' + Math.random().toString(36).substring(2, 9);
  const baseOrigin = window.location.origin;
  return `${baseOrigin}/view.html?id=${fallbackId}`;
}

// ===== SHARE TO X =====
if (shareBtn) {
  shareBtn.addEventListener('click', async () => {
    const origHtml = shareBtn.innerHTML;
    shareBtn.innerHTML = '<span class="btn-icon">⏳</span> UPLOADING...';
    shareBtn.style.pointerEvents = 'none';

    const tag = getEffectiveTag();
    const tagSnippet = tag && tag !== 'BUILD • SHIP • REPEAT' ? ` (${tag})` : '';
    const siteUrl = window.location.href.split('#')[0];

    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     (navigator.maxTouchPoints > 1 && window.innerWidth <= 820);

    // Copy image to clipboard for desktop users
    if (!isMobile && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
      try {
        const item = new ClipboardItem({
          'image/png': new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'))
        });
        navigator.clipboard.write([item]).catch(() => {});
      } catch (e) {}
    }

    try {
      // 1. Get high-quality jpeg data for backend upload
      const imageData = canvas.toDataURL('image/jpeg', 0.85);

      // 2. Upload to ticket backend
      const ticketUrl = await uploadToTicketBackend(imageData);

      // 3. Build caption with BOTH distinct links ALWAYS included:
      const caption = `Just claimed my official HH Goa 2026 PFP${tagSnippet}! 🌴🚀\n\nSee you in Goa this Oct 28–31.\n\nCheck out my PFP: ${ticketUrl}\n\nMake yours: ${siteUrl}\n\n#FrameInGoa #HHGoa2026 #BuildShipRepeat`;
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`;

      // 4. Directly open X
      if (isMobile && navigator.share) {
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], 'hh-goa-2026-pfp.png', { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              try {
                await navigator.share({ text: caption, files: [file] });
                return;
              } catch (err) {
                if (err.name === 'AbortError') return;
              }
            }
          }
          window.open(tweetUrl, '_blank');
        }, 'image/png');
      } else {
        window.open(tweetUrl, '_blank');
      }
    } catch (err) {
      console.error('Share error:', err);
      const fallbackUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Just claimed my official HH Goa 2026 PFP! 🌴🚀\n\nSee you in Goa this Oct 28–31.\n\nCheck out my PFP: ${siteUrl}ticket/sample\n\nMake yours: ${siteUrl}\n\n#FrameInGoa #HHGoa2026`)}`;
      window.open(fallbackUrl, '_blank');
    } finally {
      shareBtn.innerHTML = origHtml;
      shareBtn.style.pointerEvents = 'auto';
    }
  });
}

// ===== MAIN CANVAS DRAWING ENGINE =====
function drawFrame() {
  ctx.clearRect(0, 0, SIZE, SIZE);

  // 0. Solid Pure Black Background (ensures Twitter/X dark presentation and eliminates white corners when pasted/shared)
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, SIZE, SIZE);

  // 1. Draw User Photo or Placeholder
  drawUserPhoto();

  // 2. Draw the Authentic Goan Frame Artwork Overlay
  if (processedFrame) {
    ctx.drawImage(processedFrame, 0, 0, SIZE, SIZE);
  } else {
    drawFallbackVectorFrame();
  }

  // 3. Draw Dynamic Builder Badge Tag
  drawDynamicBuilderTag();
}

// ===== DRAW USER PHOTO =====
function drawUserPhoto() {
  const photoRadius = 310;

  ctx.save();
  ctx.beginPath();
  ctx.arc(CENTER, CENTER, photoRadius, 0, Math.PI * 2);
  ctx.clip();

  if (userPhoto) {
    const imgAspect = userPhoto.width / userPhoto.height;
    const baseDim = photoRadius * 2;
    let drawW, drawH;

    if (imgAspect > 1) {
      drawH = baseDim * photoScale;
      drawW = drawH * imgAspect;
    } else {
      drawW = baseDim * photoScale;
      drawH = drawW / imgAspect;
    }

    const drawX = CENTER - drawW / 2 + photoOffsetX;
    const drawY = CENTER - drawH / 2 + photoOffsetY;

    ctx.drawImage(userPhoto, drawX, drawY, drawW, drawH);
  } else {
    // Modern placeholder gradient
    const grad = ctx.createRadialGradient(CENTER, CENTER, 20, CENTER, CENTER, photoRadius);
    grad.addColorStop(0, '#1E5336');
    grad.addColorStop(0.7, '#0E3A20');
    grad.addColorStop(1, '#072412');
    ctx.fillStyle = grad;
    ctx.fillRect(CENTER - photoRadius, CENTER - photoRadius, photoRadius * 2, photoRadius * 2);

    // Subtle background mesh
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.08)';
    ctx.lineWidth = 1;
    for (let i = -photoRadius; i <= photoRadius; i += 30) {
      ctx.beginPath();
      ctx.moveTo(CENTER + i, CENTER - photoRadius);
      ctx.lineTo(CENTER + i, CENTER + photoRadius);
      ctx.stroke();
    }

    // Upload Camera Icon
    ctx.fillStyle = 'rgba(245, 230, 200, 0.4)';
    ctx.font = 'bold 56px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📸', CENTER, CENTER - 32);

    ctx.fillStyle = '#FAF4E8';
    ctx.font = 'bold 22px "Space Mono", monospace';
    ctx.fillText('UPLOAD PHOTO', CENTER, CENTER + 28);

    ctx.fillStyle = 'rgba(250, 244, 232, 0.6)';
    ctx.font = '14px "Space Mono", monospace';
    ctx.fillText('Click upload or drag & drop', CENTER, CENTER + 58);
  }

  ctx.restore();
}

// ===== DRAW DYNAMIC BUILDER TAG =====
function drawDynamicBuilderTag() {
  const displayTag = getEffectiveTag();
  if (!displayTag) return;

  ctx.save();

  // Position a sleek builder identity chip on the top left
  const chipX = CENTER - 340;
  const chipY = CENTER - 415;

  ctx.font = 'bold 15px "Space Mono", monospace';
  const textW = ctx.measureText(displayTag).width;
  const chipW = Math.min(360, textW + 28);
  const chipH = 32;

  // Shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;

  // Dark Green Badge with Gold Border
  ctx.fillStyle = '#0B3D0B';
  roundRect(ctx, chipX, chipY, chipW, chipH, 6);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 1.5;
  roundRect(ctx, chipX, chipY, chipW, chipH, 6);
  ctx.stroke();

  // Text with clipping
  ctx.save();
  roundRect(ctx, chipX, chipY, chipW, chipH, 6);
  ctx.clip();
  ctx.fillStyle = '#FFD700';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(displayTag, chipX + 14, chipY + chipH / 2);
  ctx.restore();

  ctx.restore();
}

// ===== FALLBACK VECTOR DRAWING =====
function drawFallbackVectorFrame() {
  ctx.save();

  // Outer Scalloped Circle
  drawScallopedCircle(CENTER, CENTER, 490, 36, 22, '#FAF4E8');

  // Forest green ring
  ctx.beginPath();
  ctx.arc(CENTER, CENTER, 465, 0, Math.PI * 2);
  ctx.fillStyle = '#0B3D0B';
  ctx.fill();

  // Inner ring
  ctx.beginPath();
  ctx.arc(CENTER, CENTER, 300, 0, Math.PI * 2);
  ctx.strokeStyle = '#FAF4E8';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Curved text
  drawCurvedText('H A C K E R   H O U S E', CENTER, CENTER, 400, -Math.PI / 2, {
    fontSize: 52,
    fontFamily: '"Bebas Neue", sans-serif',
    color: '#FFFFFF',
    spacing: 3
  });

  drawCurvedText('B U I L D  •  S H I P  •  R E P E A T', CENTER, CENTER, 400, Math.PI / 2, {
    fontSize: 38,
    fontFamily: '"Bebas Neue", sans-serif',
    color: '#FAF4E8',
    spacing: 2,
    flip: true
  });

  ctx.restore();
}

// ===== SCALLOPED CIRCLE =====
function drawScallopedCircle(cx, cy, radius, numBumps, bumpDepth, color) {
  ctx.save();
  ctx.beginPath();

  for (let i = 0; i < numBumps; i++) {
    const a1 = (i / numBumps) * Math.PI * 2;
    const a2 = ((i + 1) / numBumps) * Math.PI * 2;

    const x1 = cx + radius * Math.cos(a1);
    const y1 = cy + radius * Math.sin(a1);
    const x2 = cx + radius * Math.cos(a2);
    const y2 = cy + radius * Math.sin(a2);

    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const dx = mx - cx;
    const dy = my - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const cpx = mx + (dx / dist) * bumpDepth;
    const cpy = my + (dy / dist) * bumpDepth;

    if (i === 0) ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(cpx, cpy, x2, y2);
  }

  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

// ===== CURVED TEXT =====
function drawCurvedText(text, cx, cy, radius, centerAngle, options = {}) {
  const {
    fontSize = 48,
    fontFamily = '"Bebas Neue", sans-serif',
    color = '#FFFFFF',
    spacing = 0,
    flip = false
  } = options;

  ctx.save();
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const chars = text.split('');
  const widths = chars.map(c => ctx.measureText(c).width + spacing);
  const totalWidth = widths.reduce((a, b) => a + b, 0);
  const totalAngle = totalWidth / radius;

  let angle = centerAngle - totalAngle / 2;

  for (let i = 0; i < chars.length; i++) {
    const halfChar = widths[i] / (2 * radius);
    const midAngle = angle + halfChar;

    ctx.save();
    ctx.translate(cx + radius * Math.cos(midAngle), cy + radius * Math.sin(midAngle));

    if (flip) {
      ctx.rotate(midAngle - Math.PI / 2);
    } else {
      ctx.rotate(midAngle + Math.PI / 2);
    }

    ctx.fillText(chars[i], 0, 0);
    ctx.restore();

    angle += widths[i] / radius;
  }

  ctx.restore();
}

// ===== UTILITY: Rounded Rectangle =====
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ===== TEAM UNO MODAL CONTROLLER =====
const teamBtn = document.getElementById('team-btn');
const teamModal = document.getElementById('team-modal');
const closeTeamModalBtn = document.getElementById('close-team-modal');
const teamModalBackdrop = document.getElementById('team-modal-backdrop');

function openTeamModal() {
  if (teamModal) {
    teamModal.classList.add('active');
    teamModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
}

function closeTeamModal() {
  if (teamModal) {
    teamModal.classList.remove('active');
    teamModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

if (teamBtn) {
  teamBtn.addEventListener('click', openTeamModal);
}

if (closeTeamModalBtn) {
  closeTeamModalBtn.addEventListener('click', closeTeamModal);
}

if (teamModalBackdrop) {
  teamModalBackdrop.addEventListener('click', closeTeamModal);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && teamModal && teamModal.classList.contains('active')) {
    closeTeamModal();
  }
});

// ===== INIT: Draw initial frame when fonts ready =====
document.fonts.ready.then(() => {
  drawFrame();
});

