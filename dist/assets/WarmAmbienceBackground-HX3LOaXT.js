import{r as A,C as i,k as ie,F as ae,P as se,W as re,l as de,m as ce,n as le,p as we,t as _,B as he,M as C,G as me,v as ue,w as j,x as pe,y as D,z as P,A as fe,N as ge,D as H,E as ve,H as be,I as ye,j as xe,J as Se}from"./index-hYcMITVk.js";const Ae=({darkMode:o})=>{const m=A.useRef(null),g=A.useRef({x:0,y:0});return A.useEffect(()=>{const d=v=>{g.current.x=v.clientX/window.innerWidth*2-1,g.current.y=-(v.clientY/window.innerHeight)*2+1};return window.addEventListener("mousemove",d),()=>window.removeEventListener("mousemove",d)},[]),A.useEffect(()=>{if(!m.current)return;const d={bgGradientTop:o?new i("#1a120b"):new i("#fdf6e3"),bgGradientBot:o?new i("#2d1b14"):new i("#d4a373"),firefly:o?new i("#fbbf24"):new i("#b45309"),dust:o?new i("#ffffff"):new i("#78350f"),foliage:o?new i("#022c22"):new i("#422006")},v=window.innerWidth<768,N=Math.min(window.devicePixelRatio,v?1.5:2),n=new ie,I=o?1708555:16577766,O=o?.035:.012;n.fog=new ae(I,O);const a=new se(45,window.innerWidth/window.innerHeight,.1,100);a.position.set(0,0,20);const s=new re({alpha:!0,antialias:!0,powerPreference:"high-performance"});s.setSize(window.innerWidth,window.innerHeight),s.setPixelRatio(N),s.shadowMap.enabled=!0,s.shadowMap.type=de,m.current.appendChild(s.domElement);const V=(()=>{const t=document.createElement("canvas");t.width=1024,t.height=256;const e=t.getContext("2d"),f=e.createLinearGradient(0,0,0,256);f.addColorStop(0,"#5d4037"),f.addColorStop(1,"#3e2723"),e.fillStyle=f,e.fillRect(0,0,1024,256),e.globalAlpha=.25,e.strokeStyle="#100500",e.lineWidth=3;for(let l=0;l<150;l++){e.beginPath();const r=Math.random()*256;e.moveTo(0,r),e.bezierCurveTo(300,r+Math.random()*100-50,700,r+Math.random()*100-50,1024,r),e.stroke()}e.globalAlpha=1,e.fillStyle="rgba(20,5,0,0.85)",e.shadowColor="rgba(255,255,255,0.15)",e.shadowBlur=0,e.shadowOffsetY=2,e.font='900 90px "Courier New", monospace',e.textAlign="center",e.textBaseline="middle",e.fillText("TOUS À TABLE",512,110),e.font='italic 40px "Times New Roman", serif',e.fillStyle="rgba(60,30,10,0.9)",e.fillText("Atelier Normand",512,180);const h=new ce(t);return h.colorSpace=le,h})(),X=new we(60,32,32),Y=new _({side:he,vertexShader:"varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`
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
            `,uniforms:{top:{value:d.bgGradientTop},bot:{value:d.bgGradientBot}}}),q=new C(X,Y);n.add(q);const c=new me;c.position.set(0,5.5,0),n.add(c);const J=new ue(10,2.8,.4),K=new j({map:V,roughness:.6,metalness:.1,color:16777215}),b=new C(J,K);b.castShadow=!0,b.receiveShadow=!0,c.add(b);const E=new j({color:4073251,roughness:.8}),T=new pe(.04,.04,20),L=new C(T,E);L.position.set(-4.5,10,0);const R=new C(T,E);R.position.set(4.5,10,0),c.add(L),c.add(R);const y=150,p=new D,x=new Float32Array(y*3),u=new Float32Array(y*3);for(let t=0;t<y;t++)x[t*3]=(Math.random()-.5)*50,x[t*3+1]=(Math.random()-.5)*40,x[t*3+2]=(Math.random()-.5)*30,u[t*3]=Math.random()*10,u[t*3+1]=.2+Math.random()*.3,u[t*3+2]=Math.random();p.setAttribute("position",new P(x,3)),p.setAttribute("aData",new P(u,3));const Q=new fe({color:d.dust,size:.25,transparent:!0,opacity:.8,blending:ge,sizeAttenuation:!0}),Z=new H(p,Q);n.add(Z);const z=20,G=new D,S=new Float32Array(z*3),B=new Float32Array(z);for(let t=0;t<z;t++){const e=Math.random()>.5?1:-1;S[t*3]=e*(12+Math.random()*12),S[t*3+1]=(Math.random()-.5)*25,S[t*3+2]=14+Math.random()*4,B[t]=15+Math.random()*25}G.setAttribute("position",new P(S,3)),G.setAttribute("size",new P(B,1));const $=new _({uniforms:{color:{value:d.foliage},opacity:{value:.5}},transparent:!0,depthWrite:!1,vertexShader:`
                attribute float size;
                void main() {
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                }
            `,fragmentShader:`
                uniform vec3 color;
                uniform float opacity;
                void main() {
                    vec2 coord = gl_PointCoord - vec2(0.5);
                    float d = length(coord);
                    if(d > 0.5) discard;
                    float blur = smoothstep(0.5, 0.0, d);
                    gl_FragColor = vec4(color, blur * opacity);
                }
            `}),F=new H(G,$);n.add(F);const ee=.4,te=new ve(16777215,ee);n.add(te);const oe=o?1.5:2.8,w=new be(d.firefly,oe);w.position.set(12,15,12),w.castShadow=!0,w.shadow.mapSize.width=2048,w.shadow.mapSize.height=2048,w.shadow.bias=-1e-4,w.shadow.radius=2,n.add(w);const M=new ye(16775910,3);M.position.set(-10,10,15),M.target=b,M.castShadow=!0,n.add(M);const ne=new Se;m.current.style.opacity=0,setTimeout(()=>m.current.style.opacity=1,100);let W;const k=()=>{W=requestAnimationFrame(k);const t=ne.getElapsedTime(),e=g.current.x*.8,f=g.current.y*.8;a.position.x+=(e-a.position.x)*.03,a.position.y+=(f-a.position.y)*.03,a.lookAt(0,2,0),c.position.y=5.5+Math.sin(t*.4)*.15,c.rotation.z=Math.sin(t*.25)*.015,c.rotation.x=Math.sin(t*.2)*.03;const h=p.attributes.position.array;for(let l=0;l<y;l++){const r=l*3;h[r+1]+=u[l*3+1]*.02,h[r+1]>20&&(h[r+1]=-20),h[r]+=Math.sin(t+u[l*3])*.01}p.attributes.position.needsUpdate=!0,F.rotation.z=Math.sin(t*.1)*.05,s.render(n,a)};k();const U=()=>{a.aspect=window.innerWidth/window.innerHeight,a.updateProjectionMatrix(),s.setSize(window.innerWidth,window.innerHeight)};return window.addEventListener("resize",U),()=>{var t;cancelAnimationFrame(W),window.removeEventListener("resize",U),(t=m.current)==null||t.removeChild(s.domElement),s.dispose(),n.traverse(e=>{e.geometry&&e.geometry.dispose(),e.material&&e.material.dispose()})}},[o]),xe.jsx("div",{ref:m,className:"fixed inset-0 z-0 transition-opacity duration-1000 ease-out",style:{background:o?"#1a120b":"#fdf6e3"}})};export{Ae as default};
