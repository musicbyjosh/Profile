function initializeParks() {
    console.log('Initializing Parks section...');
    
    // Wait for GSAP to be available
    if (typeof gsap === 'undefined') {
        console.error('GSAP not loaded yet, retrying in 100ms...');
        setTimeout(initializeParks, 100);
        return;
    }
    
    const scrollingStrip = document.querySelector('.scrolling-strip');
    const posterItems = document.querySelectorAll('.poster-item');
    const parksContainer = document.querySelector('.parks-container');
    
    if (!scrollingStrip || posterItems.length === 0) {
        console.error('Parks elements not found:', {
            scrollingStrip: !!scrollingStrip,
            posterItems: posterItems.length,
            parksContainer: !!parksContainer
        });
        return;
    }
    
    console.log(`Found ${posterItems.length} poster items`);
    
    // Wait for images to load before calculating dimensions
    const images = document.querySelectorAll('.parks-poster');
    let loadedImages = 0;
    const totalImages = images.length;
    
    function startAnimation() {
        // Calculate the width needed for seamless scrolling
        const firstPoster = posterItems[0];
        const posterWidth = firstPoster.offsetWidth;
        const gap = window.innerWidth * 0.02; // 2vw in pixels
        const halfCount = Math.floor(posterItems.length / 2);
        const totalWidth = (posterWidth + gap) * halfCount;
        
        console.log(`Animation setup:`, {
            posterWidth,
            gap,
            halfCount,
            totalWidth,
            itemsCount: posterItems.length
        });
        
        // Create infinite scrolling animation
        const scrollTween = gsap.to(scrollingStrip, {
            x: -totalWidth,
            duration: 8,
            ease: "none",
            repeat: -1,
            paused: false
        });
        
        console.log('GSAP animation started');
        
        // Add hover effects for each poster
        posterItems.forEach((item, index) => {
            const poster = item.querySelector('.parks-poster');
            
            if (!poster) {
                console.warn(`No poster found in item ${index}`);
                return;
            }
            
            // Create timelines for smooth synchronized animations
            let hoverTimeline = null;
            let resetTimeline = null;
            
            // Mouse enter - pause scrolling and animate poster
            item.addEventListener('mouseenter', () => {
                console.log(`Hovering over poster ${index + 1}`);
                
                // Pause the scrolling animation
                scrollTween.pause();
                
                // Kill any existing animations
                if (resetTimeline) resetTimeline.kill();
                
                // Create synchronized hover animation timeline
                hoverTimeline = gsap.timeline();
                hoverTimeline.to(poster, {
                    scale: 1.12,
                    rotation: 5,
                    filter: "drop-shadow(1vw 1vw 0px rgba(0, 0, 0, 1))",
                    duration: 0.5,
                    ease: "expo.out"
                }, 0); // Start at time 0 for simultaneous animation
            });
            
            // Mouse leave - resume scrolling and reset poster
            item.addEventListener('mouseleave', () => {
                console.log(`Left poster ${index + 1}`);
                
                // Resume the scrolling animation
                scrollTween.resume();
                
                // Kill any existing animations
                if (hoverTimeline) hoverTimeline.kill();
                
                // Create synchronized reset animation timeline
                resetTimeline = gsap.timeline();
                resetTimeline.to(poster, {
                    scale: 1,
                    rotation: 0,
                    filter: "drop-shadow(0px 0px 0px rgba(0, 0, 0, 0))",
                    duration: 0.9,
                    ease: "expo.out"
                }, 0); // Start at time 0 for simultaneous animation
            });
        });
        
        // Optional: Add intersection observer for performance optimization
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    console.log('Parks section is visible - starting animation');
                    scrollTween.resume();
                } else {
                    console.log('Parks section is not visible - pausing animation');
                    scrollTween.pause();
                }
            });
        }, {
            threshold: 0.1
        });
        
        if (parksContainer) {
            observer.observe(parksContainer);
        }
        
        console.log('Parks section initialized successfully with GSAP');
    }
    
    // Check if images are already loaded or load them
    if (totalImages === 0) {
        console.log('No images found, starting animation anyway');
        startAnimation();
        return;
    }
    
    images.forEach((img, index) => {
        if (img.complete) {
            loadedImages++;
            console.log(`Image ${index + 1} already loaded`);
        } else {
            img.addEventListener('load', () => {
                loadedImages++;
                console.log(`Image ${index + 1} loaded (${loadedImages}/${totalImages})`);
                if (loadedImages === totalImages) {
                    setTimeout(startAnimation, 100); // Small delay to ensure DOM is ready
                }
            });
            
            img.addEventListener('error', (e) => {
                console.error(`Image ${index + 1} failed to load:`, e);
                loadedImages++;
                if (loadedImages === totalImages) {
                    setTimeout(startAnimation, 100);
                }
            });
        }
    });
    
    // If all images are already loaded
    if (loadedImages === totalImages) {
        setTimeout(startAnimation, 100);
    }
    
    // Fallback timeout
    setTimeout(() => {
        if (loadedImages < totalImages) {
            console.warn('Some images still loading, starting animation anyway');
            startAnimation();
        }
    }, 2000);
}

// Ensure the function is available globally for LoadSections.js
window.initializeParks = initializeParks;