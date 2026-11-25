const express = require("express");
const cors = require("cors");

// ====== CONFIGURACIÓN DEL EQUIPO ======
// N = número de lista del primer integrante (orden alfabético por apellido).

const N = process.env.TEAM_N || "8"; // <-- CAMBIAR
const HEADER_NAME = "X-Red-Equipo";
const HEADER_VALUE = `CIAF-${N}`;
const ORIGEN_PERMITIDO = "http://localhost:5500";
const PORT = process.env.PORT || 3000;
// =======================================

const app = express();

// 1) CORS primero: así las respuestas de preflight (OPTIONS) y los 401
//    también llevan Access-Control-Allow-Origin.
app.use(
  cors({
    origin: ORIGEN_PERMITIDO, // devuelve: Access-Control-Allow-Origin: http://localhost:5500
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", HEADER_NAME],
    exposedHeaders: ["X-Servidor-Procesado"], // para que el navegador pueda leerlo
  })
);

app.use(express.json());

// 2) Middleware de validación del encabezado personalizado
function validarEncabezadoEquipo(req, res, next) {
  const recibido = req.get(HEADER_NAME);

  if (!recibido || recibido !== HEADER_VALUE) {
    return res.status(401).json({
      error: "401 Unauthorized",
      mensaje: `Falta el encabezado ${HEADER_NAME} o su valor es incorrecto.`,
      esperado: `${HEADER_NAME}: CIAF-N`,
      recibido: recibido || null,
    });
  }

  // Encabezado de respuesta para toda respuesta que pase la validación
  res.set("X-Servidor-Procesado", `Equipo-${N}`);
  next();
}

app.use("/api", validarEncabezadoEquipo);

// 3) Recurso: consulta de estado de envíos (datos en memoria)
const envios = [
  { id: 1, guia: "CO-1001", destino: "Pereira", estado: "En tránsito" },
  { id: 2, guia: "CO-1002", destino: "Manizales", estado: "Entregado" },
];

// GET /api/envios -> consulta
app.get("/api/envios", (req, res) => {
  res.status(200).json({ total: envios.length, data: envios });
});

// POST /api/envios -> registro (JSON)
app.post("/api/envios", (req, res) => {
  const { guia, destino, estado } = req.body || {};

  if (!guia || !destino || !estado) {
    return res.status(400).json({
      error: "400 Bad Request",
      mensaje: "El JSON debe incluir: guia, destino y estado.",
    });
  }

  const nuevo = { id: envios.length + 1, guia, destino, estado };
  envios.push(nuevo);
  res.status(201).json({ mensaje: "Envío registrado", data: nuevo });
});

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
  console.log(`Header requerido -> ${HEADER_NAME}: ${HEADER_VALUE}`);
  console.log(`Origen CORS permitido -> ${ORIGEN_PERMITIDO}`);
});
