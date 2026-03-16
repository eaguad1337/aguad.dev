// ============================================
// AGUAD.DEV - Animations & Interactions
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all animations
  initMatrixRain();
  initTypewriter();
  initScrollReveal();
  initSmoothScroll();
});

// Matrix Rain Effect
function initMatrixRain() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Set canvas size
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Matrix characters - mix of Latin, Katakana, and technical symbols
  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>[]{}//||=+*&%$#@!';
  const charArray = chars.split('');
  
  const fontSize = 14;
  const columns = Math.floor(canvas.width / fontSize);
  
  // Drops array - one per column
  const drops = [];
  for (let i = 0; i < columns; i++) {
    // Random start position for each column
    drops[i] = Math.random() * -100;
  }
  
  let frameCount = 0;
  let isActive = true;
  
  // Visibility check - pause when not visible
  const observer = new IntersectionObserver((entries) => {
    isActive = entries[0].isIntersecting;
  }, { threshold: 0 });
  observer.observe(canvas);
  
  function draw() {
    if (!isActive) {
      requestAnimationFrame(draw);
      return;
    }
    
    // Only draw every 2nd frame for performance (30fps)
    frameCount++;
    if (frameCount % 2 !== 0) {
      requestAnimationFrame(draw);
      return;
    }
    
    // Semi-transparent black for trail effect
    ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = fontSize + 'px JetBrains Mono';
    
    for (let i = 0; i < drops.length; i++) {
      // Random character
      const char = charArray[Math.floor(Math.random() * charArray.length)];
      
      // x = i * fontSize, y = drops[i] * fontSize
      ctx.fillText(char, i * fontSize, drops[i] * fontSize);
      
      // Reset drop to top randomly after it crosses screen
      // Add randomness to reset chance for varied effect
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      
      // Move drop down
      drops[i]++;
    }
    
    requestAnimationFrame(draw);
  }
  
  draw();
}

// Typewriter Effect
function initTypewriter() {
  const element = document.querySelector('.typewriter-text');
  if (!element) return;
  
  const text = element.getAttribute('data-text') || element.textContent;
  const speed = parseInt(element.getAttribute('data-speed')) || 50;
  const delay = parseInt(element.getAttribute('data-delay')) || 500;
  
  element.textContent = '';
  element.style.opacity = '1';
  
  let i = 0;
  
  setTimeout(() => {
    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    }
    type();
  }, delay);
}

// Scroll Reveal Animation
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length === 0) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Optionally unobserve after revealing
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  reveals.forEach(el => observer.observe(el));
}

// Smooth Scroll for anchor links
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Mouse parallax effect for hero (subtle)
document.addEventListener('mousemove', (e) => {
  const hero = document.querySelector('.hero-content');
  if (!hero || window.matchMedia('(pointer: coarse)').matches) return;
  
  const x = (e.clientX / window.innerWidth - 0.5) * 10;
  const y = (e.clientY / window.innerHeight - 0.5) * 10;
  
  hero.style.transform = `translate(${x}px, ${y}px)`;
});

// ============================================
// KONAMI CODE EASTER EGG
// ============================================
(function initKonamiCode() {
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a', 'Enter'];
  let konamiIndex = 0;
  let konamiActive = false;
  
  // Create overlay container
  const overlay = document.createElement('div');
  overlay.id = 'konami-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.5s ease;
  `;
  
  // Create spinning image
  const img = document.createElement('img');
  img.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEqSIeDvXZ1ZDWFduJzOpXfzrVrc8oiRhW5A&s';
  img.alt = 'Konami Easter Egg';
  img.style.cssText = `
    max-width: 300px;
    max-height: 300px;
    border-radius: 50%;
    animation: konami-spin 3s linear infinite;
    box-shadow: 0 0 50px rgba(255, 255, 255, 0.5);
  `;
  
  overlay.appendChild(img);
  document.body.appendChild(overlay);
  
  // Add keyframes for spin animation
  if (!document.getElementById('konami-styles')) {
    const style = document.createElement('style');
    style.id = 'konami-styles';
    style.textContent = `
      @keyframes konami-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      #konami-overlay.active {
        opacity: 1;
        pointer-events: auto;
      }
      #konami-overlay.active img {
        animation: konami-spin 2s linear infinite, konami-pulse 1s ease-in-out infinite alternate;
      }
      @keyframes konami-pulse {
        from { box-shadow: 0 0 30px rgba(255, 255, 255, 0.3); }
        to { box-shadow: 0 0 80px rgba(255, 255, 255, 0.8); }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Listen for key sequence
  document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    const expectedKey = konamiCode[konamiIndex].toLowerCase();
    
    if (key === expectedKey) {
      konamiIndex++;
      
      if (konamiIndex === konamiCode.length) {
        // Konami code complete!
        konamiActive = true;
        overlay.classList.add('active');
        
        // Play sound effect (optional, using Web Audio API for a retro beep)
        playKonamiSound();
        
        // Hide after 5 seconds
        setTimeout(() => {
          overlay.classList.remove('active');
          konamiActive = false;
        }, 5000);
        
        konamiIndex = 0;
      }
    } else {
      // Reset if wrong key
      konamiIndex = 0;
    }
  });
  
  // Close on click
  overlay.addEventListener('click', () => {
    overlay.classList.remove('active');
    konamiActive = false;
  });
  
  // Retro sound effect
  function playKonamiSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      // Audio not supported, silently fail
    }
  }
})();
