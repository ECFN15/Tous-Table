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
            bgGradientTop: darkMode ? new THREE.Color('#1a120b') : new THREE.Color('#fdf6e3'), // Warm Solar White
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
            ctx.fillStyle = 'rgba(20,5,0,0.85)';
            ctx.shadowColor = 'rgba(255,255,255,0.15)'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 2; // Bevel effect
            ctx.font = '900 90px "Courier New", monospace';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText("TOUS À TABLE", 512, 110);
            ctx.font = 'italic 40px "Times New Roman", serif';
            ctx.fillStyle = 'rgba(60,30,10,0.9)';
            ctx.fillText("Atelier Normand", 512, 180);

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
        const signYBase = isMobile ? 9.6 : 5.5;

        const signGroup = new THREE.Group();
        signGroup.position.set(0, signYBase, 0);
        scene.add(signGroup);

        const boxGeo = new THREE.BoxGeometry(signWidth, signHeight, 0.4);
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
        const r1 = new THREE.Mesh(ropeGeo, ropeMat); r1.position.set(-signWidth * 0.45, 10, 0);
        const r2 = new THREE.Mesh(ropeGeo, ropeMat); r2.position.set(signWidth * 0.45, 10, 0);
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

            signGroup.position.y = signYBase + Math.sin(time * 0.4) * 0.15;
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
                background: darkMode ? '#1a120b' : '#fdf6e3'
            }}
        />
    );
};

export default WarmAmbienceBackground;
