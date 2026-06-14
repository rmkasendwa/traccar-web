// @ts-nocheck
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import { googleProtocol } from 'maplibre-google-maps';
import { Protocol } from 'pmtiles';
import { useRef, useLayoutEffect, useEffect, useState, useMemo } from 'react';
import { useTheme } from '@/components/ui';
import MapSwitcher from '@/features/map/control/MapSwitcher';
import { useAttributePreference, usePreference } from '@/lib/preferences';
import usePersistedState from '@/lib/usePersistedState';
import { mapImages } from '@/features/map/core/preloadImages';
import useMapStyles from '@/features/map/core/useMapStyles';
import { useAsyncTask } from '@/lib/react';

const element = document.createElement('div');
element.style.width = '100%';
element.style.height = '100%';
element.style.boxSizing = 'initial';

maplibregl.addProtocol('google', googleProtocol);
maplibregl.addProtocol('pmtiles', new Protocol().tile);

export const map = new maplibregl.Map({
  container: element,
  attributionControl: false,
});

let ready = false;
const readyListeners = new Set();

const addReadyListener = (listener) => {
  readyListeners.add(listener);
  listener(ready);
};

const removeReadyListener = (listener) => {
  readyListeners.delete(listener);
};

const updateReadyValue = (value) => {
  ready = value;
  readyListeners.forEach((listener) => listener(value));
};

const initMap = async () => {
  if (ready) return;
  if (!map.hasImage('background')) {
    Object.entries(mapImages).forEach(([key, value]) => {
      map.addImage(key, value, {
        pixelRatio: window.devicePixelRatio,
      });
    });
  }
};

const MapView = ({ children }) => {
  const theme = useTheme();

  const containerRef = useRef(null);

  const [mapReady, setMapReady] = useState(false);

  const mapStyles = useMapStyles();
  const activeMapStyles = useAttributePreference('activeMapStyles', 'openFreeMap,osm');
  const [selectedStyleId, setSelectedStyleId] = usePersistedState(
    'selectedMapStyle',
    usePreference('map', 'openFreeMap'),
  );
  const mapboxAccessToken = useAttributePreference('mapboxAccessToken');
  const maxZoom = useAttributePreference('web.maxZoom');

  const styles = useMemo(() => {
    const filtered = mapStyles.filter((s) => s.available && activeMapStyles.includes(s.id));
    const fallback = mapStyles.find((s) => s.id === 'osm');
    if (!filtered.length) {
      return fallback ? [fallback] : [];
    }
    return fallback && !filtered.some((style) => style.id === fallback.id)
      ? [...filtered, fallback]
      : filtered;
  }, [mapStyles, activeMapStyles]);

  useAsyncTask(async () => {
    if (theme.direction === 'rtl') {
      maplibregl.setRTLTextPlugin('/mapbox-gl-rtl-text.js');
    }
  }, [theme.direction]);

  useEffect(() => {
    const attribution = new maplibregl.AttributionControl({ compact: true });
    const navigation = new maplibregl.NavigationControl();
    map.addControl(attribution, theme.direction === 'rtl' ? 'bottom-left' : 'bottom-right');
    map.addControl(navigation, theme.direction === 'rtl' ? 'top-left' : 'top-right');
    return () => {
      map.removeControl(navigation);
      map.removeControl(attribution);
    };
  }, [theme.direction]);

  useEffect(() => {
    if (maxZoom) {
      map.setMaxZoom(maxZoom);
    }
  }, [maxZoom]);

  useEffect(() => {
    maplibregl.accessToken = mapboxAccessToken;
  }, [mapboxAccessToken]);

  useEffect(() => {
    const style = styles.find((s) => s.id === selectedStyleId);
    if (!style) {
      if (styles.length) {
        setSelectedStyleId(styles[0].id);
      }
      return;
    }
    updateReadyValue(false);
    map.coordinateSystem = style.coordinateSystem;

    let styleLoaded = false;
    const handleStyleLoad = async () => {
      styleLoaded = true;
      await initMap();
      updateReadyValue(true);
      map.resize();
    };
    const handleError = () => {
      if (!styleLoaded && style.id !== 'osm') {
        setSelectedStyleId('osm');
      }
    };

    map.once('style.load', handleStyleLoad);
    map.on('error', handleError);
    map.setTransformRequest(style.transformRequest);
    map.setStyle(style.style, { diff: false });
    return () => {
      map.off('style.load', handleStyleLoad);
      map.off('error', handleError);
    };
  }, [styles, selectedStyleId, setSelectedStyleId]);

  useEffect(() => {
    const listener = (ready) => setMapReady(ready);
    addReadyListener(listener);
    return () => {
      removeReadyListener(listener);
    };
  }, []);

  useLayoutEffect(() => {
    const currentEl = containerRef.current;
    currentEl.appendChild(element);
    map.resize();
    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(currentEl);
    return () => {
      resizeObserver.disconnect();
      currentEl.removeChild(element);
    };
  }, [containerRef]);

  return (
    <div style={{ width: '100%', height: '100%' }} ref={containerRef}>
      <MapSwitcher styles={styles} selectedId={selectedStyleId} onSelect={setSelectedStyleId} />
      {mapReady && children}
    </div>
  );
};

export default MapView;
