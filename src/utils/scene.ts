import { CAMERA_PREFIX, MULTICAM_PREFIX, SWITCH_PREFIX } from '../services/obsService';

const CAMERA_LABEL_REGEX = new RegExp(`^${CAMERA_PREFIX}\\s?`);
const MULTICAM_LABEL_REGEX = new RegExp(`^${MULTICAM_PREFIX}\\s?`);
const SWITCH_LABEL_PREFIX = `${SWITCH_PREFIX} `;

export const cameraLabel = (scene: string) => scene.replace(CAMERA_LABEL_REGEX, '');
export const multicamLabel = (scene: string) => scene.replace(MULTICAM_LABEL_REGEX, '');
export const switchSceneLabel = (scene: string) =>
    scene.startsWith(SWITCH_LABEL_PREFIX) ? scene.slice(SWITCH_LABEL_PREFIX.length) : scene;
