import * as THREE from 'three';
import { Player } from './Player';
import { Obstacles, ObstacleData } from './Obstacles';

export class Collision {
  public static checkPlayerObstacles(player: Player, obstacles: Obstacles): ObstacleData | null {
    if (player.isDead || player.isFalling) return null;

    const playerSphere = player.getBoundingSphere();

    const activeList = obstacles.getActiveObstacles();
    for (const obs of activeList) {
      // Fast broadphase distance check on Z
      if (Math.abs(obs.z - player.z) > 4.0) continue;

      // Sphere vs Box intersection
      if (obs.box.intersectsSphere(playerSphere)) {
        return obs;
      }
    }

    return null;
  }
}
