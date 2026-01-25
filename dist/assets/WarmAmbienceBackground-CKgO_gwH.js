import{r as A,C as i,k as ce,F as de,P as le,W as we,l as he,m as me,n as ue,p as pe,t as D,B as fe,M as C,G as ge,v as ve,w as N,x as be,y as I,z as P,A as ye,N as xe,D as Y,E as Se,H as Me,I as Ae,j as Ce,J as Pe}from"./index-Dil3qmc3.js";const Ge=({darkMode:o})=>{const u=A.useRef(null),v=A.useRef({x:0,y:0});return A.useEffect(()=>{const c=w=>{v.current.x=w.clientX/window.innerWidth*2-1,v.current.y=-(w.clientY/window.innerHeight)*2+1};return window.addEventListener("mousemove",c),()=>window.removeEventListener("mousemove",c)},[]),A.useEffect(()=>{if(!u.current)return;const c={bgGradientTop:o?new i("#1a120b"):new i("#fdf6e3"),bgGradientBot:o?new i("#2d1b14"):new i("#d4a373"),firefly:o?new i("#fbbf24"):new i("#b45309"),dust:o?new i("#ffffff"):new i("#78350f"),foliage:o?new i("#022c22"):new i("#422006")},w=window.innerWidth<768,O=Math.min(window.devicePixelRatio,w?1.5:2),n=new ce,V=o?1708555:16577766,X=o?.035:.012;n.fog=new de(V,X);const a=new le(45,window.innerWidth/window.innerHeight,.1,100);a.position.set(0,0,20);const s=new we({alpha:!0,antialias:!0,powerPreference:"high-performance"});s.setSize(window.innerWidth,window.innerHeight),s.setPixelRatio(O),s.shadowMap.enabled=!0,s.shadowMap.type=he,u.current.appendChild(s.domElement);const q=(()=>{const t=document.createElement("canvas");t.width=1024,t.height=256;const e=t.getContext("2d"),g=e.createLinearGradient(0,0,0,256);g.addColorStop(0,"#5d4037"),g.addColorStop(1,"#3e2723"),e.fillStyle=g,e.fillRect(0,0,1024,256),e.globalAlpha=.25,e.strokeStyle="#100500",e.lineWidth=3;for(let l=0;l<150;l++){e.beginPath();const r=Math.random()*256;e.moveTo(0,r),e.bezierCurveTo(300,r+Math.random()*100-50,700,r+Math.random()*100-50,1024,r),e.stroke()}e.globalAlpha=1,e.fillStyle="rgba(20,5,0,0.85)",e.shadowColor="rgba(255,255,255,0.15)",e.shadowBlur=0,e.shadowOffsetY=2,e.font='900 90px "Courier New", monospace',e.textAlign="center",e.textBaseline="middle",e.fillText("TOUS À TABLE",512,110),e.font='italic 40px "Times New Roman", serif',e.fillStyle="rgba(60,30,10,0.9)",e.fillText("Atelier Normand",512,180);const m=new me(t);return m.colorSpace=ue,m})(),J=new pe(60,32,32),K=new D({side:fe,vertexShader:"varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`
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
            `,uniforms:{top:{value:c.bgGradientTop},bot:{value:c.bgGradientBot}}}),Q=new C(J,K);n.add(Q);const T=w?.53:1,z=10*T,Z=2.8*T,L=w?9.6:5.5,d=new ge;d.position.set(0,L,0),n.add(d);const $=new ve(z,Z,.4),ee=new N({map:q,roughness:.6,metalness:.1,color:16777215}),b=new C($,ee);b.castShadow=!0,b.receiveShadow=!0,d.add(b);const B=new N({color:4073251,roughness:.8}),R=new be(.04,.04,20),W=new C(R,B);W.position.set(-z*.45,10,0);const F=new C(R,B);F.position.set(z*.45,10,0),d.add(W),d.add(F);const y=150,f=new I,x=new Float32Array(y*3),p=new Float32Array(y*3);for(let t=0;t<y;t++)x[t*3]=(Math.random()-.5)*50,x[t*3+1]=(Math.random()-.5)*40,x[t*3+2]=(Math.random()-.5)*30,p[t*3]=Math.random()*10,p[t*3+1]=.2+Math.random()*.3,p[t*3+2]=Math.random();f.setAttribute("position",new P(x,3)),f.setAttribute("aData",new P(p,3));const te=new ye({color:c.dust,size:.25,transparent:!0,opacity:.8,blending:xe,sizeAttenuation:!0}),oe=new Y(f,te);n.add(oe);const G=20,E=new I,S=new Float32Array(G*3),k=new Float32Array(G);for(let t=0;t<G;t++){const e=Math.random()>.5?1:-1;S[t*3]=e*(12+Math.random()*12),S[t*3+1]=(Math.random()-.5)*25,S[t*3+2]=14+Math.random()*4,k[t]=15+Math.random()*25}E.setAttribute("position",new P(S,3)),E.setAttribute("size",new P(k,1));const ne=new D({uniforms:{color:{value:c.foliage},opacity:{value:.5}},transparent:!0,depthWrite:!1,vertexShader:`
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
            `}),H=new Y(E,ne);n.add(H);const ie=.4,ae=new Se(16777215,ie);n.add(ae);const se=o?1.5:2.8,h=new Me(c.firefly,se);h.position.set(12,15,12),h.castShadow=!0,h.shadow.mapSize.width=2048,h.shadow.mapSize.height=2048,h.shadow.bias=-1e-4,h.shadow.radius=2,n.add(h);const M=new Ae(16775910,3);M.position.set(-10,10,15),M.target=b,M.castShadow=!0,n.add(M);const re=new Pe;u.current.style.opacity=0,setTimeout(()=>u.current.style.opacity=1,100);let U;const _=()=>{U=requestAnimationFrame(_);const t=re.getElapsedTime(),e=v.current.x*.8,g=v.current.y*.8;a.position.x+=(e-a.position.x)*.03,a.position.y+=(g-a.position.y)*.03,a.lookAt(0,w?4:2,0),d.position.y=L+Math.sin(t*.4)*.15,d.rotation.z=Math.sin(t*.25)*.015,d.rotation.x=Math.sin(t*.2)*.03;const m=f.attributes.position.array;for(let l=0;l<y;l++){const r=l*3;m[r+1]+=p[l*3+1]*.02,m[r+1]>20&&(m[r+1]=-20),m[r]+=Math.sin(t+p[l*3])*.01}f.attributes.position.needsUpdate=!0,H.rotation.z=Math.sin(t*.1)*.05,s.render(n,a)};_();const j=()=>{a.aspect=window.innerWidth/window.innerHeight,a.updateProjectionMatrix(),s.setSize(window.innerWidth,window.innerHeight)};return window.addEventListener("resize",j),()=>{var t;cancelAnimationFrame(U),window.removeEventListener("resize",j),(t=u.current)==null||t.removeChild(s.domElement),s.dispose(),n.traverse(e=>{e.geometry&&e.geometry.dispose(),e.material&&e.material.dispose()})}},[o]),Ce.jsx("div",{ref:u,className:"fixed inset-0 z-0 transition-opacity duration-1000 ease-out",style:{background:o?"#1a120b":"#fdf6e3"}})};export{Ge as default};
