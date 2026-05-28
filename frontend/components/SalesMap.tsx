"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";
import type { VentaMapaPoint } from "@/app/actions/mapa";

// Fix Leaflet's broken default icon paths when bundled with webpack/Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const ESTADO_COLOR: Record<string, string> = {
  CUMPLIDA: "#22c55e",
  PREVENTA: "#6366f1",
  PENDIENTE: "#eab308",
  INICIADA: "#06b6d4",
  TICKET: "#a855f7",
};

function markerColor(estado: string) {
  return ESTADO_COLOR[estado] ?? "#94a3b8";
}

function coloredIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.4)"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

function escapeHtml(s: string | null | undefined) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isValidLatLng(lat: unknown, lng: unknown): lat is number {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !(lat === 0 && lng === 0)
  );
}

export default function SalesMap({ points }: { points: VentaMapaPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        center: [-34.61, -58.38],
        zoom: 5,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
      layerRef.current = L.layerGroup().addTo(map);

      requestAnimationFrame(() => mapRef.current?.invalidateSize());
    }

    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    const validPoints: VentaMapaPoint[] = [];
    const invalid: VentaMapaPoint[] = [];

    points.forEach((p) => {
      const lat = typeof p.lat === "string" ? parseFloat(p.lat) : p.lat;
      const lng = typeof p.lng === "string" ? parseFloat(p.lng) : p.lng;
      if (!isValidLatLng(lat, lng)) {
        invalid.push(p);
        return;
      }
      validPoints.push({ ...p, lat, lng });
      const icon = coloredIcon(markerColor(p.estado));
      L.marker([lat, lng], { icon })
        .addTo(layer)
        .bindPopup(
          `<div style="font-size:13px;line-height:1.5">
            <strong>${escapeHtml(p.clienteNombre)}</strong><br/>
            <span style="color:#6b7280">${escapeHtml(p.localidad)}${p.provincia ? ", " + escapeHtml(p.provincia) : ""}</span><br/>
            Asesor: ${escapeHtml(p.asesorNombre)}<br/>
            Central: ${escapeHtml(p.centralNombre)}<br/>
            Estado: <strong>${escapeHtml(p.estado)}</strong>
          </div>`,
          { maxWidth: 220 },
        );
    });

    if (invalid.length > 0) {
      console.warn(
        `[SalesMap] ${invalid.length} venta(s) descartada(s) por coordenadas inválidas`,
        invalid.slice(0, 5).map((p) => ({ id: p.id, lat: p.lat, lng: p.lng })),
      );
    }

    if (validPoints.length > 0) {
      const bounds = L.latLngBounds(validPoints.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [points]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full rounded-2xl" />;
}
