// GSAP Card Flip Animation
function initializeBarreAnimations() {
    console.log('Initializing Barre animations...');
    
    // Check if GSAP is loaded
    if (typeof gsap === 'undefined') {
        console.error('GSAP is not loaded. Please check the script path.');
        return;
    }
    
    // Register ScrollTrigger plugin
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        console.log('ScrollTrigger registered successfully');
    } else {
        console.warn('ScrollTrigger not available, scroll animations will be skipped');
    }
    
    console.log('GSAP is loaded, continuing with Barre animations...');
    
    // Initialize Banner Animation
    initializeBannerAnimation();
    
    // SVG Line Scroll Animation
    initializeSVGScrollAnimation();
    
    // Animation settings - change these to adjust all animations
    const FLIP_DURATION = 0.6;
    const FLIP_EASE = "power4.inOut";
    const SCALE_DURATION = 0.4;
    const SCALE_EASE = "expo.out";
    const FLOAT_ROTATION_MIN = -2; // minimum rotation in degrees
    const FLOAT_ROTATION_MAX = 4; // maximum rotation in degrees
    const FLOAT_SCALE_RANGE = 0.02; // scale range (will scale from 1.1 to 1.2)
    const BASE_SCALE = 1.3; // base scale when hovering
    const BASE_ROTATION = 4; // base rotation when hovering (degrees)
    const FLOAT_ROTATION_DURATION = 3; // seconds for one complete rotation cycle
    const FLOAT_SCALE_DURATION = 1.7; // seconds for one complete scale cycle
    
    // Get all card wrappers
    const cardWrappers = document.querySelectorAll('.card-wrapper');
    
    if (cardWrappers.length === 0) {
        console.warn('No card wrappers found. Check your HTML structure.');
        return;
    }

    cardWrappers.forEach((cardWrapper, index) => {
        const cardFront = cardWrapper.querySelector('.card-front');
        const cardBack = cardWrapper.querySelector('.card-back');
        
        if (!cardFront || !cardBack) {
            console.warn(`Card ${index + 1} is missing front or back element.`);
            return;
        }
        
        let isFlipped = false;
        let isHovered = false;
        let floatRotationAnimation = null;
        let floatScaleAnimation = null;
        let scaleUpAnimation = null;
        
        // Set initial state
        gsap.set(cardBack, { rotationY: 180 });
        gsap.set(cardFront, { rotationY: 0 });
        gsap.set(cardWrapper, { scale: 1, rotation: 0, zIndex: 1 });
        
        // Create timeline for flip animation
        const flipTimeline = gsap.timeline({ paused: true });
        
        flipTimeline
            .to(cardFront, {
                rotationY: 180,
                duration: FLIP_DURATION,
                ease: FLIP_EASE
            }, 0)
            .to(cardBack, {
                rotationY: 0,
                duration: FLIP_DURATION,
                ease: FLIP_EASE
            }, 0);
        
        // Create reverse timeline
        const flipBackTimeline = gsap.timeline({ paused: true });
        
        flipBackTimeline
            .to(cardFront, {
                rotationY: 0,
                duration: FLIP_DURATION,
                ease: FLIP_EASE
            }, 0)
            .to(cardBack, {
                rotationY: 180,
                duration: FLIP_DURATION,
                ease: FLIP_EASE
            }, 0);
        
        // Cleanup function to kill all animations
        function cleanupAnimations() {
            if (floatRotationAnimation) {
                floatRotationAnimation.kill();
                floatRotationAnimation = null;
            }
            if (floatScaleAnimation) {
                floatScaleAnimation.kill();
                floatScaleAnimation = null;
            }
            if (scaleUpAnimation) {
                scaleUpAnimation.kill();
                scaleUpAnimation = null;
            }
        }
        
        // Start floating animations
        function startFloatingAnimations() {
            // Only start if we're still hovered and don't already have animations
            if (!isHovered || floatRotationAnimation || floatScaleAnimation) return;
            
            // Start floating rotation from BASE_ROTATION, go counterclockwise first
            floatRotationAnimation = gsap.fromTo(cardWrapper, 
                { rotation: BASE_ROTATION }, // Start from where the initial animation ended
                {
                    rotation: BASE_ROTATION + FLOAT_ROTATION_MIN, // Go counterclockwise first (to 2°)
                    duration: FLOAT_ROTATION_DURATION / 2,
                    ease: "sine.inOut",
                    yoyo: true,
                    repeat: -1
                }
            );
            
            // Start floating scale from the current scale (BASE_SCALE) seamlessly
            floatScaleAnimation = gsap.fromTo(cardWrapper, {
                scale: BASE_SCALE // Start from where the initial animation ended
            }, {
                scale: BASE_SCALE + FLOAT_SCALE_RANGE,
                duration: FLOAT_SCALE_DURATION / 2,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1
            });
        }
        
        // Consolidated mouse enter handler
        cardWrapper.addEventListener('mouseenter', () => {
            isHovered = true;
            
            // Handle flip animation
            if (!isFlipped) {
                flipBackTimeline.pause();
                flipTimeline.restart();
                isFlipped = true;
            }
            
            // Bring card to front
            gsap.set(cardWrapper, { zIndex: 10 });
            
            // Clean any existing animations
            cleanupAnimations();
            
            // Smooth scale up to base scale first
            scaleUpAnimation = gsap.to(cardWrapper, {
                scale: BASE_SCALE,
                rotation: BASE_ROTATION,
                duration: SCALE_DURATION,
                ease: SCALE_EASE,
                onComplete: startFloatingAnimations
            });
        });
        
        // Consolidated mouse leave handler
        cardWrapper.addEventListener('mouseleave', () => {
            isHovered = false;
            
            // Handle flip animation
            if (isFlipped) {
                flipTimeline.pause();
                flipBackTimeline.restart();
                isFlipped = false;
            }
            
            // Clean up all animations
            cleanupAnimations();
            
            // Return to normal state
            gsap.to(cardWrapper, {
                scale: 1,
                rotation: 0,
                zIndex: 1,
                duration: SCALE_DURATION,
                ease: SCALE_EASE
            });
        });
    });
    
    // Poster hover animations
    const posterWrappers = document.querySelectorAll('.poster-wrapper');
    
    if (posterWrappers.length > 0) {
        console.log(`Found ${posterWrappers.length} poster wrappers`);
        
        // Poster animation settings
        const POSTER_SCALE = 1.17; // scale on hover
        const POSTER_ROTATION_RANGE = 8; // rotation range in degrees
        const POSTER_BOX_ROTATION_FACTOR = 1.5; // box rotates 80% of poster rotation
        const POSTER_BOX_SCALE_FACTOR = 1; // box scales 110% of poster scale (1.265x total)
        const POSTER_BOX_BORDER_FACTOR = 1; // box border thickness multiplier on hover
        const POSTER_DURATION = 0.5;
        const POSTER_EASE = "expo.out";
        
        // Persistent z-index management
        let lastHoveredPoster = null;
        let currentZIndex = 10;
        
        posterWrappers.forEach((posterWrapper, index) => {
            const posterImage = posterWrapper.querySelector('.poster-image');
            const posterBox = posterWrapper.querySelector('.poster-box');
            
            if (!posterImage || !posterBox) {
                console.warn(`Poster ${index + 1} is missing image or box element.`);
                return;
            }
            
            // Set initial state for smoother animations
            gsap.set(posterImage, { scale: 1, rotation: 0 });
            gsap.set(posterBox, { scale: 1, rotation: 0 });
            
            // Mouse enter handler
            posterWrapper.addEventListener('mouseenter', () => {
                // Remove z-index from previously hovered poster
                if (lastHoveredPoster && lastHoveredPoster !== posterWrapper) {
                    gsap.set(lastHoveredPoster, { zIndex: 'auto' });
                }
                
                // Increment z-index for new poster
                currentZIndex++;
                
                // Random rotation direction for variety
                const rotationDirection = Math.random() > 0.5 ? 1 : -1;
                const posterRotation = (Math.random() * POSTER_ROTATION_RANGE) * rotationDirection;
                const boxRotation = posterRotation * POSTER_BOX_ROTATION_FACTOR;
                const boxScale = POSTER_SCALE * POSTER_BOX_SCALE_FACTOR;
                const boxBorderWidth = `${POSTER_BOX_BORDER_FACTOR * 0.45}vw`;
                const posterBorderWidth = `${POSTER_BOX_BORDER_FACTOR * 0.45}vw`;
                
                console.log(`Poster hover: image scale=${POSTER_SCALE}, box scale=${boxScale.toFixed(2)}, borders=${posterBorderWidth}, rotation=${posterRotation.toFixed(1)}°, z-index=${currentZIndex}`);
                
                // Bring poster to front with incremented z-index
                gsap.set(posterWrapper, { zIndex: currentZIndex });
                
                // Animate poster image (with thicker border)
                gsap.to(posterImage, {
                    scale: POSTER_SCALE,
                    rotation: posterRotation,
                    borderWidth: posterBorderWidth,
                    duration: POSTER_DURATION,
                    ease: POSTER_EASE
                });
                
                // Animate poster box (less rotation, more scale, thicker border)
                gsap.to(posterBox, {
                    scale: boxScale,
                    rotation: boxRotation,
                    borderWidth: boxBorderWidth,
                    duration: POSTER_DURATION,
                    ease: POSTER_EASE
                });
                
                // Update last hovered poster
                lastHoveredPoster = posterWrapper;
            });
            
            // Mouse leave handler
            posterWrapper.addEventListener('mouseleave', () => {
                console.log('Poster leave: returning to normal state but keeping z-index');
                
                // Return both to original state but keep z-index
                gsap.to(posterImage, {
                    scale: 1,
                    rotation: 0,
                    borderWidth: '0.45vw', // Return to original border width
                    duration: POSTER_DURATION,
                    ease: POSTER_EASE
                });
                
                gsap.to(posterBox, {
                    scale: 1,
                    rotation: 0,
                    borderWidth: '0.45vw', // Return to original border width
                    duration: POSTER_DURATION,
                    ease: POSTER_EASE
                });
                
                // Don't reset z-index - let it stay on top until another poster is hovered
            });
        });
    }
    
    console.log('Barre animation system initialized successfully');
    
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);
    
    // It Images Scroll Trigger Animation
    const itImages = document.querySelectorAll('.it-image');
    
    if (itImages.length > 0) {
        console.log(`Found ${itImages.length} it images for scroll animation`);
        
        // Animation settings for It images
        const IT_ANIMATION_DURATION = 0.5;
        const IT_ANIMATION_EASE = "expo.out";
        const IT_STAGGER_DELAY = 0.1; // delay between each image animation
        
        itImages.forEach((image, index) => {
            // Get the initial rotation from CSS - check both transform and rotate properties
            const computedStyle = window.getComputedStyle(image);
            let initialRotation = 0;
            
            // First try the rotate property (newer CSS)
            const rotateProperty = computedStyle.rotate;
            if (rotateProperty && rotateProperty !== 'none') {
                initialRotation = parseFloat(rotateProperty);
            } else {
                // Fallback to transform matrix if rotate property isn't available
                const matrix = computedStyle.transform;
                if (matrix !== 'none') {
                    const values = matrix.split('(')[1].split(')')[0].split(',');
                    if (values.length === 6) {
                        const a = values[0];
                        const b = values[1];
                        initialRotation = Math.round(Math.atan2(b, a) * (180/Math.PI));
                    }
                }
            }
            
            console.log(`Image ${index + 1} initial rotation: ${initialRotation}°`);
            
            // Set initial state (hidden, slightly down, scaled down, and rotated away from CSS rotation)
            gsap.set(image, { 
                opacity: 0, 
                y: "3vw", 
                scale: 0.9,  // Less extreme scale
                rotation: initialRotation - 10 // Subtract 10 degrees from original CSS rotation
            });
            
            // Create scroll trigger for each image with responsive positioning
            ScrollTrigger.create({
                trigger: ".pink-section",
                start: () => {
                    // Calculate responsive offset based on viewport width
                    const vw = window.innerWidth;
                    const baseOffset = 7; // Base percentage offset
                    const responsiveMultiplier = vw > 1200 ? 1.2 : vw > 768 ? 1 : 0.8;
                    const offset = index * baseOffset * responsiveMultiplier;
                    return `top+=${offset}% bottom-=70%`;
                },
                end: () => {
                    // Extend trigger to cover both pink and gray sections
                    // This ensures images stay visible until scrolling back up past the start point
                    return "bottom+=100vh"; // Extend well beyond the sections
                },
                toggleActions: "play none none reverse", // Only hide when scrolling up past start point
                refreshPriority: -1, // Ensure this refreshes when viewport changes
                onEnter: () => {
                    // Quick opacity fade
                    gsap.to(image, {
                        opacity: 1,
                        duration: 0.2, // Much faster opacity
                        ease: "power2.out",
                        delay: index * IT_STAGGER_DELAY
                    });
                    
                    // Slower scale and rotation animation
                    gsap.to(image, {
                        y: 0,
                        scale: 1,
                        rotation: initialRotation, // Return to original CSS rotation
                        duration: 1.2, // Longer duration for scale and rotation
                        ease: IT_ANIMATION_EASE,
                        delay: index * IT_STAGGER_DELAY
                    });
                },
                // Remove onLeave - images should stay visible when scrolling down
                onEnterBack: () => {
                    // Quick opacity fade
                    gsap.to(image, {
                        opacity: 1,
                        duration: 0.2,
                        ease: "power2.out",
                        delay: (itImages.length - 1 - index) * IT_STAGGER_DELAY
                    });
                    
                    // Slower scale and rotation animation
                    gsap.to(image, {
                        y: 0,
                        scale: 1,
                        rotation: initialRotation, // Return to original CSS rotation
                        duration: 1.2,
                        ease: IT_ANIMATION_EASE,
                        delay: (itImages.length - 1 - index) * IT_STAGGER_DELAY
                    });
                },
                onLeaveBack: () => {
                    gsap.to(image, {
                        opacity: 0,
                        y: "3vw",
                        scale: 0.9,
                        rotation: initialRotation - 10, // Rotate away from original CSS rotation
                        duration: IT_ANIMATION_DURATION * 0.5,
                        ease: "power2.inOut"
                    });
                }
            });
        });
        
        console.log('It images scroll triggers created successfully');
        
        // Add responsive behavior for viewport changes
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                ScrollTrigger.refresh();
                console.log('ScrollTriggers refreshed for new viewport size');
            }, 150); // Debounce resize events
        });
    }
    
    // It Images Hover Animation
    const itImagesForHover = document.querySelectorAll('.it-image');
    
    if (itImagesForHover.length > 0) {
        console.log(`Adding hover animations to ${itImagesForHover.length} it images`);
        
        // Hover animation settings for It images
        const IT_HOVER_SCALE = 1.04; // Scale on hover
        const IT_HOVER_MOVE_UP = "-2.5vw"; // Move up in vw on hover
        const IT_HOVER_ROTATION = -2; // Slight rotation in degrees on hover
        const IT_HOVER_DURATION = 0.4; // Animation duration
        const IT_HOVER_EASE = "power2.out"; // Animation easing
        
        itImagesForHover.forEach((image, index) => {
            // Mouse enter handler
            image.addEventListener('mouseenter', () => {
                gsap.to(image, {
                    scale: IT_HOVER_SCALE,
                    y: IT_HOVER_MOVE_UP,
                    rotation: `+=${IT_HOVER_ROTATION}`, // Add rotation relative to current rotation
                    duration: IT_HOVER_DURATION,
                    ease: IT_HOVER_EASE
                });
            });
            
            // Mouse leave handler
            image.addEventListener('mouseleave', () => {
                gsap.to(image, {
                    scale: 1,
                    y: 0,
                    rotation: `+=${-IT_HOVER_ROTATION}`, // Subtract the rotation back
                    duration: IT_HOVER_DURATION,
                    ease: IT_HOVER_EASE
                });
            });
        });
        
        console.log('It images hover animations initialized successfully');
    }
    
    // Circle Button IT Image Visibility Control
    const circleButtons = document.querySelectorAll('.circle-btn');
    
    if (circleButtons.length > 0) {
        console.log(`Found ${circleButtons.length} circle buttons for IT image control`);
        
        // Simple button animation settings
        const BUTTON_FADE_DURATION = 0.25;
        const BUTTON_FADE_EASE = "expo.out";
        
        // Button hover animation settings for corresponding IT images
        const BUTTON_IT_SCALE = 1.08;
        const BUTTON_IT_ROTATION_OFFSET = 3;
        const BUTTON_IT_DURATION = 0.3;
        const BUTTON_IT_EASE = "expo.out";
        
        // Store original CSS rotations for each IT image
        const originalRotations = {
            '.it-1': -8,
            '.it-2': 5,
            '.it-3': -5,
            '.it-4': 2,
            '.it-5': -10
        };
        
        // Keep track of which images were hidden by buttons
        let hiddenByButton = new Set();
        
        circleButtons.forEach((button, buttonIndex) => {
            // Mouse enter handler
            button.addEventListener('mouseenter', () => {
                console.log(`Button ${buttonIndex + 1} hovered`);
                
                // Clear previous button state
                hiddenByButton.clear();
                
                // Get corresponding IT image (button 0 = IT5, button 1 = IT4, etc.)
                const correspondingItIndex = 5 - buttonIndex; // 5,4,3,2,1
                const correspondingItSelector = `.it-${correspondingItIndex}`;
                const correspondingImage = document.querySelector(correspondingItSelector);
                
                // Animate corresponding IT image
                if (correspondingImage) {
                    const originalRotation = originalRotations[correspondingItSelector];
                    gsap.to(correspondingImage, {
                        scale: BUTTON_IT_SCALE,
                        rotation: originalRotation + BUTTON_IT_ROTATION_OFFSET,
                        duration: BUTTON_IT_DURATION,
                        ease: BUTTON_IT_EASE
                    });
                }
                
                // Hide IT images based on button position
                const imagesToHide = [];
                
                if (buttonIndex === 0) { // Top button - hide IT1, IT2, IT3, IT4 (keep IT5)
                    imagesToHide.push('.it-1', '.it-2', '.it-3', '.it-4');
                } else if (buttonIndex === 1) { // Second button - hide IT1, IT2, IT3 (keep IT4, IT5)
                    imagesToHide.push('.it-1', '.it-2', '.it-3');
                } else if (buttonIndex === 2) { // Third button - hide IT1, IT2 (keep IT3, IT4, IT5)
                    imagesToHide.push('.it-1', '.it-2');
                } else if (buttonIndex === 3) { // Fourth button - hide IT1 (keep IT2, IT3, IT4, IT5)
                    imagesToHide.push('.it-1');
                }
                // Bottom button (4) - hide nothing (show all)
                
                imagesToHide.forEach(selector => {
                    const image = document.querySelector(selector);
                    if (image && selector !== correspondingItSelector) { // Don't hide the corresponding image
                        hiddenByButton.add(selector);
                        
                        // Use stored original rotation
                        const originalRotation = originalRotations[selector];
                        
                        gsap.to(image, {
                            opacity: 0,
                            rotation: originalRotation - 3, // Slight rotation away from original
                            duration: BUTTON_FADE_DURATION,
                            ease: BUTTON_FADE_EASE
                        });
                    }
                });
            });
            
            // Mouse leave handler
            button.addEventListener('mouseleave', () => {
                console.log(`Button ${buttonIndex + 1} unhovered`);
                
                // Get corresponding IT image
                const correspondingItIndex = 5 - buttonIndex;
                const correspondingItSelector = `.it-${correspondingItIndex}`;
                const correspondingImage = document.querySelector(correspondingItSelector);
                
                // Reset corresponding IT image animation
                if (correspondingImage) {
                    const originalRotation = originalRotations[correspondingItSelector];
                    gsap.to(correspondingImage, {
                        scale: 1,
                        rotation: originalRotation,
                        duration: BUTTON_IT_DURATION,
                        ease: BUTTON_IT_EASE
                    });
                }
                
                // Restore all images that were hidden by this button
                hiddenByButton.forEach(selector => {
                    const image = document.querySelector(selector);
                    if (image) {
                        // Use stored original rotation
                        const originalRotation = originalRotations[selector];
                        
                        gsap.to(image, {
                            opacity: 1,
                            rotation: originalRotation, // Return to exact original CSS rotation
                            duration: BUTTON_FADE_DURATION,
                            ease: BUTTON_FADE_EASE
                        });
                    }
                });
                
                // Clear the hidden set
                hiddenByButton.clear();
            });
        });
        
        console.log('Circle button IT image visibility control initialized successfully');
    }
}

// Banner Animation Initialization Function
function initializeBannerAnimation() {
    console.log('Initializing banner animation...');
    
    const bannerTrack = document.querySelector('.banner-track');
    const bannerImages = document.querySelectorAll('.banner-image');
    
    if (!bannerTrack || bannerImages.length === 0) {
        console.warn('Banner elements not found. Check your HTML structure.');
        return;
    }
    
    console.log(`Found banner track with ${bannerImages.length} images`);
    
    // Wait for images to load before starting animation
    let loadedImages = 0;
    const totalImages = bannerImages.length;
    
    function checkImageLoaded() {
        loadedImages++;
        if (loadedImages === totalImages) {
            startBannerAnimation();
        }
    }
    
    function startBannerAnimation() {
        console.log('All banner images loaded, starting animation');
        
        // Add loaded class to start CSS animation
        bannerTrack.classList.add('loaded');
        
        // Optional: Add GSAP-based fallback or enhancements if needed
        // For now, rely on CSS animation for smooth performance
        
        // Add error handling for animation issues
        setTimeout(() => {
            checkBannerHealth();
        }, 1000);
        
        // Add intersection observer for performance optimization
        setupBannerVisibilityOptimization();
    }
    
    function setupBannerVisibilityOptimization() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Banner is visible, ensure animation is running
                        bannerTrack.style.animationPlayState = 'running';
                    } else {
                        // Banner is not visible, optionally pause for performance
                        // Only pause if user preference allows (respect reduced motion)
                        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                            // Keep running for seamless experience, but could pause here if needed
                            // bannerTrack.style.animationPlayState = 'paused';
                        }
                    }
                });
            }, {
                rootMargin: '50px' // Start observing 50px before the element is visible
            });
            
            observer.observe(bannerTrack);
        }
    }
    
    function checkBannerHealth() {
        const computedStyle = window.getComputedStyle(bannerTrack);
        const animationName = computedStyle.animationName;
        const animationPlayState = computedStyle.animationPlayState;
        
        console.log(`Banner animation status: ${animationName}, play state: ${animationPlayState}`);
        
        if (animationName === 'none' || animationPlayState === 'paused') {
            console.warn('Banner animation not running, attempting restart...');
            // Force restart animation
            bannerTrack.style.animation = 'none';
            setTimeout(() => {
                bannerTrack.style.animation = '';
                bannerTrack.classList.add('loaded');
            }, 10);
        }
    }
    
    // Check if images are already loaded (cached)
    bannerImages.forEach((img, index) => {
        if (img.complete && img.naturalWidth > 0) {
            checkImageLoaded();
        } else {
            img.addEventListener('load', checkImageLoaded);
            img.addEventListener('error', () => {
                console.warn(`Banner image ${index + 1} failed to load`);
                checkImageLoaded(); // Continue anyway
            });
        }
    });
    
    // Fallback: start animation after 2 seconds even if images aren't fully loaded
    setTimeout(() => {
        if (loadedImages < totalImages) {
            console.log('Starting banner animation with fallback timer');
            startBannerAnimation();
        }
    }, 2000);
}

// SVG Line Scroll Animation Function
function initializeSVGScrollAnimation() {
    console.log('Initializing SVG scroll animations...');
    
    // Check if ScrollTrigger is available
    if (typeof ScrollTrigger === 'undefined') {
        console.error('ScrollTrigger is not loaded. Please check the script path.');
        return;
    }
    
    // Get all title SVGs
    const titleSVGs = document.querySelectorAll('.title-svg');
    
    if (titleSVGs.length === 0) {
        console.warn('No title SVGs found. Check your HTML structure.');
        return;
    }
    
    console.log(`Found ${titleSVGs.length} title SVGs for scroll animation`);
    
    // Simple animation settings - adjust finalPosition to move each line where you want
    const SVG_CONFIGS = [
        { initialOffset: '-20vw', finalPosition: '-9.25vw' },   // "At" line - starts left, ends at center
        { initialOffset: '8vw', finalPosition: '-7.5vw' },    // "The" line - starts right, ends at center  
        { initialOffset: '-30vw', finalPosition: '-22vw' }    // "Barre" line - starts left, ends at center
    ];
    
    titleSVGs.forEach((svg, index) => {
        const config = SVG_CONFIGS[index] || { initialOffset: '-20vw', finalPosition: '0vw' };
        
        // Set initial position
        gsap.set(svg, { x: config.initialOffset });
        
        // Create simple scroll animation
        gsap.to(svg, {
            x: config.finalPosition,
            scrollTrigger: {
                trigger: '.hero-section',
                start: 'top 100%',
                end: 'bottom 75%',
                scrub: true
            }
        });
        
        console.log(`SVG ${index + 1} animation: ${config.initialOffset} → ${config.finalPosition}`);
    });
    
    console.log('Simple SVG scroll animations setup complete');
}

// Initialize when called (for dynamic loading)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBarreAnimations);
} else {
    initializeBarreAnimations();
}