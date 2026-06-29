import type { EaseToOptions, FitBoundsOptions, JumpToOptions, LngLatBoundsLike } from 'maplibre-gl';
import { map } from '@/features/map/core/MapView';

const DEFAULT_AUTO_MAX_ZOOM = 18;

type CameraZoomValue = number | undefined;

type CameraMaxZoomValue = number | string | null | undefined;

export const getCameraAutoMaxZoom = (maxZoom?: CameraMaxZoomValue): number => {
  const parsed = Number(maxZoom);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_AUTO_MAX_ZOOM;
};

export const clampCameraZoom = (
  zoom: CameraZoomValue,
  maxZoom?: CameraMaxZoomValue,
): CameraZoomValue => {
  const cameraMaxZoom = getCameraAutoMaxZoom(maxZoom);
  return typeof zoom === 'number' && !Number.isNaN(zoom) ? Math.min(zoom, cameraMaxZoom) : zoom;
};

const clampMapZoom = (maxZoom?: CameraMaxZoomValue): void => {
  const cameraMaxZoom = getCameraAutoMaxZoom(maxZoom);
  if (map.getZoom() > cameraMaxZoom) {
    map.setZoom(cameraMaxZoom);
  }
};

export type JumpCameraOptions = JumpToOptions & {
  zoom?: CameraZoomValue;
};

export type EaseCameraOptions = EaseToOptions & {
  zoom?: CameraZoomValue;
};

export const jumpToWithCameraMaxZoom = (
  options: JumpCameraOptions,
  maxZoom?: CameraMaxZoomValue,
): void => {
  if (options.zoom != null) {
    options.zoom = clampCameraZoom(options.zoom, maxZoom);
  }
  map.jumpTo(options);
};

export const easeToWithCameraMaxZoom = (
  options: EaseCameraOptions,
  maxZoom?: CameraMaxZoomValue,
): void => {
  if (options.zoom != null) {
    options.zoom = clampCameraZoom(options.zoom, maxZoom);
  }
  map.easeTo(options);
  if (!options.duration || options.duration === 0) {
    clampMapZoom(maxZoom);
  } else {
    map.once('moveend', () => clampMapZoom(maxZoom));
  }
};

export const fitBoundsWithCameraMaxZoom = (
  bounds: LngLatBoundsLike,
  options: FitBoundsOptions = {},
  maxZoom?: CameraMaxZoomValue,
): void => {
  map.fitBounds(bounds, options);
  if (!options.duration || options.duration === 0) {
    clampMapZoom(maxZoom);
  } else {
    map.once('moveend', () => clampMapZoom(maxZoom));
  }
};
