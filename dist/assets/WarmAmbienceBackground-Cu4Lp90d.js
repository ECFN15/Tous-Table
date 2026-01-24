import{r as B,C as i,k as I,W as U,l as R,m as N,R as O,n as W,V as q,P as X,M as f,p as E,G as Y,t as k,B as J,v as K,w as Q,x as G,A as Z,N as $,y as ee,j as te,z as oe,D as ne}from"./index-Cwzp7ipv.js";const ie=({darkMode:n})=>{const d=B.useRef(null);return B.useEffect(()=>{if(!d.current)return;const c={bgTop:n?new i("#1a1612"):new i("#fdfaf2"),bgBottom:n?new i("#2d241c"):new i("#e8dcc4"),accent1:n?new i("#d97706"):new i("#c68642"),accent2:n?new i("#92400e"):new i("#8b4513"),dust:n?new i("#fff7ed"):new i("#5d4037")},y=window.innerWidth<768,F=Math.min(window.devicePixelRatio,y?1.5:2),m=new I,r=new U({alpha:!0,antialias:!0,powerPreference:"high-performance"});r.setSize(window.innerWidth,window.innerHeight),r.setPixelRatio(F),d.current.appendChild(r.domElement);const _=(()=>{const t=document.createElement("canvas");t.width=512,t.height=128;const e=t.getContext("2d");e.fillStyle="#6d4c41",e.fillRect(0,0,512,128),e.globalAlpha=.3,e.strokeStyle="#3e2723";for(let o=0;o<40;o++){e.beginPath(),e.lineWidth=Math.random()*2;const h=Math.random()*128;e.moveTo(0,h),e.bezierCurveTo(170,h+(Math.random()-.5)*20,340,h+(Math.random()-.5)*20,512,h),e.stroke()}for(let o=0;o<3;o++)e.beginPath(),e.ellipse(Math.random()*512,Math.random()*128,10,5,Math.random()*Math.PI,0,Math.PI*2),e.stroke();e.globalAlpha=.6,e.lineWidth=12,e.strokeStyle="#2d1b0e",e.strokeRect(0,0,512,128),e.globalAlpha=1,e.fillStyle="#261b1b",e.font='900 60px "Courier New", monospace',e.textAlign="center",e.textBaseline="middle",e.shadowBlur=4,e.shadowColor="rgba(0,0,0,0.4)",e.fillText("TOUS À TABLE",256,64);const a=new R(t);return a.colorSpace=N,a})(),H=(()=>{const t=document.createElement("canvas");t.width=16,t.height=64;const e=t.getContext("2d");e.fillStyle="#8d7d66",e.fillRect(0,0,16,64),e.fillStyle="#5d4037";for(let o=0;o<64;o+=8)e.fillRect(0,o,16,4);const a=new R(t);return a.wrapS=a.wrapT=O,a.repeat.set(1,10),a})(),p=new W({vertexShader:"varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }",fragmentShader:`
            uniform float time;
            uniform vec2 resolution;
            uniform vec3 cTop, cBot, cAcc1, cAcc2;
            uniform bool isDark;
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
                float t = time * 0.06; 
                
                // More complex fluid movement for Light Mode
                float n1 = snoise(st * (isDark ? 1.5 : 2.0) + vec2(t*0.2, t*0.1));
                float n2 = snoise(st * (isDark ? 3.0 : 4.5) - vec2(t*0.15, 0.0));
                
                float flow = mix(n1, n2, isDark ? 0.4 : 0.6);
                
                vec3 bg = mix(cBot, cTop, gl_FragCoord.y / resolution.y); 
                
                // Higher contrast for light mode
                float mixVal1 = isDark ? 0.4 : 0.35;
                float mixVal2 = isDark ? 0.7 : 0.75;
                
                bg = mix(bg, cAcc1, smoothstep(mixVal1, mixVal2, flow) * (isDark ? 0.15 : 0.25)); 
                bg = mix(bg, cAcc2, smoothstep(-0.6, -0.2, flow) * (isDark ? 0.1 : 0.2)); 
                
                // Subtle Paper/Wood Texture
                float grain = fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453);
                bg += (grain - 0.5) * 0.05; 
                
                gl_FragColor = vec4(bg, 1.0);
            }
        `,uniforms:{time:{value:0},resolution:{value:new q(window.innerWidth,window.innerHeight)},cTop:{value:c.bgTop},cBot:{value:c.bgBottom},cAcc1:{value:c.accent1},cAcc2:{value:c.accent2},isDark:{value:n}}}),v=new X(50,window.innerWidth/window.innerHeight,.1,100);v.position.set(0,0,32);const w=new f(new E(2,2),p);w.position.set(0,0,-10),m.add(w);const s=new Y;s.position.set(4,7,5),m.add(s);const L=new k({map:_,transparent:!0,opacity:.95}),V=new f(new J(9,2.3,.5),L);s.add(V);const b=new K(.12,.12,30),A=new k({map:H}),M=new f(b,A);M.position.set(-4,15,-.1),s.add(M);const C=new f(b,A);C.position.set(4,15,-.1),s.add(C);const u=y?80:200,g=new Q,x=new Float32Array(u*3),l=new Float32Array(u*4);for(let t=0;t<u;t++){x[t*3]=(Math.random()-.5)*60,x[t*3+1]=(Math.random()-.5)*50,x[t*3+2]=(Math.random()-.5)*20;let e=Math.pow(Math.random(),2);l[t*4]=e,l[t*4+1]=(Math.random()-.5)*1,l[t*4+2]=.3+Math.random()*.7,l[t*4+3]=Math.random()*Math.PI*2}g.setAttribute("position",new G(x,3)),g.setAttribute("aData",new G(l,4));const P=new W({uniforms:{time:{value:0},color:{value:c.dust},isDark:{value:n}},transparent:!0,depthWrite:!1,blending:n?Z:$,vertexShader:`
            attribute vec4 aData; varying float vAlpha;
            uniform float time;
            void main() {
                vec3 pos = position;
                pos.y += mod(time * aData.z + aData.w * 10.0, 60.0) - 30.0;
                pos.x += sin(time * 0.5 + aData.w) * 2.0; 
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                float size = (60.0 * aData.x + 8.0); // Bigger range
                gl_PointSize = size * (1.0 / -mvPosition.z);
                vAlpha = (0.7 - aData.x * 0.4) * (0.5 + 0.5 * sin(time * 1.5 + aData.w));
            }
        `,fragmentShader:`
            uniform vec3 color; 
            uniform bool isDark;
            varying float vAlpha;
            void main() {
                vec2 coord = gl_PointCoord - vec2(0.5);
                float dist = length(coord);
                if(dist > 0.5) discard;
                float center = 1.0 - smoothstep(0.0, 0.5, dist);
                
                // Add a soft border for light mode visibility
                float edge = smoothstep(0.45, 0.5, dist);
                vec3 finalColor = isDark ? color : mix(color, color * 0.7, edge);
                
                gl_FragColor = vec4(finalColor, vAlpha * (center * 0.6 + 0.1));
            }
        `});m.add(new ee(g,P));const j=new oe;let z;const D=()=>{z=requestAnimationFrame(D);const t=j.getElapsedTime();p.uniforms.time.value=t,P.uniforms.time.value=t,s.rotation.z=Math.sin(t*.4)*.04,s.rotation.x=Math.sin(t*.6)*.02,r.render(m,v)},S=()=>{const e=ne.degToRad(50),a=2*Math.tan(e/2)*42,o=a*(window.innerWidth/window.innerHeight);w.geometry.dispose(),w.geometry=new E(o*1.5,a*1.5)};S(),D();const T=()=>{S(),p.uniforms.resolution.value.set(window.innerWidth,window.innerHeight),v.aspect=window.innerWidth/window.innerHeight,v.updateProjectionMatrix(),r.setSize(window.innerWidth,window.innerHeight)};return window.addEventListener("resize",T),()=>{var t;cancelAnimationFrame(z),window.removeEventListener("resize",T),(t=d.current)==null||t.removeChild(r.domElement),r.dispose()}},[n]),te.jsx("div",{ref:d,className:"fixed inset-0 z-0",style:{background:n?"#1a1612":"#fdfaf2"}})};export{ie as default};
