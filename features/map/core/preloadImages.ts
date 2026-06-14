// @ts-nocheck
import { grey } from '@/components/ui/theme';
import { createTheme } from '@/components/ui/theme';
import { loadImage, prepareIcon } from '@/features/map/core/mapUtil';

import directionSvg from '@/features/map/assets/direction.svg';
import backgroundSvg from '@/features/map/assets/background.svg';
import animalSvg from '@/features/map/assets/icon/animal.svg';
import bicycleSvg from '@/features/map/assets/icon/bicycle.svg';
import boatSvg from '@/features/map/assets/icon/boat.svg';
import busSvg from '@/features/map/assets/icon/bus.svg';
import carSvg from '@/features/map/assets/icon/car.svg';
import camperSvg from '@/features/map/assets/icon/camper.svg';
import craneSvg from '@/features/map/assets/icon/crane.svg';
import defaultSvg from '@/features/map/assets/icon/default.svg';
import startSvg from '@/features/map/assets/icon/start.svg';
import finishSvg from '@/features/map/assets/icon/finish.svg';
import helicopterSvg from '@/features/map/assets/icon/helicopter.svg';
import motorcycleSvg from '@/features/map/assets/icon/motorcycle.svg';
import personSvg from '@/features/map/assets/icon/person.svg';
import planeSvg from '@/features/map/assets/icon/plane.svg';
import scooterSvg from '@/features/map/assets/icon/scooter.svg';
import shipSvg from '@/features/map/assets/icon/ship.svg';
import tractorSvg from '@/features/map/assets/icon/tractor.svg';
import trailerSvg from '@/features/map/assets/icon/trailer.svg';
import trainSvg from '@/features/map/assets/icon/train.svg';
import tramSvg from '@/features/map/assets/icon/tram.svg';
import truckSvg from '@/features/map/assets/icon/truck.svg';
import vanSvg from '@/features/map/assets/icon/van.svg';

export const mapIcons = {
  animal: animalSvg,
  bicycle: bicycleSvg,
  boat: boatSvg,
  bus: busSvg,
  car: carSvg,
  camper: camperSvg,
  crane: craneSvg,
  default: defaultSvg,
  finish: finishSvg,
  helicopter: helicopterSvg,
  motorcycle: motorcycleSvg,
  person: personSvg,
  plane: planeSvg,
  scooter: scooterSvg,
  ship: shipSvg,
  start: startSvg,
  tractor: tractorSvg,
  trailer: trailerSvg,
  train: trainSvg,
  tram: tramSvg,
  truck: truckSvg,
  van: vanSvg,
};

export const mapIconKey = (category) => {
  switch (category) {
    case 'offroad':
    case 'pickup':
      return 'car';
    case 'trolleybus':
      return 'bus';
    default:
      return mapIcons.hasOwnProperty(category) ? category : 'default';
  }
};

export const mapImages = {};

const theme = createTheme({
  palette: {
    neutral: { main: grey[500] },
  },
});

export default async () => {
  const background = await loadImage(backgroundSvg);
  mapImages.background = await prepareIcon(background);
  mapImages.direction = await prepareIcon(await loadImage(directionSvg));
  await Promise.all(
    Object.keys(mapIcons).map(async (category) => {
      const results = [];
      ['info', 'success', 'error', 'neutral'].forEach((color) => {
        results.push(
          loadImage(mapIcons[category]).then((icon) => {
            mapImages[`${category}-${color}`] = prepareIcon(
              background,
              icon,
              theme.palette[color].main,
            );
          }),
        );
      });
      await Promise.all(results);
    }),
  );
};
