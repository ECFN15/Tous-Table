import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const WarmAmbienceBackground = ({ darkMode }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // --- CONFIG ---
        // A palette that feels like "Liquid Amber" or "Varnished Wood" + Light
        const PALETTE = {
            bgTop: darkMode ? new THREE.Color('#1a1612') : new THREE.Color('#fdfcf8'),
            bgBottom: darkMode ? new THREE.Color('#2d241c') : new THREE.Color('#f2efe9'),
            accent1: darkMode ? new THREE.Color('#d97706') : new THREE.Color('#fbbf24'), // Gold
            accent2: darkMode ? new THREE.Color('#92400e') : new THREE.Color('#d97706'), // Deep Amber
            dust: darkMode ? new THREE.Color('#fff7ed') : new THREE.Color('#fef3c7'), // Pale dust
        };

        // --- SCENE ---
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, depth: false });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        // --- SHADER: "ETHEREAL CAUSTICS" ---
        // Simulates light refracting through a warm, organic medium (like honey or polished wood)
        const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
    `;

        const fragmentShader = `
        uniform float time;
        uniform vec2 resolution;
        uniform vec2 mouse;
        uniform vec3 cTop;
        uniform vec3 cBot;
        uniform vec3 cAcc1;
        uniform vec3 cAcc2;
        
        varying vec2 vUv;

        // --- NOISE FUNCTIONS ---
        // Simplex 3D Noise 
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) { 
            const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
            const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
            vec3 i  = floor(v + dot(v, C.yyy) );
            vec3 x0 = v - i + dot(i, C.xxx) ;
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min( g.xyz, l.zxy );
            vec3 i2 = max( g.xyz, l.zxy );
            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
            vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y
            i = mod289(i); 
            vec4 p = permute( permute( permute( 
                        i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                    + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                    + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
            float n_ = 0.142857142857; // 1.0/7.0
            vec3  ns = n_ * D.wyz - D.xzx;
            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
            vec4 x = x_ *ns.x + ns.yyyy;
            vec4 y = y_ *ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);
            vec4 b0 = vec4( x.xy, y.xy );
            vec4 b1 = vec4( x.zw, y.zw );
            vec4 s0 = floor(b0)*2.0 + 1.0;
            vec4 s1 = floor(b1)*2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));
            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
            vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
            vec3 p0 = vec3(a0.xy,h.x);
            vec3 p1 = vec3(a0.zw,h.y);
            vec3 p2 = vec3(a1.xy,h.z);
            vec3 p3 = vec3(a1.zw,h.w);
            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
            p0 *= norm.x;
            p1 *= norm.y;
            p2 *= norm.z;
            p3 *= norm.w;
            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                        dot(p2,x2), dot(p3,x3) ) );
        }

        // FBM (Fractal Brownian Motion) for detail
        float fbm(vec3 p) {
            float value = 0.0;
            float amplitude = 0.5;
            float frequency = 0.0;
            for (int i = 0; i < 4; i++) {
                value += amplitude * snoise(p);
                p *= 2.0;
                amplitude *= 0.5;
            }
            return value;
        }

        void main() {
            vec2 st = gl_FragCoord.xy / resolution.xy;
            vec2 pos = st;
            
            // 1. Mouse Influence (Elastic distortion)
            float dist = distance(st, mouse);
            pos.x += smoothstep(0.5, 0.0, dist) * 0.05 * sin(time);
            
            // 2. Flowing Liquid Noise
            float n1 = snoise(vec3(pos * 1.5, time * 0.05));
            float n2 = fbm(vec3(pos * 4.0 + n1, time * 0.1)); // Distorted noise
            
            // 3. Create "Caustics" lines (Simulating light refraction)
            // We take the domain warping result and isolate thin high-value bands
            float caustic = smoothstep(0.3, 0.32, abs(n2)); 
            
            // Soften
            caustic = 1.0 - caustic; // Invert to get lines
            caustic *= 0.15; // Subtle intensity

            // 4. Color Mixing
            // Vertical gradient base
            vec3 bg = mix(cBot, cTop, st.y);
            
            // Add "Amber Swirls"
            float amberMask = smoothstep(-0.2, 0.8, n1);
            bg = mix(bg, cAcc1, amberMask * 0.15); // Add gold
            
            // Add "Deep Wood/Honey" pockets
            float deepMask = smoothstep(0.4, 1.0, n2);
            bg = mix(bg, cAcc2, deepMask * 0.1); 

            // Add Caustic highlights (The "Creativity")
            bg += cAcc1 * caustic;

            // Vignette
            float vignette = 1.0 - length(st - 0.5) * 0.8;
            bg *= vignette;

            gl_FragColor = vec4(bg, 1.0);
        }
    `;

        const uniforms = {
            time: { value: 0 },
            resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            mouse: { value: new THREE.Vector2(0.5, 0.5) },
            cTop: { value: PALETTE.bgTop },
            cBot: { value: PALETTE.bgBottom },
            cAcc1: { value: PALETTE.accent1 },
            cAcc2: { value: PALETTE.accent2 },
        };

        const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
        scene.add(mesh);

        // --- PARTICLE SYSTEM (Floating Bokeh) ---
        // A separate scene/camera isn't needed if we layer. But for depth/parallax, let's use a group.

        // We create a perspective camera just for particles to have parallax, 
        // but render it into the same scene? No, we need 2 passes or just use the Ortho camera
        // and manual parallax in shader... 
        // Actually, simpler & more performant: Single scene, particles are "in front" (z > 0),
        // Background is plane at z = -1. 
        // BUT we used Ortho camera for full screen shader.
        // Solution: Switch main camera to Perspective. 
        // Put shader plane far back and scale it to fill frustum.

        const pCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
        pCamera.position.z = 10;

        // Calculate Plane Size at z=-10
        const dist = 20; // 10 camera  - (-10 plane) = 20
        const vFOV = THREE.MathUtils.degToRad(75);
        const height = 2 * Math.tan(vFOV / 2) * dist;
        const width = height * (window.innerWidth / window.innerHeight);
        mesh.geometry = new THREE.PlaneGeometry(width, height);
        mesh.position.z = -10;
        scene.add(mesh); // Re-add with new geometry/pos

        // Create "Bokeh" Particles
        const pCount = 200;
        const pGeo = new THREE.BufferGeometry();
        const pPos = new Float32Array(pCount * 3);
        const pScale = new Float32Array(pCount);
        const pSpeed = new Float32Array(pCount);
        const pPhase = new Float32Array(pCount);

        for (let i = 0; i < pCount; i++) {
            pPos[i * 3] = (Math.random() - 0.5) * 30; // X
            pPos[i * 3 + 1] = (Math.random() - 0.5) * 20; // Y
            pPos[i * 3 + 2] = (Math.random() - 0.5) * 10; // Z
            pScale[i] = Math.random();
            pSpeed[i] = 0.2 + Math.random() * 0.5;
            pPhase[i] = Math.random() * Math.PI * 2;
        }

        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        pGeo.setAttribute('aScale', new THREE.BufferAttribute(pScale, 1));
        pGeo.setAttribute('aPhase', new THREE.BufferAttribute(pPhase, 1));

        // Custom Particle Shader (Soft Bokeh Pulse)
        const pMat = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: PALETTE.dust }
            },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexShader: `
            attribute float aScale;
            attribute float aPhase;
            varying float vAlpha;
            uniform float time;
            
            void main() {
                vec3 pos = position;
                // Float Upwards
                pos.y += mod(time * 0.5 + aPhase, 20.0) - 10.0;
                
                // Gentle Sway
                pos.x += sin(time * 0.5 + aPhase) * 0.5;
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                
                // Pulse Size
                gl_PointSize = (20.0 * aScale + 5.0) * (1.0 / -mvPosition.z);
                
                // Pulse Opacity
                vAlpha = 0.3 + 0.4 * sin(time * 2.0 + aPhase); 
            }
        `,
            fragmentShader: `
            uniform vec3 color;
            varying float vAlpha;
            void main() {
                // Soft Circle
                vec2 coord = gl_PointCoord - vec2(0.5);
                float dist = length(coord);
                if(dist > 0.5) discard;
                
                // Radial gradient alpha
                float glow = 1.0 - (dist * 2.0);
                glow = pow(glow, 1.5); // Soften
                
                gl_FragColor = vec4(color, vAlpha * glow);
            }
        `
        });

        const particles = new THREE.Points(pGeo, pMat);
        scene.add(particles);


        // --- ANIMATION ---
        const clock = new THREE.Clock();
        let frame;

        // Smooth Mouse
        const mouseC = new THREE.Vector2(0.5, 0.5);
        const targetMouse = new THREE.Vector2(0.5, 0.5);

        const onMove = (e) => {
            targetMouse.x = e.clientX / window.innerWidth;
            targetMouse.y = 1.0 - (e.clientY / window.innerHeight); // Invert Y for shader coords
        };
        window.addEventListener('mousemove', onMove);

        const animate = () => {
            frame = requestAnimationFrame(animate);
            const t = clock.getElapsedTime();

            // Lerp Mouse
            mouseC.lerp(targetMouse, 0.05);
            uniforms.mouse.value = mouseC;
            uniforms.time.value = t;
            pMat.uniforms.time.value = t;

            // Parallax Camera
            const pX = (mouseC.x - 0.5) * 2;
            const pY = (mouseC.y - 0.5) * 2;
            pCamera.position.x += (pX - pCamera.position.x) * 0.05;
            pCamera.position.y += (pY - pCamera.position.y) * 0.05;
            pCamera.lookAt(0, 0, 0);

            renderer.render(scene, pCamera);
        };

        animate();

        const handleResize = () => {
            const _dist = 20;
            const _h = 2 * Math.tan(THREE.MathUtils.degToRad(75) / 2) * _dist;
            const _w = _h * (window.innerWidth / window.innerHeight);

            mesh.geometry.dispose();
            mesh.geometry = new THREE.PlaneGeometry(_w, _h);

            uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
            pCamera.aspect = window.innerWidth / window.innerHeight;
            pCamera.updateProjectionMatrix();
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
            style={{
                background: darkMode ? '#1a1612' : '#fcfbf9', // Fallback
                zIndex: 0
            }}
        />
    );
};

export default WarmAmbienceBackground;
