import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const WarmAmbienceBackground = ({ darkMode }) => {
    const containerRef = useRef(null);
    // Mouse tracking for parallax
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            // Normalized coordinates -1 to 1
            mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        if (!containerRef.current) return;

        // --- CONCEPT: "L'ATELIER DANS LA CLAIRIERE" (The Workshop in the Glade) ---
        // A fully 3D scene with depth, blurred foregrounds, and atmospheric lighting.

        const PALETTE = {
            // Light: "Golden Hour Workshop" - Rich, Saturated, Authentic
            // We move away from "Pale White" to "Warm Amber/Honey" and "Deep Earth".
            bgGradientTop: darkMode ? new THREE.Color('#1a120b') : new THREE.Color('#FAF9F6'), // Ivory White
            bgGradientBot: darkMode ? new THREE.Color('#2d1b14') : new THREE.Color('#d4a373'), // Deep Latte/Earth (Grounding)

            // Particles/Magic
            firefly: darkMode ? new THREE.Color('#fbbf24') : new THREE.Color('#b45309'), // Deep Amber in light mode
            dust: darkMode ? new THREE.Color('#ffffff') : new THREE.Color('#78350f'), // Dark Oak dust in light mode

            // Foliage shadows (blurred in foreground)
            foliage: darkMode ? new THREE.Color('#022c22') : new THREE.Color('#422006'), // Dark Brown/Green
        };

        const isMobile = window.innerWidth < 768;
        const PIXEL_RATIO = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2);

        // 1. SCENE & CAMERA
        const scene = new THREE.Scene();
        // Fog: "Golden Mist" in light mode, not white.
        const fogColor = darkMode ? 0x1a120b : 0xfcf4e6;
        const fogDensity = darkMode ? 0.035 : 0.012; // Very clear in light mode for contrast
        scene.fog = new THREE.FogExp2(fogColor, fogDensity);

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 0, 20);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(PIXEL_RATIO);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        containerRef.current.appendChild(renderer.domElement);

        // --- ASSETS GENERATION ---

        // A. WOOD TEXTURE (Procedural)
        const woodTex = (() => {
            const c = document.createElement('canvas'); c.width = 1024; c.height = 256;
            const ctx = c.getContext('2d');
            // Base - High Contrast Oak
            const g = ctx.createLinearGradient(0, 0, 0, 256);
            g.addColorStop(0, '#5d4037'); g.addColorStop(1, '#3e2723');
            ctx.fillStyle = g; ctx.fillRect(0, 0, 1024, 256);
            // Grain - Deep grooves
            ctx.globalAlpha = 0.25; ctx.strokeStyle = '#100500'; ctx.lineWidth = 3;
            for (let i = 0; i < 150; i++) {
                ctx.beginPath();
                const y = Math.random() * 256;
                ctx.moveTo(0, y);
                ctx.bezierCurveTo(300, y + Math.random() * 100 - 50, 700, y + Math.random() * 100 - 50, 1024, y);
                ctx.stroke();
            }
            // Branding - Burnt & Carved
            ctx.globalAlpha = 1.0;

            // Texture for the inlay (GOLD / BRASS)
            const goldGrad = ctx.createLinearGradient(0, 50, 0, 200);
            goldGrad.addColorStop(0, '#8a6e3e');   // Shadowy bronze
            goldGrad.addColorStop(0.3, '#fddb92'); // Bright shine
            goldGrad.addColorStop(0.5, '#d4af37'); // Classic gold
            goldGrad.addColorStop(0.8, '#fddb92'); // Shine
            goldGrad.addColorStop(1, '#8a6e3e');   // Shadowy bronze

            // 1. "TOUS À TABLE"
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            // "Plus raffiné": Reduced size (90->64px) and weight (900->Bold)
            ctx.font = 'bold 64px "Courier New", monospace';

            // Subtle Drop Shadow (clean, no heavy blur)
            ctx.shadowColor = 'rgba(0,0,0, 0.4)';
            ctx.shadowBlur = 2;
            ctx.shadowOffsetY = 2;

            // A. Dark Stroke (Thinner for elegance)
            ctx.lineWidth = 1.0;
            ctx.strokeStyle = 'rgba(0,0,0, 0.5)';
            ctx.strokeText("TOUS À TABLE", 512, 98); // Centering Y: 98

            // B. Gold Fill
            ctx.fillStyle = goldGrad;
            ctx.fillText("TOUS À TABLE", 512, 98);

            // 2. ICON: Metal Plate with Engraved Hammer (To the LEFT)
            ctx.save();
            ctx.translate(150, 128); // Y=128 (True vertical center of 256px canvas)

            // A. The Metal Plate (Gold Fill)
            const badgeSize = 96; // BIGGER (was 64)
            const r = 14;

            // Shadow for the plate
            ctx.shadowColor = 'rgba(0,0,0, 0.6)';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;

            ctx.fillStyle = goldGrad;
            ctx.beginPath();
            ctx.roundRect(-badgeSize / 2, -badgeSize / 2, badgeSize, badgeSize, r);
            ctx.fill();

            // Remove shadow for internal details
            ctx.shadowColor = 'transparent';

            // B. Rivets (Screws) in corners
            ctx.fillStyle = 'rgba(60, 40, 30, 0.8)'; // Dark rusty
            const screwOffset = 36;
            const screwRadio = 3;
            [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, y]) => {
                ctx.beginPath();
                ctx.arc(x * screwOffset, y * screwOffset, screwRadio, 0, Math.PI * 2);
                ctx.fill();
            });

            // C. The Hammer (Engraved / Stamped)
            ctx.fillStyle = 'rgba(45, 20, 10, 0.9)';

            ctx.rotate(-Math.PI / 4);
            ctx.beginPath();

            // Handle (Thick - Solid)
            ctx.rect(-5, -6, 10, 36);

            // Head (Solid Block)
            ctx.rect(-21, -27, 42, 21);

            ctx.fill();

            // Add fine detail line (Light Highlight)
            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, -6); ctx.lineTo(0, 30); // Handle highlight
            ctx.moveTo(-21, -27); ctx.lineTo(21, -27); // Head highlight
            ctx.stroke();

            ctx.restore();

            // 3. ICON RIGHT: Metal Plate with Hand Saw (Geometric / Flaticon Style)
            ctx.save();
            ctx.translate(874, 128); // Symmetrical to Left (150) -> 1024 - 150 = 874

            // A. The Metal Plate (Identical properties)
            // badgeSize = 96, r = 14

            // Shadow
            ctx.shadowColor = 'rgba(0,0,0, 0.6)';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;

            ctx.fillStyle = goldGrad;
            ctx.beginPath();
            ctx.roundRect(-48, -48, 96, 96, 14);
            ctx.fill();

            ctx.shadowColor = 'transparent';

            // B. Rivets
            ctx.fillStyle = 'rgba(60, 40, 30, 0.8)';
            [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, y]) => {
                ctx.beginPath();
                ctx.arc(x * 36, y * 36, 3, 0, Math.PI * 2);
                ctx.fill();
            });

            // C. Hand Saw Icon (Geometric / Flaticon Style)
            // Dark Burnt color
            ctx.fillStyle = 'rgba(45, 20, 10, 0.9)';

            // Angle: Blade down-left, Handle up-right
            ctx.rotate(Math.PI / 6);

            ctx.beginPath();

            // --- BLADE ---
            // A simple Trapezoid with teeth
            // Spine
            ctx.moveTo(15, -12); // Start at handle
            ctx.lineTo(-35, -5); // Tip top (Tapered)

            // Front Tip
            ctx.lineTo(-35, 5);  // Tip bottom

            // Bottom Edge (TEETH - Sharp Zigzag)
            // Linear interpolation from Tip(-35, 5) to Heel(15, 20)
            const startX = -35; const startY = 5;
            const endX = 15; const endY = 20;
            const teeth = 8;

            const dx = (endX - startX) / teeth;
            const dy = (endY - startY) / teeth;

            for (let i = 0; i < teeth; i++) {
                const cx = startX + dx * i;
                const cy = startY + dy * i;
                // Tooth: Vertical down -> Diagonal up
                ctx.lineTo(cx + dx * 0.2, cy + dy + 2); // Point
                ctx.lineTo(cx + dx, cy + dy);         // Valley
            }

            // Close Blade at Handle
            ctx.lineTo(15, -12);
            ctx.fill();

            // --- HANDLE (Angular Geometric) ---
            // Distinct blocky shape wrapping the end
            ctx.beginPath();
            ctx.moveTo(15, -15); // Top-front corner
            ctx.lineTo(35, -15); // Top-back corner (flat)
            ctx.lineTo(42, -5);  // Angled back top
            ctx.lineTo(40, 20);  // Back edge down
            ctx.lineTo(25, 25);  // Bottom-back corner
            ctx.lineTo(15, 20);  // Bottom-front corner (Heel)
            ctx.lineTo(10, 5);   // Inner notch? 
            ctx.lineTo(15, -15); // Close
            ctx.fill();

            // --- HANDLE CUTOUT ---
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            // Upright rounded rect / Slot
            const slotX = 26;
            const slotY = -2;
            const slotW = 6;
            const slotH = 16;
            ctx.roundRect(slotX, slotY, slotW, slotH, 3);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';

            // --- HIGHLIGHTS ---
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            // Spine highlight
            ctx.moveTo(15, -12);
            ctx.lineTo(-35, -5);
            ctx.stroke();
            // Handle highlight
            ctx.beginPath();
            ctx.moveTo(15, -15); ctx.lineTo(35, -15);
            ctx.stroke();

            ctx.restore();

            // 3. "Atelier Normand"
            ctx.font = 'bold italic 40px "Times New Roman", serif'; // Original font

            // Same crisp gold style
            ctx.strokeText("Atelier Normand", 512, 158); // Centering Y: 158
            ctx.fillStyle = goldGrad;
            ctx.fillText("Atelier Normand", 512, 158);

            // Clear shadows
            ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

            const t = new THREE.CanvasTexture(c);
            t.colorSpace = THREE.SRGBColorSpace;
            return t;
        })();

        // --- SCENE COMPOSITION ---

        // 1. FAR BACKGROUND (Sphere with Vignette)
        const bgGeo = new THREE.SphereGeometry(60, 32, 32);
        const bgMat = new THREE.ShaderMaterial({
            side: THREE.BackSide,
            vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
            fragmentShader: `
                uniform vec3 top, bot;
                varying vec2 vUv;
                void main() {
                    // Rich Gradient
                    vec3 col = mix(bot, top, vUv.y);
                    
                    // Vignette for depth (Darker corners)
                    vec2 uv = vUv * 2.0 - 1.0;
                    float dist = length(uv);
                    // Subtle darkening at edges
                    col *= smoothstep(1.5, 0.4, dist); 
                    
                    gl_FragColor = vec4(col, 1.0);
                }
            `,
            uniforms: { top: { value: PALETTE.bgGradientTop }, bot: { value: PALETTE.bgGradientBot } }
        });
        const bgMesh = new THREE.Mesh(bgGeo, bgMat);
        scene.add(bgMesh);


        // 2. THE SIGN (Midground Anchor)
        const signScale = isMobile ? 0.53 : 1.0;
        const signWidth = 10 * signScale;
        const signHeight = 2.8 * signScale;
        // Make signYBase mutable to adjust for dynamic FOV changes
        let signYBase = isMobile ? 9.6 : 5.5;

        const signGroup = new THREE.Group();
        signGroup.position.set(0, signYBase, 0);
        signGroup.visible = window.innerWidth >= 1700;
        scene.add(signGroup);

        const boxGeo = new THREE.PlaneGeometry(signWidth, signHeight);
        const boxMat = new THREE.MeshStandardMaterial({
            map: woodTex,
            roughness: 0.6, // More polished/waxed look
            metalness: 0.1,
            color: 0xffffff
        });
        const signMesh = new THREE.Mesh(boxGeo, boxMat);
        signMesh.castShadow = true;
        signMesh.receiveShadow = true;
        signGroup.add(signMesh);

        // Ropes
        const ropeMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.8 });
        const ropeGeo = new THREE.CylinderGeometry(0.04, 0.04, 20);
        const r1 = new THREE.Mesh(ropeGeo, ropeMat); r1.position.set(-signWidth * 0.45, 10, -0.1);
        const r2 = new THREE.Mesh(ropeGeo, ropeMat); r2.position.set(signWidth * 0.45, 10, -0.1);
        signGroup.add(r1); signGroup.add(r2);


        // 3. ATMOSPHERIC PARTICLES
        const dustCount = 150;
        const dustGeo = new THREE.BufferGeometry();
        const dustPos = new Float32Array(dustCount * 3);
        const dustData = new Float32Array(dustCount * 3);
        for (let i = 0; i < dustCount; i++) {
            dustPos[i * 3] = (Math.random() - 0.5) * 50;
            dustPos[i * 3 + 1] = (Math.random() - 0.5) * 40;
            dustPos[i * 3 + 2] = (Math.random() - 0.5) * 30;
            dustData[i * 3] = Math.random() * 10;
            dustData[i * 3 + 1] = 0.2 + Math.random() * 0.3;
            dustData[i * 3 + 2] = Math.random();
        }
        dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
        dustGeo.setAttribute('aData', new THREE.BufferAttribute(dustData, 3));
        const dustMat = new THREE.PointsMaterial({
            color: PALETTE.dust,
            size: 0.25,
            transparent: true,
            opacity: 0.8, // High visibility
            blending: THREE.NormalBlending, // "Solid" specks
            sizeAttenuation: true
        });
        const dustSystem = new THREE.Points(dustGeo, dustMat);
        scene.add(dustSystem);


        // 4. FOREGROUND BOKEH
        const bokehCount = 20;
        const bokehGeo = new THREE.BufferGeometry();
        const bokehPos = new Float32Array(bokehCount * 3);
        const bokehSizes = new Float32Array(bokehCount);

        for (let i = 0; i < bokehCount; i++) {
            const side = Math.random() > 0.5 ? 1 : -1;
            bokehPos[i * 3] = side * (12 + Math.random() * 12);
            bokehPos[i * 3 + 1] = (Math.random() - 0.5) * 25;
            bokehPos[i * 3 + 2] = 14 + Math.random() * 4;
            bokehSizes[i] = 15.0 + Math.random() * 25.0;
        }
        bokehGeo.setAttribute('position', new THREE.BufferAttribute(bokehPos, 3));
        bokehGeo.setAttribute('size', new THREE.BufferAttribute(bokehSizes, 1));

        const bokehMat = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: PALETTE.foliage },
                opacity: { value: 0.5 } // More visible depth
            },
            transparent: true,
            depthWrite: false,
            vertexShader: `
                attribute float size;
                void main() {
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                uniform float opacity;
                void main() {
                    vec2 coord = gl_PointCoord - vec2(0.5);
                    float d = length(coord);
                    if(d > 0.5) discard;
                    float blur = smoothstep(0.5, 0.0, d);
                    gl_FragColor = vec4(color, blur * opacity);
                }
            `
        });
        const bokehSystem = new THREE.Points(bokehGeo, bokehMat);
        scene.add(bokehSystem);



        // 6. FLOATING FURNITURE (Background Decor)
        const furnitureGroup = new THREE.Group();
        scene.add(furnitureGroup);

        const furnitureMat = new THREE.MeshBasicMaterial({
            color: darkMode ? 0xffffff : 0x2d1b14, // Very Dark Wood for Light Mode
            wireframe: true,
            transparent: true,
            opacity: darkMode ? 0.15 : 0.15 // Increased visibility
        });

        // Helper for consistent structural style
        const createLeg = (x, z, h, w = 0.08) => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), furnitureMat);
            leg.position.set(x, -h / 2, z);
            return leg;
        };
        const createPlank = (w, h, d, y = 0) => {
            const plank = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), furnitureMat);
            plank.position.y = y;
            return plank;
        };

        const createChair = () => {
            const g = new THREE.Group();
            // Legs
            const hLeg = 1.0;
            [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]].forEach(([x, z]) => {
                g.add(createLeg(x, z, hLeg));
            });
            // Seat (Thin plank)
            g.add(createPlank(1.2, 0.05, 1.2, 0));
            // Backrest (Spindles)
            const backTop = createPlank(1.2, 0.1, 0.1, 1.0);
            backTop.position.z = -0.55;
            g.add(backTop);

            // Vertical spindles for back
            for (let i = 1; i < 4; i++) {
                const spLabel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.0), furnitureMat);
                spLabel.position.set(-0.6 + i * 0.4, 0.5, -0.55);
                g.add(spLabel);
            }

            // Crossbars (Traverses)
            const cb1 = createPlank(1.0, 0.04, 0.04, -0.5); cb1.position.z = -0.5;
            const cb2 = createPlank(1.0, 0.04, 0.04, -0.5); cb2.position.z = 0.5;
            g.add(cb1); g.add(cb2);

            return g;
        };

        const createTable = () => {
            const g = new THREE.Group();
            // Farm Table: Thick legs, long top
            const hLeg = 1.6;
            [[-1.5, -0.8], [1.5, -0.8], [-1.5, 0.8], [1.5, 0.8]].forEach(([x, z]) => {
                g.add(createLeg(x, z, hLeg, 0.15));
            });
            // Top
            g.add(createPlank(3.4, 0.1, 1.8, 0));
            // Center Traverse
            const trav = createPlank(2.8, 0.06, 0.06, -hLeg / 2);
            g.add(trav);
            return g;
        };

        const createBench = () => {
            const g = new THREE.Group();
            const hLeg = 0.9;
            // 6 Legs for a long bench
            [[-2, -0.4], [0, -0.4], [2, -0.4], [-2, 0.4], [0, 0.4], [2, 0.4]].forEach(([x, z]) => {
                g.add(createLeg(x, z, hLeg, 0.1));
            });
            // Top
            g.add(createPlank(4.2, 0.08, 1.0, 0));
            return g;
        }

        const createDresser = () => {  // "Dressoir" / Sideboard
            const g = new THREE.Group();
            // Body Box (Wireframe shows edges nicely)
            const body = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.5, 1.0), furnitureMat);
            body.position.y = 0;
            g.add(body);
            // Legs
            [[-1.4, 0.4], [1.4, 0.4], [-1.4, -0.4], [1.4, -0.4]].forEach(([x, z]) => {
                const l = createLeg(x, z, 0.5);
                l.position.y = -1.0; // below body
                g.add(l);
            });
            // Drawers (Inner Boxes)
            const d1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 1.02), furnitureMat);
            d1.position.set(-0.9, 0.4, 0);
            const d2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 1.02), furnitureMat);
            d2.position.set(0, 0.4, 0);
            const d3 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 1.02), furnitureMat);
            d3.position.set(0.9, 0.4, 0);
            g.add(d1); g.add(d2); g.add(d3);

            return g;
        }

        const furnitureItems = [];
        // High count for dense "attic" feel
        const itemCount = 35;
        for (let i = 0; i < itemCount; i++) {
            const type = Math.random();
            let item;
            if (type < 0.3) item = createChair();
            else if (type < 0.55) item = createTable();
            else if (type < 0.8) item = createBench();
            else item = createDresser();

            // Depth calculation: -50 (far) to +5 (very close)
            // We want more items in the back, fewer in front to avoid cluttering the view
            const zPos = -40 + Math.random() * 50; // [-40, 10]

            // Parallax factor (optional logic later, for now scale)
            // Closer items (zPos higher) -> Bigger Scale
            // Map [-40, 10] -> Scale [0.5, 2.5]
            const scaleFactor = THREE.MathUtils.mapLinear(zPos, -40, 10, 0.6, 2.2);

            item.position.set(
                (Math.random() - 0.5) * 90, // Wide spread
                (Math.random() - 0.5) * 50, // Vertical spread
                zPos
            );

            // Random rotation
            item.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

            item.scale.set(scaleFactor, scaleFactor, scaleFactor);

            furnitureGroup.add(item);
            furnitureItems.push({
                mesh: item,
                // Speed inversely proportional to scale (mass)? Or simple random.
                speed: (Math.random() * 0.002) + 0.0005,
                axis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize()
            });
        }


        // 5. LIGHTING (CONTRAST & VOLUME)
        // Key concept: Low Ambient, High Directional = Drama/Relief

        // Ambient: "Fill light"
        const ambientIntensity = darkMode ? 0.4 : 0.4; // Keep low even in light mode!
        const ambientLight = new THREE.AmbientLight(0xffffff, ambientIntensity);
        scene.add(ambientLight);

        // Sun: "Key light"
        const sunIntensity = darkMode ? 1.5 : 2.8; // Very bright sun
        const sunLight = new THREE.DirectionalLight(PALETTE.firefly, sunIntensity);
        sunLight.position.set(12, 15, 12); // Sharp angle
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.bias = -0.0001;
        sunLight.shadow.radius = 2; // Soft edges
        scene.add(sunLight);

        // Sign Rim Light
        const spotLight = new THREE.SpotLight(0xfffae6, 3.0);
        spotLight.position.set(-10, 10, 15);
        spotLight.target = signMesh;
        spotLight.castShadow = true;
        scene.add(spotLight);


        // --- ANIMATION ---
        const clock = new THREE.Clock();

        // Initial fade in
        containerRef.current.style.opacity = 0;
        setTimeout(() => containerRef.current.style.opacity = 1, 100);

        let frame;
        const animate = () => {
            frame = requestAnimationFrame(animate);
            const time = clock.getElapsedTime();

            const targetX = mouseRef.current.x * 0.8;
            const targetY = mouseRef.current.y * 0.8;

            camera.position.x += (targetX - camera.position.x) * 0.03;
            camera.position.y += (targetY - camera.position.y) * 0.03;
            camera.lookAt(0, isMobile ? 4 : 2, 0);

            // Use the dynamic signYBase
            // Reduced amplitude further to 0.05 for very subtle floating
            signGroup.position.y = signYBase + Math.sin(time * 0.5) * 0.05;
            signGroup.rotation.z = Math.sin(time * 0.25) * 0.015;
            signGroup.rotation.x = Math.sin(time * 0.2) * 0.03;

            const positions = dustGeo.attributes.position.array;
            for (let i = 0; i < dustCount; i++) {
                const i3 = i * 3;
                positions[i3 + 1] += dustData[i * 3 + 1] * 0.02;
                if (positions[i3 + 1] > 20) positions[i3 + 1] = -20;
                positions[i3] += Math.sin(time + dustData[i * 3]) * 0.01;
            }
            dustGeo.attributes.position.needsUpdate = true;

            bokehSystem.rotation.z = Math.sin(time * 0.1) * 0.05;

            // Furniture Animation
            furnitureGroup.rotation.y = Math.sin(time * 0.05) * 0.1;
            furnitureItems.forEach(item => {
                item.mesh.rotateOnAxis(item.axis, item.speed);
                item.mesh.position.y += Math.sin(time + item.mesh.position.x) * 0.005;
            });

            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!containerRef.current) return;

            const w = containerRef.current.clientWidth;
            const h = containerRef.current.clientHeight;

            camera.aspect = w / h;

            // FIX: Lock Horizontal FOV on mobile to ensure the 'pancarte' (sign) size stays consistent 
            // regardless of vertical safe-areas/browser-bars (Samsung vs Apple).
            // Currently, changing height changes the object size with fixed Vertical FOV. 
            // We switch to fixed Horizontal FOV logic for mobile.
            if (w < 768) {
                const targetAspect = 9 / 16; // Standard Mobile Baseline
                const baseVFov = 45;

                // Calculate ideal Horizontal FOV in radians
                const baseHFovRad = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(baseVFov) / 2) * targetAspect);

                // Calculate new Vertical FOV needed to match that Horizontal FOV at the current Aspect Ratio
                const newVFovRad = 2 * Math.atan(Math.tan(baseHFovRad / 2) / camera.aspect);

                camera.fov = THREE.MathUtils.radToDeg(newVFovRad);

                // --- DYNAMIC POSITIONING CORRECTION ---
                // When FOV increases (to adapt to a taller screen without browser bars), the top of the viewport moves UP.
                // We need to move the sign UP to keep it at the same relative visual distance from the top header.

                // 1. Calculate World Y of the top edge of frustum at depth 0
                // Use the LookAt target Y to factor in camera tilt.
                // Mobile LookAt Y = 4. Camera Y = 0. Camera Z = 20.
                // Angle to LookAt target = atan(4/20) approx 11.3 deg.
                const lookAtY = 4;
                const camZ = 20;

                // Angle of the camera center relative to flat horizon
                const tiltAngle = Math.atan(lookAtY / camZ);

                // Top edge angle = tiltAngle + half_vertical_fov
                const topEdgeAngle = tiltAngle + (newVFovRad / 2);

                // Top Edge Y Position relative to camera (Y=0)
                const topEdgeY = camZ * Math.tan(topEdgeAngle);

                // 2. Define the desired "Margin" from top. 
                // Based on initial calibration: FOV 45, Aspect 9/16 => TopEdge ~13.4. signYBase ~9.6.
                // Adjusted offset to 4.3: The "Sweet Spot" between covering text (4.0) and hiding behind buttons (4.5).
                const desiredOffsetFromTop = 4.3;

                signYBase = topEdgeY - desiredOffsetFromTop;

            } else {
                camera.fov = 45; // Reset to default for desktop
                // Desktop logic if needed, currently assumes fixed behavior
                // signYBase is initialized to 5.5 and doesn't need dynamic shift as FOV is constant
            }

            // DYNAMIC VISIBILITY: Only show sign if width >= 1700px
            signGroup.visible = w >= 1700;

            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);
        // Initial size
        handleResize();

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('resize', handleResize);
            containerRef.current?.removeChild(renderer.domElement);
            renderer.dispose();
            scene.traverse(o => {
                if (o.geometry) o.geometry.dispose();
                if (o.material) o.material.dispose();
            });
        };
    }, [darkMode]);

    return (
        <div
            ref={containerRef}
            className="fixed top-0 left-0 w-full h-[120vh] md:h-screen z-0 transition-opacity duration-1000 ease-out"
            style={{
                background: darkMode ? '#1a120b' : '#FAF9F6'
            }}
        />
    );
};

export default WarmAmbienceBackground;
