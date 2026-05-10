import React, { useEffect, useRef } from 'react';
import {
  Scene, PerspectiveCamera, WebGLRenderer,
  DirectionalLight, AmbientLight,
  TorusKnotGeometry, MeshBasicMaterial, Mesh
} from 'three';
import { isTouchDevice } from '../../utils/devicePerformance';

// WebGL stays visible on mobile, including low-power mobile.
// The expensive RAF loop runs only while the hero is visible.

const ThreeBackground = ({ onReady }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return undefined;

    window._pauseThree = false;
    const touchDevice = isTouchDevice();

    const scene = new Scene();
    const camera = new PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 18;

    const renderer = new WebGLRenderer({
      alpha: true,
      antialias: !touchDevice,
      powerPreference: touchDevice ? 'default' : 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(touchDevice ? 1 : Math.min(window.devicePixelRatio, 1.5));

    mountRef.current.appendChild(renderer.domElement);

    const light = new DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
    scene.add(new AmbientLight(0xffffff, 0.4));

    const geometry = new TorusKnotGeometry(4, 1.2, touchDevice ? 72 : 120, touchDevice ? 10 : 16, 2, 3);
    const material = new MeshBasicMaterial({
      color: 0x9C8268,
      wireframe: true,
      transparent: true,
      opacity: 0.09,
    });

    const mesh = new Mesh(geometry, material);
    if (window.innerWidth < 768) {
      mesh.scale.set(0.6, 0.6, 0.6);
    }
    scene.add(mesh);

    let animationId = 0;
    let resizeRaf = 0;
    let scrollRaf = 0;
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;
    let isRendering = false;

    const animate = () => {
      if (!isRendering) return;
      mesh.rotation.x += 0.0008;
      mesh.rotation.y += 0.0012;
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    const startRendering = () => {
      if (isRendering) return;
      isRendering = true;
      animationId = requestAnimationFrame(animate);
    };

    const stopRendering = () => {
      isRendering = false;
      if (animationId) cancelAnimationFrame(animationId);
      animationId = 0;
    };

    const setPaused = (nextPaused) => {
      const paused = Boolean(nextPaused);
      window._pauseThree = paused;

      if (paused || document.hidden) {
        stopRendering();
        return;
      }

      startRendering();
    };

    const shouldPauseForScroll = () => {
      const hero = document.querySelector('.hero-section');
      if (!hero) return window.scrollY > window.innerHeight * 0.85;
      return hero.getBoundingClientRect().bottom <= 0;
    };

    const updatePauseFromScroll = () => {
      scrollRaf = 0;
      setPaused(shouldPauseForScroll());
    };

    const schedulePauseUpdate = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(updatePauseFromScroll);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopRendering();
        return;
      }
      setPaused(shouldPauseForScroll());
    };

    const applyResize = () => {
      resizeRaf = 0;
      const nextWidth = window.innerWidth;
      const nextHeight = window.innerHeight;

      // Mobile browser chrome can fire resize while scrolling. Ignore height-only
      // shifts so WebGL does not call setSize during native momentum.
      if (touchDevice && Math.abs(nextWidth - lastWidth) < 2 && Math.abs(nextHeight - lastHeight) < 96) {
        return;
      }

      lastWidth = nextWidth;
      lastHeight = nextHeight;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);

      if (window.innerWidth < 768) {
        mesh.scale.set(0.6, 0.6, 0.6);
      } else {
        mesh.scale.set(1, 1, 1);
      }

      renderer.render(scene, camera);
    };

    const handleResize = () => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(applyResize);
    };

    window.__setThreePaused = setPaused;
    renderer.render(scene, camera);
    onReady?.();
    setPaused(shouldPauseForScroll());

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', schedulePauseUpdate, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', schedulePauseUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      stopRendering();
      if (window.__setThreePaused === setPaused) delete window.__setThreePaused;
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full" />;
};

export default ThreeBackground;
