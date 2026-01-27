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
            // Previous: bgGradientTop: darkMode ? new THREE.Color('#1a120b') : new THREE.Color('#FAF9F6'),
            // Previous: bgGradientBot: darkMode ? new THREE.Color('#2d1b14') : new THREE.Color('#d4a373'),
            bgGradientTop: darkMode ? new THREE.Color('#0a0807') : new THREE.Color('#e0d0c1'), // Deep Charcoal / Light Walnut (Grayish Beige)
            bgGradientBot: darkMode ? new THREE.Color('#1f1814') : new THREE.Color('#8b5e3c'), // Dark Umber / Deep Teak (Rich Brown)

            // Particles/Magic
            firefly: darkMode ? new THREE.Color('#fbbf24') : new THREE.Color('#d97706'), // Vibrant orange / Amber
            dust: darkMode ? new THREE.Color('#ffffff') : new THREE.Color('#4a3728'), // Dark Brown (Wenge) for dust vs White

            // Foliage shadows (blurred in foreground)
            foliage: darkMode ? new THREE.Color('#022c22') : new THREE.Color('#3d2b1f'), // Deep forest / Dark bark
        };

        const isMobile = window.innerWidth < 768;
        const PIXEL_RATIO = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2);

        // 1. SCENE & CAMERA
        const scene = new THREE.Scene();
        // Fog: "Golden Mist" in light mode, aligned with top gradient.
        const fogColor = darkMode ? 0x0a0807 : 0xfdf5e6;
        const fogDensity = darkMode ? 0.04 : 0.015; // Slightly denser for better depth
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





        // 3. ATMOSPHERIC PARTICLES
        const dustCount = 200; // Increased count for better density
        const dustGeo = new THREE.BufferGeometry();
        const dustPos = new Float32Array(dustCount * 3);
        const dustData = new Float32Array(dustCount * 3);
        const dustColors = new Float32Array(dustCount * 3);

        const dustColorDark = PALETTE.dust;
        // Light Mode: "Sawdust" (Golden Brown) | Dark Mode: Gold/Amber
        const dustColorLight = darkMode ? new THREE.Color('#fbbf24') : new THREE.Color('#A67B5B');

        for (let i = 0; i < dustCount; i++) {
            dustPos[i * 3] = (Math.random() - 0.5) * 50;
            dustPos[i * 3 + 1] = (Math.random() - 0.5) * 40;
            dustPos[i * 3 + 2] = (Math.random() - 0.5) * 30;

            dustData[i * 3] = Math.random() * 10;
            dustData[i * 3 + 1] = 0.2 + Math.random() * 0.3;
            dustData[i * 3 + 2] = Math.random();

            // Randomly assign dark or light color
            const color = Math.random() > 0.4 ? dustColorDark : dustColorLight;
            dustColors[i * 3] = color.r;
            dustColors[i * 3 + 1] = color.g;
            dustColors[i * 3 + 2] = color.b;
        }
        dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
        dustGeo.setAttribute('aData', new THREE.BufferAttribute(dustData, 3));
        dustGeo.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));

        const dustMat = new THREE.PointsMaterial({
            vertexColors: true, // IMPORTANT: Enable individual particle colors
            size: 0.3, // Slightly larger
            transparent: true,
            opacity: 0.9,
            blending: THREE.NormalBlending,
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
            color: darkMode ? 0xffffff : 0x3e2723, // Wenge (Very Dark Brown) for Light Mode wireframes
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
                background: darkMode ? '#1a120b' : '#e0d0c1'
            }}
        />
    );
};

export default WarmAmbienceBackground;
