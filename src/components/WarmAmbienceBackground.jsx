import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const WarmAmbienceBackground = ({ darkMode }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // --- CONFIGURATION ---
        const PALETTE = {
            // Dark Mode: PRESERVED (User loved this)
            // Deep Espresso -> Warm Stone + Golden Ambers
            bgTop: darkMode ? new THREE.Color('#1a1612') : new THREE.Color('#fff9ee'), // Light: Warm Cream/Yellow tint
            bgBottom: darkMode ? new THREE.Color('#2d241c') : new THREE.Color('#fbeccb'), // Light: Warm Honey/Sand
            accent1: darkMode ? new THREE.Color('#d97706') : new THREE.Color('#f59e0b'), // Light: Vibrant Orange-Gold
            accent2: darkMode ? new THREE.Color('#92400e') : new THREE.Color('#b45309'), // Light: Deep Amber/Brown
            dust: darkMode ? new THREE.Color('#fff7ed') : new THREE.Color('#d97706'), // Light: Golden Dust
        };

        // Mobile Optimization
        const isMobile = window.innerWidth < 768;
        const PIXEL_RATIO = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2);

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, depth: false, powerPreference: "high-performance" });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(PIXEL_RATIO);
        containerRef.current.appendChild(renderer.domElement);

        // --- LIQUID SHADER (REVERTED TO SMOOTHER VERSION) ---
        // Slower, simpler noise flow as requested ("je préféré avant")
        const fragmentShader = `
        uniform float time;
        uniform vec2 resolution;
        uniform vec3 cTop;
        uniform vec3 cBot;
        uniform vec3 cAcc1;
        uniform vec3 cAcc2;
        
        varying vec2 vUv;

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
            vec2 st = gl_FragCoord.xy / resolution.xy;
            st.x *= resolution.x / resolution.y;
            
            // Ultra-Slow Flow (Restored)
            float t = time * 0.08; 
            
            float n1 = snoise(st * 0.8 + vec2(t * 0.2, t * 0.1));
            float n2 = snoise(st * 2.0 - vec2(t * 0.15, 0.0));
            
            float flow = mix(n1, n2, 0.5);
            
            // Base Gradient
            vec3 bg = mix(cBot, cTop, gl_FragCoord.y / resolution.y); 
            
            // Soft Accents (Restored simpler mixing logic)
            // Accent 1 (Gold/Orange)
            bg = mix(bg, cAcc1, smoothstep(0.3, 0.8, flow) * 0.15); 
            // Accent 2 (Deep Brown/Amber)
            bg = mix(bg, cAcc2, smoothstep(-0.6, -0.2, flow) * 0.1); 
            
            // Subtle grain
            float grain = fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453);
            bg += (grain - 0.5) * 0.02;

            gl_FragColor = vec4(bg, 1.0);
        }
    `;

        const uniforms = {
            time: { value: 0 },
            resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            cTop: { value: PALETTE.bgTop },
            cBot: { value: PALETTE.bgBottom },
            cAcc1: { value: PALETTE.accent1 },
            cAcc2: { value: PALETTE.accent2 },
        };

        const material = new THREE.ShaderMaterial({
            vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }`,
            fragmentShader,
            uniforms
        });

        // Background Plane
        const pCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
        pCamera.position.z = 20;

        const bgPlane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
        bgPlane.position.z = -10;
        scene.add(bgPlane);


        // --- PARTICLES (Passive Calm) ---
        const pCount = isMobile ? 80 : 150;
        const pGeo = new THREE.BufferGeometry();
        const pPos = new Float32Array(pCount * 3);
        const pData = new Float32Array(pCount * 3);

        for (let i = 0; i < pCount; i++) {
            pPos[i * 3] = (Math.random() - 0.5) * 40;
            pPos[i * 3 + 1] = (Math.random() - 0.5) * 40;
            pPos[i * 3 + 2] = (Math.random() - 0.5) * 5;

            pData[i * 3] = Math.random();
            pData[i * 3 + 1] = 0.2 + Math.random() * 0.3;   // Slow gentle speed
            pData[i * 3 + 2] = Math.random() * Math.PI * 2;
        }

        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        pGeo.setAttribute('aData', new THREE.BufferAttribute(pData, 3));

        const pMat = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: PALETTE.dust }
            },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexShader: `
            attribute vec3 aData; // x=scale, y=speed, z=phase
            varying float vAlpha;
            uniform float time;
            
            void main() {
                vec3 pos = position;
                float scale = aData.x;
                float speed = aData.y;
                float phase = aData.z;
                
                // Continuous Drift (Restored gentle vertical flow)
                pos.y += mod(time * speed + phase * 5.0, 40.0) - 20.0;
                pos.x += sin(time * 0.2 + phase) * 2.0; 
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                
                gl_PointSize = (15.0 * scale + 5.0) * (1.0 / -mvPosition.z);
                vAlpha = 0.3 + 0.3 * sin(time * 1.5 + phase);
            }
        `,
            fragmentShader: `
            uniform vec3 color;
            varying float vAlpha;
            void main() {
                vec2 coord = gl_PointCoord - vec2(0.5);
                float dist = length(coord);
                if(dist > 0.5) discard;
                float glow = 1.0 - (dist * 2.0);
                glow = pow(glow, 2.0);
                gl_FragColor = vec4(color, vAlpha * glow);
            }
        `
        });

        const particles = new THREE.Points(pGeo, pMat);
        scene.add(particles);


        // --- ANIMATION ---
        const clock = new THREE.Clock();
        let frame;

        const animate = () => {
            frame = requestAnimationFrame(animate);
            const t = clock.getElapsedTime();
            uniforms.time.value = t;
            pMat.uniforms.time.value = t;
            renderer.render(scene, pCamera);
        };

        const updateBgSize = () => {
            const d = 30;
            const vFOV = THREE.MathUtils.degToRad(75);
            const height = 2 * Math.tan(vFOV / 2) * d;
            const width = height * (window.innerWidth / window.innerHeight);

            bgPlane.geometry.dispose();
            bgPlane.geometry = new THREE.PlaneGeometry(width, height);
        };

        updateBgSize();
        animate();

        const handleResize = () => {
            updateBgSize();
            uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
            pCamera.aspect = window.innerWidth / window.innerHeight;
            pCamera.updateProjectionMatrix();
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
