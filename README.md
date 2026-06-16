# Cashi - API de Finanzas Personales 💸

> **URL de producción:** `https://cashi-api.onrender.com` *(actualizar después del primer deploy)*

Cashi es un microservicio diseñado para gestionar ingresos y egresos, permitiendo a los usuarios organizar sus finanzas por categorías y consultar su balance general en tiempo real.

Este proyecto fue construido siguiendo una **arquitectura N-Layer** (Capas) para asegurar la escalabilidad y mantenibilidad del código.

## Stack Tecnológico

- **Runtime:** Node.js 22.x (LTS)
- **Framework:** [Hono](https://hono.dev/)
- **Lenguaje:** TypeScript
- **ORM:** Prisma 7
- **Base de Datos:** PostgreSQL
- **Validación:** Zod
- **Infraestructura:** Docker & Docker Compose
- **Build Tool:** tsdown

## Estructura del Proyecto (N-Layer)

El proyecto sigue la estructura recomendada en la guía de estudio:

- `src/routes/`: Definición de endpoints y mapeo a controladores.
- `src/controllers/`: Lógica de coordinación, validación de entrada con Zod y manejo de respuestas HTTP.
- `src/repositories/`: Capa de acceso a datos. Es la única capa que interactúa con Prisma.
- `src/schemas/`: Esquemas de validación con Zod y definiciones de tipos compartidos.
- `src/lib/`: Utilidades globales (Singleton de Prisma, manejo centralizado de errores de BD).
- `generated/`: Cliente de Prisma generado (fuera de `node_modules` para mejor visibilidad de tipos).

## Requisitos Previos

- Docker y Docker Compose instalados.
- Node.js 22+ (se recomienda usar corepack para Yarn 4).

## Instalación y Ejecución

Sigue estos pasos para levantar el proyecto localmente:

1. **Clonar el repositorio:**
   ```bash
   git clone <url-del-repo>
   cd eva2_api_cashi
   ```

2. **Instalar dependencias:**
   ```bash
   corepack enable
   yarn install
   ```

3. **Configurar variables de entorno:**
   Crea un archivo `.env` en la raíz (puedes copiar el contenido de abajo):
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cashidb?schema=public"
   PORT=3000
   ```

4. **Levantar la base de datos (Docker):**
   ```bash
   yarn db:up
   ```

5. **Ejecutar migraciones de Prisma:**
   ```bash
   yarn migrate
   ```

6. **Iniciar el servidor en modo desarrollo:**
   ```bash
   yarn dev
   ```

El servidor estará disponible en `http://localhost:3000`.

## Novedades (Unidad 3)

Esta versión incluye soporte para:
- **Usuarios y Autenticación:** Registro y Login usando contraseñas hasheadas (`bcryptjs`) y JSON Web Tokens (`jsonwebtoken`).
- **Transacciones por Usuario:** Cada transacción está asociada al usuario que la crea. El balance y el listado de transacciones son específicos de cada usuario.
- **Subida de Comprobantes:** Endpoint para adjuntar imágenes (boletas, facturas) a las transacciones. Las imágenes se guardan de forma local en la carpeta `uploads/`.

## Variables de Entorno Adicionales

Asegúrate de agregar la clave secreta para JWT a tu archivo `.env`:
```env
JWT_SECRET="supersecret-cambiame"
```

## Despliegue en Producción (Render)

El proyecto está configurado para desplegarse automáticamente en [Render.com](https://render.com) mediante el archivo `render.yaml`.

### Variables de Entorno Requeridas

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Connection string de PostgreSQL gestionado | `postgresql://user:pass@host/db` |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT (mín. 32 chars) | Generada automáticamente por Render |
| `PORT` | Puerto en el que escucha el servidor | `10000` |

> **Nota sobre uploads:** En el plan free de Render el filesystem es **efímero** — los archivos subidos a `/uploads` se pierden al reiniciar el servidor. Para persistencia real de imágenes se recomienda usar Cloudflare R2 o AWS S3.

### Pasos para desplegar

1. Crear una base de datos PostgreSQL en Render (plan Free)
2. Crear un Web Service conectado a este repositorio
3. Render detecta automáticamente el `render.yaml` y configura el servicio
4. Configurar `DATABASE_URL`, `JWT_SECRET` y `PORT` en las variables de entorno
5. El build ejecuta: `yarn install → prisma generate → prisma migrate deploy → yarn build`
6. Cada `git push` a `main` dispara un nuevo deploy automático

## Endpoints Principales

### Autenticación (Públicos)
| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/auth/register` | Crea una cuenta. Devuelve un token JWT. |
| POST | `/auth/login` | Inicia sesión. Devuelve un token JWT. |

### Categorías (Protegidos con JWT)
| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/categories` | Lista todas las categorías (globales). |
| POST | `/categories` | Crea una nueva categoría. |

### Transacciones (Protegidos con JWT)
| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/transactions` | Lista las transacciones **del usuario autenticado**. |
| GET | `/transactions/balance` | Retorna el balance general del usuario autenticado. |
| GET | `/transactions/:id` | Detalle de una transacción (solo si el usuario es el dueño). |
| POST | `/transactions` | Registra un nuevo movimiento asociado al usuario autenticado. |
| PATCH | `/transactions/:id` | Actualiza una transacción (solo si es el dueño). |
| DELETE | `/transactions/:id` | Elimina una transacción (solo si es el dueño). |
| POST | `/transactions/upload` | Sube un comprobante de imagen (`multipart/form-data`) y devuelve la URL. |

---

## Declaración de Uso de IA

- Generación de la estructura base siguiendo el patrón N-Layer.
- Implementación de esquemas de validación Zod.
- Configuración de Prisma 7 con Driver Adapters.
- Redacción de este archivo README.

La lógica de negocio y la organización de capas fueron supervisadas y ajustadas para cumplir con los requerimientos académicos de la Unidad 2.