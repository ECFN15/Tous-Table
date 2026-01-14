import React, { useEffect, useRef, useLayoutEffect, useState } from 'react';
import { Hammer, Menu, X } from 'lucide-react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Enregistrement du plugin GSAP
gsap.registerPlugin(ScrollTrigger);

const HomeView = ({ onEnterMarketplace }) => {
    const canvasRef = useRef(null);
    const cursorRef = useRef(null);
    const componentRef = useRef(null);
    // Le menu est fermé par défaut
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // --- 1. THREE.JS BACKGROUND ---
    useEffect(() => {
        if (!canvasRef.current) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xF4F2EE);
        scene.fog = new THREE.Fog(0xF4F2EE, 5, 15);

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.z = 8;
        camera.position.y = 1;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        while (canvasRef.current.firstChild) {
            canvasRef.current.removeChild(canvasRef.current.firstChild);
        }
        canvasRef.current.appendChild(renderer.domElement);

        const ambi = new THREE.AmbientLight(0xffffff, 0.7); scene.add(ambi);
        const dir = new THREE.DirectionalLight(0xffffff, 0.5); dir.position.set(5, 10, 5); scene.add(dir);

        const geo = new THREE.TorusKnotGeometry(1.5, 0.4, 150, 20);
        const mat = new THREE.MeshStandardMaterial({ 
            color: 0x9C8268, 
            roughness: 0.6,
            metalness: 0.1,
            wireframe: false
        });
        const mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);

        const clock = new THREE.Clock();
        let requestID;

        const animate = () => {
            const t = clock.getElapsedTime();
            mesh.rotation.x = t * 0.1;
            mesh.rotation.y = t * 0.05;
            mesh.position.y = Math.sin(t * 0.5) * 0.2;
            renderer.render(scene, camera);
            requestID = requestAnimationFrame(animate);
        };
        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(requestID);
            if (canvasRef.current && renderer.domElement) {
                try { canvasRef.current.removeChild(renderer.domElement); } catch (e) {}
            }
            geo.dispose(); mat.dispose();
        };
    }, []);

    // --- 2. GSAP ANIMATIONS ---
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Cursor
            const moveCursor = (e) => {
                gsap.to(cursorRef.current, { x: e.clientX, y: e.clientY, duration: 0.1 });
            };
            window.addEventListener('mousemove', moveCursor);

            // Hover effects
            const targets = document.querySelectorAll('a, button, .magnetic, .nav-link, .feat-btn, .magnetic-card, .menu-trigger');
            targets.forEach(el => {
                el.addEventListener('mouseenter', () => cursorRef.current?.classList.add('hovered'));
                el.addEventListener('mouseleave', () => cursorRef.current?.classList.remove('hovered'));
            });

            // Hero Animation
            const tlHero = gsap.timeline();
            tlHero.to('.hero-title span', { y: 0, duration: 1.5, ease: 'power4.out', stagger: 0.1, delay: 0.2 })
                  .to('.hero-footer', { opacity: 1, duration: 1 }, "-=1");

            // Horizontal Scroll (Process)
            const processContainer = document.querySelector('.process-container');
            if (processContainer) {
                gsap.to(processContainer, {
                    x: () => -(processContainer.scrollWidth - window.innerWidth),
                    ease: "none",
                    scrollTrigger: {
                        trigger: '.process-wrapper',
                        start: "top top",
                        end: () => "+=" + (processContainer.scrollWidth - window.innerWidth),
                        pin: true,
                        scrub: 1,
                        invalidateOnRefresh: true
                    }
                });
            }

            // --- ANIMATION MANIFESTO (PARAMÈTRES EXACTS DU HTML) ---
            const images = gsap.utils.toArray('.image-block img');
            images.forEach(img => {
                gsap.to(img, {
                    y: '10%', // Paramètre exact de ton code HTML
                    ease: "none",
                    scrollTrigger: {
                        trigger: img.parentElement, 
                        start: "top bottom", 
                        scrub: true // True = synchro exacte au scroll (pas d'inertie ajoutée)
                    }
                });
            });
            
            // Featured Parallax (Code HTML : parallax-img-fast = 15%)
            gsap.to('.feat-img', {
                y: '15%',
                ease: "none",
                scrollTrigger: {
                    trigger: '.featured-section',
                    start: "top bottom",
                    scrub: true
                }
            });

            // Team Stagger
            gsap.from('.team-member', {
                y: 50,
                opacity: 0,
                duration: 1,
                stagger: 0.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.team-section',
                    start: "top 80%"
                }
            });

            return () => {
                window.removeEventListener('mousemove', moveCursor);
            };
        }, componentRef);

        return () => ctx.revert();
    }, []);

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if(el) {
            el.scrollIntoView({ behavior: 'smooth' });
            setIsMenuOpen(false);
        }
    };

    return (
        <div ref={componentRef} className="home-container">
            {/* CSS EXACT DU DESIGN */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Montserrat:wght@300;400;500&display=swap');

                :root {
                    --bg-color: #F4F2EE;
                    --text-color: #141414;
                    --accent-color: #9C8268;
                    --line-color: rgba(20, 20, 20, 0.15);
                    --gutter: 5vw;
                }

                * { box-sizing: border-box; }
                
                .home-container {
                    margin: 0; padding: 0; width: 100%;
                    background-color: var(--bg-color);
                    color: var(--text-color);
                    font-family: 'Montserrat', sans-serif;
                    overflow-x: hidden;
                    -webkit-font-smoothing: antialiased;
                }

                /* Custom Cursor */
                #cursor {
                    position: fixed; top: 0; left: 0; width: 10px; height: 10px;
                    background: var(--text-color); border-radius: 50%; pointer-events: none; z-index: 9999;
                    transform: translate(-50%, -50%); transition: transform 0.2s, background 0.2s;
                    mix-blend-mode: difference;
                }
                #cursor.hovered { transform: translate(-50%, -50%) scale(5); background: rgba(255,255,255,0.8); }

                /* Nav */
                .home-nav {
                    position: fixed; top: 0; left: 0; width: 100%;
                    padding: 2rem var(--gutter);
                    display: flex; justify-content: space-between; align-items: center;
                    z-index: 100; mix-blend-mode: multiply;
                }
                .logo { font-family: 'Cormorant Garamond'; font-size: 1.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; display: flex; align-items: center; gap: 10px;}
                
                /* Canvas */
                #canvas-wrap {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
                    z-index: 0; opacity: 0.6; pointer-events: none;
                    filter: contrast(0.9) brightness(1.1);
                }

                section { position: relative; z-index: 1; }

                /* HERO */
                .hero {
                    height: 100vh; display: flex; flex-direction: column; justify-content: center;
                    padding: 0 var(--gutter); border-bottom: 1px solid var(--line-color);
                }
                .hero-title {
                    font-family: 'Cormorant Garamond'; font-size: 11vw;
                    line-height: 0.9; font-weight: 300; text-transform: uppercase;
                    color: var(--text-color); margin: 0; padding: 0; overflow: hidden;
                }
                .hero-title span { display: block; transform: translateY(100%); }
                .hero-footer {
                    position: absolute; bottom: 3rem; left: var(--gutter); right: var(--gutter);
                    display: flex; justify-content: space-between; font-size: 0.9rem; opacity: 0;
                }

                /* MANIFESTO */
                .manifesto { display: flex; position: relative; border-bottom: 1px solid var(--line-color); background: var(--bg-color); }
                .manifesto::after { content: ''; position: absolute; top: 0; bottom: 0; left: 40%; width: 1px; background: var(--line-color); z-index: 2; }
                .manifesto-sticky { width: 40%; height: 100vh; position: sticky; top: 0; display: flex; flex-direction: column; justify-content: center; padding: 0 var(--gutter); }
                .manifesto-scroll { width: 60%; padding: 10rem var(--gutter) 10rem 10vw; }
                .lead-text { font-family: 'Cormorant Garamond'; font-size: 3rem; line-height: 1.2; margin-bottom: 2rem; }
                .sub-text { font-size: 1rem; line-height: 1.6; opacity: 0.7; max-width: 400px; }
                
                .image-block { margin-bottom: 10rem; position: relative; overflow: hidden; }
                
                /* L'image de base (sera animée par GSAP pour le Y) */
                /* IMPORTANT : CSS exact du HTML fourni pour la transition et le will-change */
                .image-block img { 
                    width: 100%; 
                    display: block; 
                    transition: transform 1.5s ease; 
                    will-change: transform; 
                }
                .image-block:hover img { transform: scale(1.03); }
                
                .caption { margin-top: 1.5rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.2em; opacity: 0.6; display: flex; align-items: center; gap: 1rem; }
                .caption::before { content: ''; width: 30px; height: 1px; background: currentColor; }

                /* PROCESS */
                .process-wrapper { width: 100%; height: 100vh; display: flex; flex-wrap: nowrap; overflow: hidden; background: #141414; color: #F4F2EE; align-items: center; }
                .process-container { display: flex; gap: 0; padding: 0 5vw; width: 300%; }
                .process-card { width: 40vw; height: 60vh; display: flex; flex-direction: column; justify-content: space-between; border-right: 1px solid rgba(255,255,255,0.1); padding: 0 4rem; }
                .p-num { font-size: 5rem; font-family: 'Cormorant Garamond'; opacity: 0.2; }
                .p-img { height: 50%; width: 100%; object-fit: cover; opacity: 0.8; filter: grayscale(100%); transition: filter 0.5s; }
                .process-card:hover .p-img { filter: grayscale(0%); }
                .p-title { font-size: 2.5rem; font-family: 'Cormorant Garamond'; margin-top: 1rem; }

                /* FEATURED */
                .featured-section {
                    position: relative; min-height: 120vh; background-color: #FFFFFF;
                    color: var(--text-color); overflow: hidden; display: flex; flex-direction: column; justify-content: center; align-items: center;
                }
                .feat-bg-text {
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    font-family: 'Cormorant Garamond'; font-size: 25vw; line-height: 0.8;
                    color: rgba(0,0,0,0.03); white-space: nowrap; z-index: 0; pointer-events: none;
                }
                .feat-container {
                    position: relative; z-index: 1; width: 100%; max-width: 1600px;
                    padding: 0 var(--gutter); display: flex; align-items: center; justify-content: space-between;
                }
                .feat-left { width: 25%; padding-right: 2rem; }
                .feat-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.2em; color: var(--accent-color); margin-bottom: 2rem; display: block; position: relative; padding-left: 40px; }
                .feat-label::before { content: ''; position: absolute; left: 0; top: 50%; width: 30px; height: 1px; background: currentColor; }
                .feat-name { font-family: 'Cormorant Garamond'; font-size: 4rem; line-height: 1; margin-bottom: 2rem; color: #000; }
                .feat-desc { font-size: 0.95rem; line-height: 1.8; opacity: 0.8; margin-bottom: 3rem; color: #444; }
                .feat-img-wrap { width: 45%; height: 80vh; position: relative; z-index: 2; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.1); }
                .feat-img { width: 100%; height: 120%; object-fit: cover; }
                .feat-btn { display: inline-block; padding: 1rem 2.5rem; background: var(--text-color); color: #fff; text-transform: uppercase; letter-spacing: 0.2em; font-size: 0.75rem; cursor: pointer; transition: all 0.3s ease; border: 1px solid var(--text-color); }
                .feat-btn:hover { background: transparent; color: var(--text-color); }
                .feat-right { width: 20%; padding-left: 2rem; display: flex; flex-direction: column; justify-content: center; height: 60vh; }
                .feat-specs { border-top: 1px solid rgba(0,0,0,0.1); padding-top: 2rem; }
                .spec-row { display: flex; justify-content: space-between; margin-bottom: 1.5rem; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; }
                .spec-row span:first-child { opacity: 0.5; }
                .spec-row span:last-child { font-weight: 500; }
                .feat-price { font-family: 'Cormorant Garamond'; font-size: 3rem; margin-top: 3rem; display: block; color: var(--accent-color); }

                /* TEAM */
                .team-section { padding: 12rem var(--gutter); background-color: var(--bg-color); border-top: 1px solid var(--line-color); }
                .team-header { text-align: center; margin-bottom: 8rem; }
                .team-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4rem; }
                .team-member { display: flex; flex-direction: column; align-items: center; text-align: center; cursor: pointer; }
                .member-img-wrap { width: 100%; aspect-ratio: 3/4; overflow: hidden; margin-bottom: 2rem; position: relative; }
                .member-img { width: 100%; height: 100%; object-fit: cover; filter: grayscale(100%) contrast(1.1); transition: all 0.8s cubic-bezier(0.19, 1, 0.22, 1); }
                .team-member:hover .member-img { filter: grayscale(0%) contrast(1); transform: scale(1.05); }
                .member-name { font-family: 'Cormorant Garamond'; font-size: 2rem; margin: 0 0 0.5rem 0; }
                .member-role { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.15em; opacity: 0.5; }

                /* FOOTER */
                footer { 
                    position: relative; 
                    z-index: 50; 
                    background-color: #141414 !important; 
                    color: #F4F2EE !important; 
                    padding: 5rem var(--gutter); 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: flex-end; 
                    min-height: 50vh; 
                }
                .footer-cta h2 { font-family: 'Cormorant Garamond'; font-size: 6vw; margin: 0; line-height: 1; cursor: pointer; transition: color 0.3s; color: #F4F2EE; }
                .footer-cta h2:hover { color: var(--accent-color); }
                .footer-links { display: flex; gap: 2rem; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.5; color: #F4F2EE; }

                @media (max-width: 768px) {
                    .manifesto { flex-direction: column; } .manifesto::after { display: none; }
                    .manifesto-sticky { position: relative; width: 100%; height: auto; padding: 4rem var(--gutter); top: 0; }
                    .manifesto-scroll { width: 100%; padding: 0 var(--gutter) 4rem; }
                    .process-card { width: 80vw; } .feat-container { flex-direction: column; gap: 4rem; }
                    .feat-left, .feat-img-wrap, .feat-right { width: 100%; padding: 0; height: auto; }
                    .team-grid { grid-template-columns: 1fr; } .hero-title { font-size: 15vw; }
                }
            `}</style>

            {/* CURSOR */}
            <div id="cursor" ref={cursorRef}></div>

            {/* 3D BACKGROUND */}
            <div id="canvas-wrap" ref={canvasRef}></div>

            {/* NAV CUSTOM (LOGO + MENU HAMBURGER) */}
            <nav className="home-nav">
                <div className="logo magnetic" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <Hammer size={24} className="text-[#141414]" />
                    Tous à Table
                </div>
                <div 
                    className="menu-trigger magnetic" 
                    onClick={() => setIsMenuOpen(true)}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                    <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Menu</span>
                    <Menu size={24} />
                </div>
            </nav>

            {/* MENU OVERLAY */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 200, 
                visibility: isMenuOpen ? 'visible' : 'hidden', pointerEvents: isMenuOpen ? 'all' : 'none',
                transition: 'visibility 0.7s'
            }}>
                <div onClick={() => setIsMenuOpen(false)} style={{
                    position: 'absolute', inset: 0, background: 'rgba(20,20,20,0.4)', backdropFilter: 'blur(10px)',
                    opacity: isMenuOpen ? 1 : 0, transition: 'opacity 0.7s'
                }}></div>
                <div style={{
                    position: 'absolute', right: 0, top: 0, bottom: 0, width: 'min(100%, 500px)',
                    backgroundColor: '#F4F2EE', padding: '4rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    transform: isMenuOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.7s cubic-bezier(0.19, 1, 0.22, 1)'
                }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5rem' }}>
                            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.5 }}>Navigation</span>
                            <X size={24} onClick={() => setIsMenuOpen(false)} style={{ cursor: 'pointer' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <span className="magnetic" onClick={onEnterMarketplace} style={{ fontFamily: 'Cormorant Garamond', fontSize: '3rem', cursor: 'pointer', lineHeight: 1 }}>Marketplace</span>
                            <span className="magnetic" onClick={() => scrollToSection('featured')} style={{ fontFamily: 'Cormorant Garamond', fontSize: '3rem', cursor: 'pointer', lineHeight: 1 }}>Pièce du Mois</span>
                        </div>
                    </div>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.4 }}>Tous à Table © 2024</div>
                </div>
            </div>

            {/* HERO */}
            <section className="hero">
                <h1 className="hero-title">
                    <span>Matière</span>
                    <span style={{ marginLeft: '10vw', color: 'var(--accent-color)' }}>Vivante</span>
                </h1>
                <div className="hero-footer">
                    <span>Est. 2024 — France</span>
                    <span>Restauration de Mobilier d'Art</span>
                    <span style={{ cursor: 'pointer', borderBottom: '1px solid currentColor' }} onClick={() => scrollToSection('manifesto')}>Découvrir ↓</span>
                </div>
            </section>

            {/* MANIFESTO */}
            <section className="manifesto" id="manifesto">
                <div className="manifesto-sticky">
                    <h2 className="lead-text">Nous ne restaurons pas seulement des objets. <br />Nous prolongeons des histoires.</h2>
                    <p className="sub-text">Dans notre atelier normand, chaque pièce est diagnostiquée, déconstruite puis réassemblée. Le respect de la patine est notre signature.</p>
                </div>
                <div className="manifesto-scroll">
                    <div className="image-block">
                        <img src="https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=1000" alt="Atelier" onLoad={() => ScrollTrigger.refresh()} />
                        <div className="caption">01. L'Essence du Bois</div>
                    </div>
                    <div className="image-block">
                        <img src="https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1000" alt="Outils" onLoad={() => ScrollTrigger.refresh()} />
                        <div className="caption">02. Le Geste Précis</div>
                    </div>
                    <div className="image-block">
                        <img src="https://images.unsplash.com/photo-1622372738946-62e02505feb3?q=80&w=1000" alt="Finition" onLoad={() => ScrollTrigger.refresh()} />
                        <div className="caption">03. La Patine du Temps</div>
                    </div>
                </div>
            </section>

            {/* PROCESS */}
            <section className="process-wrapper" id="process">
                <div className="process-container">
                    <div className="process-card" style={{ width: '25vw', justifyContent: 'center', border: 'none' }}>
                        <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '4rem', lineHeight: 1 }}>Notre<br />Méthode</h2>
                    </div>
                    <div className="process-card"><span className="p-num">I</span><img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600" className="p-img" alt="Diag" /><h3 className="p-title">Diagnostic</h3></div>
                    <div className="process-card"><span className="p-num">II</span><img src="https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?q=80&w=600" className="p-img" alt="Greffe" /><h3 className="p-title">Greffe</h3></div>
                    <div className="process-card"><span className="p-num">III</span><img src="https://images.unsplash.com/photo-1565538810643-b5bdb714032a?q=80&w=600" className="p-img" alt="Finition" /><h3 className="p-title">Finition</h3></div>
                </div>
            </section>

            {/* FEATURED */}
            <section className="featured-section" id="featured">
                <div className="feat-bg-text">VOLTAIRE</div>
                <div className="feat-container">
                    <div className="feat-left">
                        <span className="feat-label">Pièce du Mois</span>
                        <h2 className="feat-name">Le Fauteuil<br />Voltaire</h2>
                        <p className="feat-desc">Une restauration d'exception pour ce classique du XIXe siècle. Structure en noyer massif sculpté, dégarnie et refaite à l'ancienne.</p>
                        <div className="feat-btn magnetic" onClick={onEnterMarketplace}>Découvrir la pièce</div>
                    </div>
                    <div className="feat-img-wrap"><img src="https://images.unsplash.com/photo-1567016432779-094069958ea5?q=80&w=1200" className="feat-img" alt="Fauteuil Design" onLoad={() => ScrollTrigger.refresh()} /></div>
                    <div className="feat-right">
                        <div className="feat-specs">
                            <div className="spec-row"><span>Origine</span> <span>France, 1880</span></div>
                            <div className="spec-row"><span>Bois</span> <span>Noyer Massif</span></div>
                            <div className="spec-row"><span>Tissu</span> <span>Velours Gênes</span></div>
                            <div className="spec-row"><span>Finition</span> <span>Vernis Tampon</span></div>
                        </div>
                        <span className="feat-price">450 €</span>
                    </div>
                </div>
            </section>

            {/* TEAM */}
            <section className="team-section">
                <div className="team-header">
                    <span className="section-label" style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1rem', opacity: 0.5 }}>L'Équipe</span>
                    <h2 className="section-title" style={{ fontFamily: 'Cormorant Garamond', fontSize: '4rem', margin: 0 }}>Les Artisans</h2>
                </div>
                <div className="team-grid">
                    <div className="team-member magnetic-card">
                        <div className="member-img-wrap"><img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600" className="member-img" alt="Artisan" /></div>
                        <h3 className="member-name">Jean Lefebvre</h3><span className="member-role">Maître Ébéniste</span>
                    </div>
                    <div className="team-member magnetic-card">
                        <div className="member-img-wrap"><img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=600" className="member-img" alt="Artisan" /></div>
                        <h3 className="member-name">Sophie Martin</h3><span className="member-role">Tapissière</span>
                    </div>
                    <div className="team-member magnetic-card">
                        <div className="member-img-wrap"><img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600" className="member-img" alt="Artisan" /></div>
                        <h3 className="member-name">Thomas Dubois</h3><span className="member-role">Finisseur</span>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer>
                <div className="footer-cta">
                    <span className="section-label" style={{ color: '#666' }}>Contact</span>
                    <h2 onClick={() => window.location.href='mailto:contact@tousatable.fr'}>Parlons de<br />Votre Projet</h2>
                </div>
                <div className="footer-links">
                    <span>Instagram</span>
                    <span>Email</span>
                </div>
            </footer>
        </div>
    );
};

export default HomeView;