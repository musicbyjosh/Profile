// Simple Portfolio Loader
async function loadPortfolio() {
  console.log('Starting portfolio load...');
  try {
    // Load all GSAP dependencies once at the beginning
    await loadGSAPDependencies();
    
    await loadWebIntroSection();
    await loadThermalSection();
    await loadBarreSection();
    await loadDoorsSection();
    await loadStyleGraphicSection();
    await loadParksSection();
    await loadMusicSection();
    
    // Hide loading indicator
    document.getElementById('loading')?.remove();
    console.log('Portfolio loaded successfully');
  } catch (error) {
    console.error('Portfolio loading failed:', error);
  }
}

async function loadGSAPDependencies() {
  console.log('Loading GSAP dependencies...');
  try {
    await Promise.all([
      loadScript('minified/gsap.min.js'),
      loadScript('minified/SplitText.min.js'),
      loadScript('minified/ScrollTrigger.min.js'),
      loadScript('minified/CustomEase.min.js'),
      loadScript('Three/three.core.min.js')
    ]);
    console.log('GSAP dependencies loaded');
  } catch (error) {
    console.error('Error loading GSAP dependencies:', error);
    throw error;
  }
}

async function loadWebIntroSection() {
  console.log('Loading Web Intro...');
  const timestamp = new Date().getTime();
  const [cssResponse, htmlResponse] = await Promise.all([
    fetch(`Web Intro/style.css?v=${timestamp}`),
    fetch(`Web Intro/index.html?v=${timestamp}`)
  ]);
  
  if (!cssResponse.ok || !htmlResponse.ok) {
    throw new Error(`Failed to fetch Web Intro files: CSS ${cssResponse.status}, HTML ${htmlResponse.status}`);
  }
  
  // Load CSS with scroll fixes
  const cssText = await cssResponse.text();
  const style = document.createElement('style');
  style.textContent = cssText + `
    body { height: auto !important; overflow-y: auto !important; display: block !important; }
    .web-intro-section { height: 100vh !important; display: flex !important; align-items: center !important; justify-content: space-between !important; }
    .web-intro-section h1 { font-family: griffith-gothic, sans-serif !important; font-weight: 900 !important; font-style: italic !important; }
    .web-intro-section .name-container { font-family: griffith-gothic, sans-serif !important; font-weight: 900 !important; font-style: italic !important; }
    .web-intro-section .menu-items { font-family: griffith-gothic, sans-serif !important; }
    .web-intro-section .menu-items span { font-family: griffith-gothic, sans-serif !important; font-weight: 300 !important; }
  `;
  document.head.appendChild(style);
  
  // Load HTML content and extract body content (excluding scripts)
  const htmlText = await htmlResponse.text();
  const bodyContent = htmlText.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || '';
  
  // Remove script tags from the body content since we'll load them separately
  const cleanBodyContent = bodyContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  const section = document.getElementById('web-intro-section');
  if (!section) {
    throw new Error('Web intro section element not found');
  }
  
  section.innerHTML = cleanBodyContent;
  section.classList.add('loaded');
  console.log('Web Intro HTML loaded');
  console.log('Section content:', section.innerHTML.substring(0, 200) + '...');
  console.log('Section visibility:', window.getComputedStyle(section).visibility);
  console.log('Section display:', window.getComputedStyle(section).display);
  
  // Load scripts with correct paths
  try {
    // GSAP dependencies are already loaded globally
    await loadScript('Web Intro/script.js');
    console.log('Web Intro script loaded');
  } catch (error) {
    console.error('Error loading Web Intro scripts:', error);
    throw error;
  }
  
  console.log('Web Intro complete');
}

async function loadThermalSection() {
  console.log('Loading Thermal...');
  const [cssResponse, htmlResponse] = await Promise.all([
    fetch('Thermal/Thermal-Style.css'),
    fetch('Thermal/Thermal-Index.html')
  ]);
  
  if (!cssResponse.ok || !htmlResponse.ok) {
    throw new Error(`Failed to fetch Thermal files: CSS ${cssResponse.status}, HTML ${htmlResponse.status}`);
  }
  
  // Load CSS with height fixes
  const cssText = await cssResponse.text();
  const style = document.createElement('style');
  style.textContent = cssText + `
    .thermal-section .gradient-box { height: 100vh !important; min-height: 100vh !important; }
  `;
  document.head.appendChild(style);
  
  // Load HTML content
  const htmlText = await htmlResponse.text();
  const bodyContent = htmlText.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || '';
  
  const section = document.getElementById('thermal-section');
  if (!section) {
    throw new Error('Thermal section element not found');
  }
  
  section.innerHTML = bodyContent;
  section.classList.add('loaded');
  console.log('Thermal HTML loaded');
  
  // Load scripts
  await loadScript('Thermal/ThermalScript.js');
  console.log('Thermal complete');
}

async function loadBarreSection() {
  console.log('Loading Barre...');
  const [cssResponse, htmlResponse] = await Promise.all([
    fetch('Barre/BarreStyle.css'),
    fetch('Barre/BarreIndex.html')
  ]);
  
  if (!cssResponse.ok || !htmlResponse.ok) {
    throw new Error(`Failed to fetch Barre files: CSS ${cssResponse.status}, HTML ${htmlResponse.status}`);
  }
  
  // Load CSS with height fixes
  const cssText = await cssResponse.text();
  const style = document.createElement('style');
  style.textContent = cssText + `
    .barre-section { height: auto !important; min-height: 100vh !important; }
  `;
  document.head.appendChild(style);
  
  // Load HTML content
  const htmlText = await htmlResponse.text();
  const bodyContent = htmlText.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || '';
  
  // Remove script tags from the body content since we'll load them separately
  const cleanBodyContent = bodyContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  const section = document.getElementById('barre-section');
  if (!section) {
    throw new Error('Barre section element not found');
  }
  
  section.innerHTML = cleanBodyContent;
  section.classList.add('loaded');
  console.log('Barre HTML loaded');
  
  // Load scripts
  await loadScript('Barre/BarreScript.js');
  
  // Initialize Barre animations after script is loaded
  console.log('Checking if initializeBarreAnimations function exists...');
  if (typeof initializeBarreAnimations === 'function') {
    console.log('Calling initializeBarreAnimations...');
    initializeBarreAnimations();
  } else {
    console.error('initializeBarreAnimations function not found');
  }
  
  console.log('Barre complete');
}

async function loadDoorsSection() {
  console.log('Loading Doors...');
  const [cssResponse, htmlResponse] = await Promise.all([
    fetch('Doors/DoorsStyle.css'),
    fetch('Doors/DoorsIndex.html')
  ]);
  
  if (!cssResponse.ok || !htmlResponse.ok) {
    throw new Error(`Failed to fetch Doors files: CSS ${cssResponse.status}, HTML ${htmlResponse.status}`);
  }
  
  // Load CSS with height fixes
  const cssText = await cssResponse.text();
  const style = document.createElement('style');
  style.textContent = cssText + `
    .doors-section { height: 57vw !important; min-height: 57vw !important; }
    .doors-section .main-section { height: 57vw !important; }
  `;
  document.head.appendChild(style);
  
  // Load HTML content
  const htmlText = await htmlResponse.text();
  const bodyContent = htmlText.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || '';
  
  // Remove script tags from the body content since we'll load them separately
  const cleanBodyContent = bodyContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  const section = document.getElementById('doors-section');
  if (!section) {
    throw new Error('Doors section element not found');
  }
  
  section.innerHTML = cleanBodyContent;
  section.classList.add('loaded');
  console.log('Doors HTML loaded');
  
  // Load scripts
  await loadScript('Doors/DoorsScript.js');
  
  // Initialize Doors animations after script is loaded
  console.log('Checking if initializeDoorsAnimations function exists...');
  if (typeof initializeDoorsAnimations === 'function') {
    console.log('Calling initializeDoorsAnimations...');
    initializeDoorsAnimations();
  } else {
    console.error('initializeDoorsAnimations function not found');
  }
  
  console.log('Doors complete');
}

async function loadStyleGraphicSection() {
  console.log('Loading Style Graphic...');
  const [cssResponse, htmlResponse] = await Promise.all([
    fetch('Style Graphic/Style Style.css'),
    fetch('Style Graphic/Style Index.html')
  ]);
  
  if (!cssResponse.ok || !htmlResponse.ok) {
    throw new Error(`Failed to fetch Style Graphic files: CSS ${cssResponse.status}, HTML ${htmlResponse.status}`);
  }
  
  // Load CSS with height fixes
  const cssText = await cssResponse.text();
  const style = document.createElement('style');
  style.textContent = cssText + `
    .style-graphic-section { height: 45vw !important; min-height: 45vw !important; }
    .style-graphic-section .logo-container { height: 45vw !important; }
  `;
  document.head.appendChild(style);
  
  // Load HTML content
  const htmlText = await htmlResponse.text();
  const bodyContent = htmlText.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || '';
  
  // Remove script tags from the body content since we'll load them separately
  const cleanBodyContent = bodyContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  const section = document.getElementById('style-graphic-section');
  if (!section) {
    throw new Error('Style Graphic section element not found');
  }
  
  section.innerHTML = cleanBodyContent;
  section.classList.add('loaded');
  console.log('Style Graphic HTML loaded');
  
  // Load scripts
  await loadScript('Style Graphic/Style Script.js');
  
  // Initialize Style Graphic animations after script is loaded
  console.log('Checking if initializeStyleGraphic function exists...');
  if (typeof initializeStyleGraphic === 'function') {
    console.log('Calling initializeStyleGraphic...');
    initializeStyleGraphic();
  } else {
    console.error('initializeStyleGraphic function not found');
  }
  
  console.log('Style Graphic complete');
}

async function loadParksSection() {
  console.log('Loading Parks...');
  const [cssResponse, htmlResponse] = await Promise.all([
    fetch('Parks/parks.css'),
    fetch('Parks/parks.html')
  ]);
  
  if (!cssResponse.ok || !htmlResponse.ok) {
    throw new Error(`Failed to fetch Parks files: CSS ${cssResponse.status}, HTML ${htmlResponse.status}`);
  }
  
  // Load CSS with height fixes
  const cssText = await cssResponse.text();
  const style = document.createElement('style');
  style.textContent = cssText + `
    .parks-section { height: 40vw !important; }
  `;
  document.head.appendChild(style);
  
  // Load HTML content
  const htmlText = await htmlResponse.text();
  const bodyContent = htmlText.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || '';
  
  // Remove script tags from the body content since we'll load them separately
  const cleanBodyContent = bodyContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  const section = document.getElementById('parks-section');
  if (!section) {
    throw new Error('Parks section element not found');
  }
  
  section.innerHTML = cleanBodyContent;
  section.classList.add('loaded');
  console.log('Parks HTML loaded');
  
  // Load scripts
  await loadScript('Parks/parks.js');
  
  // Initialize Parks animations after script is loaded
  console.log('Checking if initializeParks function exists...');
  if (typeof initializeParks === 'function') {
    console.log('Calling initializeParks...');
    initializeParks();
  } else {
    console.error('initializeParks function not found');
  }
  
  console.log('Parks complete');
}

async function loadMusicSection() {
  console.log('Loading Music...');
  
  try {
    const timestamp = new Date().getTime();
    const [cssResponse, htmlResponse] = await Promise.all([
      fetch(`Music/DebugCardGallery.css?v=${timestamp}`),
      fetch(`Music/DebugCardGallery.html?v=${timestamp}`)
    ]);
    
    if (!cssResponse.ok || !htmlResponse.ok) {
      throw new Error(`Failed to fetch Music files: CSS ${cssResponse.status}, HTML ${htmlResponse.status}`);
    }

    // Load CSS with height fixes for portfolio integration
    const cssText = await cssResponse.text();
    const style = document.createElement('style');
    
    // Scope all CSS to the music section to prevent global interference
    let scopedCSS = cssText
      // Replace body selector with .music-section
      .replace(/^body\s*{/gm, '.music-section {')
      // Replace html selector with .music-section
      .replace(/^html\s*{/gm, '.music-section {')
      // Scope other selectors that might be global
      .replace(/^\*\s*{/gm, '.music-section * {')
      // Fix background image path for portfolio context
      .replace(/url\('music-bg@3x\.webp'\)/g, "url('Music/music-bg@3x.webp')");
    
    // Add portfolio-specific integration styles
    style.textContent = scopedCSS + `
      .music-section { 
        height: auto !important; 
        min-height: 110vw !important; 
        font-family: "figtree", sans-serif;
        font-weight: 400;
        font-style: normal;
        text-transform: uppercase;
        background: #000000;
        color: #fff;
        overflow-x: hidden;
      }
      .music-section .music-hero-section { height: 60vw !important; }
      .music-section .gallery-container { height: 70vw !important; margin-top: -30vw !important; }
    `;
    document.head.appendChild(style);
    console.log('Music CSS loaded and scoped to music section');

    // Load HTML content
    const htmlText = await htmlResponse.text();
    const bodyContent = htmlText.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || '';
    
    // Remove script tags from the body content since we'll load them separately
    const cleanBodyContent = bodyContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    
    const section = document.getElementById('music-section');
    if (!section) {
      throw new Error('Music section element not found');
    }
    
    section.innerHTML = cleanBodyContent;
    section.classList.add('loaded');
    console.log('Music HTML content loaded into section');
    
    // Verify cardsWrapper was added
    const cardsWrapper = document.getElementById('cardsWrapper');
    console.log(`cardsWrapper element: ${cardsWrapper ? 'found' : 'NOT FOUND'}`);
    
    // Load required GSAP plugins for music section BEFORE loading the script
    console.log('Loading GSAP plugins required for music gallery...');
    try {
      await Promise.all([
        loadScript('minified/CustomBounce.min.js'),
        loadScript('minified/Observer.min.js'),
        loadScript('minified/Draggable.min.js'),
        loadScript('minified/InertiaPlugin.min.js'),
        loadScript('minified/MorphSVGPlugin.min.js')
      ]);
      console.log('Music-specific GSAP plugins loaded successfully');
    } catch (error) {
      console.error('Error loading GSAP plugins for music:', error);
      throw error;
    }

    // Load music script AFTER ensuring all GSAP plugins are ready
    await loadScript('Music/DebugCardGallery.js');
    
    console.log('Music script loaded, initializing gallery...');
    
    // Initialize Music Gallery with improved error handling
    const initializeMusic = () => {
      const cardsWrapper = document.getElementById('cardsWrapper');
      console.log('Checking for cardsWrapper:', !!cardsWrapper);
      
      if (cardsWrapper) {
        console.log('cardsWrapper found, attempting initialization...');
        
        // Try window-scoped functions first
        if (typeof window.initializeMusicGallery === 'function') {
          console.log('Calling window.initializeMusicGallery...');
          return window.initializeMusicGallery();
        } else if (typeof initializeMusicGallery === 'function') {
          console.log('Calling global initializeMusicGallery...');
          return initializeMusicGallery();
        } else if (typeof window.DebugCardGallery === 'function') {
          console.log('Calling window.DebugCardGallery constructor...');
          try {
            new window.DebugCardGallery();
            return true;
          } catch (error) {
            console.error('Error creating DebugCardGallery:', error);
            return false;
          }
        } else if (typeof DebugCardGallery === 'function') {
          console.log('Calling DebugCardGallery constructor...');
          try {
            new DebugCardGallery();
            return true;
          } catch (error) {
            console.error('Error creating DebugCardGallery:', error);
            return false;
          }
        } else {
          console.error('No initialization methods found');
          return false;
        }
      } else {
        console.error('cardsWrapper not found in DOM');
        return false;
      }
    };
    
    // Try immediate initialization
    if (!initializeMusic()) {
      // If immediate initialization fails, try with delays
      console.log('Immediate initialization failed, trying with delays...');
      setTimeout(() => {
        if (!initializeMusic()) {
          console.log('First retry failed, trying one more time...');
          setTimeout(() => {
            const success = initializeMusic();
            if (success) {
              console.log('Music gallery finally initialized successfully');
            } else {
              console.error('Music gallery initialization failed after all retries');
            }
          }, 1000);
        }
      }, 500);
    } else {
      console.log('Music gallery initialized successfully on first try');
    }
    
    console.log('Music complete');
    
  } catch (error) {
    console.error('Error loading music section:', error);
    throw error;
  }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Initialize
document.readyState === 'loading' 
  ? document.addEventListener('DOMContentLoaded', loadPortfolio)
  : loadPortfolio();