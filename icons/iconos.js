/* ============================================================
   Zent — set de iconos propios (minimalistas, trazo 1.6)
   Reemplazan a los emojis de categorías.
   Estilo: 24x24, sin relleno, trazo redondeado.
   ============================================================ */

window.ZENT_ICONOS = {
  /* ---------- Comida y bebida ---------- */
  comida: '<path d="M4 11h16a8 8 0 0 1-16 0Z"/><path d="M9 7c0-1.3 1-1.7 1-3.2M13 7c0-1.3 1-1.7 1-3.2"/>',
  restaurante: '<path d="M8 2v6a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V2"/><path d="M10 10v12"/><path d="M17 2v20"/><path d="M17 2c-1.6 1.6-2.2 3.6-2.2 5.6 0 1.8 1 2.6 2.2 2.8"/>',
  cafeteria: '<path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8V5h6v3"/><path d="M7 13h10"/>',
  cafe: '<path d="M5 10h10v5a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5v-5Z"/><path d="M15 11h2a2 2 0 0 1 0 4h-2"/><path d="M8 2c0 1.4 1 1.6 1 3M12 2c0 1.4 1 1.6 1 3"/>',
  pan: '<path d="M5 13a7 7 0 0 1 14 0v3a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-3Z"/><path d="M9 7v9M12 6.5v10M15 7v9"/>',
  pastel: '<path d="M4 11h16v7a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-7Z"/><path d="M4 11c1.4-1.4 2.9-1.4 4.3 0s2.9 1.4 4.3 0 2.9-1.4 4.3 0 1.5 1.4 3.1 0"/><path d="M12 8V4"/>',
  pizza: '<path d="M12 3 5 19.5a1 1 0 0 0 .9 1.4h12.2a1 1 0 0 0 .9-1.4L12 3Z"/><circle cx="10" cy="13" r="1.2"/><circle cx="14" cy="16" r="1"/><circle cx="12" cy="8.5" r="1"/>',
  helado: '<path d="M6 10h12l-6 11-6-11Z"/><circle cx="9" cy="7" r="2.6"/><circle cx="15" cy="7" r="2.6"/>',
  jugo: '<path d="M7 7h10l-1 13H8L7 7Z"/><path d="M12 7 16 2"/><path d="M8 13h8"/>',
  cerveza: '<path d="M6 6h9v10a4 4 0 0 1-4 4h-1a4 4 0 0 1-4-4V6Z"/><path d="M15 8h2.5a2.5 2.5 0 0 1 0 5H15"/><path d="M8 3v3M11 3v3"/>',
  vino: '<path d="M8 3h8l-1 5a3 3 0 0 1-6 0L8 3Z"/><path d="M12 11v7M8.5 21h7"/>',
  mercado: '<path d="M5 8h14l-1.5 11a2 2 0 0 1-2 1.8H8.5a2 2 0 0 1-2-1.8L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  supermercado: '<path d="M3 4h2l2.2 10.5a2 2 0 0 0 2 1.5h7.5a2 2 0 0 0 2-1.6L20 8H6"/><circle cx="10" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/>',
  despensa: '<rect x="4" y="9" width="16" height="11" rx="2"/><path d="M7 9V6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3M13 9V6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3"/>',

  /* ---------- Transporte y viajes ---------- */
  bus: '<rect x="4" y="4" width="16" height="13" rx="2.5"/><path d="M4 11h16"/><path d="M7 17v2M17 17v2"/><circle cx="8" cy="14" r="1"/><circle cx="16" cy="14" r="1"/>',
  taxi: '<path d="M4 16v-4l2-5h12l2 5v4"/><path d="M4 16h16"/><circle cx="8" cy="16" r="1.6"/><circle cx="16" cy="16" r="1.6"/><path d="M10 7V4h4v3"/>',
  carro: '<path d="M4 16v-3l2-5h12l2 5v3"/><path d="M4 13h16"/><circle cx="7.5" cy="16.5" r="1.6"/><circle cx="16.5" cy="16.5" r="1.6"/>',
  moto: '<circle cx="5" cy="16.5" r="3.2"/><circle cx="19" cy="16.5" r="3.2"/><path d="M5 16.5h5l4-7h4"/><path d="M11 9.5h4"/>',
  bicicleta: '<circle cx="6" cy="16" r="4"/><circle cx="18" cy="16" r="4"/><path d="m6 16 4-8h4l4 8"/><path d="M9 8h5"/>',
  semaforo: '<rect x="8" y="3" width="8" height="14" rx="3.5"/><circle cx="12" cy="7" r="1.1"/><circle cx="12" cy="12" r="1.1"/><path d="M12 17v4"/>',
  gasolina: '<path d="M4 20V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14"/><path d="M3 20h12"/><path d="M14 10h2.5a2.5 2.5 0 0 1 2.5 2.5V17a1.5 1.5 0 0 0 3 0V9l-3-3"/>',
  parqueadero: '<rect x="3" y="3" width="18" height="18" rx="3.5"/><path d="M9.5 17V7h3a3 3 0 0 1 0 6h-3"/>',
  tren: '<rect x="6" y="3" width="12" height="13" rx="3"/><path d="M6 10h12"/><path d="m9 20-2 2M15 20l2 2"/><path d="M9 13h.01M15 13h.01"/>',
  avion: '<path d="M12 3c1 0 1.6 1 1.6 2.4V9l7 4v2l-7-2v4l2.5 2v1.5L12 19.5 8.9 20.5V19l2.5-2v-4l-7 2v-2l7-4V5.4C10.4 4 11 3 12 3Z"/>',
  hotel: '<path d="M3 18v-8h11a4 4 0 0 1 4 4v4"/><path d="M3 14h15"/><circle cx="7.5" cy="12" r="1.6"/><path d="M3 18h18"/>',
  maleta: '<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M3 12h18"/>',
  viaje: '<circle cx="12" cy="12" r="8.5"/><path d="m15.8 8.2-2.2 5.4-5.4 2.2 2.2-5.4 5.4-2.2Z"/>',
  pasaporte: '<rect x="5" y="3" width="14" height="18" rx="2.5"/><circle cx="12" cy="10" r="3.5"/><path d="M8.5 16.5h7"/>',

  /* ---------- Dinero y pagos ---------- */
  dinero: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 9.5h.01M18 14.5h.01"/>',
  moneda: '<circle cx="12" cy="12" r="8.5"/><path d="M12 6.5v11"/><path d="M14.5 9.2c0-1-1.1-1.7-2.5-1.7S9.5 8.2 9.5 9.2s1.1 1.5 2.5 1.5 2.5.5 2.5 1.5-1.1 1.7-2.5 1.7-2.5-.7-2.5-1.7"/>',
  tarjeta: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19"/><path d="M6 15h4"/>',
  efectivo: '<ellipse cx="9" cy="7" rx="5" ry="2.5"/><path d="M4 7v4c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V7"/><path d="M14 11c2.8 0 5 1.1 5 2.5V16c0 1.4-2.2 2.5-5 2.5"/>',
  transferencia: '<path d="M4 9h13M14 6l3 3-3 3"/><path d="M20 15H7M10 12l-3 3 3 3"/>',
  recibo: '<path d="M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21V3Z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  factura: '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M9 12h6M9 16h4"/>',
  presupuesto: '<rect x="4" y="4" width="16" height="17" rx="2"/><path d="M9 4v3M15 4v3"/><path d="M8 12h8M8 16h5"/>',
  inversion: '<path d="m3 17 5-6 4 4 4-6 5 6"/><path d="M3 21h18"/>',
  porcentaje: '<path d="M18 6 6 18"/><circle cx="8" cy="8" r="2.2"/><circle cx="16" cy="16" r="2.2"/>',
  impuesto: '<path d="M6 3h12v18H6z"/><circle cx="10" cy="9" r="1.4"/><circle cx="14" cy="15" r="1.4"/><path d="M14 9 10 15"/>',
  renovacion: '<path d="M20 12a8 8 0 1 1-3-6.2"/><path d="M20 4v5h-5"/>',
  ahorro: '<path d="M4 12a8 8 0 0 1 16 0v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-5Z"/><path d="M15 5.5h3l-1.5 2.5"/><path d="M12 10v4"/>',
  meta: '<path d="M6 21V4"/><path d="M6 4h11l-2 4 2 4H6"/>',

  /* ---------- Salud y cuidado ---------- */
  salud: '<path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.6-7 9-7 9Z"/>',
  medicina: '<rect x="2.6" y="8.4" width="18.8" height="7.2" rx="3.6" transform="rotate(-45 12 12)"/><path d="m8.5 8.5 7 7"/>',
  farmacia: '<path d="M10 3h4v6h6v4h-6v8h-4v-8H4V9h6V3Z"/>',
  hospital: '<path d="M4 21V8l8-5 8 5v13"/><path d="M12 9v6M9 12h6"/>',
  dentista: '<path d="M7 3c-2 0-3 1.5-3 3.5 0 2 1 3 1.5 5s.5 4 1 6c.3 1.2 1 2 2 2s1.5-1 1.8-2.5c.3-1.4.4-2.5.7-3 .3.5.4 1.6.7 3 .3 1.5.8 2.5 1.8 2.5s1.7-.8 2-2c.5-2 .8-4 1-6S19 6.5 19 6.5C19 4.5 18 3 16 3c-1.5 0-2.6 1-4 1s-2.5-1-4-1Z"/>',
  ojo: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  gafas: '<circle cx="6.5" cy="13" r="3.5"/><circle cx="17.5" cy="13" r="3.5"/><path d="M10 13c1-1 3-1 4 0M3 12.5 4.5 6h3M21 12.5 19.5 6h-3"/>',
  gimnasio: '<path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12"/>',
  deporte: '<circle cx="12" cy="12" r="8.5"/><path d="m12 7.5 4 3-1.5 4.5h-5L8 10.5l4-3Z"/>',
  meditar: '<circle cx="12" cy="6" r="2.5"/><path d="M12 9v6"/><path d="M7 21c0-4.5 2-7 5-7s5 2.5 5 7"/><path d="M6 13h4M14 13h4"/>',

  /* ---------- Hogar y servicios ---------- */
  hogar: '<path d="M4 11 12 4l8 7v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8Z"/><path d="M9.5 21v-6h5v6"/>',
  alquiler: '<circle cx="8" cy="8" r="4"/><path d="m11 11 9 9M17 17l2-2M14 14l2-2"/>',
  servicios: '<path d="M9 17a6 6 0 1 1 6 0v1a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-1Z"/><path d="M9.5 22h5"/>',
  energia: '<path d="M9 3v5M15 3v5"/><path d="M6 8h12v3a6 6 0 0 1-12 0V8Z"/><path d="M12 17v4"/>',
  agua: '<path d="M12 3s6 6.5 6 10.5a6 6 0 0 1-12 0C6 9.5 12 3 12 3Z"/>',
  gas: '<path d="M12 21a6 6 0 0 0 6-6c0-4-4-5-4-9-2 2-3 4-3 6-1-.5-1.5-1.5-1.5-2.5C7 11 6 13 6 15a6 6 0 0 0 6 6Z"/>',
  internet: '<path d="M2.5 9a15 15 0 0 1 19 0M5.5 12.5a10 10 0 0 1 13 0M8.5 16a5.5 5.5 0 0 1 7 0"/><circle cx="12" cy="19.5" r="1"/>',
  tv: '<rect x="2.5" y="6" width="19" height="12.5" rx="2"/><path d="m8 3 4 3 4-3"/>',
  limpieza: '<path d="M9 8h6v11a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V8Z"/><path d="M10 8V5h4v3"/><path d="M14 5h4M18 3v4"/>',
  lavanderia: '<rect x="4" y="3" width="16" height="18" rx="2.5"/><circle cx="12" cy="14" r="4.5"/><path d="M7.5 6.5h.01M10.5 6.5h.01"/><path d="M8.5 14c1.5-1.5 3-1.5 4.5 0"/>',
  muebles: '<path d="M7 4v6h10V4"/><path d="M5 10h14v3H5z"/><path d="M7 13v7M17 13v7"/>',
  jardin: '<path d="M12 21v-8"/><path d="M12 13c-3 0-5-2-5-5 3 0 5 2 5 5Z"/><path d="M12 13c3 0 5-2 5-5-3 0-5 2-5 5Z"/><path d="M8 21h8"/>',

  /* ---------- Trabajo y estudio ---------- */
  trabajo: '<rect x="2.5" y="7" width="19" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M2.5 12h19"/>',
  oficina: '<path d="M5 21V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v17"/><path d="M15 9h3a1 1 0 0 1 1 1v11"/><path d="M8 7h1.5M8 11h1.5M8 15h1.5M11.5 7H13M11.5 11H13M11.5 15H13"/><path d="M3 21h18"/>',
  reunion: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5"/><circle cx="17.5" cy="9.5" r="2.3"/><path d="M16.5 15.5c2.9 0 5 1.6 5 4"/>',
  llamada: '<path d="M6 3h3l2 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 2v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4 5.2 2 2 0 0 1 6 3Z"/>',
  email: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
  tareas: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="m8 9 1.5 1.5L12 8"/><path d="M14 9h3M8 15l1.5 1.5L12 14"/><path d="M14 15h3"/>',
  universidad: '<path d="M12 4 2 9l10 5 10-5-10-5Z"/><path d="M6 11.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5"/><path d="M21 9v5"/>',
  curso: '<path d="M12 6.5S10 4.5 5 4.5v13c5 0 7 2 7 2s2-2 7-2v-13c-5 0-7 2-7 2Z"/><path d="M12 6.5v13"/>',
  biblioteca: '<path d="M4 4h16v16H4z"/><path d="M4 10h16M4 15h16"/><path d="M9 4v16"/>',
  idiomas: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.4 2.5 3.6 5.3 3.6 8.5S14.4 18 12 20.5c-2.4-2.5-3.6-5.3-3.6-8.5S9.6 6 12 3.5Z"/>',
  certificado: '<circle cx="12" cy="9" r="5"/><path d="M8.5 13.5 7 21l5-2.5L17 21l-1.5-7.5"/>',

  /* ---------- Ocio y viajes ---------- */
  ocio: '<path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z"/><path d="M12 8v8"/>',
  cine: '<path d="M3 8h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z"/><path d="M3 8 4.5 4h15L18 8"/><path d="m7 4 2 4M12 4l2 4M17 4l2 4"/>',
  musica: '<path d="M9 18V6l10-2v12"/><circle cx="7" cy="18" r="2.2"/><circle cx="17" cy="16" r="2.2"/>',
  concierto: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"/>',
  videojuego: '<rect x="2.5" y="7" width="19" height="10" rx="5"/><path d="M7 10v4M5 12h4"/><circle cx="16" cy="11" r="1"/><circle cx="18.5" cy="13.5" r="1"/>',
  lectura: '<path d="M12 7C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 2 2-2 5-2.5 8.5-2V5c-3.5-.5-6.5 0-8.5 2Z"/><path d="M12 7v13"/>',
  pintura: '<path d="m15 4 5 5-8 8-5-5 8-8Z"/><path d="m13 6 5 5"/><path d="M9 14c-1 1-1.5 3-1.5 5.5C9 19 9.5 17 11 16"/>',
  fotografia: '<path d="M3 8.5A2.5 2.5 0 0 1 5.5 6H8l1.5-2h5L16 6h2.5A2.5 2.5 0 0 1 21 8.5v9A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-9Z"/><circle cx="12" cy="13" r="3.5"/>',
  mapa: '<path d="m3 6 5-2 8 2 5-2v14l-5 2-8-2-5 2V6Z"/><path d="M8 4v14M16 6v14"/><circle cx="12" cy="11" r="1.7"/>',
  camping: '<path d="M12 4 3 20h18L12 4Z"/><path d="M9 20 12 13l3 7"/>',
  senderismo: '<path d="m3 19 6-10 4 6 2.5-3.5L21 19H3Z"/>',
  loteria: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="8" cy="11" r="1.4"/><circle cx="12" cy="13" r="1.4"/><circle cx="16" cy="11" r="1.4"/><path d="M6 15.5h8"/>',

  /* ---------- Personas y hogar ---------- */
  familia: '<circle cx="7.5" cy="7" r="2.8"/><path d="M2.5 19c0-3 2.2-4.6 5-4.6s5 1.6 5 4.6"/><circle cx="17" cy="9" r="2.2"/><path d="M15 14.6c2.6 0 4.5 1.6 4.5 4.4"/>',
  pareja: '<path d="M12 20C8.4 17.4 5.5 14.6 5.5 11a3.7 3.7 0 0 1 6.5-2.4A3.7 3.7 0 0 1 18.5 11c0 3.6-2.9 6.4-6.5 9Z"/><path d="M17 7.5c1.6 0 2.8 1.2 2.8 2.7 0 2-1.6 3.6-3.4 5-1.8-1.4-3.4-3-3.4-5 0-1.5 1.2-2.7 2.8-2.7Z"/>',
  amistad: '<circle cx="12" cy="7" r="2.6"/><circle cx="5.5" cy="10" r="2.2"/><circle cx="18.5" cy="10" r="2.2"/><path d="M8 20c0-2.8 1.8-4.4 4-4.4s4 1.6 4 4.4"/><path d="M1.5 19c0-2.3 1.7-3.6 4-3.6.6 0 1.1.1 1.6.3"/><path d="M18.9 15.7c.5-.2 1-.3 1.6-.3 2.3 0 4 1.3 4 3.6"/>',
  regalo: '<rect x="3" y="9" width="18" height="11" rx="2"/><path d="M3 13h18M12 9v11"/><path d="M12 9S9 9 8 6.5A2.5 2.5 0 0 1 12 5a2.5 2.5 0 0 1 4 1.5C15 9 12 9 12 9Z"/>',
  boda: '<circle cx="9" cy="14" r="5"/><circle cx="15" cy="14" r="5"/>',
  ropa: '<path d="M8 3 4 5.5 5.5 10 8 9v11h8V9l2.5 1L20 5.5 16 3a4 4 0 0 1-8 0Z"/>',
  zapatos: '<path d="M3 16h6l3 2h9v3H3v-5Z"/><path d="M9 16v-4"/>',
  belleza: '<path d="m15 3 6 6-8 8-6-6 8-8Z"/><path d="m12 6 6 6"/><path d="M7 11c-1.5 1.5-1.5 4-1 6 2 0 4.5.5 6-1"/>',
  mascotas: '<circle cx="7" cy="9" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="17" cy="9" r="2"/><path d="M12 12c3 0 5 2.2 5 4.3 0 1.6-1.4 2.7-3 2.7-1 0-1.3-.5-2-.5s-1 .5-2 .5c-1.6 0-3-1.1-3-2.7C7 14.2 9 12 12 12Z"/>',

  /* ---------- General ---------- */
  seguridad: '<path d="M12 3 5 6v5.5c0 4.3 3 8 7 9.5 4-1.5 7-5.2 7-9.5V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
  legal: '<path d="M12 4v16M7 20h10M4 8h16M12 4 8 8M12 4l4 4"/><path d="M4 8l-2.5 5a3 3 0 0 0 5 0L4 8ZM20 8l-2.5 5a3 3 0 0 0 5 0L20 8Z"/>',
  reloj: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',
  calendario: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  creciente: '<path d="M4 17 10 11l4 4 6-7"/><path d="M15 8h5v5"/>',
  descendente: '<path d="M4 7l6 6 4-4 6 7"/><path d="M15 16h5v-5"/>',
  compartir: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4"/>',
  descargar: '<path d="M12 3v11M8 10l4 4 4-4"/><path d="M4 19h16"/>',
  etiqueta: '<path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9-9-9Z"/><circle cx="7.5" cy="7.5" r="1.3"/>',
  chat: '<path d="M4 5h16v11H9l-5 4V5Z"/><path d="M8 9h8M8 12.5h5"/>',
  mas: '<circle cx="12" cy="12" r="8.5"/><path d="M12 8v8M8 12h8"/>',
  aviso: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5.5M12 16.5h.01"/>',
  ajustes: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M18.8 5.2l-2.1 2.1M7.3 16.7l-2.1 2.1"/>',
  filtro: '<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',
  candado: '<rect x="4.5" y="10" width="15" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14.5v2.5"/>',
  guardar: '<path d="M4 4h12l4 4v12H4z"/><path d="M8 4v6h7V4"/><path d="M8 20v-6h8v6"/>',
  carpeta: '<path d="M3 6a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z"/>'
};

/* Helper: devuelve el SVG completo de un icono */
window.zentIcono = function (id, clase) {
  var d = window.ZENT_ICONOS[id] || window.ZENT_ICONOS.mas;
  return '<svg class="icono' + (clase ? ' ' + clase : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + d + '</svg>';
};
