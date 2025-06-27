gsap.registerPlugin(CustomEase, ScrollTrigger);

document.fonts.ready.then(() => {
  console.log('Fonts ready, starting unified animation sequence');
  
  // Set initial position for background gradient - start lower
  gsap.set('.gradient-shape', {
    y: 1000 // Start 1000px lower than normal position
  });
  
  gsap.set('.menu-items span', {
    opacity: 0,
    x: 50,
    scale: 0.9
  });
  
  gsap.set('.menu-icon .bar', { 
    xPercent: -100 
  });

  // Animation state tracking
  let loadAnimationY = 1000; // Track load animation progress
  let scrollOffsetY = 0;     // Track scroll offset
  let isUpdating = false;    // Prevent feedback loops
  let loadProgress = 0;      // Track load animation progress for easing
  
  // Clean function to update position
  function updatePosition() {
    if (isUpdating) return;
    isUpdating = true;
    
    const finalY = loadAnimationY + scrollOffsetY;
    gsap.set('.gradient-shape', { 
      y: finalY,
      force3D: true
    });
    
    isUpdating = false;
  }
  
  // ScrollTrigger for scroll offset only
  ScrollTrigger.create({
    trigger: "body",
    start: "top top", 
    end: "bottom top",
    scrub: 1,
    onUpdate: (self) => {
      scrollOffsetY = self.progress * -2000;
      updatePosition();
    }
  });

  // Create unified master timeline
  const masterTl = gsap.timeline();
  
  // Load animation that tracks its own progress with proper easing
  masterTl
    .to({ progress: 0 }, { // Animate a progress value with easing
      progress: 1,
      duration: 4,
      ease: 'expo.out',
      onUpdate: function() {
        // Get the eased progress value
        loadProgress = this.targets()[0].progress;
        // Apply eased progress to calculate position
        loadAnimationY = 1000 * (1 - loadProgress) - 200; // 1000 -> -200 with easing
        updatePosition();
      }
    }, 0.2) // Start slightly after page load
    
    .to('.menu-icon .bar', {
      xPercent: 0,
      duration: 3.5,
      stagger: 0.2,
      ease: 'expo.out'
    }, 0.4)  // Start at same time as blur
    
    .to('.subtext', {
      clipPath: 'inset(0 0% 0 0)',
      duration: 4,
      ease: 'expo.out'
    }, 0.4);  // Start at same time as blur

  // Menu animation system with cohesive blur effects
  const icon = document.querySelector('.menu-icon');
  const menuItems = document.querySelectorAll('.menu-items span');
  let iconHidden = false;
  let menuVisible = false;

  // Unified menu show animation
  const showMenuTl = gsap.timeline({ paused: true })
    .to('.menu-icon .bar', {
      xPercent: 100,
      opacity: 0,
      filter: 'blur(3px)',
      duration: 0.4,
      stagger: 0.06,
      ease: 'power3.out'
    })
    .to(menuItems, {
      opacity: 1,
      x: 0,
      scale: 1,
      filter: 'blur(0px)',
      duration: 0.8,
      stagger: {
        amount: 0.2,
        from: "end"
      },
      ease: 'power3.out'
    }, "-=0.2");

  // Unified menu hide animation
  const hideMenuTl = gsap.timeline({ paused: true })
    .to(menuItems, {
      opacity: 0,
      x: 40,
      scale: 0.95,
      filter: 'blur(8px)',
      duration: 0.5,
      stagger: {
        amount: 0.15,
        from: "start"
      },
      ease: 'power3.in'
    })
    .set('.menu-icon .bar', { 
      xPercent: -100,
      opacity: 0,
      filter: 'blur(0px)' 
    }, "-=0.2")
    .to('.menu-icon .bar', {
      xPercent: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power3.out'
    });

  // Responsive hover detection
  const rightEdgeThreshold = () => window.innerWidth * 0.65;
  
  // Show menu on icon hover
  icon.addEventListener('mouseenter', () => {
    if (!iconHidden && !menuVisible) {
      iconHidden = true;
      menuVisible = true;
      hideMenuTl.pause();
      showMenuTl.restart();
    }
  });

  // Hide menu with smooth detection
  let hideTimeout;
  document.addEventListener('mousemove', (e) => {
    clearTimeout(hideTimeout);
    
    if (iconHidden && menuVisible && e.clientX < rightEdgeThreshold()) {
      hideTimeout = setTimeout(() => {
        if (iconHidden && menuVisible) {
          iconHidden = false;
          menuVisible = false;
          showMenuTl.pause();
          hideMenuTl.restart();
        }
      }, 150);
    }
  });

  // Elegant hover effects with consistent blur
  menuItems.forEach((item) => {
    item.addEventListener('mouseenter', () => {
      gsap.to(item, {
        scale: 1.12,
        filter: 'brightness(1.2) blur(0px)',
        duration: 0.4,
        ease: 'power3.out'
      });
    });

    item.addEventListener('mouseleave', () => {
      gsap.to(item, {
        scale: 1,
        filter: 'brightness(1) blur(0px)',
        duration: 0.4,
        ease: 'power3.out'
      });
    });

    // Add click functionality
    item.addEventListener('click', () => {
      const menuText = item.textContent.toLowerCase();
      let targetSection = null;

      if (menuText === 'graphics') {
        targetSection = document.getElementById('thermal-section');
      } else if (menuText === 'music') {
        targetSection = document.getElementById('music-section');
      }
      // About Me is left empty for now

      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  console.log('Unified animation sequence complete');
});