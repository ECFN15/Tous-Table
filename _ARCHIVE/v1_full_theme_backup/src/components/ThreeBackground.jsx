import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    
    // Reset pause state on mount
    window._pauseThree = false;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    
    // Append to our local ref, not the parent's
    mountRef.current.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    const geometry = new THREE.TorusKnotGeometry(4, 1.2, 120, 16, 2, 3);
    const material = new THREE.MeshBasicMaterial({
      color: 0x9C8268,
      wireframe: true,
      transparent: true,
      opacity: 0.09
    });

    const mesh = new THREE.Mesh(geometry, material);

    // ADJUST: Scale down for mobile (initial)
    if (window.innerWidth < 768) {
      mesh.scale.set(0.6, 0.6, 0.6);
    }

    scene.add(mesh);

    let animationId;
    const animate = () => {
      // OPTIM: Pause rendering if not in view to save GPU
      if (window._pauseThree) {
        animationId = requestAnimationFrame(animate);
        return;
      }
      mesh.rotation.x += 0.0008;
      mesh.rotation.y += 0.0012;
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);

      // ADJUST: Reactive scale on resize
      if (window.innerWidth < 768) {
        mesh.scale.set(0.6, 0.6, 0.6);
      } else {
        mesh.scale.set(1, 1, 1);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (mountRef.current && renderer.domElement) {
        // Safe check in case component unmounted
        if (mountRef.current.contains(renderer.domElement)) {
          mountRef.current.removeChild(renderer.domElement);
        }
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full" />;
};

export default ThreeBackground;
