import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const WarmAmbienceBackground = ({ darkMode }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // --- CONFIG ---
        const COUNT = 1500;
        const COLORS = darkMode
            ? [0xffffff, 0xffd700, 0x8B4513] // White, Gold, SaddleBrown
            : [0x1a1a1a, 0xdaa520, 0xA0522D]; // Dark Grey, GoldenRod, Sienna

        // --- SCENE SETUP ---
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(darkMode ? 0x111111 : 0xfaf9f6, 0.002);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.z = 30;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        // --- PARTICLES (INSTANCED MESH) ---
        // Abstract geometry: A mix of tiny circles (dust) and thin lines (wood shavings/fibers)
        // We'll use a simple CircleGeometry for highly optimized smooth look
        const geometry = new THREE.CircleGeometry(0.15, 6);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.6,
            depthWrite: false, // Important for transparency
            blending: THREE.AdditiveBlending // Glowy effect
        });

        const mesh = new THREE.InstancedMesh(geometry, material, COUNT);

        // Data arrays
        const dummy = new THREE.Object3D();
        const positions = new Float32Array(COUNT * 3);
        const velocities = new Float32Array(COUNT * 3); // x, y, speed
        const colors = new Float32Array(COUNT * 3);
        const timeOffsets = new Float32Array(COUNT);

        const colorObjs = COLORS.map(c => new THREE.Color(c));

        for (let i = 0; i < COUNT; i++) {
            // Random Position (Fill screen + buffer)
            const x = (Math.random() - 0.5) * 100;
            const y = (Math.random() - 0.5) * 60;
            const z = (Math.random() - 0.5) * 40;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            // Velocity (Flow direction)
            // General flow upwards/right like creative sparks
            velocities[i * 3] = (Math.random() * 0.02) + 0.005; // X drift
            velocities[i * 3 + 1] = (Math.random() * 0.05) + 0.01; // Y rise
            velocities[i * 3 + 2] = Math.random() * 0.05 + 0.5; // Scale base

            // Attributes
            timeOffsets[i] = Math.random() * Math.PI * 2;

            // Color Palette Assignment
            const color = colorObjs[Math.floor(Math.random() * COLORS.length)];
            mesh.setColorAt(i, color);

            // Init Matrix (Needed once)
            dummy.position.set(x, y, z);
            dummy.scale.setScalar(velocities[i * 3 + 2]); // Use Z velocity slot for scale
            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);
        }

        mesh.instanceMatrix.needsUpdate = true;
        mesh.instanceColor.needsUpdate = true;
        scene.add(mesh);

        // --- INTERACTION ---
        const mouse = new THREE.Vector2(0, 0);
        const targetMouse = new THREE.Vector2(0, 0);

        const handleMouseMove = (e) => {
            // Normalize mouse -1 to 1
            targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', handleMouseMove);


        // --- ANIMATION LOOP ---
        const clock = new THREE.Clock();
        let frameId;

        const animate = () => {
            frameId = requestAnimationFrame(animate);
            const time = clock.getElapsedTime();
            const deltaTime = clock.getDelta();

            // Smooth Mouse Lerp
            mouse.lerp(targetMouse, 0.05);

            // Update Particles
            for (let i = 0; i < COUNT; i++) {
                const idx = i * 3;

                // 1. Base Movement (Flow)
                let x = positions[idx];
                let y = positions[idx + 1];
                let z = positions[idx + 2];

                const speedX = velocities[idx];
                const speedY = velocities[idx + 1];
                const scaleBase = velocities[idx + 2];
                const phase = timeOffsets[i];

                // Complex organic path using noise-like sin/cos sums
                x += speedX + Math.sin(time * 0.5 + phase) * 0.02;
                y += speedY + Math.cos(time * 0.3 + x * 0.1) * 0.01;

                // 2. Mouse Interaction (Repulsion/Attraction Field)
                // Project mouse to World Space somewhat (approximation)
                const mouseX = mouse.x * 50;
                const mouseY = mouse.y * 30;
                const dist = Math.sqrt((x - mouseX) ** 2 + (y - mouseY) ** 2);

                // "Magnetic" Swirl effect around mouse
                if (dist < 15) {
                    const force = (15 - dist) / 15;
                    const angle = Math.atan2(y - mouseY, x - mouseX);
                    // Spiral push
                    x += Math.cos(angle) * force * 0.5;
                    y += Math.sin(angle) * force * 0.5;
                }

                // 3. Loop Boundaries
                if (y > 35) y = -35;
                if (x > 55) x = -55;
                if (x < -55) x = 55;

                // Store Updated Pos
                positions[idx] = x;
                positions[idx + 1] = y;

                // Update Matrix
                dummy.position.set(x, y, z);

                // Breathing Scale (Alive feeling)
                const scalePulse = Math.sin(time * 2 + phase) * 0.2 + 1;
                dummy.scale.setScalar(scaleBase * scalePulse);

                // Subtle Rotation (Sparkle)
                dummy.rotation.z += 0.01 * scaleBase;

                dummy.updateMatrix();
                mesh.setMatrixAt(i, dummy.matrix);
            }

            mesh.instanceMatrix.needsUpdate = true;

            // Gentle Camera Float (Parallax)
            camera.position.x += (mouse.x * 2 - camera.position.x) * 0.02;
            camera.position.y += (mouse.y * 2 - camera.position.y) * 0.02;
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            containerRef.current?.removeChild(renderer.domElement);
            renderer.dispose();
            geometry.dispose();
            material.dispose();
        };
    }, [darkMode]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-0 pointer-events-none"
            style={{
                opacity: darkMode ? 0.3 : 0.5, // Subtle back layer
                background: 'transparent'
            }}
        />
    );
};

export default WarmAmbienceBackground;
