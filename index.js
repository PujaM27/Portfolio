// Set up camera, scene, and renderer
const container = document.getElementById("scene-container");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 85;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000); // Solid black background
container.appendChild(renderer.domElement);

// Remove the space texture as the background
// scene.background = spaceTexture; // This line is no longer needed

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight2.position.set(-10, -10, -10);
scene.add(directionalLight2);

const pointLight = new THREE.PointLight(0x44ffcc, 2.0, 200);
pointLight.position.set(0, 50, 50);
scene.add(pointLight);

const rimLight = new THREE.PointLight(0x00ffff, 1.5, 100);
rimLight.position.set(0, 0, -50);
scene.add(rimLight);

const spotLight = new THREE.SpotLight(0xffffff, 1.5);
spotLight.position.set(100, 100, 100);
spotLight.angle = Math.PI / 4;
spotLight.penumbra = 0.1;
spotLight.decay = 2;
spotLight.distance = 200;
scene.add(spotLight);

// Helper function to create star fields for different sections
function createStarField(color, starCount, yOffset) {
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);

    // Generate star positions with varying distances
    for (let i = 0; i < starCount * 3; i++) {
        starPositions[i] = (Math.random() - 0.5) * 500; // Spread stars in 3D space
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));

    const starMaterial = new THREE.PointsMaterial({
        color: color,
        size: 1.5,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.7,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    stars.position.y = yOffset; // Position the stars behind the section
    stars.position.z = -50; // Push the stars further back for depth
    scene.add(stars);

    // Animate stars
    const starAnimationSpeed = 0.0005 + Math.random() * 0.0005;
    function animateStars() {
        stars.rotation.y += starAnimationSpeed;
        requestAnimationFrame(animateStars);
    }
    animateStars();

    return stars;
}

// Create star fields for each section
const aboutStars = createStarField(0xaaaaaa, 500, 200); // Light gray for "About"
const projectsStars = createStarField(0x44ffcc, 500, 0); // Cyan for "Projects"
const contactStars = createStarField(0xffdd44, 500, -200); // Yellow for "Contacts"

// Load the GLTF model
const gltfLoader = new THREE.GLTFLoader();
let model;

function createOrbitingText() {
    // Programming symbols and characters with more variety
    const symbols = [
        '{ }', '< >', '//', '[]', '# ;', '&&', '+=', '/**/', '==>', '0101',
        '=>', '...', '||', '!=', '++', '--', '**', '??', '?.', '::',
        '{ }', '< >', '//', '[]', '# ;', '&&', '+=', '/**/', '==>', '0101',
        '=>', '...', '||', '!=', '++', '--', '**', '??', '?.', '::'
    ];
    const radius = 50;
    const textGroup = new THREE.Group();
    
    // Split the symbols array
    const totalSymbols = symbols.length;
    // Use full circle for even spacing
    const arcAngle = Math.PI * 2; // Changed to full circle (360 degrees)
    const startAngle = 0;
    
    symbols.forEach((symbol, index) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 96; // Increased canvas width for more space
        canvas.height = 64;
        
        // Style the text with a more tech-looking font
        context.font = 'bold 32px "Courier New"';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Add tech-style glow effect
        context.shadowColor = '#00ff88';
        context.shadowBlur = 15;
        context.fillStyle = '#ffffff';
        context.fillText(symbol, canvas.width/2, canvas.height/2);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true,
            opacity: 0.9
        });
        
        const sprite = new THREE.Sprite(spriteMaterial);
        
        // Scale for symbols
        const scale = 7.5; // Slightly reduced scale
        sprite.scale.set(scale, scale, 1);
        
        // Position symbols around the globe with even spacing
        const angle = startAngle + (index / totalSymbols) * arcAngle;
        sprite.position.x = Math.cos(angle) * radius;
        sprite.position.z = Math.sin(angle) * radius;
        sprite.position.y = -10;
        
        // Keep symbols upright and readable
        sprite.center.set(0.5, 0.5);
        sprite.lookAt(0, sprite.position.y, 0);
        sprite.rotateY(-Math.PI / 2);
        
        textGroup.add(sprite);
    });
    
    scene.add(textGroup);
    return textGroup;
}

let textGroup;

gltfLoader.load(
    "models/low_poly_astronaut/scene.gltf",
    function (gltf) {
        model = gltf.scene;
        model.scale.set(5, 5, 5);
        model.position.set(0, 0, 0);
        scene.add(model);
        textGroup = createOrbitingText();
    },
    undefined,
    function (error) {
        console.error("An error happened", error);
    }
);

// Render loop
function animate() {
    requestAnimationFrame(animate);
    if (model) {
        model.rotation.y += 0.01;
        if (textGroup) {
            textGroup.rotation.y = model.rotation.y; // Sync with model rotation
        }
    }
    renderer.render(scene, camera);
}
animate();

// Make the 3D scene responsive
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Adjust camera based on scroll position to simulate scrolling through sections
window.addEventListener("scroll", () => {
    const scrollY = window.scrollY || window.pageYOffset;
    const sectionHeight = window.innerHeight; // Full viewport height

    // Zoom in and out based on scroll position
    const newZ = Math.max(30, 85 - (scrollY * 0.1)); // Limit zooming in to a min value of 30
    camera.position.z = newZ;

    // Adjust camera vertically (simulate parallax effect)
    const newY = 300 - scrollY * (600 / sectionHeight); // Smooth transition between sections
    camera.position.y = newY;

    // Optional: Add horizontal movement or other dynamic behaviors
    // camera.position.x += scrollY * 0.05;

    // Scroll behavior for Projects Section (example, adjust as needed)
    const projectSection = document.getElementById("projects");
    const projectContainer = projectSection.querySelector(".horizontal-scroll-container");
    const scrollProgress = (scrollY - projectSection.offsetTop) / window.innerHeight;
    const maxScroll = projectContainer.scrollWidth - window.innerWidth;
    projectContainer.scrollLeft = scrollProgress * maxScroll;
});

// Replace the existing star field code with this new version
function initStarfield() {
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');

    // Set canvas size to window size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Star properties
    const stars = [];
    const numStars = 400; // Increased number of stars
    const maxStarSize = 2;

    // Create stars with improved properties
    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * maxStarSize,
            opacity: Math.random() * 0.8 + 0.2, // Stars have varying opacity
            speed: Math.random() * 0.2 + 0.1,   // Slower, more subtle movement
            angle: Math.random() * Math.PI * 2   // Random direction
        });
    }

    // Animation function
    function animate() {
        // Create a subtle trail effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        stars.forEach(star => {
            // Update star position with circular motion
            star.x += Math.cos(star.angle) * star.speed;
            star.y += Math.sin(star.angle) * star.speed;

            // Wrap stars around the screen
            if (star.x < 0) star.x = canvas.width;
            if (star.x > canvas.width) star.x = 0;
            if (star.y < 0) star.y = canvas.height;
            if (star.y > canvas.height) star.y = 0;

            // Create a subtle twinkling effect
            star.opacity = Math.sin(Date.now() * 0.001 + star.angle) * 0.3 + 0.7;

            // Draw star with gradient for a softer look
            const gradient = ctx.createRadialGradient(
                star.x, star.y, 0,
                star.x, star.y, star.size
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.beginPath();
            ctx.fillStyle = gradient;
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }

    animate();
}

// Call initStarfield after window loads
window.addEventListener('load', initStarfield);
