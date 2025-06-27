function initializeStyleGraphic() {
    const colorLogo = document.querySelector('.logo.color');
    const container = document.querySelector('.logo-container');
    
    if (!colorLogo || !container) {
        console.error('Style Graphic elements not found');
        return;
    }
    
    const BASE_RADIUS = 120; // Increased from 70 for bigger brush
    const TRAIL_DURATION = 1200;
    const trail = [];
    let hovering = false;
    let lastPos = { x: -1, y: -1 };
    let currentPos = { x: -1, y: -1 };

    // Function to calculate responsive radius based on viewport width
    function getResponsiveRadius() {
        const vw = window.innerWidth;
        // Scale radius based on viewport width, with a minimum size
        // At 1920px width = BASE_RADIUS, scales proportionally
        const scaledRadius = Math.max(40, (BASE_RADIUS * vw) / 1920);
        return scaledRadius;
    }

    function animate() {
        const now = Date.now();
        const currentRadius = getResponsiveRadius();
        
        // Remove expired trail points
        while (trail.length && now - trail[0].time > TRAIL_DURATION) trail.shift();
        
        const gradients = [];
        
        // Get the actual logo dimensions and position for proper coordinate mapping
        const logoRect = colorLogo.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Calculate offset from container to logo
        const logoOffsetX = logoRect.left - containerRect.left;
        const logoOffsetY = logoRect.top - containerRect.top;
        
        // Current cursor position (only while hovering)
        if (hovering && currentPos.x >= 0) {
            // Adjust coordinates relative to the logo position
            const adjustedX = currentPos.x - logoOffsetX;
            const adjustedY = currentPos.y - logoOffsetY;
            gradients.push(`radial-gradient(circle ${currentRadius}px at ${adjustedX}px ${adjustedY}px, white 80%, transparent)`);
        }
        
        // Trail gradients (always show these regardless of hover state)
        trail.forEach(pt => {
            const alpha = Math.max(0, 1 - (now - pt.time) / TRAIL_DURATION);
            if (alpha > 0) {
                // Adjust coordinates relative to the logo position
                const adjustedX = pt.x - logoOffsetX;
                const adjustedY = pt.y - logoOffsetY;
                gradients.push(`radial-gradient(circle ${currentRadius}px at ${adjustedX}px ${adjustedY}px, rgba(255,255,255,${alpha}) 80%, transparent)`);
            }
        });
        
        // Update mask
        const mask = gradients.length ? gradients.join(', ') : 'none';
        colorLogo.style.webkitMaskImage = mask;
        colorLogo.style.maskImage = mask;
        
        // Control opacity based on whether we have any active effects
        // Keep the logo visible if there are trail points or if hovering
        if (gradients.length > 0) {
            colorLogo.style.opacity = '1';
        } else {
            colorLogo.style.opacity = '0';
        }
        
        // Continue animation if there are any gradients (trail or current position)
        if (gradients.length || trail.length) requestAnimationFrame(animate);
    }

    container.addEventListener('mousemove', e => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        currentPos = { x, y };
        
        // Add trail point only if mouse moved
        if (x !== lastPos.x || y !== lastPos.y) {
            trail.push({ x, y, time: Date.now() });
            lastPos = { x, y };
        }
        
        if (!hovering) {
            hovering = true;
            animate();
        }
    });

    container.addEventListener('mouseleave', () => {
        hovering = false;
        
        // Add final trail point to continue the trail effect
        if (currentPos.x >= 0) {
            trail.push({ ...currentPos, time: Date.now() });
        }
        
        // Don't reset positions immediately - let the trail fade naturally
        // The animation will continue until the trail expires
    });

    // Update radius on window resize for responsive behavior
    window.addEventListener('resize', () => {
        // No need to do anything here since getResponsiveRadius() is called each frame
        // This comment is just for clarity that resize is handled automatically
    });
}

// Initialize immediately if DOM is ready, or wait for DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeStyleGraphic);
} else {
    initializeStyleGraphic();
}