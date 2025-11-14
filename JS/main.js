// =======================================================
// Global Variables for Three.js (Background)
// =======================================================
let camera, scene, renderer, particles;
let mouseX = 0, mouseY = 0;
// These are initialized in init() now to ensure they only exist if the element is present
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

// =======================================================
// Modal Control Logic
// Functions attached to 'window' for accessibility from inline HTML 'onclick' attributes.
// =======================================================
/**
 * Function to display a custom message box instead of using alert() for placeholder links.
 * @param {string} nomeArea - The name of the area being accessed (e.g., "Sobre").
 */
window.mostrarAviso = function(nomeArea) {
    const messageBox = document.getElementById('messageBox');
    if (!messageBox) {
        console.warn(`[AVISO] Placeholder link clicked: ${nomeArea}`);
        return;
    }

    document.getElementById('messageTitle').textContent = `Navegação: ${nomeArea}`;
    document.getElementById('messageText').textContent = 
        `A seção '${nomeArea}' é atualmente um espaço reservado (placeholder). Este recurso será implementado em breve.`;
    
    messageBox.classList.remove('hidden');
    messageBox.classList.add('flex'); // Ensure it is visible as flex
}

// =======================================================
// Drawer/Menu Toggle Logic
// =======================================================
/**
 * Toggles the mobile menu drawer from the right side.
 * @param {boolean} [forceOpen] - Forces the menu open (true) or closed (false).
 */
window.toggleMenu = function(forceOpen) {
    const mobileMenuDrawer = document.getElementById('mobile-menu-drawer');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');

    if (!mobileMenuDrawer || !mobileMenuOverlay) return;

    // Checks if the menu is currently visible (transform-translate-x-0 class applied)
    const isMenuOpen = mobileMenuDrawer.classList.contains('transform-translate-x-0');
    
    if (forceOpen === true || (forceOpen === undefined && !isMenuOpen)) {
        // OPEN Menu: Show the overlay and drawer
        mobileMenuDrawer.classList.remove('hidden'); 
        mobileMenuDrawer.classList.remove('transform-translate-x-full'); 
        mobileMenuDrawer.classList.add('transform-translate-x-0'); 
        mobileMenuOverlay.classList.remove('hidden');
        // Delay ensures the transition starts after the element is no longer 'hidden'
        setTimeout(() => mobileMenuOverlay.classList.add('opacity-100'), 10);
        document.body.style.overflow = 'hidden'; // Prevents background scrolling
    } else {
        // CLOSE Menu: Hide the drawer and overlay
        mobileMenuDrawer.classList.remove('transform-translate-x-0'); 
        mobileMenuDrawer.classList.add('transform-translate-x-full'); 
        mobileMenuOverlay.classList.remove('opacity-100');
        
        // Hide the elements after the 300ms CSS transition completes for a smooth close
        setTimeout(() => {
            mobileMenuDrawer.classList.add('hidden'); 
            mobileMenuOverlay.classList.add('hidden');
            document.body.style.overflow = ''; // Restore scrolling
        }, 300);
    }
}

// =======================================================
// Three.js Background Logic
// =======================================================

function init() {
    const threeCanvasElement = document.getElementById('three-canvas');
    if (!threeCanvasElement) return;

    // Scene and Camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    
    threeCanvasElement.appendChild(renderer.domElement);

    // Particles: Increased density and size for better visibility
    const particleCount = 6000; 
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const color = new THREE.Color();
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * 2000 - 1000;
        const y = Math.random() * 2000 - 1000;
        const z = Math.random() * 2000 - 1000;
        positions.push(x, y, z);
        
        // Color: cyan gradient
        color.setHSL(0.55, 0.5, 0.7 + (x / 2000));
        colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        color: 0x06B6D4, // Cyan
        size: 1.5,
        blending: THREE.AdditiveBlending,
        transparent: true,
        sizeAttenuation: true
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Event Listeners for Three.js
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('touchmove', onDocumentTouchMove, false);
    
    // Start the animation loop only if canvas was successfully initialized
    animate(); 
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    if (camera) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
    if (renderer) {
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - window.innerWidth / 2) * 0.2;
    mouseY = (event.clientY - window.innerHeight / 2) * 0.2;
}

function onDocumentTouchMove(event) {
    if (event.touches.length === 1) {
        event.preventDefault();
        mouseX = (event.touches[0].pageX - window.innerWidth / 2) * 0.3;
        mouseY = (event.touches[0].pageY - window.innerHeight / 2) * 0.3;
    }
}

function animate() {
    requestAnimationFrame(animate);

    // Only run if Three.js objects exist
    if (renderer && scene && camera) {
        // Update camera position smoothly based on mouse/touch
        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += (-mouseY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        // Subtle rotation
        if (particles) {
            particles.rotation.y += 0.0005;
            particles.rotation.x += 0.0002;
        }
        
        renderer.render(scene, camera);
    }
}

// =======================================================
// Initialization on DOM Load
// =======================================================
document.addEventListener('DOMContentLoaded', () => {
    // Initial menu setup listeners
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => toggleMenu());
    }

    // Links inside the drawer should close the menu when clicked
    document.querySelectorAll('#mobile-menu-drawer a').forEach(link => {
        link.addEventListener('click', () => toggleMenu(false));
    });

    // Start Three.js animation if the canvas element is present
    init();
});
