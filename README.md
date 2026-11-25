# Taller final – Programación de redes (CIAF)

Servicio web en **Node.js + Express** para consultar y registrar el **estado de envíos**, con CORS, validación de encabezado personalizado y pruebas en Postman.

## 1. Equipo

> Completar con los datos reales (ordenados alfabéticamente por apellido, con el número de lista oficial).

| # Lista | Apellidos y nombres |
|---|---|
| 8 | Santiago Giraldo Garcia  |
| 20 | Juan Camilo Pacheco Vega |
| 21 | Sebastian Pacheco Vega |

- **N** (número de lista del primer integrante en orden alfabético): `__`
- **Encabezado asignado:** `X-Red-Equipo: CIAF-__`
- **Respuesta esperada:** `X-Servidor-Procesado: Equipo-__`

## 2. Escenario de red

Servicio de **consulta de estado de envíos**. El cliente que lo consumiría sería una **aplicación web en el navegador** (por ejemplo, un panel servido desde `http://localhost:5500`) o una app móvil de seguimiento.

**Riesgos si viajara por HTTP sin cifrado:**
- Cualquiera en la misma red (Wi-Fi público, un router comprometido) podría **leer** guías, destinos y estados (falta de confidencialidad).
- Podría **robar el valor del header** `X-Red-Equipo` y reutilizarlo para acceder al servicio.
- Podría **modificar** la petición o la respuesta en tránsito (falta de integridad), por ejemplo cambiando el estado de un envío.
- No habría forma de comprobar que el servidor es realmente el nuestro (suplantación).

## 3. Cómo ejecutar

```bash
npm install
TEAM_N=__ npm start        # Windows PowerShell: $env:TEAM_N="__"; npm start
```

El servidor queda en `http://localhost:3000`.

### Endpoints

| Método | Ruta | Descripción | Éxito |
|---|---|---|---|
| GET | `/api/envios` | Lista los envíos | 200 |
| POST | `/api/envios` | Registra un envío (`guia`, `destino`, `estado`) | 201 |

Toda petición a `/api` debe llevar `X-Red-Equipo: CIAF-N`; si falta o no coincide, responde **401** con un JSON explicativo. Las respuestas exitosas incluyen `X-Servidor-Procesado: Equipo-N`.

### CORS

Se configuró el middleware `cors` permitiendo **solo** el origen `http://localhost:5500`. Cuando la petición trae el header `Origin: http://localhost:5500`, el servidor responde:

```
Access-Control-Allow-Origin: http://localhost:5500
```

Además se permiten los headers `Content-Type` y `X-Red-Equipo`, y se expone `X-Servidor-Procesado`. Postman no envía `Origin` por defecto, por eso la colección lo agrega manualmente.

## 4. Colección de Postman

Archivo: `postman_collection.json` (importar en Postman y ajustar la variable `equipoHeader` a `CIAF-N`).

1. GET válido → 200
2. POST válido → 201
3. GET sin header → 401
4. Verificación de headers de respuesta (CORS y `X-Servidor-Procesado`)

## 5. Mapeo de la petición en el modelo TCP/IP

Recorrido de `GET /api/envios` desde Postman hasta Express:

| Capa TCP/IP | Qué pasa en nuestra petición |
|---|---|
| **Aplicación** | Postman construye el mensaje **HTTP**: método `GET`, ruta `/api/envios` y headers (`X-Red-Equipo`, `Origin`). Express lo recibe, pasa por CORS y por el middleware, y responde con JSON y código HTTP. |
| **Transporte** | **TCP** divide el mensaje en segmentos, establece conexión (three-way handshake) y garantiza que lleguen completos y en orden. Usa el **puerto de destino 3000** y un puerto de origen efímero. |
| **Internet** | **IP** agrega las direcciones de origen y destino (aquí `127.0.0.1`, porque todo corre en la misma máquina) y se encarga del enrutamiento de los paquetes. |
| **Acceso a red** | Los paquetes se convierten en tramas y señales físicas (Ethernet/Wi-Fi). En `localhost` pasan por la interfaz de loopback sin salir de la máquina. |

Al llegar, el proceso se invierte: cada capa quita su encabezado hasta que Express recibe el mensaje HTTP.

## 6. HTTPS (SSL/TLS) y CORS en nuestro caso

**SSL/TLS (HTTPS)** cifra la comunicación entre Postman/navegador y el servidor. Protege la **confidencialidad** (nadie en el camino puede leer guías ni el header `X-Red-Equipo`), la **integridad** (se detecta si alguien altera los datos) y la **autenticidad** del servidor (el certificado demuestra que es quien dice ser). Funciona entre la capa de aplicación y la de transporte: HTTP viaja "dentro" de TLS sobre TCP. En este taller usamos HTTP por ser entorno local, pero en producción sería obligatorio HTTPS.

**CORS** resuelve un problema del **navegador**: por la política de mismo origen, una página servida desde un origen (`localhost:5500`) no puede leer respuestas de otro origen (`localhost:3000`) a menos que el servidor lo autorice con `Access-Control-Allow-Origin`. CORS no es autenticación ni protege al servidor de otros clientes (Postman o `curl` ignoran CORS): solo controla qué páginas web pueden leer las respuestas desde el navegador. Por eso lo combinamos con el header `X-Red-Equipo` para controlar el acceso.

## 7. Capturas de pantalla

> Agregar las imágenes en la carpeta `capturas/` y enlazarlas aquí.

- Respuesta exitosa (200/201) con los **Headers de respuesta** visibles: `![exito](capturas/exito.png)`
- Respuesta **401** al omitir el encabezado: `![401](capturas/401.png)`
