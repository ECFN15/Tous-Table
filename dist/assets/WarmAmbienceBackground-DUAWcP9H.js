import{r as b,C as t,k as R,O as T,W as D,l as A,V as _,M as H,P as z,B as L,m as C,A as G,n as j,p as O,j as U,t as V,v as I}from"./index-DVCOZbZ3.js";const q=({darkMode:o})=>{const r=b.useRef(null);return b.useEffect(()=>{if(!r.current)return;const i={bgTop:o?new t("#1a1612"):new t("#fdfcf8"),bgBottom:o?new t("#2d241c"):new t("#f4f1ea"),accent1:o?new t("#d97706"):new t("#fbbf24"),accent2:o?new t("#92400e"):new t("#d97706"),dust:o?new t("#fff7ed"):new t("#fde68a")},f=window.innerWidth<768,P=Math.min(window.devicePixelRatio,f?1.5:2),d=new R;new T(-1,1,1,-1,0,1);const n=new D({alpha:!0,antialias:!1,depth:!1,powerPreference:"high-performance"});n.setSize(window.innerWidth,window.innerHeight),n.setPixelRatio(P),r.current.appendChild(n.domElement);const S=`
        uniform float time;
        uniform vec2 resolution;
        uniform vec3 cTop;
        uniform vec3 cBot;
        uniform vec3 cAcc1;
        uniform vec3 cAcc2;
        
        varying vec2 vUv;

        // Optimized Simplex Noise
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
            // Aspect Ratio Fix for consistent pattern size
            st.x *= resolution.x / resolution.y;
            
            // Ultra-Slow Flow
            float t = time * 0.08; 
            
            // Layer 1: Base Liquid (Creamy/Woody)
            float n1 = snoise(st * 0.8 + vec2(t * 0.2, t * 0.1));
            
            // Layer 2: Detail Flow (Amber)
            float n2 = snoise(st * 2.0 - vec2(t * 0.15, 0.0));
            
            // Composite: Soft, blurred transitions (No sharp lines)
            float flow = mix(n1, n2, 0.5);
            
            // Color Ramp
            vec3 bg = mix(cBot, cTop, gl_FragCoord.y / resolution.y); // Vertical Grade
            
            // Add soft accents based on noise
            bg = mix(bg, cAcc1, smoothstep(0.3, 0.8, flow) * 0.15); // Golden Highlights
            bg = mix(bg, cAcc2, smoothstep(-0.6, -0.2, flow) * 0.1); // Deep Shadows
            
            // Subtle grain
            float grain = fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453);
            bg += (grain - 0.5) * 0.02;

            gl_FragColor = vec4(bg, 1.0);
        }
    `,m={time:{value:0},resolution:{value:new _(window.innerWidth,window.innerHeight)},cTop:{value:i.bgTop},cBot:{value:i.bgBottom},cAcc1:{value:i.accent1},cAcc2:{value:i.accent2}},W=new A({vertexShader:"varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }",fragmentShader:S,uniforms:m}),a=new H(new z(2,2),W);a.position.z=-1,d.add(a);const v=f?80:150,w=new L,s=new Float32Array(v*3),c=new Float32Array(v*3);for(let e=0;e<v;e++)s[e*3]=(Math.random()-.5)*40,s[e*3+1]=(Math.random()-.5)*40,s[e*3+2]=(Math.random()-.5)*5,c[e*3]=Math.random(),c[e*3+1]=.2+Math.random()*.3,c[e*3+2]=Math.random()*Math.PI*2;w.setAttribute("position",new C(s,3)),w.setAttribute("aData",new C(c,3));const x=new A({uniforms:{time:{value:0},color:{value:i.dust}},transparent:!0,depthWrite:!1,blending:G,vertexShader:`
            attribute vec3 aData; // x=scale, y=speed, z=phase
            varying float vAlpha;
            uniform float time;
            
            void main() {
                vec3 pos = position;
                float scale = aData.x;
                float speed = aData.y;
                float phase = aData.z;
                
                // Continuous Drift
                pos.y += mod(time * speed + phase * 5.0, 40.0) - 20.0;
                pos.x += sin(time * 0.2 + phase) * 2.0; // Gentle sway
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                
                // Adaptive size based on screen
                gl_PointSize = (15.0 * scale + 5.0) * (1.0 / -mvPosition.z);
                
                vAlpha = 0.3 + 0.3 * sin(time * 1.5 + phase);
            }
        `,fragmentShader:`
            uniform vec3 color;
            varying float vAlpha;
            void main() {
                vec2 coord = gl_PointCoord - vec2(0.5);
                float dist = length(coord);
                if(dist > 0.5) discard;
                
                // Soft gradient
                float glow = 1.0 - (dist * 2.0);
                glow = pow(glow, 2.0);
                
                gl_FragColor = vec4(color, vAlpha * glow);
            }
        `}),l=new j(75,window.innerWidth/window.innerHeight,.1,100);l.position.z=20;const B=new O(w,x);d.add(B);const F=new V;let p;const u=()=>{p=requestAnimationFrame(u);const e=F.getElapsedTime();m.time.value=e,x.uniforms.time.value=e,n.render(d,l)},h=()=>{a.position.z=-10;const e=30,M=I.degToRad(75),y=2*Math.tan(M/2)*e,E=y*(window.innerWidth/window.innerHeight);a.geometry.dispose(),a.geometry=new z(E,y)};h(),u();const g=()=>{h(),m.resolution.value.set(window.innerWidth,window.innerHeight),l.aspect=window.innerWidth/window.innerHeight,l.updateProjectionMatrix(),n.setSize(window.innerWidth,window.innerHeight)};return window.addEventListener("resize",g),()=>{var e;cancelAnimationFrame(p),window.removeEventListener("resize",g),(e=r.current)==null||e.removeChild(n.domElement),n.dispose()}},[o]),U.jsx("div",{ref:r,className:"fixed inset-0 z-0",style:{background:o?"#1a1612":"#fcfbf9"}})};export{q as default};
