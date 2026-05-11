# Cashi - API de Finanzas Personales 💸

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

## Endpoints Principales

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/categories` | Lista todas las categorías |
| POST | `/categories` | Crea una nueva categoría |
| GET | `/transactions` | Lista todas las transacciones (con categoría) |
| GET | `/transactions/balance` | Retorna el balance general (Ingresos - Gastos) |
| POST | `/transactions` | Registra un nuevo movimiento |

## Lógica del Balance

El requerimiento especifica que el cálculo del balance debe vivir en el **Controller**. 
En `src/controllers/transactions.controller.ts`, la función `getBalance` recupera todas las transacciones a través del repositorio y realiza la suma de ingresos y egresos para calcular el saldo final, asegurando que la lógica de negocio esté separada de la persistencia.

---

## Declaración de Uso de IA

Este proyecto fue desarrollado con la asistencia de **Antigravity (AI Coding Assistant by Google DeepMind)**.

**Uso de la herramienta:**
- Generación de la estructura base siguiendo el patrón N-Layer.
- Implementación de esquemas de validación Zod.
- Configuración de Prisma 7 con Driver Adapters.
- Redacción de este archivo README.

La lógica de negocio y la organización de capas fueron supervisadas y ajustadas para cumplir con los requerimientos académicos de la Unidad 2.