import * as THREE from 'three';

export class Player {
  public group: THREE.Group;
  public radius: number = 0.72;
  public x: number = 0;
  public y: number = 0.72;
  public z: number = 0;
  public vx: number = 0;
  public vy: number = 0;
  public isFalling: boolean = false;
  public isDead: boolean = false;

  private innerSphere: THREE.Mesh;
  private wireframeGroup: THREE.Group;
  private shards: THREE.Mesh[] = [];
  private shardVelocities: THREE.Vector3[] = [];
  private rollAngle: number = 0;

  // Track constraints
  public trackHalfWidth: number = 5.0; // 5 lanes of width 2 => -5 to +5

  constructor() {
    this.group = new THREE.Group();

    // 1. Dark/black-purple interior (#05020D) so world behind it doesn't bleed through
    const innerGeom = new THREE.SphereGeometry(this.radius * 0.96, 24, 24);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x05020D,
      depthWrite: true,
    });
    this.innerSphere = new THREE.Mesh(innerGeom, innerMat);
    this.group.add(this.innerSphere);

    // 2. White/Cyan wireframe rings (slightly brighter than environment)
    this.wireframeGroup = new THREE.Group();
    const ringMat = new THREE.LineBasicMaterial({
      color: 0x00E5FF,
      linewidth: 2.5,
    });

    const segments = 32;

    // Longitude rings (meridians)
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 4;
      const ringGeom = new THREE.BufferGeometry();
      const points: THREE.Vector3[] = [];
      for (let s = 0; s <= segments; s++) {
        const theta = (s / segments) * Math.PI * 2;
        const x = Math.sin(theta) * this.radius;
        const y = Math.cos(theta) * this.radius;
        points.push(new THREE.Vector3(x, y, 0));
      }
      ringGeom.setFromPoints(points);
      const ring = new THREE.LineLoop(ringGeom, ringMat);
      ring.rotation.y = angle;
      this.wireframeGroup.add(ring);
    }

    // Latitude rings
    const latOffsets = [-this.radius * 0.58, 0, this.radius * 0.58];
    latOffsets.forEach((yOff) => {
      const r = Math.sqrt(Math.max(0, this.radius * this.radius - yOff * yOff));
      const ringGeom = new THREE.BufferGeometry();
      const points: THREE.Vector3[] = [];
      for (let s = 0; s <= segments; s++) {
        const theta = (s / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * r, yOff, Math.sin(theta) * r));
      }
      ringGeom.setFromPoints(points);
      const ring = new THREE.LineLoop(ringGeom, ringMat);
      this.wireframeGroup.add(ring);
    });

    // Geodesic facet overlay in crisp White-Cyan (#E0FFFF) for sharp visibility
    const facetGeom = new THREE.IcosahedronGeometry(this.radius, 2);
    const facetMat = new THREE.MeshBasicMaterial({
      color: 0xE0FFFF,
      wireframe: true,
      transparent: true,
      opacity: 0.88,
    });
    const facetMesh = new THREE.Mesh(facetGeom, facetMat);
    this.wireframeGroup.add(facetMesh);

    this.group.add(this.wireframeGroup);
    this.reset();
  }

  public reset(): void {
    this.x = 0;
    this.y = this.radius;
    this.z = 0;
    this.vx = 0;
    this.vy = 0;
    this.isFalling = false;
    this.isDead = false;
    this.rollAngle = 0;
    this.group.position.set(0, this.radius, 0);
    this.group.rotation.set(0, 0, 0);
    this.innerSphere.visible = true;
    this.wireframeGroup.visible = true;

    // Clean up shards
    this.shards.forEach((shard) => this.group.remove(shard));
    this.shards = [];
    this.shardVelocities = [];
  }

  public update(dt: number, inputX: number, forwardSpeed: number): void {
    if (this.isDead) {
      this.updateShards(dt);
      return;
    }

    // Horizontal acceleration & smooth damping
    const accel = 52.0;
    const damping = 0.0008;

    this.vx += inputX * accel * dt;
    this.vx *= Math.pow(damping, dt);

    const maxVx = 16.0;
    this.vx = Math.max(-maxVx, Math.min(maxVx, this.vx));

    this.x += this.vx * dt;

    if (!this.isFalling && Math.abs(this.x) > this.trackHalfWidth) {
      this.isFalling = true;
    }

    if (this.isFalling) {
      this.vy -= 45.0 * dt;
      this.y += this.vy * dt;
      if (this.y < -15.0) {
        this.isDead = true;
      }
    } else {
      this.y = this.radius;
    }

    // Forward roll animation
    this.rollAngle -= (forwardSpeed * dt) / this.radius;
    this.wireframeGroup.rotation.x = this.rollAngle;
    this.innerSphere.rotation.x = this.rollAngle;

    this.group.rotation.z = -this.vx * 0.04;
    this.group.rotation.y = -this.vx * 0.03;

    this.group.position.set(this.x, this.y, this.z);
  }

  public explode(): void {
    if (this.isDead) return;
    this.isDead = true;
    this.innerSphere.visible = false;
    this.wireframeGroup.visible = false;

    // Exploding cyan & white shards
    const shardGeom = new THREE.TetrahedronGeometry(0.2, 0);
    const shardMatCyan = new THREE.MeshBasicMaterial({ color: 0x00E5FF, wireframe: true });
    const shardMatWhite = new THREE.MeshBasicMaterial({ color: 0xE0FFFF, wireframe: true });

    for (let i = 0; i < 24; i++) {
      const mat = i % 2 === 0 ? shardMatCyan : shardMatWhite;
      const shard = new THREE.Mesh(shardGeom, mat);
      shard.position.set(
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4
      );
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 16,
        Math.random() * 12 + 4,
        (Math.random() - 0.5) * 16
      );
      this.group.add(shard);
      this.shards.push(shard);
      this.shardVelocities.push(velocity);
    }
  }

  private updateShards(dt: number): void {
    for (let i = 0; i < this.shards.length; i++) {
      const shard = this.shards[i];
      const vel = this.shardVelocities[i];
      vel.y -= 35.0 * dt;
      shard.position.addScaledVector(vel, dt);
      shard.rotation.x += dt * 8;
      shard.rotation.y += dt * 6;
    }
  }

  public getBoundingSphere(): THREE.Sphere {
    return new THREE.Sphere(new THREE.Vector3(this.x, this.y, this.z), this.radius * 0.85);
  }
}
