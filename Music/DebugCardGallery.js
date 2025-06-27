// Debug Card Gallery - Simplified version for testing animations
console.log('DebugCardGallery.js loaded');

// Register GSAP plugins with error handling
try {
    if (typeof gsap !== 'undefined') {
        console.log('GSAP found, registering plugins...');
        // Check which plugins are available before registering
        const availablePlugins = [];
        if (typeof CustomEase !== 'undefined') availablePlugins.push(CustomEase);
        if (typeof CustomBounce !== 'undefined') availablePlugins.push(CustomBounce);
        if (typeof Observer !== 'undefined') availablePlugins.push(Observer);
        if (typeof Draggable !== 'undefined') availablePlugins.push(Draggable);
        if (typeof InertiaPlugin !== 'undefined') availablePlugins.push(InertiaPlugin);
        if (typeof MorphSVGPlugin !== 'undefined') availablePlugins.push(MorphSVGPlugin);
        
        console.log(`Available GSAP plugins: ${availablePlugins.length}`);
        if (availablePlugins.length > 0) {
            gsap.registerPlugin(...availablePlugins);
            console.log('GSAP plugins registered successfully');
        } else {
            console.warn('No GSAP plugins available to register');
        }
    } else {
        console.error('GSAP not found! Cannot register plugins.');
    }
} catch (error) {
    console.error('Error registering GSAP plugins:', error);
}

class DebugCardGallery {
    constructor() {
        this.tracks = [];
        this.totalCards = 0; // Will be set based on tracks data
        this.currentIndex = 0;
        this.cards = [];
        this.isScrolling = false;
        this.scrollDirection = 0; // -1 left, 1 right, 0 none
        this.leanAmount = 0;
        this.maxLean = 7; // degrees - increased for more dynamic feel
        this.scrollSpeed = 0.6; // Slower base speed for more fluid movement
        this.scrollInterval = 0.15; // Faster interval for smoother continuous movement
        this.isHovering = false;
        this.hoverInterval = null;
        this.allAudioPlayers = [];
        
        // Scale factor for all elements (1.0 = normal size, 1.5 = 50% bigger, etc.)
        this.scaleFactor = 1.2; // Make everything 70% bigger
        
        // SVG paths for morphing
        this.SVG_PATHS = {
            play: "M0,5.27v29.56c0,4.18,4.63,6.69,8.14,4.41l22.7-14.78c3.19-2.08,3.19-6.75,0-8.82L8.14.86C4.63-1.42,0,1.09,0,5.27Z",
            pause: "M0,5.07v31.65c0,2.8,2.27,5.07,5.07,5.07s5.07-2.27,5.07-5.07V5.07c0-2.8-2.27-5.07-5.07-5.07S0,2.27,0,5.07Z M18.96,5.07v31.65c0,2.8,2.27,5.07,5.07,5.07s5.07-2.27,5.07-5.07V5.07c0-2.8-2.27-5.07-5.07-5.07s-5.07,2.27-5.07,5.07Z",
            progressBarResting: "M711.89,42.35l-678.09.12c23.16,24.62,63,40.69,90.49,40.69h1175.19c27.5,0,67.33-16.07,90.49-40.69l-678.09-.12Z",
            progressBarHover: "M1420.48,0l-713.94,1.23L0,0c25.91,61.43,87.77,85.94,122.94,85.94h1173.3c35.54,0,98.05-24.51,124.23-85.94Z"
        };
        
        // Card positions and scales with improved spacing for fluid motion
        this.positions = {
            center: { x: 0, y: 0, scale: 1, rotation: 0, zIndex: 5 },
            innerLeft: { x: -5.5, y: 0, scale: 0.9, rotation: -7, zIndex: 4 }, // Slightly closer and larger
            innerRight: { x: 5.5, y: 0, scale: 0.9, rotation: 7, zIndex: 4 },
            outerLeft: { x: -10, y: 0.5, scale: 0.8, rotation: -14, zIndex: 3 }, // Slight vertical offset for depth
            outerRight: { x: 10, y: -0.5, scale: 0.8, rotation: 14, zIndex: 3 }
        };

        this.init();
    }

    async init() {
        try {
            await this.loadTracks();
            this.setupEventListeners();
            this.createCards();
            this.setupCardHoverEvents();
            this.setupCardClickEvents();
            this.arrangeCards();
            // Scale UI elements after everything is set up
            this.scaleUIElements();
            // Removed createDebugInfo() call
            
            // Create custom eases for more fluid physics
            CustomEase.create("fluidPhysics", "M0,0 C0.11,0.46 0.25,0.87 0.42,0.95 0.65,1.05 0.8,1.01 1,1");
            CustomEase.create("smoothInOut", "M0,0 C0.25,0.1 0.25,1 1,1");
            CustomEase.create("elasticOut", "M0,0 C0.25,0.46 0.45,0.94 0.58,0.97 0.73,1.01 0.8,0.99 1,1");
            CustomBounce.create("cardBounce", {strength: 0.4, squash: 1.5});
            
            console.log('Debug Card Gallery initialized successfully');
        } catch (error) {
            console.error('Error initializing Debug Card Gallery:', error);
        }
    }

    async loadTracks() {
        try {
            // Determine if we're in portfolio context or standalone
            const isPortfolioContext = window.location.pathname === '/' || window.location.pathname.includes('index.html');
            const tracksPath = isPortfolioContext ? 'Music/Tracks.json' : 'Tracks.json';
            
            const response = await fetch(tracksPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.tracks = await response.json();
            
            // Fix asset paths for portfolio context
            if (isPortfolioContext) {
                this.tracks = this.tracks.map(track => ({
                    ...track,
                    audio: `Music/${track.audio}`,
                    playerImage: `Music/${track.playerImage}`
                }));
                console.log('Asset paths adjusted for portfolio context');
            }
            
            // Sort tracks by date (most recent first)
            this.tracks.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateB - dateA; // Descending order (newest first)
            });
            
            this.totalCards = this.tracks.length;
            console.log(`Loaded ${this.totalCards} tracks from Tracks.json (sorted by date, newest first)`);
        } catch (error) {
            console.error('Error loading tracks:', error);
            // Fallback to empty array
            this.tracks = [];
            this.totalCards = 0;
        }
    }

    createCards() {
        const wrapper = document.getElementById('cardsWrapper');
        
        for (let i = 0; i < this.totalCards; i++) {
            const cardContainer = document.createElement('div');
            cardContainer.className = 'card';
            cardContainer.style.zIndex = 0;
            
            const musicCard = this.createMusicCard(this.tracks[i], i);
            cardContainer.appendChild(musicCard);
            
            wrapper.appendChild(cardContainer);
            this.cards.push(cardContainer);
        }
    }

    createMusicCard(track, index) {
        console.log('Creating music card:', track.title);
        
        const trackCard = document.createElement('div');
        trackCard.className = `track-card ${track.colorMode === 'dark' ? 'dark-mode' : ''}`;
        trackCard.style.backgroundImage = `url('${track.playerImage}')`;
        
        // Create overlay container
        const overlay = document.createElement('div');
        overlay.className = 'track-overlay';
        
        // Track info section
        const trackInfo = document.createElement('div');
        trackInfo.className = 'track-info';
        
        const titleSpan = document.createElement('span');
        titleSpan.className = 'track-title';
        titleSpan.textContent = track.title;
        
        const dateSpan = document.createElement('span');
        dateSpan.className = 'track-date';
        dateSpan.textContent = this.formatDate(track.date);
        
        trackInfo.appendChild(titleSpan);
        trackInfo.appendChild(dateSpan);
        overlay.appendChild(trackInfo);
        
        // Time displays
        const currentTime = document.createElement('div');
        currentTime.className = 'time-display current-time';
        currentTime.textContent = '0:00';
        
        const totalTime = document.createElement('div');
        totalTime.className = 'time-display total-time';
        totalTime.textContent = '0:00';
        
        // Play button with SVG
        const playButton = document.createElement('button');
        playButton.className = 'play-button';
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'play-pause-icon');
        svg.setAttribute('viewBox', '0 0 40 40');
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', this.SVG_PATHS.play);
        
        svg.appendChild(path);
        playButton.appendChild(svg);
        
        // Progress bar container with SVG morphing
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-bar-container';
        
        const progressSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        progressSVG.setAttribute('class', 'progress-bar');
        progressSVG.setAttribute('viewBox', '0 0 1420 84');
        progressSVG.setAttribute('preserveAspectRatio', 'none');
        
        // Background path (stroke)
        const bgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        bgPath.setAttribute('class', 'progress-bar-bg');
        bgPath.setAttribute('d', this.SVG_PATHS.progressBarResting);
        
        // Clip path for progress fill
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
        clipPath.setAttribute('id', `progress-clip-${index}`);
        
        const clipRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        clipRect.setAttribute('x', '0');
        clipRect.setAttribute('y', '0');
        clipRect.setAttribute('width', '0%');
        clipRect.setAttribute('height', '100%');
        
        clipPath.appendChild(clipRect);
        defs.appendChild(clipPath);
        
        // Progress fill path
        const fillPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        fillPath.setAttribute('class', 'progress-bar-fill');
        fillPath.setAttribute('d', this.SVG_PATHS.progressBarResting);
        fillPath.setAttribute('clip-path', `url(#progress-clip-${index})`);
        
        progressSVG.appendChild(defs);
        progressSVG.appendChild(bgPath);
        progressSVG.appendChild(fillPath);
        progressContainer.appendChild(progressSVG);
        
        // Audio element
        const audio = document.createElement('audio');
        audio.preload = 'metadata';
        audio.src = track.audio;
        
        // Add music controls to overlay
        overlay.appendChild(currentTime);
        overlay.appendChild(totalTime);
        overlay.appendChild(playButton);
        overlay.appendChild(progressContainer);
        
        // Assemble the card
        trackCard.appendChild(overlay);
        trackCard.appendChild(audio);
        
        // Set up audio functionality
        this.setupAudioPlayer(trackCard, track, index);
        
        return trackCard;
    }

    formatDate(dateString) {
        // Parse date manually to avoid timezone offset issues
        const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
        const date = new Date(year, month - 1, day); // month is 0-indexed in JS
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    }

    setupAudioPlayer(card, track, index) {
        const audio = card.querySelector('audio');
        const playButton = card.querySelector('.play-button');
        const currentTimeDisplay = card.querySelector('.current-time');
        const totalTimeDisplay = card.querySelector('.total-time');
        const progressContainer = card.querySelector('.progress-bar-container');
        const progressFill = card.querySelector('.progress-bar-fill');
        const progressBg = card.querySelector('.progress-bar-bg');
        const clipRect = card.querySelector(`#progress-clip-${index} rect`);
        
        // Store audio player reference
        this.allAudioPlayers.push(audio);
        
        // Metadata loaded
        audio.addEventListener('loadedmetadata', () => {
            totalTimeDisplay.textContent = this.formatTime(audio.duration);
        });
        
        // Time update
        audio.addEventListener('timeupdate', () => {
            currentTimeDisplay.textContent = this.formatTime(audio.currentTime);
            const progress = (audio.currentTime / audio.duration) * 100;
            clipRect.setAttribute('width', `${progress}%`);
        });
        
        // Play button click
        playButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePlayPause(audio, playButton);
        });
        
        // Progress bar click
        progressContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            const rect = progressContainer.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = clickX / rect.width;
            audio.currentTime = percentage * audio.duration;
        });
        
        // Progress bar hover morphing
        progressContainer.addEventListener('mouseenter', () => {
            gsap.to(progressBg, {
                morphSVG: this.SVG_PATHS.progressBarHover,
                duration: 0.3,
                ease: "power2.out"
            });
            gsap.to(progressFill, {
                morphSVG: this.SVG_PATHS.progressBarHover,
                duration: 0.3,
                ease: "power2.out"
            });
        });
        
        progressContainer.addEventListener('mouseleave', () => {
            gsap.to(progressBg, {
                morphSVG: this.SVG_PATHS.progressBarResting,
                duration: 0.3,
                ease: "power2.out"
            });
            gsap.to(progressFill, {
                morphSVG: this.SVG_PATHS.progressBarResting,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    }

    togglePlayPause(audio, button) {
        const path = button.querySelector('path');
        
        if (audio.paused) {
            // Stop all other audio players
            this.allAudioPlayers.forEach(player => {
                if (player !== audio && !player.paused) {
                    player.pause();
                    // Reset other play buttons
                    const otherButton = player.parentElement.querySelector('.play-button');
                    const otherPath = otherButton.querySelector('path');
                    gsap.to(otherPath, {
                        morphSVG: this.SVG_PATHS.play,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                }
            });
            
            // Play this audio
            audio.play();
            gsap.to(path, {
                morphSVG: this.SVG_PATHS.pause,
                duration: 0.3,
                ease: "power2.out"
            });
        } else {
            // Pause this audio
            audio.pause();
            gsap.to(path, {
                morphSVG: this.SVG_PATHS.play,
                duration: 0.3,
                ease: "power2.out"
            });
        }
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    arrangeCards() {
        // Hide all cards first with initial physics state
        this.cards.forEach(card => {
            gsap.set(card, { 
                opacity: 0, 
                scale: 0.6 * this.scaleFactor, // Apply global scale factor to initial scale
                x: 0,
                y: "2vw", // Start slightly lower for entrance effect
                rotation: 0
            });
        });

        // Show and position visible cards with staggered physics entrance
        const visibleIndices = this.getVisibleIndices();
        
        visibleIndices.forEach((cardIndex, positionIndex) => {
            if (cardIndex >= 0 && cardIndex < this.totalCards) {
                const card = this.cards[cardIndex];
                const position = this.getPositionByIndex(positionIndex);
                
                // Staggered entrance animation
                gsap.to(card, {
                    opacity: 1,
                    x: `${position.x}vw`,
                    y: `${position.y}vw`,
                    scale: position.scale * this.scaleFactor, // Apply global scale factor
                    rotation: position.rotation + this.leanAmount,
                    zIndex: position.zIndex,
                    duration: 1.2,
                    ease: "fluidPhysics",
                    delay: positionIndex * 0.12, // Staggered entrance
                    overwrite: "auto"
                });
            }
        });
    }

    scaleUIElements() {
        console.log(`Scaling UI elements with factor: ${this.scaleFactor}`);
        
        // Scale scroll text elements
        const scrollTexts = document.querySelectorAll('.music-section .scroll-text');
        scrollTexts.forEach(text => {
            gsap.set(text, {
                scale: this.scaleFactor,
                transformOrigin: "center center"
            });
        });
        
        // Scale hover zones to match larger cards
        const hoverZones = document.querySelectorAll('.music-section .hover-zone');
        hoverZones.forEach(zone => {
            gsap.set(zone, {
                scale: this.scaleFactor,
                transformOrigin: "center center"
            });
        });
        
        console.log('UI elements scaling applied');
    }

    getVisibleIndices() {
        // Returns array of card indices for [outerLeft, innerLeft, center, innerRight, outerRight]
        return [
            this.currentIndex - 2,
            this.currentIndex - 1,
            this.currentIndex,
            this.currentIndex + 1,
            this.currentIndex + 2
        ];
    }

    getPositionByIndex(positionIndex) {
        const positionKeys = ['outerLeft', 'innerLeft', 'center', 'innerRight', 'outerRight'];
        return this.positions[positionKeys[positionIndex]];
    }

    canScrollLeft() {
        return this.currentIndex > 0;
    }

    canScrollRight() {
        return this.currentIndex < this.totalCards - 1;
    }

    startContinuousScroll(direction) {
        console.log(`Starting continuous scroll in direction: ${direction}`);
        
        this.stopContinuousScroll();
        
        this.isHovering = true;
        this.scrollDirection = direction;
        
        const scrollAction = () => {
            if (!this.isHovering) {
                console.log('Stopped scrolling - no longer hovering');
                return;
            }
            
            const canScroll = direction === -1 ? this.canScrollLeft() : this.canScrollRight();
            console.log(`Can scroll: ${canScroll}, Current index: ${this.currentIndex}`);
            
            if (canScroll) {
                this.scroll(direction);
                this.hoverInterval = setTimeout(scrollAction, this.scrollInterval * 1000);
            } else {
                console.log('Reached boundary, stopping scroll');
                this.stopContinuousScroll();
            }
        };
        
        scrollAction();
    }

    stopContinuousScroll() {
        console.log('Stopping continuous scroll');
        this.isHovering = false;
        if (this.hoverInterval) {
            clearTimeout(this.hoverInterval);
            this.hoverInterval = null;
        }
        this.returnToNeutral();
    }

    scroll(direction) {
        this.currentIndex += direction;
        
        // Start lean and transition simultaneously for fluid motion
        this.animateLean(direction);
        this.animateCardTransition();
    }

    animateLean(direction) {
        const targetLean = direction === 1 ? -this.maxLean : this.maxLean;
        
        gsap.to(this, {
            leanAmount: targetLean,
            duration: this.scrollSpeed * 0.8, // Slightly longer for smoothness
            ease: "fluidPhysics",
            overwrite: "auto",
            onUpdate: () => {
                this.updateCardRotations();
            }
        });
    }

    updateCardRotations() {
        const visibleIndices = this.getVisibleIndices();
        
        visibleIndices.forEach((cardIndex, positionIndex) => {
            if (cardIndex >= 0 && cardIndex < this.totalCards) {
                const card = this.cards[cardIndex];
                const position = this.getPositionByIndex(positionIndex);
                
                gsap.set(card, {
                    rotation: position.rotation + this.leanAmount,
                    overwrite: "auto"
                });
            }
        });
    }

    updateCardRotationsSmooth() {
        const visibleIndices = this.getVisibleIndices();
        
        visibleIndices.forEach((cardIndex, positionIndex) => {
            if (cardIndex >= 0 && cardIndex < this.totalCards) {
                const card = this.cards[cardIndex];
                const position = this.getPositionByIndex(positionIndex);
                
                // Use smoother rotation updates for click navigation
                gsap.to(card, {
                    rotation: position.rotation + this.leanAmount,
                    duration: 0.1,
                    ease: "none",
                    overwrite: "auto"
                });
            }
        });
    }

    animateCardTransition(onComplete) {
        const visibleIndices = this.getVisibleIndices();
        const timeline = gsap.timeline({ 
            onComplete: onComplete,
            overwrite: "auto"
        });

        // Staggered animation for more natural physics feel
        visibleIndices.forEach((cardIndex, positionIndex) => {
            if (cardIndex >= 0 && cardIndex < this.totalCards) {
                const card = this.cards[cardIndex];
                const position = this.getPositionByIndex(positionIndex);
                
                // Calculate stagger delay based on distance from center
                const centerIndex = 2; // Center position in visible indices
                const distanceFromCenter = Math.abs(positionIndex - centerIndex);
                const staggerDelay = distanceFromCenter * 0.06; // Reduced stagger for more fluid motion
                
                timeline.to(card, {
                    x: `${position.x}vw`,
                    y: `${position.y}vw`,
                    scale: position.scale * this.scaleFactor, // Apply global scale factor
                    // Note: rotation is handled by updateCardRotations during lean animation
                    zIndex: position.zIndex,
                    opacity: 1,
                    duration: this.scrollSpeed + (distanceFromCenter * 0.08), // Slightly reduced duration variation
                    ease: "fluidPhysics",
                    overwrite: "auto",
                    delay: staggerDelay
                }, 0);
            }
        });

        // Animate out cards with momentum-like timing
        this.cards.forEach((card, index) => {
            if (!visibleIndices.includes(index)) {
                timeline.to(card, {
                    opacity: 0,
                    scale: 0.6 * this.scaleFactor, // Apply global scale factor
                    duration: this.scrollSpeed * 0.7, // Faster exit
                    ease: "fluidPhysics",
                    overwrite: "auto"
                }, 0);
            }
        });
    }

    animateCardTransitionSmooth() {
        const visibleIndices = this.getVisibleIndices();
        const timeline = gsap.timeline({ 
            overwrite: "auto"
        });

        // Staggered animation with smoother easing for click navigation
        visibleIndices.forEach((cardIndex, positionIndex) => {
            if (cardIndex >= 0 && cardIndex < this.totalCards) {
                const card = this.cards[cardIndex];
                const position = this.getPositionByIndex(positionIndex);
                
                // Calculate stagger delay based on distance from center
                const centerIndex = 2;
                const distanceFromCenter = Math.abs(positionIndex - centerIndex);
                const staggerDelay = distanceFromCenter * 0.08; // Keep the stagger
                
                timeline.to(card, {
                    x: `${position.x}vw`,
                    y: `${position.y}vw`,
                    scale: position.scale * this.scaleFactor, // Apply global scale factor
                    zIndex: position.zIndex,
                    opacity: 1,
                    duration: 0.6 + (distanceFromCenter * 0.1),
                    ease: "power2.out", // Smoother easing for clicks
                    overwrite: "auto",
                    delay: staggerDelay
                }, 0);
            }
        });

        // Animate out cards with smoother timing
        this.cards.forEach((card, index) => {
            if (!visibleIndices.includes(index)) {
                timeline.to(card, {
                    opacity: 0,
                    scale: 0.6 * this.scaleFactor, // Apply global scale factor
                    duration: 0.5,
                    ease: "power2.out",
                    overwrite: "auto"
                }, 0);
            }
        });
    }

    returnToNeutral() {
        gsap.to(this, {
            leanAmount: 0,
            duration: 1.2, // Longer return for smoother physics
            ease: "elasticOut",
            overwrite: "auto",
            onUpdate: () => {
                const visibleIndices = this.getVisibleIndices();
                
                visibleIndices.forEach((cardIndex, positionIndex) => {
                    if (cardIndex >= 0 && cardIndex < this.totalCards) {
                        const card = this.cards[cardIndex];
                        const position = this.getPositionByIndex(positionIndex);
                        
                        // Staggered return to neutral with physics-based easing
                        gsap.to(card, {
                            rotation: position.rotation + this.leanAmount,
                            duration: 0.8,
                            ease: "elasticOut",
                            delay: positionIndex * 0.06,
                            overwrite: "auto"
                        });
                    }
                });
            }
        });

        this.scrollDirection = 0;
    }

    setupEventListeners() {
        const hoverLeft = document.getElementById('hoverLeft');
        const hoverRight = document.getElementById('hoverRight');
        const scrollLeftText = document.getElementById('scrollLeftText');
        const scrollRightText = document.getElementById('scrollRightText');

        hoverLeft.addEventListener('mouseenter', (e) => {
            console.log('Entering left hover zone');
            if (this.canScrollLeft()) {
                this.startContinuousScroll(-1);
                this.animateScrollText(scrollLeftText, true);
            } else {
                // At boundary - just animate scroll text
                this.animateScrollText(scrollLeftText, true);
            }
        });

        hoverLeft.addEventListener('mouseleave', (e) => {
            console.log('Leaving left hover zone');
            if (!hoverLeft.contains(e.relatedTarget)) {
                this.stopContinuousScroll();
                this.animateScrollText(scrollLeftText, false);
            }
        });

        hoverRight.addEventListener('mouseenter', (e) => {
            console.log('Entering right hover zone');
            if (this.canScrollRight()) {
                this.startContinuousScroll(1);
                this.animateScrollText(scrollRightText, true);
            } else {
                // At boundary - just animate scroll text
                this.animateScrollText(scrollRightText, true);
            }
        });

        hoverRight.addEventListener('mouseleave', (e) => {
            console.log('Leaving right hover zone');
            if (!hoverRight.contains(e.relatedTarget)) {
                this.stopContinuousScroll();
                this.animateScrollText(scrollRightText, false);
            }
        });

        document.addEventListener('mouseleave', () => {
            this.stopContinuousScroll();
            this.animateScrollText(scrollLeftText, false);
            this.animateScrollText(scrollRightText, false);
        });
    }

    setupCardHoverEvents() {
        this.cards.forEach((card, index) => {
            card.addEventListener('mouseenter', () => {
                // Scale up with fluid physics easing
                gsap.to(card, {
                    scale: '+=0.08', // Slightly more scale for better visual feedback
                    duration: 0.6, // Longer duration for smoothness
                    ease: "back.out", // Elastic easing for more natural feel
                    overwrite: "auto"
                });
                
                // Enhanced shadow with smooth transition
                const musicCard = card.querySelector('.track-card');
                if (musicCard) {
                    gsap.to(musicCard, {
                        boxShadow: "0 3.5vw 9vw rgba(0, 0, 0, 0.7)",
                        duration: 0.6,
                        ease: "fluidPhysics"
                    });
                }
            });

            card.addEventListener('mouseleave', () => {
                // Scale back with elastic easing for more natural feel
                const visibleIndices = this.getVisibleIndices();
                const positionIndex = visibleIndices.indexOf(index);
                
                if (positionIndex !== -1) {
                    // Card is visible, scale back to its position scale
                    const position = this.getPositionByIndex(positionIndex);
                    gsap.to(card, {
                        scale: position.scale * this.scaleFactor, // Apply global scale factor
                        duration: 0.6,
                        ease: "back.out",
                        overwrite: "auto"
                    });
                } else {
                    // Card is not visible, scale to default hidden scale
                    gsap.to(card, {
                        scale: 0.7 * this.scaleFactor, // Apply global scale factor to hidden scale too
                        duration: 0.6,
                        ease: "elasticOut",
                        overwrite: "auto"
                    });
                }
                
                // Reset shadow with smooth transition
                const musicCard = card.querySelector('.track-card');
                if (musicCard) {
                    gsap.to(musicCard, {
                        boxShadow: "0 2vw 6vw rgba(0, 0, 0, 0.4)",
                        duration: 0.6,
                        ease: "elasticOut"
                    });
                }
            });
        });
    }

    setupCardClickEvents() {
        this.cards.forEach((card, index) => {
            card.addEventListener('click', (e) => {
                console.log(`Clicked on card ${index + 1}, navigating to center it`);
                this.navigateToCard(index);
            });
        });
    }

    navigateToCard(targetIndex) {
        // Stop any continuous scrolling
        this.stopContinuousScroll();
        
        // Calculate the difference between current and target index
        const difference = targetIndex - this.currentIndex;
        
        if (difference === 0) {
            // Already centered, do nothing
            return;
        }
        
        console.log(`Navigating from index ${this.currentIndex} to ${targetIndex} (difference: ${difference})`);
        
        // Create momentum-based animation based on distance
        const distance = Math.abs(difference);
        const direction = difference > 0 ? 1 : -1;
        
        // Scale lean amount based on distance - less lean for single card movements
        const leanMultiplier = distance === 1 ? 0.3 : Math.min(1.0, 0.5 + (distance * 0.15));
        const targetLean = direction * this.maxLean * leanMultiplier;
        
        // Add dynamic timing based on distance for physics feel
        const baseDuration = 0.7;
        const momentumDuration = baseDuration + (distance * 0.1);
        
        // Update index
        this.currentIndex = targetIndex;
        this.currentIndex = Math.max(0, Math.min(this.currentIndex, this.totalCards - 1));
        
        // Smooth lean animation with integrated rotation updates
        gsap.to(this, {
            leanAmount: targetLean,
            duration: momentumDuration * 0.4,
            ease: "power2.out",
            onUpdate: () => {
                this.updateCardRotationsSmooth();
            },
            onComplete: () => {
                // Return to neutral smoothly
                gsap.to(this, {
                    leanAmount: 0,
                    duration: momentumDuration * 0.7,
                    ease: "power2.out",
                    onUpdate: () => {
                        this.updateCardRotationsSmooth();
                    }
                });
            }
        });
        
        // Start card transition with smoother handling
        this.animateCardTransitionSmooth();
    }

    animateScrollText(textElement, isHover) {
        if (isHover) {
            gsap.to(textElement, {
                scaleY: 2,
                duration: 0.4, // Smoother text animation
                ease: "circ.out",
                transformOrigin: "top center"
            });
        } else {
            gsap.to(textElement, {
                scaleY: 1,
                duration: 0.8,
                ease: "circ.out",
                transformOrigin: "top center"
            });
        }
    }
}

// Make DebugCardGallery globally accessible for portfolio integration
window.DebugCardGallery = DebugCardGallery;

// Initialize when DOM is loaded OR when called explicitly
function initializeMusicGallery() {
    console.log('initializeMusicGallery called');
    
    // Check if GSAP is available
    if (typeof gsap === 'undefined') {
        console.error('GSAP not available, cannot initialize music gallery');
        return false;
    }
    
    const cardsWrapper = document.getElementById('cardsWrapper');
    if (cardsWrapper) {
        console.log('cardsWrapper found, initializing gallery');
        try {
            new DebugCardGallery();
            console.log('DebugCardGallery initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing DebugCardGallery:', error);
            return false;
        }
    } else {
        console.error('cardsWrapper not found, cannot initialize music gallery');
        return false;
    }
}

// Make function globally accessible for portfolio integration
window.initializeMusicGallery = initializeMusicGallery;

// Auto-initialize if DOM is already loaded (for standalone use only)
// Check if we're in portfolio context by looking for portfolio-specific elements
const isPortfolioContext = document.querySelector('.portfolio-section') || document.querySelector('#loading');

if (!isPortfolioContext) {
    // Only auto-initialize in standalone context
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeMusicGallery);
    } else {
        const cardsWrapper = document.getElementById('cardsWrapper');
        if (cardsWrapper) {
            console.log('Auto-initializing music gallery (standalone)');
            initializeMusicGallery();
        } else {
            console.log('cardsWrapper not found, waiting for explicit initialization');
        }
    }
} else {
    console.log('Portfolio context detected, waiting for explicit initialization');
}
