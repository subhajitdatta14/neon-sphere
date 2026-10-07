import * as THREE from 'three';

export interface ObstacleData {
  group: THREE.Group;
  mesh: THREE.Mesh;
  edges: THREE.LineSegments;
  box: THREE.Box3;
  active: boolean;
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  d: number;
  isMoving: boolean;
  moveSpeed: number;
  moveDir: number;
  minX: number;
  maxX: number;
  isDropping?: boolean;
  targetY?: number;
  dropTriggerZ?: number;
  dropSpeed?: number;
  isSuddenMover?: boolean;
  suddenStartX?: number;
  suddenTargetX?: number;
  suddenTriggerZ?: number;
  suddenProgress?: number;
  hasSuddenTriggered?: boolean;
}

export class Obstacles {
  public group: THREE.Group;
  public obstaclePool: ObstacleData[] = [];
  private redTexture: THREE.CanvasTexture;
  private redEdgeMat: THREE.LineBasicMaterial;
  private redMeshMat: THREE.MeshBasicMaterial;

  // Track layout: 5 lanes centered at x = -4, -2, 0, 2, 4
  private laneCoords = [-4, -2, 0, 2, 4];
  private nextSpawnZ: number = -60;
  private minWaveDistance: number = 32;

  constructor() {
    this.group = new THREE.Group();

    // 1. Procedural Glowing Hot Magenta Texture with 'X' Cross Bracing
    this.redTexture = this.createRedTexture(128);
    this.redMeshMat = new THREE.MeshBasicMaterial({
      map: this.redTexture,
      depthWrite: true,
    });
    this.redEdgeMat = new THREE.LineBasicMaterial({
      color: 0xFF2BD6,
      linewidth: 3,
    });

    // 2. Pre-allocate pool of 48 obstacles to support frequent 2-3 box drops
    const poolSize = 48;
    for (let i = 0; i < poolSize; i++) {
      const obstacleGroup = new THREE.Group();
      obstacleGroup.visible = false;

      // Default unit box geometry; we will scale it per obstacle
      const geom = new THREE.BoxGeometry(1, 1, 1);
      const mesh = new THREE.Mesh(geom, this.redMeshMat);
      obstacleGroup.add(mesh);

      const edgesGeom = new THREE.EdgesGeometry(geom);
      const edges = new THREE.LineSegments(edgesGeom, this.redEdgeMat);
      obstacleGroup.add(edges);

      this.group.add(obstacleGroup);

      this.obstaclePool.push({
        group: obstacleGroup,
        mesh,
        edges,
        box: new THREE.Box3(),
        active: false,
        x: 0,
        y: 0,
        z: 0,
        w: 1,
        h: 1,
        d: 1,
        isMoving: false,
        moveSpeed: 0,
        moveDir: 1,
        minX: -4,
        maxX: 4,
        isDropping: false,
        targetY: 0.9,
        dropTriggerZ: -52,
        dropSpeed: 30,
        isSuddenMover: false,
        suddenStartX: 0,
        suddenTargetX: 0,
        suddenTriggerZ: -46,
        suddenProgress: 0,
        hasSuddenTriggered: false,
      });
    }
  }

  private createRedTexture(size: number): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Dark black-purple background
    ctx.fillStyle = '#06010F';
    ctx.fillRect(0, 0, size, size);

    // Controlled Hot Magenta outer border glow
    ctx.strokeStyle = '#FF2BD6';
    ctx.lineWidth = 12;
    ctx.globalAlpha = 0.35;
    ctx.strokeRect(0, 0, size, size);

    // Sharp bright hot magenta edge
    ctx.globalAlpha = 1.0;
    ctx.lineWidth = 5;
    ctx.strokeRect(0, 0, size, size);

    // Diagonal 'X' Cross-Brace lines on each face
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#FF2BD6';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size, size);
    ctx.moveTo(size, 0);
    ctx.lineTo(0, size);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  public reset(): void {
    for (const obs of this.obstaclePool) {
      obs.active = false;
      obs.group.visible = false;
      obs.isDropping = false;
      obs.isSuddenMover = false;
      obs.hasSuddenTriggered = false;
      obs.suddenProgress = 0;
      obs.z = 100;
    }
    this.nextSpawnZ = -60;
  }

  private getInactiveObstacle(): ObstacleData | null {
    for (const obs of this.obstaclePool) {
      if (!obs.active) return obs;
    }
    return null;
  }

  /**
   * Spawns a cluster of 2 or 3 red boxes hovering high above the track
   * that slam down in unison right in front of the ball to block it!
   */
  private spawnDroppingCluster(
    count: 2 | 3,
    targetZ: number,
    playerX?: number,
    dropSpeed: number = 32.0
  ): void {
    // Find lane closest to player to specifically target and block the ball
    let targetIndex = 2;
    if (playerX !== undefined) {
      let minDist = 999;
      for (let i = 0; i < this.laneCoords.length; i++) {
        const dist = Math.abs(this.laneCoords[i] - playerX);
        if (dist < minDist) {
          minDist = dist;
          targetIndex = i;
        }
      }
    } else {
      targetIndex = Math.floor(Math.random() * 5);
    }

    const chosenLanes: number[] = [targetIndex];

    if (count === 2) {
      // Pick adjacent lane to form a 2-box drop block, leaving 3 open lanes
      const canGoLeft = targetIndex > 0;
      const canGoRight = targetIndex < 4;
      let secondLane: number;
      if (canGoLeft && canGoRight) {
        secondLane = Math.random() > 0.5 ? targetIndex - 1 : targetIndex + 1;
      } else if (canGoLeft) {
        secondLane = targetIndex - 1;
      } else {
        secondLane = targetIndex + 1;
      }
      chosenLanes.push(secondLane);
    } else {
      // count === 3: Block 3 lanes together directly surrounding the ball, leaving 2 safe escape lanes
      if (targetIndex >= 1 && targetIndex <= 3) {
        chosenLanes.push(targetIndex - 1, targetIndex + 1);
      } else if (targetIndex === 0) {
        chosenLanes.push(1, 2);
      } else {
        chosenLanes.push(2, 3);
      }
    }

    // Spawn 2 or 3 dropping boxes suspended high above the track
    for (let i = 0; i < chosenLanes.length; i++) {
      const laneIdx = chosenLanes[i];
      const laneX = this.laneCoords[laneIdx];
      // Slight vertical offset so they drop with natural rhythm
      const startY = 16.0 + (i % 2) * 1.5;
      const triggerZ = -52.0 - i * 1.5;
      this.spawnBlock(
        laneX,
        targetZ,
        1.8,
        1.8,
        2.0,
        false,
        -3.5,
        3.5,
        0,
        true, // isDropping
        startY,
        triggerZ,
        dropSpeed
      );
    }
  }

  public spawnWave(targetZ: number, difficulty: number, playerX?: number): void {
    // 5 lanes centered at x = -4, -2, 0, 2, 4
    // Frequently spawns 2 or 3 red boxes dropping down together from above to block the ball

    const dynamicMoveSpeed = 5.6 + Math.min(4.8, (difficulty - 1.0) * 1.6);
    const dynamicDropSpeed = 32.0 + Math.min(10.0, (difficulty - 1.0) * 2.5);

    // Tier 1: Early Game (difficulty < 1.35, approx first 15-20s)
    if (difficulty < 1.35) {
      const roll = Math.random();
      if (roll < 0.38) {
        // 2 red boxes drop down from above together to block the ball!
        this.spawnDroppingCluster(2, targetZ, playerX, dynamicDropSpeed);
      } else if (roll < 0.65) {
        // Sudden side juker: sits in lane, then suddenly darts to the left or right side!
        const startLane = this.laneCoords[Math.floor(Math.random() * 5)];
        this.spawnSuddenMover(startLane, targetZ);
      } else if (roll < 0.85) {
        // Fast moving red box sliding smoothly between center lanes
        const startX = (Math.random() - 0.5) * 3;
        const moveSpeed = 4.8 + Math.random() * 1.6;
        this.spawnBlock(startX, targetZ, 1.8, 1.8, 2.0, true, -3.2, 3.2, moveSpeed);
      } else {
        // 1 static block in a random lane (4 lanes wide open)
        const lane = Math.floor(Math.random() * 5);
        this.spawnBlock(this.laneCoords[lane], targetZ, 1.8, 1.8, 2.0, false);
      }
      return;
    }

    // Tier 2: Developing Challenge (1.35 <= difficulty < 2.0, approx 20s-45s)
    if (difficulty < 2.0) {
      const roll = Math.random();
      if (roll < 0.30) {
        // 2 red boxes drop down from above together!
        this.spawnDroppingCluster(2, targetZ, playerX, dynamicDropSpeed);
      } else if (roll < 0.52) {
        // 3 red boxes drop down from above together, forming a 3-lane blockade!
        this.spawnDroppingCluster(3, targetZ, playerX, dynamicDropSpeed);
      } else if (roll < 0.74) {
        // Sudden darting red box: suddenly jumps sideways to the right or left!
        const startLane = this.laneCoords[Math.floor(Math.random() * 5)];
        this.spawnSuddenMover(startLane, targetZ);
        // Also a static blocker on the opposite side to encourage reflex dodging
        const oppX = startLane >= 0 ? -4 : 4;
        this.spawnBlock(oppX, targetZ, 1.8, 1.8, 2.0, false);
      } else {
        // Moving red box sweeping across lanes
        const startX = (Math.random() - 0.5) * 4;
        this.spawnBlock(startX, targetZ, 1.8, 1.8, 2.0, true, -3.5, 3.5, dynamicMoveSpeed);
      }
      return;
    }

    // Tier 3 & 4: Advanced to High Stakes (difficulty >= 2.0, 45s+ survival)
    // High frequency of 2 and 3 box drops, sudden jukers, and fast moving hazards
    const patternType = Math.floor(Math.random() * 9);

    if (patternType === 0 || patternType === 1) {
      // 3 red boxes drop down from above together right in front of the ball!
      this.spawnDroppingCluster(3, targetZ, playerX, dynamicDropSpeed);
    } else if (patternType === 2) {
      // 2 red boxes drop down from above together to block the ball!
      this.spawnDroppingCluster(2, targetZ, playerX, dynamicDropSpeed);
    } else if (patternType === 3 || patternType === 4) {
      // Sudden side juker: red box suddenly darts left or right to cut off ball!
      const startLane = playerX !== undefined ? (playerX > 0 ? 0 : 2) : 0;
      this.spawnSuddenMover(startLane, targetZ);
      if (Math.random() > 0.5) {
        this.spawnSuddenMover(startLane >= 0 ? -4 : 4, targetZ);
      }
    } else if (patternType === 5) {
      // 2 dropping boxes + 1 fast moving hazard in the next wave
      this.spawnDroppingCluster(2, targetZ, playerX, dynamicDropSpeed);
      this.spawnBlock(0, targetZ - 14, 1.8, 1.8, 2.0, true, -3.5, 3.5, dynamicMoveSpeed * 1.15);
    } else if (patternType === 6) {
      // Wide sweeping patrol hazard sliding across all 5 lanes
      const startX = (Math.random() - 0.5) * 4;
      this.spawnBlock(startX, targetZ, 1.8, 1.8, 2.0, true, -3.6, 3.6, dynamicMoveSpeed);
    } else if (patternType === 7) {
      // Dual moving hazards oscillating in opposite halves
      this.spawnBlock(-2.2, targetZ, 1.8, 1.8, 2.0, true, -3.8, -0.6, dynamicMoveSpeed);
      this.spawnBlock(2.2, targetZ, 1.8, 1.8, 2.0, true, 0.6, 3.8, dynamicMoveSpeed);
    } else {
      // Slalom with moving red box on second wave
      const blockLeft = Math.random() > 0.5;
      this.spawnBlock(blockLeft ? -3.8 : 3.8, targetZ, 1.8, 1.8, 2.0, false);
      this.spawnBlock(
        blockLeft ? 1.5 : -1.5,
        targetZ - 14,
        1.8,
        1.8,
        2.0,
        true,
        -2.5,
        2.5,
        dynamicMoveSpeed
      );
    }
  }

  /**
   * Spawns a red box that sits waiting, then suddenly darts/jukes to the left or right
   * when the player approaches within surprise range!
   */
  private spawnSuddenMover(
    startX: number,
    targetZ: number,
    targetX?: number,
    triggerZ: number = -46.0
  ): void {
    // If targetX is not specified, randomly dart left or right to an adjacent lane
    let endX = targetX;
    if (endX === undefined) {
      const shift = 2; // one lane shift
      const goLeft =
        startX > 0
          ? startX >= 4
            ? true
            : Math.random() > 0.5
          : startX <= -4
          ? false
          : Math.random() > 0.5;
      endX = goLeft ? Math.max(-4, startX - shift) : Math.min(4, startX + shift);
    }

    this.spawnBlock(
      startX,
      targetZ,
      1.8,
      1.8,
      2.0,
      false, // not continuously oscillating
      -3.8,
      3.8,
      0,
      false, // not dropping
      16.0,
      -52.0,
      30.0,
      true, // isSuddenMover
      endX,
      triggerZ
    );
  }

  private spawnBlock(
    x: number,
    z: number,
    w: number,
    h: number,
    d: number,
    isMoving: boolean = false,
    minX: number = -3.5,
    maxX: number = 3.5,
    moveSpeed: number = 3.5,
    isDropping: boolean = false,
    dropStartY: number = 16.0,
    dropTriggerZ: number = -52.0,
    dropSpeed: number = 30.0,
    isSuddenMover: boolean = false,
    suddenTargetX: number = 0,
    suddenTriggerZ: number = -46.0
  ): void {
    const obs = this.getInactiveObstacle();
    if (!obs) return;

    obs.active = true;
    obs.group.visible = true;
    obs.x = x;
    obs.y = isDropping ? dropStartY : h / 2; // if dropping, start high above track!
    obs.z = z;
    obs.w = w;
    obs.h = h;
    obs.d = d;
    obs.isMoving = isMoving;
    obs.minX = minX;
    obs.maxX = maxX;
    obs.moveSpeed = moveSpeed;
    obs.moveDir = Math.random() > 0.5 ? 1 : -1;
    obs.isDropping = isDropping;
    obs.targetY = h / 2;
    obs.dropTriggerZ = dropTriggerZ;
    obs.dropSpeed = dropSpeed;
    obs.isSuddenMover = isSuddenMover;
    obs.suddenStartX = x;
    obs.suddenTargetX = suddenTargetX;
    obs.suddenTriggerZ = suddenTriggerZ;
    obs.suddenProgress = 0;
    obs.hasSuddenTriggered = false;

    // Scale mesh and edge lines
    obs.mesh.scale.set(w, h, d);
    obs.edges.scale.set(w, h, d);

    obs.group.position.set(x, obs.y, z);

    // Update bounding box
    obs.box.setFromCenterAndSize(
      new THREE.Vector3(x, obs.y, z),
      new THREE.Vector3(w * 0.95, h, d * 0.95)
    );
  }

  public update(dt: number, forwardSpeed: number, difficulty: number, playerX?: number): void {
    const moveZ = forwardSpeed * dt;

    // Move all active obstacles towards camera
    for (const obs of this.obstaclePool) {
      if (!obs.active) continue;

      // Forward movement towards player
      obs.z += moveZ;

      // Dropping obstacle logic: slams down from above when approaching player to block the ball
      if (obs.isDropping && obs.y > (obs.targetY ?? (obs.h / 2))) {
        // Trigger slam drop when within dropTriggerZ distance
        if (obs.z >= (obs.dropTriggerZ ?? -52)) {
          // If still high in descent and playerX is known, guide slightly toward ball's lane to block it
          if (obs.y > 4.5 && playerX !== undefined) {
            const targetLane = this.laneCoords.reduce((prev, curr) =>
              Math.abs(curr - playerX) < Math.abs(prev - playerX) ? curr : prev
            );
            obs.x = THREE.MathUtils.lerp(obs.x, targetLane, 0.14);
            obs.group.position.x = obs.x;
          }

          // Rapid slam down onto road
          const dropV = obs.dropSpeed ?? 32.0;
          obs.y = Math.max(obs.targetY ?? (obs.h / 2), obs.y - dropV * dt);
          obs.group.position.y = obs.y;
        }
      }

      // Sudden side-move logic: waiting red box suddenly darts left or right!
      if (obs.isSuddenMover) {
        if (!obs.hasSuddenTriggered && obs.z >= (obs.suddenTriggerZ ?? -46)) {
          obs.hasSuddenTriggered = true;
        }

        if (obs.hasSuddenTriggered && (obs.suddenProgress ?? 0) < 1.0) {
          // Swift darting animation across to target lane
          obs.suddenProgress = Math.min(1.0, (obs.suddenProgress ?? 0) + dt * 6.0);
          const t = obs.suddenProgress;
          // Smooth ease-out curve for sudden responsive dodge
          const ease = 1 - Math.pow(1 - t, 3);
          obs.x = (obs.suddenStartX ?? obs.x) + ((obs.suddenTargetX ?? obs.x) - (obs.suddenStartX ?? obs.x)) * ease;
          obs.group.position.x = obs.x;
        }
      }

      // Horizontal oscillation for moving obstacles (only some move)
      if (obs.isMoving) {
        obs.x += obs.moveDir * obs.moveSpeed * dt;
        if (obs.x >= obs.maxX) {
          obs.x = obs.maxX;
          obs.moveDir = -1;
        } else if (obs.x <= obs.minX) {
          obs.x = obs.minX;
          obs.moveDir = 1;
        }
        obs.group.position.x = obs.x;
      }

      obs.group.position.z = obs.z;

      // Update bounding box
      obs.box.min.x = obs.x - (obs.w * 0.95) / 2;
      obs.box.max.x = obs.x + (obs.w * 0.95) / 2;
      obs.box.min.y = obs.y - obs.h / 2;
      obs.box.max.y = obs.y + obs.h / 2;
      obs.box.min.z = obs.z - obs.d / 2;
      obs.box.max.z = obs.z + obs.d / 2;

      // Despawn once well behind camera
      if (obs.z > 16) {
        obs.active = false;
        obs.group.visible = false;
        obs.isDropping = false;
        obs.isSuddenMover = false;
        obs.hasSuddenTriggered = false;
        obs.suddenProgress = 0;
      }
    }

    // Spawn new waves ahead into distance
    this.nextSpawnZ += moveZ;
    const spawnHorizon = -220;

    while (this.nextSpawnZ > spawnHorizon) {
      // Dynamic spacing: gradually decreases with survival difficulty (starts relaxed at 48 units, smoothly scales to ~28)
      const waveGap = Math.max(28.0, 48.0 - (difficulty - 1.0) * 6.5);
      this.spawnWave(this.nextSpawnZ, difficulty, playerX);
      this.nextSpawnZ -= waveGap;
    }
  }

  public getActiveObstacles(): ObstacleData[] {
    return this.obstaclePool.filter((obs) => obs.active);
  }
}
