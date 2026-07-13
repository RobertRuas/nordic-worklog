import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import './MapPicker.css';

/**
 * MapPicker — Componente reutilizável de mapa interativo
 * Padrão "pin fixo, mapa móvel": o marcador fica centralizado e
 * o usuário move o mapa para selecionar a localização exata.
 * 
 * @param {Object} props
 * @param {Array} props.center - Coordenadas iniciais [lat, lng]
 * @param {Function} props.onMove - Callback ao mover o mapa (lat, lng)
 * @param {number} props.zoom - Nível de zoom (padrão: 12)
 * @param {string} props.className - Classe CSS adicional
 */

// ═══ Corrige ícone padrão do Leaflet (problema conhecido com bundlers) ═══
try {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
} catch (e) {
  console.warn('Leaflet icon fix failed:', e);
}

/**
 * Subcomponente interno — reporta centro do mapa ao mover
 * Ignora o primeiro moveend (montagem inicial do MapContainer)
 */
function MoveHandler({ onMove }) {
  const isFirstRef = useRef(true);

  useMapEvents({
    moveend(e) {
      // ═══ Ignora o primeiro moveend (montagem inicial) ═══
      if (isFirstRef.current) {
        isFirstRef.current = false;
        return;
      }
      const center = e.target.getCenter();
      if (onMove) onMove(center.lat, center.lng);
    },
  });
  return null;
}

export default function MapPicker({
  center = [47.9, 16.8],  // Pannonia Gols (aproximado)
  onMove = null,
  zoom = 12,
  className = '',
}) {
  const mapRef = useRef(null);
  // ═══ Ref para onMove — sempre atual, sem causar re-render ═══
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;

  // ═══ Sincroniza centro via setView ═══
  useEffect(() => {
    if (!mapRef.current || !center) return;
    mapRef.current.setView(center, zoom);
  }, [center[0], center[1], zoom]);

  return (
    <div className={`map-picker ${className}`}>
      {/* ═══ Pin fixo central (overlay sobre o mapa) ═══ */}
      <div className="map-picker-pin">
        <div className="map-picker-pin-head"></div>
        <div className="map-picker-pin-stem"></div>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        dragging={true}
        zoomControl={true}
        ref={mapRef}
        className="map-picker-container"
      >
        {/* Tiles do OpenStreetMap (gratuito) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Handler de movimento — usa ref para estabilidade */}
        <MoveHandler onMove={(lat, lng) => onMoveRef.current?.(lat, lng)} />
      </MapContainer>
    </div>
  );
}
