import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const WarmAmbienceBackground = ({ darkMode }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // --- CONFIG ---
        const PALETTE = {
            bgTop: darkMode ? new THREE.Color('#1a1612') : new THREE.Color('#fff9ee'),
            bgBottom: darkMode ? new THREE.Color('#2d241c') : new THREE.Color('#fbeccb'),
            accent1: darkMode ? new THREE.Color('#d97706') : new THREE.Color('#f59e0b'),
            accent2: darkMode ? new THREE.Color('#92400e') : new THREE.Color('#b45309'),
            dust: darkMode ? new THREE.Color('#fff7ed') : new THREE.Color('#d97706'),
        };

        const isMobile = window.innerWidth < 768;
        const PIXEL_RATIO = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2);

        const scene = new THREE.Scene();
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(PIXEL_RATIO);
        containerRef.current.appendChild(renderer.domElement);

        // --- TEXTURES ---
        const woodTex = (() => {
            const c = document.createElement('canvas'); c.width = 512; c.height = 128;
            const ctx = c.getContext('2d');
            // Base
            ctx.fillStyle = '#8b5a2b'; ctx.fillRect(0, 0, 512, 128);
            // Grain
            ctx.globalAlpha = 0.2; ctx.fillStyle = '#3e2723';
            for (let i = 0; i < 300; i++) ctx.fillRect(Math.random() * 512, Math.random() * 128, Math.random() * 100 + 20, 2);
            // Frame
            ctx.globalAlpha = 0.5; ctx.lineWidth = 10; ctx.strokeStyle = '#2d1b0e'; ctx.strokeRect(0, 0, 512, 128);
            // Text
            ctx.globalAlpha = 1.0; ctx.fillStyle = '#2d1b0e';
            ctx.font = 'bold 55px monospace';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.shadowBlur = 2; ctx.shadowColor = 'rgba(255,255,255,0.3)';
            ctx.fillText("TOUS À TABLE", 256, 64);

            const t = new THREE.CanvasTexture(c);
            t.colorSpace = THREE.SRGBColorSpace; // Fix gamma
            return t;
        })();

        const ropeTex = (() => {
            const c = document.createElement('canvas'); c.width = 16; c.height = 64;
            const ctx = c.getContext('2d');
            ctx.fillStyle = '#C2B280'; ctx.fillRect(0, 0, 16, 64);
            ctx.fillStyle = '#8B8055';
            for (let i = 0; i < 64; i += 8) ctx.fillRect(0, i, 16, 2);
            const t = new THREE.CanvasTexture(c);
            t.wrapS = t.wrapT = THREE.RepeatWrapping;
            t.repeat.set(1, 10);
            return t;
        })();

        // --- BACKGROUND SHADER ---
        const material = new THREE.ShaderMaterial({
            vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }`,
            fragmentShader: `
            uniform float time;
            uniform vec2 resolution;
            uniform vec3 cTop, cBot, cAcc1, cAcc2;
            varying vec2 vUv;
            
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
                vec2 i  = floor(v + dot(v, C.yy));
                vec2 x0 = v - i + dot(i, C.xx);
                vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
                i = mod289(i);
                vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                m = m*m ; m = m*m ;
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
                vec2 st = gl_FragCoord.xy / resolution.xy;
                st.x *= resolution.x / resolution.y;
                float t = time * 0.05; 
                float n1 = snoise(st * 1.5 + vec2(t*0.2, t*0.1));
                float n2 = snoise(st * 3.0 - vec2(t*0.15, 0.0));
                float flow = mix(n1, n2, 0.4);
                vec3 bg = mix(cBot, cTop, gl_FragCoord.y / resolution.y); 
                bg = mix(bg, cAcc1, smoothstep(0.4, 0.7, flow) * 0.15); 
                bg = mix(bg, cAcc2, smoothstep(-0.6, -0.3, flow) * 0.1); 
                float grain = fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453);
                bg += (grain - 0.5) * 0.035; 
                gl_FragColor = vec4(bg, 1.0);
            }
        `,
            uniforms: {
                time: { value: 0 },
                resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                cTop: { value: PALETTE.bgTop },
                cBot: { value: PALETTE.bgBottom },
                cAcc1: { value: PALETTE.accent1 },
                cAcc2: { value: PALETTE.accent2 },
            }
        });

        // --- SCENE SETUP (CRITICAL FIX FOR VISIBILITY) ---
        // Use a simpler camera setup.
        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
        // Move camera back to see the sign
        camera.position.set(0, 0, 30);

        // 1. Background Plane (Deep Z)
        const bgPlane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
        bgPlane.position.z = -20; // Needs to be behind objects
        scene.add(bgPlane);

        // 2. The SIGN Group
        const signGroup = new THREE.Group();
        // Position Logic: 
        // At Z=0 (where sign is), frame width is approx: 2 * tan(foV/2) * camZ * aspect.
        // 30 units back * roughly 1 = 30 units wide.
        // We want it Top-Right-Centerish?
        // Let's place it securely at (0, 8, 0)
        signGroup.position.set(2, 6, 0);
        scene.add(signGroup);

        // Board Mesh
        const board = new THREE.Mesh(
            new THREE.BoxGeometry(8, 2, 0.4),
            new THREE.MeshBasicMaterial({ map: woodTex }) // MeshBasic is self-illuminated
        );
        signGroup.add(board);

        // Ropes
        const ropeGeo = new THREE.CylinderGeometry(0.1, 0.1, 20);
        const ropeMat = new THREE.MeshBasicMaterial({ map: ropeTex });

        const ropeL = new THREE.Mesh(ropeGeo, ropeMat);
        ropeL.position.set(-3, 11, 0); // Start from board, go way up
        signGroup.add(ropeL);

        const ropeR = new THREE.Mesh(ropeGeo, ropeMat);
        ropeR.position.set(3, 11, 0);
        signGroup.add(ropeR);

        // --- PARTICLES ---
        const pCount = isMobile ? 100 : 250;
        const pGeo = new THREE.BufferGeometry();
        const pPos = new Float32Array(pCount * 3);
        const pData = new Float32Array(pCount * 4);

        for (let i = 0; i < pCount; i++) {
            pPos[i * 3] = (Math.random() - 0.5) * 60;
            pPos[i * 3 + 1] = (Math.random() - 0.5) * 50;
            pPos[i * 3 + 2] = (Math.random() - 0.5) * 20; // Spread in Z from -10 to +10
            let sizenorm = Math.pow(Math.random(), 3.0);
            pData[i * 4] = sizenorm;
            pData[i * 4 + 1] = (Math.random() - 0.5) * 1.5;
            pData[i * 4 + 2] = 0.5 + Math.random() * 1.0;
            pData[i * 4 + 3] = Math.random() * Math.PI * 2;
        }
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        pGeo.setAttribute('aData', new THREE.BufferAttribute(pData, 4));

        const pMat = new THREE.ShaderMaterial({
            uniforms: { time: { value: 0 }, color: { value: PALETTE.dust } },
            transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
            vertexShader: `
            attribute vec4 aData; varying float vAlpha;
            uniform float time;
            void main() {
                vec3 pos = position;
                pos.y += mod(time * aData.z + aData.w * 10.0, 60.0) - 30.0;
                pos.x += sin(time * 0.5 + aData.w) * 2.0; 
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                float size = (50.0 * aData.x + 4.0);
                gl_PointSize = size * (1.0 / -mvPosition.z);
                vAlpha = (0.6 - aData.x * 0.4) * (0.5 + 0.5 * sin(time * 2.0 + aData.w));
            }
        `,
            fragmentShader: `
            uniform vec3 color; varying float vAlpha;
            void main() {
                vec2 coord = gl_PointCoord - vec2(0.5);
                float dist = length(coord);
                if(dist > 0.5) discard;
                float center = 1.0 - smoothstep(0.0, 0.5, dist);
                gl_FragColor = vec4(color, vAlpha * (center * 0.5 + 0.1));
            }
        `
        });
        scene.add(new THREE.Points(pGeo, pMat));


        // --- ANIMATION ---
        const clock = new THREE.Clock();
        let frame;

        const animate = () => {
            frame = requestAnimationFrame(animate);
            const t = clock.getElapsedTime();
            material.uniforms.time.value = t;
            pMat.uniforms.time.value = t;

            // Sway Sign
            signGroup.rotation.z = Math.sin(t * 0.5) * 0.05;
            signGroup.rotation.x = Math.sin(t * 0.7) * 0.02;

            renderer.render(scene, camera);
        };

        // Update BG Plane to fill screen at Z = -20
        const updateBgSize = () => {
            const d = 50; // Cam Z (30) - Plane Z (-20)
            const vFOV = THREE.MathUtils.degToRad(50);
            const height = 2 * Math.tan(vFOV / 2) * d;
            const width = height * (window.innerWidth / window.innerHeight);
            bgPlane.geometry.dispose();
            bgPlane.geometry = new THREE.PlaneGeometry(width * 1.2, height * 1.2); // Oversize safe coverage
        };

        updateBgSize();
        animate();

        const handleResize = () => {
            updateBgSize();
            material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('resize', handleResize);
            containerRef.current?.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, [darkMode]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-0"
            style={{ background: darkMode ? '#1a1612' : '#fff9ee' }}
        />
    );
};

export default WarmAmbienceBackground;
