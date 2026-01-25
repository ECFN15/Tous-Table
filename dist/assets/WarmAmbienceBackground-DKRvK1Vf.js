import{r as A,C as i,k as ce,F as le,P as we,W as he,l as ue,m as me,n as pe,p as fe,t as N,B as ge,M as C,G as ve,v as be,w as I,x as ye,y as Y,z as P,A as xe,N as Se,D as O,E as Me,H as Ae,I as Ce,j as Pe,J as ze}from"./index-DmCcek-N.js";const Ee=({darkMode:o})=>{const m=A.useRef(null),v=A.useRef({x:0,y:0});return A.useEffect(()=>{const d=c=>{v.current.x=c.clientX/window.innerWidth*2-1,v.current.y=-(c.clientY/window.innerHeight)*2+1};return window.addEventListener("mousemove",d),()=>window.removeEventListener("mousemove",d)},[]),A.useEffect(()=>{if(!m.current)return;const d={bgGradientTop:o?new i("#1a120b"):new i("#fdf6e3"),bgGradientBot:o?new i("#2d1b14"):new i("#d4a373"),firefly:o?new i("#fbbf24"):new i("#b45309"),dust:o?new i("#ffffff"):new i("#78350f"),foliage:o?new i("#022c22"):new i("#422006")},c=window.innerWidth<768,V=Math.min(window.devicePixelRatio,c?1.5:2),n=new ce,X=o?1708555:16577766,q=o?.035:.012;n.fog=new le(X,q);const a=new we(45,window.innerWidth/window.innerHeight,.1,100);a.position.set(0,0,20);const s=new he({alpha:!0,antialias:!0,powerPreference:"high-performance"});s.setSize(window.innerWidth,window.innerHeight),s.setPixelRatio(V),s.shadowMap.enabled=!0,s.shadowMap.type=ue,m.current.appendChild(s.domElement);const J=(()=>{const t=document.createElement("canvas");t.width=1024,t.height=256;const e=t.getContext("2d"),g=e.createLinearGradient(0,0,0,256);g.addColorStop(0,"#5d4037"),g.addColorStop(1,"#3e2723"),e.fillStyle=g,e.fillRect(0,0,1024,256),e.globalAlpha=.25,e.strokeStyle="#100500",e.lineWidth=3;for(let w=0;w<150;w++){e.beginPath();const r=Math.random()*256;e.moveTo(0,r),e.bezierCurveTo(300,r+Math.random()*100-50,700,r+Math.random()*100-50,1024,r),e.stroke()}e.globalAlpha=1,e.fillStyle="rgba(20,5,0,0.85)",e.shadowColor="rgba(255,255,255,0.15)",e.shadowBlur=0,e.shadowOffsetY=2,e.font='900 90px "Courier New", monospace',e.textAlign="center",e.textBaseline="middle",e.fillText("TOUS À TABLE",512,110),e.font='italic 40px "Times New Roman", serif',e.fillStyle="rgba(60,30,10,0.9)",e.fillText("Atelier Normand",512,180);const u=new me(t);return u.colorSpace=pe,u})(),K=new fe(60,32,32),Q=new N({side:ge,vertexShader:"varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`
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
            `,uniforms:{top:{value:d.bgGradientTop},bot:{value:d.bgGradientBot}}}),Z=new C(K,Q);n.add(Z);const T=c?.53:1,z=10*T,$=2.8*T,W=c?9.6:5.5,l=new ve;l.position.set(0,W,0),n.add(l);const ee=new be(z,$,.4),te=new I({map:J,roughness:.6,metalness:.1,color:16777215}),b=new C(ee,te);b.castShadow=!0,b.receiveShadow=!0,l.add(b);const L=new I({color:4073251,roughness:.8}),B=new ye(.04,.04,20),R=new C(B,L);R.position.set(-z*.45,10,0);const F=new C(B,L);F.position.set(z*.45,10,0),l.add(R),l.add(F);const y=150,f=new Y,x=new Float32Array(y*3),p=new Float32Array(y*3);for(let t=0;t<y;t++)x[t*3]=(Math.random()-.5)*50,x[t*3+1]=(Math.random()-.5)*40,x[t*3+2]=(Math.random()-.5)*30,p[t*3]=Math.random()*10,p[t*3+1]=.2+Math.random()*.3,p[t*3+2]=Math.random();f.setAttribute("position",new P(x,3)),f.setAttribute("aData",new P(p,3));const oe=new xe({color:d.dust,size:.25,transparent:!0,opacity:.8,blending:Se,sizeAttenuation:!0}),ne=new O(f,oe);n.add(ne);const G=20,E=new Y,S=new Float32Array(G*3),k=new Float32Array(G);for(let t=0;t<G;t++){const e=Math.random()>.5?1:-1;S[t*3]=e*(12+Math.random()*12),S[t*3+1]=(Math.random()-.5)*25,S[t*3+2]=14+Math.random()*4,k[t]=15+Math.random()*25}E.setAttribute("position",new P(S,3)),E.setAttribute("size",new P(k,1));const ie=new N({uniforms:{color:{value:d.foliage},opacity:{value:.5}},transparent:!0,depthWrite:!1,vertexShader:`
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
            `}),H=new O(E,ie);n.add(H);const ae=.4,se=new Me(16777215,ae);n.add(se);const re=o?1.5:2.8,h=new Ae(d.firefly,re);h.position.set(12,15,12),h.castShadow=!0,h.shadow.mapSize.width=2048,h.shadow.mapSize.height=2048,h.shadow.bias=-1e-4,h.shadow.radius=2,n.add(h);const M=new Ce(16775910,3);M.position.set(-10,10,15),M.target=b,M.castShadow=!0,n.add(M);const de=new ze;m.current.style.opacity=0,setTimeout(()=>m.current.style.opacity=1,100);let U;const _=()=>{U=requestAnimationFrame(_);const t=de.getElapsedTime(),e=v.current.x*.8,g=v.current.y*.8;a.position.x+=(e-a.position.x)*.03,a.position.y+=(g-a.position.y)*.03,a.lookAt(0,c?4:2,0),l.position.y=W+Math.sin(t*.4)*.15,l.rotation.z=Math.sin(t*.25)*.015,l.rotation.x=Math.sin(t*.2)*.03;const u=f.attributes.position.array;for(let w=0;w<y;w++){const r=w*3;u[r+1]+=p[w*3+1]*.02,u[r+1]>20&&(u[r+1]=-20),u[r]+=Math.sin(t+p[w*3])*.01}f.attributes.position.needsUpdate=!0,H.rotation.z=Math.sin(t*.1)*.05,s.render(n,a)};_();let j=window.innerWidth;const D=()=>{c&&window.innerWidth===j||(j=window.innerWidth,a.aspect=window.innerWidth/window.innerHeight,a.updateProjectionMatrix(),s.setSize(window.innerWidth,window.innerHeight))};return window.addEventListener("resize",D),()=>{var t;cancelAnimationFrame(U),window.removeEventListener("resize",D),(t=m.current)==null||t.removeChild(s.domElement),s.dispose(),n.traverse(e=>{e.geometry&&e.geometry.dispose(),e.material&&e.material.dispose()})}},[o]),Pe.jsx("div",{ref:m,className:"fixed inset-0 z-0 transition-opacity duration-1000 ease-out",style:{background:o?"#2d1b14":"#d4a373"}})};export{Ee as default};
