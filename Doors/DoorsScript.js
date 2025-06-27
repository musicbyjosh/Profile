// GSAP Folder Opening Animation
function initializeDoorsAnimations() {
    // Animation settings - adjust these to change speed and easing
    const ANIMATION_DURATION = .7;
    const OPEN_EASE = "circ.in";
    const CLOSE_EASE = "expo.out";
    
    // Container hover effect settings
    const CONTAINER_DURATION = 0.3;
    const CONTAINER_EASE = "expo.out(1.7)";
    
    // Hover effect amounts - adjust these to change hover animation strength
    const HOVER_SCALE_INCREASE = 0.08;  // How much larger the folder gets on hover (0.08 = 8% increase)
    const HOVER_ROTATE_CHANGE = 2;      // How many degrees the rotation changes on hover
    
    // Store front image animation settings - easily configurable
    const STORE_FRONT_ANIMATION = {
        // Starting state
        startPosition: { x: "-30%", y: "0%" },
        startRotation: -1,
        startScale: 1,
        startOpacity: 0,
        
        // Animation properties
        speed: .6,
        ease: "expo.out",
        delay: 0.4,             // Delay before animation starts (in seconds)
        opacityInSpeed: 0.8,    // Speed for fade in (opacity 0 to 1)
        opacityOutSpeed: 0.15,   // Speed for fade out (opacity 1 to 0)
        
        // End state (on hover)
        endPosition: { x: "0%", y: "0%" },
        endRotation: 6,
        endScale: 1.05,
        endOpacity: 1
    };

    // Cartoon image hover animation settings - easily configurable
    const CARTOON_ANIMATIONS = {
        // Global scale settings (applies to all)
        globalScale: {
            baseScale: 1,
            hoverScale: 1,
            speed: 0.3,
            ease: "expo.out(1.7)"
        },
        
        // Individual settings for each image
        spotlight: {
            // Position controls (relative to current CSS position)
            basePosition: { x: "0%", y: "0%" },
            hoverPosition: { x: ".5vw", y: "-3vw" },
            // Rotation controls
            baseRotation: -4,   // Must match CSS: rotate(-4deg)
            hoverRotation: 1
        },
        circle: {
            // Position controls (relative to current CSS position)
            // Note: Circle uses bottom positioning, so y values work opposite to top-positioned elements
            basePosition: { x: "0%", y: "0%" },
            hoverPosition: { x: "-4vw", y: "1vw" },  // Positive Y moves it UP from bottom
            // Rotation controls
            baseRotation: -8,   // Must match CSS: rotate(-8deg)
            hoverRotation: -3
        },
        curve: {
            // Position controls (relative to current CSS position)
            basePosition: { x: "0%", y: "0%" },
            hoverPosition: { x: "-2.5vw", y: ".5vw" },
            // Rotation controls
            baseRotation: 3,    // Must match CSS: rotate(3deg)
            hoverRotation: 9
        }
    };
    
    // Base values (from CSS)
    const BASE_SCALE = 1.5;
    const BASE_ROTATE = -9;
    
    // Calculated hover values
    const HOVER_SCALE = BASE_SCALE + HOVER_SCALE_INCREASE;
    const HOVER_ROTATE = BASE_ROTATE + HOVER_ROTATE_CHANGE;
    
    const folderContainer = document.querySelector('.folder-container');
    const folderOverlay = document.querySelector('.folder-image-overlay');
    const baseFolder = document.querySelector('.folder-image');
    const folderText = document.querySelector('.folder-text');
    const storeFrontContainer = document.querySelector('.store-front-container');
    
    // Cartoon image elements
    const spotlightImage = document.querySelector('.spotlight-image');
    const circleImage = document.querySelector('.circle-image');
    const curveImage = document.querySelector('.curve-image');
    
    if (!folderOverlay || !baseFolder || !folderContainer || !folderText || !storeFrontContainer) return;
    
    // Set initial perspective for 3D effect
    const mainSection = document.querySelector('.main-section');
    mainSection.style.perspective = '1000px';
    
    // Set initial state - but don't change transform-origin yet
    gsap.set(folderOverlay, {
        rotationY: 0
    });
    
    gsap.set(folderText, {
        rotationY: 0
    });
    
    // Set initial state for store front image
    gsap.set(storeFrontContainer, {
        x: STORE_FRONT_ANIMATION.startPosition.x,
        y: STORE_FRONT_ANIMATION.startPosition.y,
        rotation: STORE_FRONT_ANIMATION.startRotation,
        scale: STORE_FRONT_ANIMATION.startScale,
        opacity: STORE_FRONT_ANIMATION.startOpacity
    });
    
    let isOpen = false;
    
    // Hover event listeners - use the container for consistent hover area
    folderContainer.addEventListener('mouseenter', function() {
        if (!isOpen) {
            isOpen = true;
            // Kill any existing animations to prevent conflicts
            gsap.killTweensOf(folderOverlay);
            gsap.killTweensOf(folderContainer);
            gsap.killTweensOf(folderText);
            gsap.killTweensOf(storeFrontContainer);
            
            // Animate the folder opening
            gsap.to(folderOverlay, {
                duration: ANIMATION_DURATION,
                rotationY: 180,
                transformOrigin: "100% 50%",
                ease: OPEN_EASE,
                onUpdate: function() {
                    // Get current rotation value
                    const currentRotation = gsap.getProperty(folderOverlay, "rotationY");
                    // Change z-index the moment it passes 90 degrees
                    if (currentRotation >= 90 && folderOverlay.style.zIndex !== '3') {
                        folderOverlay.style.zIndex = '3';
                    }
                }
            });
            
            // Animate the text with the folder
            gsap.to(folderText, {
                duration: ANIMATION_DURATION,
                rotationY: 180,
                transformOrigin: "190% 50%",
                ease: OPEN_EASE
            });
            
            // Animate the store front image (position, rotation, scale)
            gsap.to(storeFrontContainer, {
                duration: STORE_FRONT_ANIMATION.speed,
                delay: STORE_FRONT_ANIMATION.delay,
                x: STORE_FRONT_ANIMATION.endPosition.x,
                y: STORE_FRONT_ANIMATION.endPosition.y,
                rotation: STORE_FRONT_ANIMATION.endRotation,
                scale: STORE_FRONT_ANIMATION.endScale,
                ease: STORE_FRONT_ANIMATION.ease
            });
            
            // Animate the store front image opacity separately
            gsap.to(storeFrontContainer, {
                duration: STORE_FRONT_ANIMATION.opacityInSpeed,
                delay: STORE_FRONT_ANIMATION.delay,
                opacity: STORE_FRONT_ANIMATION.endOpacity,
                ease: STORE_FRONT_ANIMATION.ease
            });
            
            // Add subtle hover effect to existing transform
            gsap.to(folderContainer, {
                duration: CONTAINER_DURATION,
                transform: `translateY(-50%) scale(${HOVER_SCALE}) rotate(${HOVER_ROTATE}deg)`,
                ease: CONTAINER_EASE
            });
        }
    });
    
    folderContainer.addEventListener('mouseleave', function() {
        if (isOpen) {
            isOpen = false;
            // Kill any existing animations to prevent conflicts
            gsap.killTweensOf(folderOverlay);
            gsap.killTweensOf(folderContainer);
            gsap.killTweensOf(folderText);
            gsap.killTweensOf(storeFrontContainer);
            
            // Animate the folder closing
            gsap.to(folderOverlay, {
                duration: ANIMATION_DURATION,
                rotationY: 0,
                transformOrigin: "100% 50%",
                ease: CLOSE_EASE,
                onUpdate: function() {
                    // Get current rotation value
                    const currentRotation = gsap.getProperty(folderOverlay, "rotationY");
                    // Restore z-index the moment it passes back through 90 degrees
                    if (currentRotation <= 90 && folderOverlay.style.zIndex !== '5') {
                        folderOverlay.style.zIndex = '5';
                    }
                }
            });
            
            // Animate the text back
            gsap.to(folderText, {
                duration: ANIMATION_DURATION,
                rotationY: 0,
                transformOrigin: "200% 50%",
                ease: CLOSE_EASE
            });
            
            // Animate the store front image back to initial state (position, rotation, scale)
            gsap.to(storeFrontContainer, {
                duration: STORE_FRONT_ANIMATION.speed,
                x: STORE_FRONT_ANIMATION.startPosition.x,
                y: STORE_FRONT_ANIMATION.startPosition.y,
                rotation: STORE_FRONT_ANIMATION.startRotation,
                scale: STORE_FRONT_ANIMATION.startScale,
                ease: STORE_FRONT_ANIMATION.ease
            });
            
            // Animate the store front image opacity separately with fade out timing
            gsap.to(storeFrontContainer, {
                duration: STORE_FRONT_ANIMATION.opacityOutSpeed,
                opacity: STORE_FRONT_ANIMATION.startOpacity,
                ease: STORE_FRONT_ANIMATION.ease
            });
            
            // Return to original transform
            gsap.to(folderContainer, {
                duration: CONTAINER_DURATION,
                transform: `translateY(-50%) scale(${BASE_SCALE}) rotate(${BASE_ROTATE}deg)`,
                ease: CONTAINER_EASE
            });
        }
    });

    // Cartoon image hover animations
    function addCartoonHover(element, imageName, hasTranslateY = false, hasTranslateX = false) {
        if (!element) return;
        
        const imageConfig = CARTOON_ANIMATIONS[imageName];
        const globalConfig = CARTOON_ANIMATIONS.globalScale;
        
        element.addEventListener('mouseenter', function() {
            gsap.killTweensOf(element);
            
            // Build transform string preserving CSS positioning transforms
            let transform = '';
            if (hasTranslateY) transform += 'translateY(-50%) ';
            if (hasTranslateX) transform += 'translateX(-50%) ';
            
            // Add position offset using translate
            transform += `translate(${imageConfig.hoverPosition.x}, ${imageConfig.hoverPosition.y}) `;
            transform += `scale(${globalConfig.hoverScale}) rotate(${imageConfig.hoverRotation}deg)`;
            
            gsap.to(element, {
                duration: globalConfig.speed,
                transform: transform,
                ease: globalConfig.ease
            });
        });
        
        element.addEventListener('mouseleave', function() {
            gsap.killTweensOf(element);
            
            // Build transform string preserving CSS positioning transforms
            let transform = '';
            if (hasTranslateY) transform += 'translateY(-50%) ';
            if (hasTranslateX) transform += 'translateX(-50%) ';
            
            // Return to base position
            transform += `translate(${imageConfig.basePosition.x}, ${imageConfig.basePosition.y}) `;
            transform += `scale(${globalConfig.baseScale}) rotate(${imageConfig.baseRotation}deg)`;
            
            gsap.to(element, {
                duration: globalConfig.speed,
                transform: transform,
                ease: globalConfig.ease
            });
        });
    }
    
    // Apply hover animations to cartoon images
    addCartoonHover(spotlightImage, 'spotlight', true, false); // has translateY
    addCartoonHover(circleImage, 'circle', false, true);       // has translateX
    addCartoonHover(curveImage, 'curve', false, false);        // no translate
}

// Initialize animations when DOM is ready or when called directly
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDoorsAnimations);
} else {
    // DOM is already loaded, initialize immediately
    initializeDoorsAnimations();
}