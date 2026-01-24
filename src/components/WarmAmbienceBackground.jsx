import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const WarmAmbienceBackground = ({ darkMode }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // --- CONFIG ---
        // A richer palette that replaces the flat white
        const PALETTE = {
            bgStart: darkMode ? new THREE.Color(0x1c1917) : new THREE.Color(0xfdfbf7), // Off-white/Cream
            bgEnd: darkMode ? new THREE.Color(0x292524) : new THREE.Color(0xf5f0e6), // Warm Stone
            accent: darkMode ? new THREE.Color(0xd97706) : new THREE.Color(0xffb066), // Golden Amber
            noise: darkMode ? 0.05 : 0.03
        };

        // --- SCENE SETUP ---
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); // Full screen plane
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        // --- SHADER MATERIAL (The "Liquid Light" Effect) ---
        // This shader creates a slow, moving gradient with noise, mimicking light passing through leaves or liquid wood.
        const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
    `;

        const fragmentShader = `
        uniform float time;
        uniform vec3 colorStart;
        uniform vec3 colorEnd;
        uniform vec3 colorAccent;
        varying vec2 vUv;

        // Simplex Noise (Standard GLSL implementation)
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

        float snoise(vec2 v) {
            const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
            vec2 i  = floor(v + dot(v, C.yy));
            vec2 x0 = v - i + dot(i, C.xx);
            vec2 i1;
            i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod289(i);
            vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
            m = m*m ;
            m = m*m ;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
            vec3 g;
            g.x  = a0.x  * x0.x  + h.x  * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
        }

        void main() {
            // Slow moving coordinate system
            vec2 pos = vUv * 1.5;
            float noiseVal = snoise(pos + time * 0.05); // Base flow
            float detailVal = snoise(pos * 3.0 - time * 0.1); // Surface ripples

            // Mix subtle background gradient
            float gradient = vUv.y + (noiseVal * 0.2);
            vec3 bg = mix(colorStart, colorEnd, gradient);

            // Add "Light Beams" (Gold accents)
            // We create a mask where noise is high
            float beamMask = smoothstep(0.4, 0.7, detailVal + noiseVal * 0.5);
            
            // Final composite
            vec3 finalColor = mix(bg, colorAccent, beamMask * 0.15); // Subtle blend
            
            // Grain (Texture)
            float grain = fract(sin(dot(vUv.xy, vec2(12.9898,78.233))) * 43758.5453);
            finalColor += (grain - 0.5) * 0.03;

            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

        const uniforms = {
            time: { value: 0 },
            colorStart: { value: PALETTE.bgStart },
            colorEnd: { value: PALETTE.bgEnd },
            colorAccent: { value: PALETTE.accent }
        };

        const planeMat = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        });

        const planeGeo = new THREE.PlaneGeometry(2, 2);
        const plane = new THREE.Mesh(planeGeo, planeMat);
        scene.add(plane);


        // --- FOREGROUND PARTICLES (Floating Gold Dust) ---
        // A separate scene/camera is not strictly needed if we just layer it on top, 
        // but using a single scene is fine for this 2.5D approach.
        // We add a particle system on top of the shader plane.

        // We need a perspective camera for the particles to feel deep
        const particleCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
        particleCamera.position.z = 20;

        // Use a separate scene for particles to layer them easily or just mix?
        // Let's mix carefully. The plane is at Z=0 (actually in ortho view). 
        // Easier: Just render the shader to a FullScreenQuad, then render particles on top.
        // BUT simplest: Just put the plane far back in perspective.

        // REFACTOR: Use perspective for everything for simplicity in one pass.
        // Plane covers field of view.
        const dist = 30;
        const vFOV = THREE.MathUtils.degToRad(75);
        const height = 2 * Math.tan(vFOV / 2) * dist;
        const width = height * (window.innerWidth / window.innerHeight);

        plane.geometry = new THREE.PlaneGeometry(width * 1.5, height * 1.5); // Oversize for parallax
        plane.position.z = -10; // Behind particles
        plane.material = planeMat;

        // Replace Ortho with Perspective
        const mainCamera = particleCamera; // Reuse
        scene.remove(plane); // Re-add correctly
        scene.add(plane);

        // PARTICLES
        const pCount = 300;
        const pGeo = new THREE.BufferGeometry();
        const pPos = new Float32Array(pCount * 3);
        const pSizes = new Float32Array(pCount);
        const pSpeed = new Float32Array(pCount);

        for (let i = 0; i < pCount; i++) {
            pPos[i * 3] = (Math.random() - 0.5) * 50;
            pPos[i * 3 + 1] = (Math.random() - 0.5) * 30;
            pPos[i * 3 + 2] = (Math.random() - 0.5) * 20;
            pSizes[i] = Math.random();
            pSpeed[i] = 0.5 + Math.random();
        }
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        pGeo.setAttribute('size', new THREE.BufferAttribute(pSizes, 1));

        // Particle Texture (Soft blurry circle)
        const createCircleTex = () => {
            const c = document.createElement('canvas'); c.width = 32; c.height = 32;
            const cx = c.getContext('2d');
            const g = cx.createRadialGradient(16, 16, 0, 16, 16, 16);
            g.addColorStop(0, 'rgba(255, 255, 255, 1)');
            g.addColorStop(1, 'rgba(255, 255, 255, 0)');
            cx.fillStyle = g;
            cx.fillRect(0, 0, 32, 32);
            return new THREE.CanvasTexture(c);
        };

        const pMat = new THREE.PointsMaterial({
            size: 0.5,
            color: PALETTE.accent,
            map: createCircleTex(),
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const particles = new THREE.Points(pGeo, pMat);
        scene.add(particles);


        // --- ANIMATION ---
        const clock = new THREE.Clock();
        let frame;

        const mouse = new THREE.Vector2();

        const onMove = (e) => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', onMove);

        const animate = () => {
            frame = requestAnimationFrame(animate);
            const t = clock.getElapsedTime();

            // 1. Update Shader Time
            uniforms.time.value = t;

            // 2. Float Particles
            const positions = particles.geometry.attributes.position.array;
            for (let i = 0; i < pCount; i++) {
                const yIdx = i * 3 + 1;
                positions[yIdx] += pSpeed[i] * 0.02; // Rise
                if (positions[yIdx] > 15) positions[yIdx] = -15; // Reset
            }
            particles.geometry.attributes.position.needsUpdate = true;

            // 3. Parallax / Mouse Sway
            const targetX = mouse.x * 2;
            const targetY = mouse.y * 2;

            // Plane sways opposite to mouse for depth
            plane.position.x += ((-targetX * 2) - plane.position.x) * 0.05;
            plane.position.y += ((-targetY * 2) - plane.position.y) * 0.05;

            // Camera sways slightly
            mainCamera.position.x += (targetX - mainCamera.position.x) * 0.02;
            mainCamera.position.y += (targetY - mainCamera.position.y) * 0.02;
            mainCamera.lookAt(0, 0, 0);

            renderer.render(scene, mainCamera);
        };

        animate();

        const handleResize = () => {
            const _dist = 30;
            const _height = 2 * Math.tan(THREE.MathUtils.degToRad(75) / 2) * _dist;
            const _width = _height * (window.innerWidth / window.innerHeight);

            mainCamera.aspect = window.innerWidth / window.innerHeight;
            mainCamera.updateProjectionMatrix();

            plane.geometry.dispose();
            plane.geometry = new THREE.PlaneGeometry(_width * 1.5, _height * 1.5);

            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('resize', handleResize);
            containerRef.current?.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, [darkMode]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-0"
            // Force opaque background for the container so it REPLACES the white page bg
            style={{ background: darkMode ? '#1c1917' : '#fdfbf7' }}
        />
    );
};

export default WarmAmbienceBackground;
