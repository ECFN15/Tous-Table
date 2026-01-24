import{r as R,C as n,k as U,W as V,l as T,m as I,R as O,n as E,V as k,P as q,M as f,p as W,G as N,B as X,t as G,v as J,w as K,x as D,A as Q,y as Y,j as Z,z as $,D as ee}from"./index-D8j4cXgh.js";const oe=({darkMode:a})=>{const d=R.useRef(null);return R.useEffect(()=>{if(!d.current)return;const c={bgTop:a?new n("#1a1612"):new n("#fff9ee"),bgBottom:a?new n("#2d241c"):new n("#fbeccb"),accent1:a?new n("#d97706"):new n("#f59e0b"),accent2:a?new n("#92400e"):new n("#b45309"),dust:a?new n("#fff7ed"):new n("#d97706")},g=window.innerWidth<768,F=Math.min(window.devicePixelRatio,g?1.5:2),m=new U,r=new V({alpha:!0,antialias:!0,powerPreference:"high-performance"});r.setSize(window.innerWidth,window.innerHeight),r.setPixelRatio(F),d.current.appendChild(r.domElement);const _=(()=>{const e=document.createElement("canvas");e.width=512,e.height=128;const t=e.getContext("2d");t.fillStyle="#8b5a2b",t.fillRect(0,0,512,128),t.globalAlpha=.2,t.fillStyle="#3e2723";for(let i=0;i<300;i++)t.fillRect(Math.random()*512,Math.random()*128,Math.random()*100+20,2);t.globalAlpha=.5,t.lineWidth=10,t.strokeStyle="#2d1b0e",t.strokeRect(0,0,512,128),t.globalAlpha=1,t.fillStyle="#2d1b0e",t.font="bold 55px monospace",t.textAlign="center",t.textBaseline="middle",t.shadowBlur=2,t.shadowColor="rgba(255,255,255,0.3)",t.fillText("TOUS À TABLE",256,64);const o=new T(e);return o.colorSpace=I,o})(),H=(()=>{const e=document.createElement("canvas");e.width=16,e.height=64;const t=e.getContext("2d");t.fillStyle="#C2B280",t.fillRect(0,0,16,64),t.fillStyle="#8B8055";for(let i=0;i<64;i+=8)t.fillRect(0,i,16,2);const o=new T(e);return o.wrapS=o.wrapT=O,o.repeat.set(1,10),o})(),p=new E({vertexShader:"varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }",fragmentShader:`
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
        `,uniforms:{time:{value:0},resolution:{value:new k(window.innerWidth,window.innerHeight)},cTop:{value:c.bgTop},cBot:{value:c.bgBottom},cAcc1:{value:c.accent1},cAcc2:{value:c.accent2}}}),v=new q(50,window.innerWidth/window.innerHeight,.1,100);v.position.set(0,0,30);const w=new f(new W(2,2),p);w.position.z=-20,m.add(w);const s=new N;s.position.set(2,6,0),m.add(s);const L=new f(new X(8,2,.4),new G({map:_}));s.add(L);const y=new J(.1,.1,20),b=new G({map:H}),A=new f(y,b);A.position.set(-3,11,0),s.add(A);const z=new f(y,b);z.position.set(3,11,0),s.add(z);const h=g?100:250,u=new K,x=new Float32Array(h*3),l=new Float32Array(h*4);for(let e=0;e<h;e++){x[e*3]=(Math.random()-.5)*60,x[e*3+1]=(Math.random()-.5)*50,x[e*3+2]=(Math.random()-.5)*20;let t=Math.pow(Math.random(),3);l[e*4]=t,l[e*4+1]=(Math.random()-.5)*1.5,l[e*4+2]=.5+Math.random()*1,l[e*4+3]=Math.random()*Math.PI*2}u.setAttribute("position",new D(x,3)),u.setAttribute("aData",new D(l,4));const C=new E({uniforms:{time:{value:0},color:{value:c.dust}},transparent:!0,depthWrite:!1,blending:Q,vertexShader:`
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
        `,fragmentShader:`
            uniform vec3 color; varying float vAlpha;
            void main() {
                vec2 coord = gl_PointCoord - vec2(0.5);
                float dist = length(coord);
                if(dist > 0.5) discard;
                float center = 1.0 - smoothstep(0.0, 0.5, dist);
                gl_FragColor = vec4(color, vAlpha * (center * 0.5 + 0.1));
            }
        `});m.add(new Y(u,C));const j=new $;let M;const S=()=>{M=requestAnimationFrame(S);const e=j.getElapsedTime();p.uniforms.time.value=e,C.uniforms.time.value=e,s.rotation.z=Math.sin(e*.5)*.05,s.rotation.x=Math.sin(e*.7)*.02,r.render(m,v)},P=()=>{const t=ee.degToRad(50),o=2*Math.tan(t/2)*50,i=o*(window.innerWidth/window.innerHeight);w.geometry.dispose(),w.geometry=new W(i*1.2,o*1.2)};P(),S();const B=()=>{P(),p.uniforms.resolution.value.set(window.innerWidth,window.innerHeight),v.aspect=window.innerWidth/window.innerHeight,v.updateProjectionMatrix(),r.setSize(window.innerWidth,window.innerHeight)};return window.addEventListener("resize",B),()=>{var e;cancelAnimationFrame(M),window.removeEventListener("resize",B),(e=d.current)==null||e.removeChild(r.domElement),r.dispose()}},[a]),Z.jsx("div",{ref:d,className:"fixed inset-0 z-0",style:{background:a?"#1a1612":"#fff9ee"}})};export{oe as default};
