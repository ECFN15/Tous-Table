import{r as _,C as t,k as N,O as k,W as O,l as F,V as u,M as U,P as h,m as V,B as q,n as y,A as G,p as X,j as Y,t as J,v as W}from"./index-CTwd9jEy.js";const Q=({darkMode:n})=>{const r=_.useRef(null);return _.useEffect(()=>{if(!r.current)return;const s={bgTop:n?new t("#1a1612"):new t("#fdfcf8"),bgBottom:n?new t("#2d241c"):new t("#f2efe9"),accent1:n?new t("#d97706"):new t("#fbbf24"),accent2:n?new t("#92400e"):new t("#d97706"),dust:n?new t("#fff7ed"):new t("#fef3c7")},l=new N;new k(-1,1,1,-1,0,1);const i=new O({alpha:!0,antialias:!0,depth:!1});i.setSize(window.innerWidth,window.innerHeight),i.setPixelRatio(Math.min(window.devicePixelRatio,2)),r.current.appendChild(i.domElement);const E=`
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
    `,B=`
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
    `,d={time:{value:0},resolution:{value:new u(window.innerWidth,window.innerHeight)},mouse:{value:new u(.5,.5)},cTop:{value:s.bgTop},cBot:{value:s.bgBottom},cAcc1:{value:s.accent1},cAcc2:{value:s.accent2}},T=new F({vertexShader:E,fragmentShader:B,uniforms:d}),a=new U(new h(2,2),T);l.add(a);const o=new V(75,window.innerWidth/window.innerHeight,.1,100);o.position.z=10;const H=20,R=W.degToRad(75),g=2*Math.tan(R/2)*H,j=g*(window.innerWidth/window.innerHeight);a.geometry=new h(j,g),a.position.z=-10,l.add(a);const c=200,v=new q,m=new Float32Array(c*3),b=new Float32Array(c),D=new Float32Array(c),z=new Float32Array(c);for(let e=0;e<c;e++)m[e*3]=(Math.random()-.5)*30,m[e*3+1]=(Math.random()-.5)*20,m[e*3+2]=(Math.random()-.5)*10,b[e]=Math.random(),D[e]=.2+Math.random()*.5,z[e]=Math.random()*Math.PI*2;v.setAttribute("position",new y(m,3)),v.setAttribute("aScale",new y(b,1)),v.setAttribute("aPhase",new y(z,1));const A=new F({uniforms:{time:{value:0},color:{value:s.dust}},transparent:!0,depthWrite:!1,blending:G,vertexShader:`
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
        `,fragmentShader:`
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
        `}),I=new X(v,A);l.add(I);const L=new J;let C;const p=new u(.5,.5),x=new u(.5,.5),S=e=>{x.x=e.clientX/window.innerWidth,x.y=1-e.clientY/window.innerHeight};window.addEventListener("mousemove",S);const P=()=>{C=requestAnimationFrame(P);const e=L.getElapsedTime();p.lerp(x,.05),d.mouse.value=p,d.time.value=e,A.uniforms.time.value=e;const w=(p.x-.5)*2,f=(p.y-.5)*2;o.position.x+=(w-o.position.x)*.05,o.position.y+=(f-o.position.y)*.05,o.lookAt(0,0,0),i.render(l,o)};P();const M=()=>{const w=2*Math.tan(W.degToRad(75)/2)*20,f=w*(window.innerWidth/window.innerHeight);a.geometry.dispose(),a.geometry=new h(f,w),d.resolution.value.set(window.innerWidth,window.innerHeight),o.aspect=window.innerWidth/window.innerHeight,o.updateProjectionMatrix(),i.setSize(window.innerWidth,window.innerHeight)};return window.addEventListener("resize",M),()=>{var e;cancelAnimationFrame(C),window.removeEventListener("mousemove",S),window.removeEventListener("resize",M),(e=r.current)==null||e.removeChild(i.domElement),i.dispose()}},[n]),Y.jsx("div",{ref:r,className:"fixed inset-0 z-0",style:{background:n?"#1a1612":"#fcfbf9",zIndex:0}})};export{Q as default};
