import * as THREE from 'three';

interface BuildingItem {
  group: THREE.Group;
  mesh: THREE.Mesh;
  edges: THREE.LineSegments;
  checks: THREE.LineSegments;
  cornerLight?: THREE.LineSegments;
  basePinkBorder?: THREE.Line;
  x: number;
  z: number;
  w: number;
  h: number;
  d: number;
  isFrontRow: boolean;
}

export class World {
  public group: THREE.Group;
  public trackWidth: number = 10.0; // 5 lanes of width 2
  public trackLength: number = 320.0;

  private trackMesh: THREE.Mesh;
  private trackMaterial: THREE.MeshBasicMaterial;
  private trackGridTexture: THREE.CanvasTexture;

  // Solid obsidian skyscraper core materials
  private frontGlassMat: THREE.MeshBasicMaterial;
  private backGlassMat: THREE.MeshBasicMaterial;

  // Razor-sharp vector line materials for the checks & edges
  private frontCheckMat: THREE.LineBasicMaterial;
  private frontEdgeMat: THREE.LineBasicMaterial;
  private backCheckMat: THREE.LineBasicMaterial;
  private backEdgeMat: THREE.LineBasicMaterial;
  private cornerPillarMat: THREE.LineBasicMaterial;
  private neonPinkBorderMat: THREE.LineBasicMaterial;

  private sunMesh: THREE.Mesh;
  private stars: THREE.Points;

  private buildings: BuildingItem[] = [];

  constructor() {
    this.group = new THREE.Group();

    // 1. Digital Grid Highway: Electric Cyan (#00E5FF) on dark black-purple (#05020D)
    this.trackGridTexture = this.createTrackTexture(128, '#00E5FF', '#05020D', 5);
    this.trackGridTexture.repeat.set(5, this.trackLength / 2);
    this.trackGridTexture.wrapS = THREE.RepeatWrapping;
    this.trackGridTexture.wrapT = THREE.RepeatWrapping;

    const trackGeom = new THREE.PlaneGeometry(this.trackWidth, this.trackLength);
    this.trackMaterial = new THREE.MeshBasicMaterial({
      map: this.trackGridTexture,
      depthWrite: true,
      side: THREE.DoubleSide,
    });
    this.trackMesh = new THREE.Mesh(trackGeom, this.trackMaterial);
    this.trackMesh.rotation.x = -Math.PI / 2;
    this.trackMesh.position.set(0, 0, -this.trackLength / 2 + 15);
    this.group.add(this.trackMesh);

    // Glowing Cyan Highway Rails along edges (at x = -5 and x = +5)
    const railMat = new THREE.LineBasicMaterial({
      color: 0x00E5FF,
      linewidth: 3,
    });
    const leftRailPoints = [
      new THREE.Vector3(-this.trackWidth / 2, 0.06, 15),
      new THREE.Vector3(-this.trackWidth / 2, 0.06, -this.trackLength + 15),
    ];
    const rightRailPoints = [
      new THREE.Vector3(this.trackWidth / 2, 0.06, 15),
      new THREE.Vector3(this.trackWidth / 2, 0.06, -this.trackLength + 15),
    ];
    this.group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(leftRailPoints), railMat));
    this.group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(rightRailPoints), railMat));

    // Neon Pink Border Material
    this.neonPinkBorderMat = new THREE.LineBasicMaterial({
      color: 0xFF2BD6,
      linewidth: 3.5,
    });

    // Glowing Neon Pink Borders running below the two side buildings along both canyon sides
    const leftPinkBorderPts = [
      new THREE.Vector3(-5.75, 0.08, 15),
      new THREE.Vector3(-5.75, 0.08, -this.trackLength + 15),
    ];
    const rightPinkBorderPts = [
      new THREE.Vector3(5.75, 0.08, 15),
      new THREE.Vector3(5.75, 0.08, -this.trackLength + 15),
    ];
    this.group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(leftPinkBorderPts), this.neonPinkBorderMat));
    this.group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(rightPinkBorderPts), this.neonPinkBorderMat));

    // Neon pink glowing base ribbon strip directly below the two side buildings
    const pinkStripGeom = new THREE.PlaneGeometry(0.35, this.trackLength);
    const pinkStripMat = new THREE.MeshBasicMaterial({
      color: 0xFF2BD6,
      side: THREE.DoubleSide,
    });
    const leftPinkStrip = new THREE.Mesh(pinkStripGeom, pinkStripMat);
    leftPinkStrip.rotation.x = -Math.PI / 2;
    leftPinkStrip.position.set(-5.75, 0.04, -this.trackLength / 2 + 15);
    this.group.add(leftPinkStrip);

    const rightPinkStrip = new THREE.Mesh(pinkStripGeom, pinkStripMat);
    rightPinkStrip.rotation.x = -Math.PI / 2;
    rightPinkStrip.position.set(5.75, 0.04, -this.trackLength / 2 + 15);
    this.group.add(rightPinkStrip);

    // 2. Skyscraper Materials
    // Solid obsidian glass cores (blocks background, gives high contrast for checks)
    this.frontGlassMat = new THREE.MeshBasicMaterial({
      color: 0x03010b,
      depthWrite: true,
    });
    this.backGlassMat = new THREE.MeshBasicMaterial({
      color: 0x050114,
      depthWrite: true,
    });

    // Front row checks & edges: Electric Cyan (#00E5FF)
    this.frontEdgeMat = new THREE.LineBasicMaterial({ color: 0x00E5FF, linewidth: 2.5 });
    this.frontCheckMat = new THREE.LineBasicMaterial({ color: 0x00D9F5, linewidth: 1.8 });

    // Backdrop row checks & edges: Deep Violet (#6C2BFF)
    this.backEdgeMat = new THREE.LineBasicMaterial({ color: 0x6C2BFF, linewidth: 1.8 });
    this.backCheckMat = new THREE.LineBasicMaterial({ color: 0x5622D9, linewidth: 1.2 });

    // Bright vertical neon pillar for the roadside corner of front buildings
    this.cornerPillarMat = new THREE.LineBasicMaterial({
      color: 0x00E5FF,
      linewidth: 3.5,
    });

    // 3. Horizon Synthwave Sun: Magenta (#FF2BD6) and Violet (#6C2BFF)
    const sunTexture = this.createSynthwaveSunTexture(512);
    const sunGeom = new THREE.PlaneGeometry(42, 42);
    const sunMat = new THREE.MeshBasicMaterial({
      map: sunTexture,
      transparent: true,
      depthWrite: false,
    });
    this.sunMesh = new THREE.Mesh(sunGeom, sunMat);
    this.sunMesh.position.set(0, 14, -260);
    this.group.add(this.sunMesh);

    // 4. Subtle Distant Starfield
    const starGeom = new THREE.BufferGeometry();
    const starCount = 350;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 320;
      starPositions[i * 3 + 1] = Math.random() * 90 + 5;
      starPositions[i * 3 + 2] = -Math.random() * 260 - 40;
    }
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x8F6BFF,
      size: 0.75,
      transparent: true,
      opacity: 0.55,
    });
    this.stars = new THREE.Points(starGeom, starMat);
    this.group.add(this.stars);

    // 5. Procedural Continuous Skyscraper Canyon with Exact Check Design
    this.initCanyonBuildings();
  }

  private createTrackTexture(size: number, lineColor: string, bgColor: string, strokeWidth: number): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = strokeWidth * 2;
    ctx.globalAlpha = 0.3;
    ctx.strokeRect(0, 0, size, size);

    ctx.globalAlpha = 1.0;
    ctx.lineWidth = strokeWidth;
    ctx.strokeRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }

  private createSynthwaveSunTexture(size: number): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.42;

    const grad = ctx.createLinearGradient(0, cy - radius, 0, cy + radius);
    grad.addColorStop(0, '#FF2BD6');
    grad.addColorStop(0.55, '#D917B8');
    grad.addColorStop(1, '#6C2BFF');

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.globalCompositeOperation = 'destination-out';
    const lines = 7;
    for (let i = 1; i <= lines; i++) {
      const y = cy + (radius * (i / (lines + 1))) * 0.95;
      const stripeHeight = 4 + i * 2.8;
      ctx.fillRect(0, y, size, stripeHeight);
    }
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.15);
    glowGrad.addColorStop(0, 'rgba(255, 43, 214, 0.35)');
    glowGrad.addColorStop(1, 'rgba(108, 43, 255, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    return new THREE.CanvasTexture(canvas);
  }

  /**
   * Generates razor-sharp 3D check grid lines (floor bands and vertical window mullions)
   * that match the exact check design shown in the reference screenshot!
   */
  private createBuildingCheckLinesGeometry(w: number, h: number, d: number, checkSize: number = 2.4): THREE.BufferGeometry {
    const points: THREE.Vector3[] = [];
    const halfW = w / 2;
    const halfH = h / 2;
    const halfD = d / 2;

    // 1. Horizontal Floor Check Rings
    for (let y = -halfH + checkSize; y < halfH - checkSize * 0.3; y += checkSize) {
      // 4 perimeter lines around the skyscraper at floor height y
      points.push(new THREE.Vector3(-halfW, y, -halfD), new THREE.Vector3(halfW, y, -halfD));
      points.push(new THREE.Vector3(halfW, y, -halfD), new THREE.Vector3(halfW, y, halfD));
      points.push(new THREE.Vector3(halfW, y, halfD), new THREE.Vector3(-halfW, y, halfD));
      points.push(new THREE.Vector3(-halfW, y, halfD), new THREE.Vector3(-halfW, y, -halfD));
    }

    // 2. Vertical Window Check Lines on Front & Back faces (width faces)
    for (let x = -halfW + checkSize; x < halfW - checkSize * 0.3; x += checkSize) {
      // Front face (+Z)
      points.push(new THREE.Vector3(x, -halfH, halfD), new THREE.Vector3(x, halfH, halfD));
      // Back face (-Z)
      points.push(new THREE.Vector3(x, -halfH, -halfD), new THREE.Vector3(x, halfH, -halfD));
    }

    // 3. Vertical Window Check Lines on Left & Right faces (road-facing canyon faces)
    for (let z = -halfD + checkSize; z < halfD - checkSize * 0.3; z += checkSize) {
      // Left face (-X)
      points.push(new THREE.Vector3(-halfW, -halfH, z), new THREE.Vector3(-halfW, halfH, z));
      // Right face (+X)
      points.push(new THREE.Vector3(halfW, -halfH, z), new THREE.Vector3(halfW, halfH, z));
    }

    return new THREE.BufferGeometry().setFromPoints(points);
  }

  /**
   * Build the continuous towering skyscraper canyon bordering both sides of the track
   * with the exact check grid design from the screenshot!
   */
  private initCanyonBuildings(): void {
    // 1. Front Row (Highway Canyon): Closely borders the track at x = ±5.8
    const frontCountPerSide = 24;
    const zStep = 12.5;

    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < frontCountPerSide; i++) {
        const z = 15 - i * zStep;
        // Varied width and height for natural cyber skyscraper skyline
        const w = 4.8 + (i % 3) * 1.4;
        const h = 40.0 + ((i * 7) % 35); // heights between 40 and 75 units
        const d = 8.5;
        // Inner face flush at x = ±5.8
        const x = side * (5.8 + w / 2);

        this.spawnBuilding(x, z, w, h, d, true, side);
      }
    }

    // 2. Backdrop Row (City Skyline): Behind the front row at x = ±15.0
    const backCountPerSide = 14;
    const backZStep = 20.0;

    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < backCountPerSide; i++) {
        const z = 15 - i * backZStep;
        const w = 7.5 + (i % 2) * 2.5;
        const h = 65.0 + ((i * 11) % 45); // towering heights between 65 and 110 units
        const d = 14.0;
        const x = side * (15.0 + w / 2);

        this.spawnBuilding(x, z, w, h, d, false, side);
      }
    }
  }

  private spawnBuilding(
    x: number,
    z: number,
    w: number,
    h: number,
    d: number,
    isFrontRow: boolean,
    side: number
  ): void {
    const group = new THREE.Group();

    // 1. Solid Obsidian Core Box
    const geom = new THREE.BoxGeometry(w, h, d);
    const glassMat = isFrontRow ? this.frontGlassMat : this.backGlassMat;
    const mesh = new THREE.Mesh(geom, glassMat);
    mesh.position.y = h / 2 - 0.5;
    group.add(mesh);

    // 2. Glowing Outer Box Edges
    const edgesGeom = new THREE.EdgesGeometry(geom);
    const edgeMat = isFrontRow ? this.frontEdgeMat : this.backEdgeMat;
    const edges = new THREE.LineSegments(edgesGeom, edgeMat);
    edges.position.y = h / 2 - 0.5;
    group.add(edges);

    // 3. Exact 3D Window Check Grid (Horizontal floor lines + vertical mullions)
    const checkGeom = this.createBuildingCheckLinesGeometry(w, h, d, 2.4);
    const checkMat = isFrontRow ? this.frontCheckMat : this.backCheckMat;
    const checks = new THREE.LineSegments(checkGeom, checkMat);
    checks.position.y = h / 2 - 0.5;
    group.add(checks);

    let cornerLight: THREE.LineSegments | undefined;

    // 4. For front-row buildings: signature bright vertical neon pillar on the roadside corner
    if (isFrontRow) {
      const innerCornerX = side < 0 ? w / 2 : -w / 2;
      const cornerPts = [
        new THREE.Vector3(innerCornerX, -0.5, d / 2),
        new THREE.Vector3(innerCornerX, h - 0.5, d / 2),
        new THREE.Vector3(innerCornerX, -0.5, -d / 2),
        new THREE.Vector3(innerCornerX, h - 0.5, -d / 2),
      ];
      const cornerGeom = new THREE.BufferGeometry().setFromPoints(cornerPts);
      cornerLight = new THREE.LineSegments(cornerGeom, this.cornerPillarMat);
      group.add(cornerLight);
    }

    // 5. Glowing Neon Pink Border along the bottom/base below the building
    let basePinkBorder: THREE.Line | undefined;
    if (isFrontRow) {
      const baseBorderGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-w / 2, 0.12, -d / 2),
        new THREE.Vector3(w / 2, 0.12, -d / 2),
        new THREE.Vector3(w / 2, 0.12, d / 2),
        new THREE.Vector3(-w / 2, 0.12, d / 2),
        new THREE.Vector3(-w / 2, 0.12, -d / 2),
      ]);
      basePinkBorder = new THREE.Line(baseBorderGeom, this.neonPinkBorderMat);
      group.add(basePinkBorder);
    }

    group.position.set(x, 0, z);
    this.group.add(group);

    this.buildings.push({
      group,
      mesh,
      edges,
      checks,
      cornerLight,
      basePinkBorder,
      x,
      z,
      w,
      h,
      d,
      isFrontRow,
    });
  }

  public update(dt: number, forwardSpeed: number): void {
    // 1. Move track texture offset
    this.trackGridTexture.offset.y -= (forwardSpeed * dt) / 2.0;

    // 2. Move buildings towards camera (+Z) and recycle them
    const moveZ = forwardSpeed * dt;
    const despawnZ = 25;
    const frontSpawnZ = -285;
    const backSpawnZ = -275;

    for (let i = 0; i < this.buildings.length; i++) {
      const b = this.buildings[i];
      b.z += moveZ;

      if (b.z > despawnZ) {
        const spawnLimit = b.isFrontRow ? frontSpawnZ : backSpawnZ;
        b.z = spawnLimit + (b.z - despawnZ);
      }

      b.group.position.z = b.z;
    }
  }

  public reset(): void {
    this.trackGridTexture.offset.y = 0;
    const frontCountPerSide = 24;
    const zStep = 12.5;
    let idx = 0;

    // Reset Front Row
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < frontCountPerSide; i++) {
        if (idx < this.buildings.length) {
          const b = this.buildings[idx++];
          b.z = 15 - i * zStep;
          b.group.position.z = b.z;
        }
      }
    }

    // Reset Backdrop Row
    const backCountPerSide = 14;
    const backZStep = 20.0;
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < backCountPerSide; i++) {
        if (idx < this.buildings.length) {
          const b = this.buildings[idx++];
          b.z = 15 - i * backZStep;
          b.group.position.z = b.z;
        }
      }
    }
  }
}
