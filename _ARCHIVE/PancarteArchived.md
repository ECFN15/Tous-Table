# Archive - Code de la Pancarte 3D (Marketplace)

Ce fichier contient le code retiré de `WarmAmbienceBackground.jsx` relatif à la pancarte 3D "Atelier Normand / Tous à Table".
Ce composant générait une texture de bois procédurale avec des incrustations dorées et affichait une enseigne suspendue flottante.

## 1. Génération de la Texture (Canvas 2D)

Cette section générait la texture de bois chêne/or avec les textes et icônes.

```javascript
// A. WOOD TEXTURE (Procedural)
const woodTex = (() => {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 256;
    const ctx = c.getContext('2d');
    // Base - High Contrast Oak
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, '#5d4037'); g.addColorStop(1, '#3e2723');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1024, 256);
    // Grain - Deep grooves
    ctx.globalAlpha = 0.25; ctx.strokeStyle = '#100500'; ctx.lineWidth = 3;
    for (let i = 0; i < 150; i++) {
        ctx.beginPath();
        const y = Math.random() * 256;
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(300, y + Math.random() * 100 - 50, 700, y + Math.random() * 100 - 50, 1024, y);
        ctx.stroke();
    }
    // Branding - Burnt & Carved
    ctx.globalAlpha = 1.0;

    // Texture for the inlay (GOLD / BRASS) - HIGH CONTRAST METAL
    const goldGrad = ctx.createLinearGradient(0, 0, 1024, 256); // Diagonal gradient
    goldGrad.addColorStop(0, '#8a6e3e');   // Shadowy bronze
    goldGrad.addColorStop(0.15, '#d4af37'); // Classic gold
    goldGrad.addColorStop(0.25, '#fef9c3'); // White-hot shine
    goldGrad.addColorStop(0.35, '#d4af37'); // Classic gold
    goldGrad.addColorStop(0.5, '#8a6e3e');   // Shadowy bronze
    goldGrad.addColorStop(0.65, '#d4af37'); // Classic gold
    goldGrad.addColorStop(0.75, '#fef9c3'); // White-hot shine
    goldGrad.addColorStop(0.85, '#d4af37'); // Classic gold
    goldGrad.addColorStop(1, '#8a6e3e');   // Shadowy bronze

    // 0. REFINED INNER FRAME (Double gold line)
    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, 984, 216);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.strokeRect(18, 18, 988, 220); // Fine highlight edge

    // 1. "TOUS À TABLE"
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    // "Plus raffiné": Reduced size (90->64px) and weight (900->Bold)
    ctx.font = 'bold 64px "Courier New", monospace';

    // Subtle Drop Shadow (clean, no heavy blur)
    ctx.shadowColor = 'rgba(0,0,0, 0.4)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetY = 2;

    // A. Dark Stroke (Thinner for elegance)
    ctx.lineWidth = 1.0;
    ctx.strokeStyle = 'rgba(0,0,0, 0.5)';
    ctx.strokeText("TOUS À TABLE", 512, 98); // Centering Y: 98

    // B. Gold Fill
    ctx.fillStyle = goldGrad;
    ctx.fillText("TOUS À TABLE", 512, 98);

    // 2. ICON: Metal Plate with Engraved Hammer (To the LEFT)
    ctx.save();
    ctx.translate(150, 128); // Y=128 (True vertical center of 256px canvas)

    // A. The Metal Plate (Gold Fill)
    const badgeSize = 96; // BIGGER (was 64)
    const r = 14;

    // Shadow for the plate
    ctx.shadowColor = 'rgba(0,0,0, 0.6)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;

    ctx.fillStyle = goldGrad;
    ctx.beginPath();
    ctx.roundRect(-badgeSize / 2, -badgeSize / 2, badgeSize, badgeSize, r);
    ctx.fill();

    // Remove shadow for internal details
    ctx.shadowColor = 'transparent';

    // B. Rivets (Screws) in corners
    ctx.fillStyle = 'rgba(60, 40, 30, 0.8)'; // Dark rusty
    const screwOffset = 36;
    const screwRadio = 3;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x * screwOffset, y * screwOffset, screwRadio, 0, Math.PI * 2);
        ctx.fill();
    });

    // C. The Hammer (Engraved / Stamped)
    ctx.fillStyle = 'rgba(45, 20, 10, 0.9)';

    ctx.rotate(-Math.PI / 4);
    ctx.beginPath();

    // Handle (Thick - Solid)
    ctx.rect(-5, -6, 10, 36);

    // Head (Solid Block)
    ctx.rect(-21, -27, 42, 21);

    ctx.fill();

    // Add fine detail line (Light Highlight)
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -6); ctx.lineTo(0, 30); // Handle highlight
    ctx.moveTo(-21, -27); ctx.lineTo(21, -27); // Head highlight
    ctx.stroke();

    ctx.restore();

    // 3. ICON RIGHT: Metal Plate with Hand Saw (Geometric / Flaticon Style)
    ctx.save();
    ctx.translate(874, 128); // Symmetrical to Left (150) -> 1024 - 150 = 874

    // A. The Metal Plate (Identical properties)
    // badgeSize = 96, r = 14

    // Shadow
    ctx.shadowColor = 'rgba(0,0,0, 0.6)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;

    ctx.fillStyle = goldGrad;
    ctx.beginPath();
    ctx.roundRect(-48, -48, 96, 96, 14);
    ctx.fill();

    ctx.shadowColor = 'transparent';

    // B. Rivets
    ctx.fillStyle = 'rgba(60, 40, 30, 0.8)';
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x * 36, y * 36, 3, 0, Math.PI * 2);
        ctx.fill();
    });

    // C. Hand Saw Icon (Geometric / Flaticon Style)
    // Dark Burnt color
    ctx.fillStyle = 'rgba(45, 20, 10, 0.9)';

    // Angle: Blade down-left, Handle up-right
    ctx.rotate(Math.PI / 6);

    ctx.beginPath();

    // --- BLADE ---
    // A simple Trapezoid with teeth
    // Spine
    ctx.moveTo(15, -12); // Start at handle
    ctx.lineTo(-35, -5); // Tip top (Tapered)

    // Front Tip
    ctx.lineTo(-35, 5);  // Tip bottom

    // Bottom Edge (TEETH - Sharp Zigzag)
    // Linear interpolation from Tip(-35, 5) to Heel(15, 20)
    const startX = -35; const startY = 5;
    const endX = 15; const endY = 20;
    const teeth = 8;

    const dx = (endX - startX) / teeth;
    const dy = (endY - startY) / teeth;

    for (let i = 0; i < teeth; i++) {
        const cx = startX + dx * i;
        const cy = startY + dy * i;
        // Tooth: Vertical down -> Diagonal up
        ctx.lineTo(cx + dx * 0.2, cy + dy + 2); // Point
        ctx.lineTo(cx + dx, cy + dy);         // Valley
    }

    // Close Blade at Handle
    ctx.lineTo(15, -12);
    ctx.fill();

    // --- HANDLE (Angular Geometric) ---
    // Distinct blocky shape wrapping the end
    ctx.beginPath();
    ctx.moveTo(15, -15); // Top-front corner
    ctx.lineTo(35, -15); // Top-back corner (flat)
    ctx.lineTo(42, -5);  // Angled back top
    ctx.lineTo(40, 20);  // Back edge down
    ctx.lineTo(25, 25);  // Bottom-back corner
    ctx.lineTo(15, 20);  // Bottom-front corner (Heel)
    ctx.lineTo(10, 5);   // Inner notch? 
    ctx.lineTo(15, -15); // Close
    ctx.fill();

    // --- HANDLE CUTOUT ---
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    // Upright rounded rect / Slot
    const slotX = 26;
    const slotY = -2;
    const slotW = 6;
    const slotH = 16;
    ctx.roundRect(slotX, slotY, slotW, slotH, 3);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    // --- HIGHLIGHTS ---
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Spine highlight
    ctx.moveTo(15, -12);
    ctx.lineTo(-35, -5);
    ctx.stroke();
    // Handle highlight
    ctx.beginPath();
    ctx.moveTo(15, -15); ctx.lineTo(35, -15);
    ctx.stroke();

    ctx.restore();

    // 3. "Atelier Normand"
    ctx.font = 'bold italic 40px "Times New Roman", serif'; // Original font

    // Same crisp gold style
    ctx.strokeText("Atelier Normand", 512, 158); // Centering Y: 158
    ctx.fillStyle = goldGrad;
    ctx.fillText("Atelier Normand", 512, 158);

    // Clear shadows
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
})();
```

## 2. Construction de la Scène (Mesh & Groupe)

Code Three.js pour créer le panneau, le cadre doré et les cordes.

```javascript
// 2. THE SIGN (Midground Anchor)
const signScale = isMobile ? 0.53 : 1.0;
const signWidth = 10 * signScale;
const signHeight = 2.8 * signScale;
let signYBase = isMobile ? 9.6 : 5.5;

const signGroup = new THREE.Group();
signGroup.position.set(0, signYBase, 0);
signGroup.visible = window.innerWidth >= 1700; // Seulement visible sur grand écran
scene.add(signGroup);

const boxGeo = new THREE.PlaneGeometry(signWidth, signHeight);
const boxMat = new THREE.MeshStandardMaterial({
    map: woodTex,
    roughness: 0.6,
    metalness: 0.1,
    color: 0xffffff
});
const signMesh = new THREE.Mesh(boxGeo, boxMat);
signMesh.castShadow = true;
signMesh.receiveShadow = true;
signGroup.add(signMesh);

// --- PREMIUM GOLD FRAME ---
const frameThickness = 0.12 * signScale;
const framePadding = 0.02 * signScale;
const frameDepth = 0.15 * signScale;

const goldMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 1.0,
    roughness: 0.1,
    envMapIntensity: 1.5
});

// Top & Bottom Horizontal bars
const hBarGeo = new THREE.BoxGeometry(signWidth + (frameThickness * 2), frameThickness, frameDepth);
const topBar = new THREE.Mesh(hBarGeo, goldMat);
topBar.position.set(0, (signHeight / 2) + (frameThickness / 2) + framePadding, frameDepth / 2);
signGroup.add(topBar);

const bottomBar = new THREE.Mesh(hBarGeo, goldMat);
bottomBar.position.set(0, -(signHeight / 2) - (frameThickness / 2) - framePadding, frameDepth / 2);
signGroup.add(bottomBar);

// Left & Right Vertical bars
const vBarGeo = new THREE.BoxGeometry(frameThickness, signHeight + (framePadding * 2), frameDepth);
const leftBar = new THREE.Mesh(vBarGeo, goldMat);
leftBar.position.set(-(signWidth / 2) - (frameThickness / 2) - framePadding, 0, frameDepth / 2);
signGroup.add(leftBar);

const rightBar = new THREE.Mesh(vBarGeo, goldMat);
rightBar.position.set((signWidth / 2) + (frameThickness / 2) + framePadding, 0, frameDepth / 2);
signGroup.add(rightBar);

// Decorative Corner Rivets
const rivetGeo = new THREE.SphereGeometry(frameThickness * 0.6, 16, 16);
const rivetPositions = [
    [-(signWidth / 2 + frameThickness / 2 + framePadding), (signHeight / 2 + frameThickness / 2 + framePadding)],
    [(signWidth / 2 + frameThickness / 2 + framePadding), (signHeight / 2 + frameThickness / 2 + framePadding)],
    [-(signWidth / 2 + frameThickness / 2 + framePadding), -(signHeight / 2 + frameThickness / 2 + framePadding)],
    [(signWidth / 2 + frameThickness / 2 + framePadding), -(signHeight / 2 + frameThickness / 2 + framePadding)]
];

rivetPositions.forEach(([x, y]) => {
    const rivet = new THREE.Mesh(rivetGeo, goldMat);
    rivet.position.set(x, y, frameDepth);
    rivet.scale.set(1, 1, 0.4);
    signGroup.add(rivet);
});

// Ropes
const ropeMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.8 });
const ropeGeo = new THREE.CylinderGeometry(0.04, 0.04, 20);
const r1 = new THREE.Mesh(ropeGeo, ropeMat); r1.position.set(-signWidth * 0.45, 10, -0.1);
const r2 = new THREE.Mesh(ropeGeo, ropeMat); r2.position.set(signWidth * 0.45, 10, -0.1);
signGroup.add(r1); signGroup.add(r2);
```

## 3. Lumières (Glint & Rim)

```javascript
// Add a "Glint" light that moves around the frame
const glintLight = new THREE.PointLight(0xffffff, 5.0, 10);
glintLight.position.set(0, 0, 2);
signGroup.add(glintLight);

// Sign Rim Light (In main scene)
const spotLight = new THREE.SpotLight(0xfffae6, 3.0);
spotLight.position.set(-10, 10, 15);
spotLight.target = signMesh;
spotLight.castShadow = true;
scene.add(spotLight);
```

## 4. Animation

```javascript
// Inside animate() loop
signGroup.position.y = signYBase + Math.sin(time * 0.5) * 0.05;
signGroup.rotation.z = Math.sin(time * 0.25) * 0.015;
signGroup.rotation.x = Math.sin(time * 0.2) * 0.03;

// Animate Glint Light
if (glintLight) {
    const glintSpeed = 1.2;
    const glintRadiusX = (signWidth / 2) + frameThickness;
    const glintRadiusY = (signHeight / 2) + frameThickness;
    glintLight.position.x = Math.cos(time * glintSpeed) * glintRadiusX;
    glintLight.position.y = Math.sin(time * glintSpeed * 0.8) * glintRadiusY;
    glintLight.intensity = 5.0 + Math.sin(time * 2) * 2;
}
```

## 5. Gestion Responsive Spéciale

Un code complexe était utilisé pour ajuster le FOV afin de garder la pancarte à la même taille visuelle sur mobile.

```javascript
if (w < 768) {
    // Calcul de FOV pour verrouiller la taille horizontale
    const targetAspect = 9 / 16;
    const baseVFov = 45;
    const baseHFovRad = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(baseVFov) / 2) * targetAspect);
    const newVFovRad = 2 * Math.atan(Math.tan(baseHFovRad / 2) / camera.aspect);
    camera.fov = THREE.MathUtils.radToDeg(newVFovRad);

    // Repositionnement vertical (offset)
    const lookAtY = 4;
    const camZ = 20;
    const tiltAngle = Math.atan(lookAtY / camZ);
    const topEdgeAngle = tiltAngle + (newVFovRad / 2);
    const topEdgeY = camZ * Math.tan(topEdgeAngle);
    const desiredOffsetFromTop = 4.3;
    signYBase = topEdgeY - desiredOffsetFromTop;
}
```
