import * as THREE from 'three';
import { Player } from './Player';
import { World } from './World';
import { Obstacles } from './Obstacles';

export class GameScene {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public player: Player;
  public world: World;
  public obstacles: Obstacles;

  private container: HTMLElement;
  private shakeIntensity: number = 0;
  private baseFov: number = 76;

  private computeBaseFov(aspect: number): number {
    if (aspect < 0.7) {
      // Mobile portrait (tall smartphones e.g. 9:16)
      return 92;
    } else if (aspect < 1.0) {
      // Small portrait tablets / folded screens
      return 84;
    } else if (aspect < 1.35) {
      // Square viewports & standard tablets (e.g. iPad 4:3)
      return 78;
    } else {
      // Laptops & Desktops (16:9, 16:10, ultrawide)
      return 74;
    }
  }

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x05020D);
    // Controlled distance fog matching dark purple-black background
    this.scene.fog = new THREE.FogExp2(0x05020D, 0.005);

    // 2. Camera with responsive FOV
    const aspect = container.clientWidth / container.clientHeight;
    this.baseFov = this.computeBaseFov(aspect);
    this.camera = new THREE.PerspectiveCamera(this.baseFov, aspect, 0.1, 450);
    this.camera.position.set(0, 3.2, 5.8);
    this.camera.lookAt(0, 0.6, -18);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);

    // 4. Game Entities
    this.world = new World();
    this.scene.add(this.world.group);

    this.obstacles = new Obstacles();
    this.scene.add(this.obstacles.group);

    this.player = new Player();
    this.scene.add(this.player.group);

    // Subtle ambient lighting for controlled cyber reflections
    const ambient = new THREE.AmbientLight(0x281944, 0.65);
    this.scene.add(ambient);

    // Handle Resize
    this.onWindowResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.onWindowResize);
  }

  public triggerScreenShake(amount: number = 0.6): void {
    this.shakeIntensity = amount;
  }

  public updateCamera(dt: number, speedRatio: number): void {
    // Dynamic FOV with speed
    const targetFov = this.baseFov + speedRatio * 8;
    this.camera.fov += (targetFov - this.camera.fov) * dt * 3.0;
    this.camera.updateProjectionMatrix();

    // Camera stays steady and centered: Environment does not shift or sway when moving the ball
    const targetCamX = 0;
    const targetCamY = Math.max(1.8, this.player.y + 2.6);
    const targetCamZ = this.player.z + 5.8;

    this.camera.position.x += (targetCamX - this.camera.position.x) * dt * 10;
    this.camera.position.y += (targetCamY - this.camera.position.y) * dt * 10;
    this.camera.position.z += (targetCamZ - this.camera.position.z) * dt * 10;

    // Look straight ahead along track center: Environment does not pan sideways
    const lookTargetX = 0;
    const lookTargetY = Math.max(0.2, this.player.y * 0.5 + 0.4);
    const lookTargetZ = this.player.z - 22;

    this.camera.lookAt(lookTargetX, lookTargetY, lookTargetZ);

    // Keep horizon level: Environment does not tilt or roll when steering
    this.camera.rotation.z = 0;

    // Apply screen shake
    if (this.shakeIntensity > 0) {
      this.camera.position.x += (Math.random() - 0.5) * this.shakeIntensity;
      this.camera.position.y += (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeIntensity = Math.max(0, this.shakeIntensity - dt * 2.5);
    }
  }

  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  public onWindowResize(): void {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;
    const aspect = width / height;
    this.baseFov = this.computeBaseFov(aspect);
    this.camera.aspect = aspect;
    this.camera.fov = this.baseFov;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public dispose(): void {
    window.removeEventListener('resize', this.onWindowResize);
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
