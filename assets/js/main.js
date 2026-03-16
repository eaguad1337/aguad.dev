// ============================================
// AGUAD.DEV - Animations & Interactions
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all animations
  initThemeToggle();
  initMatrixRain();
  initTypewriter();
  initScrollReveal();
  initSmoothScroll();
  initContactForm();
});

// Theme Toggle
function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;
  
  toggle.addEventListener('click', function() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });
}

// Contact Form

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

// Contact Form Handling
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  
  const message = document.getElementById('form-message');
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const submitBtn = form.querySelector('.form-submit');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Sending...';
    
    // Get form data
    const formData = new FormData(form);
    const name = formData.get('name');
    const email = formData.get('email');
    const messageText = formData.get('message');
    
    // Simple validation
    if (!name || !email || !messageText) {
      showMessage('Please fill in all fields.', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      return;
    }
    
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage('Please enter a valid email address.', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      return;
    }
    
    // Simulate form submission (since no backend is configured)
    // In production, replace this with actual form submission to Formspree, Netlify Forms, etc.
    setTimeout(() => {
      showMessage('Thanks for your message! I\'ll get back to you soon.', 'success');
      form.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }, 1000);
  });
  
  function showMessage(text, type) {
    if (!message) return;
    
    message.textContent = text;
    message.className = 'form-message ' + type;
    
    // Hide message after 5 seconds
    setTimeout(() => {
      message.className = 'form-message';
    }, 5000);
  }
}

// ============================================
// KONAMI CODE EASTER EGG
// ============================================
(function initKonamiCode() {
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a', 'Enter'];
  let konamiIndex = 0;
  let konamiActive = false;
  
  // Create overlay container - centered popup style
  const overlay = document.createElement('div');
  overlay.id = 'konami-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 99999;
    opacity: 0;
    pointer-events: none;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  `;
  
  // Create popup container
  const popup = document.createElement('div');
  popup.style.cssText = `
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    padding: 40px;
    border-radius: 20px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(255, 255, 255, 0.1);
    text-align: center;
    transform: scale(0.8);
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  `;
  
  // Create spinning image
  const img = document.createElement('img');
  img.src = '/images/konami-easter-egg.png';
  img.alt = 'Konami Easter Egg';
  img.style.cssText = `
    width: 280px;
    height: 280px;
    object-fit: cover;
    border-radius: 50%;
    animation: konami-spin 2s linear infinite;
    box-shadow: 0 0 60px rgba(255, 255, 255, 0.8), 0 0 120px rgba(255, 255, 255, 0.4);
    border: 4px solid rgba(255, 255, 255, 0.9);
    display: block;
  `;
  
  // Ensure image loads
  img.onload = () => console.log('Konami image loaded');
  img.onerror = () => console.error('Konami image failed to load');
  
  // Add title text
  const title = document.createElement('div');
  title.textContent = '🎮 KONAMI CODE ACTIVATED!';
  title.style.cssText = `
    margin-top: 20px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
    letter-spacing: 2px;
  `;
  
  popup.appendChild(img);
  popup.appendChild(title);
  overlay.appendChild(popup);
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
      #konami-overlay.active > div {
        transform: scale(1) !important;
      }
      #konami-overlay > div {
        transform: scale(0.8);
        transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
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
        
        // Hide after 7 seconds
        setTimeout(() => {
          overlay.classList.remove('active');
          konamiActive = false;
        }, 7000);
        
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
