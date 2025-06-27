// ===== ANIMATION CONFIGURATION =====
// Edit these values to customize the animations easily
const ANIMATION_CONFIG = {
  // Video hover animation settings
  video: {
    moveDistance: 50,      // How far the video moves (xPercent)
    scale: 1.2,          // How much the video scales on hover
    rotation: 2,          // Rotation in degrees on hover
    duration: 1,          // Animation duration in seconds
    ease: "expo.out"      // Animation easing
  },
  
  // Poster hover animation settings
  poster: {
    moveUp: -30,          // How far posters move up (pixels)
    rotation: 5,          // Rotation in degrees on hover
    duration: 0.6,        // Animation duration in seconds
    ease: "power2.out"    // Animation easing
  }
};

const videoSection = document.querySelector('.video-section');
const videoContentIsolator = document.querySelector('.video-content-isolator');
const videoBackdropBlur = document.querySelector('.video-backdrop-blur');
const posters = document.querySelectorAll('.poster');

// Global state for pin functionality
let isVideoPinned = false;

gsap.set([videoSection, videoContentIsolator, videoBackdropBlur], { 
  xPercent: ANIMATION_CONFIG.video.moveDistance, 
  scale: 1, 
  rotation: 0 
});

function animateVideoToHover() {
  if (isVideoPinned) return; // Don't animate if pinned
  gsap.to([videoSection, videoContentIsolator, videoBackdropBlur], {
    xPercent: 0,
    scale: ANIMATION_CONFIG.video.scale,
    rotation: ANIMATION_CONFIG.video.rotation,
    duration: ANIMATION_CONFIG.video.duration,
    ease: ANIMATION_CONFIG.video.ease
  });
}

function animateVideoToDefault() {
  if (isVideoPinned) return; // Don't animate if pinned
  gsap.to([videoSection, videoContentIsolator, videoBackdropBlur], {
    xPercent: ANIMATION_CONFIG.video.moveDistance,
    scale: 1,
    rotation: 0,
    duration: ANIMATION_CONFIG.video.duration,
    ease: ANIMATION_CONFIG.video.ease
  });
}

videoSection.addEventListener('mouseenter', animateVideoToHover);
videoSection.addEventListener('mouseleave', animateVideoToDefault);

// Add hover functionality to video content isolator as well
videoContentIsolator.addEventListener('mouseenter', animateVideoToHover);
videoContentIsolator.addEventListener('mouseleave', animateVideoToDefault);

// Poster hover animations
posters.forEach(poster => {
  // Set initial state
  gsap.set(poster, { y: 0, rotation: 0 });
  
  poster.addEventListener('mouseenter', () => {
    gsap.to(poster, {
      y: ANIMATION_CONFIG.poster.moveUp,
      rotation: ANIMATION_CONFIG.poster.rotation,
      duration: ANIMATION_CONFIG.poster.duration,
      ease: ANIMATION_CONFIG.poster.ease
    });
  });
  
  poster.addEventListener('mouseleave', () => {
    gsap.to(poster, {
      y: 0,
      rotation: 0,
      duration: ANIMATION_CONFIG.poster.duration,
      ease: ANIMATION_CONFIG.poster.ease
    });
  });
});

// ===== PIN BUTTON FUNCTIONALITY =====
const pinButton = document.querySelector('.pin-button');
const pinOutline = document.querySelector('.pin-outline');
const pinFilled = document.querySelector('.pin-filled');

pinButton.addEventListener('click', () => {
  isVideoPinned = !isVideoPinned;
  
  if (isVideoPinned) {
    // Pin the video - animate to hover position with corrected rotation
    gsap.to([videoSection, videoContentIsolator, videoBackdropBlur], {
      xPercent: 0,
      scale: ANIMATION_CONFIG.video.scale,
      rotation: 0,
      duration: ANIMATION_CONFIG.video.duration,
      ease: ANIMATION_CONFIG.video.ease
    });
    
    // Fade in the filled pin
    gsap.to(pinFilled, {
      opacity: 1,
      duration: 0.15,
      ease: "power2.out",
      onComplete: () => {
        // Quickly fade out the outline
        gsap.to(pinOutline, {
          opacity: 0,
          duration: 0.05,
          ease: "power2.out"
        });
      }
    });
  } else {
    // Unpin the video - check if mouse is still hovering before animating
    const isMouseOverVideo = videoSection.matches(':hover') || videoContentIsolator.matches(':hover');
    
    if (!isMouseOverVideo) {
      // Mouse is not over video, animate to default position
      gsap.to([videoSection, videoContentIsolator, videoBackdropBlur], {
        xPercent: ANIMATION_CONFIG.video.moveDistance,
        scale: 1,
        rotation: 0,
        duration: ANIMATION_CONFIG.video.duration,
        ease: ANIMATION_CONFIG.video.ease
      });
    } else {
      // Mouse is still over video, restore normal hover state (with rotation)
      gsap.to([videoSection, videoContentIsolator, videoBackdropBlur], {
        xPercent: 0,
        scale: ANIMATION_CONFIG.video.scale,
        rotation: ANIMATION_CONFIG.video.rotation,
        duration: ANIMATION_CONFIG.video.duration,
        ease: ANIMATION_CONFIG.video.ease
      });
    }
    
    // Fade in the outline pin
    gsap.to(pinOutline, {
      opacity: 1,
      duration: 0.15,
      ease: "power2.out",
      onComplete: () => {
        // Quickly fade out the filled
        gsap.to(pinFilled, {
          opacity: 0,
          duration: 0.05,
          ease: "power2.out"
        });
      }
    });
  }
});