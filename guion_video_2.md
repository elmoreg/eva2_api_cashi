# Guion para el Video - Proyecto Cashi 🎥

Este guion está diseñado para una explicación de 5 a 10 minutos, cumpliendo con todos los puntos de la rúbrica de la Unidad 2.

---

## 1. Introducción (0:00 - 1:00)
- **Visual:** Mostrar la raíz del proyecto en VS Code.
- **Voz:** "Hola, mi nombre es [Tu Nombre] y hoy les presento el backend de **Cashi**, una API REST de finanzas personales. El objetivo es permitir a los usuarios registrar sus ingresos y gastos, categorizarlos y consultar su balance general."
- **Puntos clave:** Mencionar que se construyó pensando en escalabilidad y siguiendo los requerimientos de la startup Cashi.

## 2. Arquitectura N-Layer (1:00 - 3:00)
- **Visual:** Expandir la carpeta `src/`.
- **Voz:** "Para este proyecto implementamos una arquitectura de **N capas (N-Layer)**. Esto nos permite separar las responsabilidades de forma clara:"
    - **Routes:** "Definen los puntos de entrada HTTP." (Mostrar `src/routes/transactions.routes.ts`)
    - **Controllers:** "Coordinan la lógica: reciben el request, validan con Zod y llaman al repositorio." (Mostrar `src/controllers/transactions.controller.ts`)
    - **Repositories:** "Son los únicos que interactúan con Prisma y la base de datos." (Mostrar `src/repositories/transactions.repository.ts`)
    - **Schemas:** "Aquí vive la validación. Usamos Zod para asegurar que los datos sean correctos antes de procesarlos." (Mostrar `src/schemas/transactions.schema.ts`)
- **Voz:** "Esta separación es fundamental. Si mañana cambiamos de base de datos, solo tendríamos que modificar el Repositorio; el resto de la aplicación ni se enteraría."

## 3. Modelo de Datos y Prisma 7 (3:00 - 4:00)
- **Visual:** Mostrar `prisma/schema.prisma`.
- **Voz:** "Usamos **Prisma 7**. Definimos dos modelos: `Category` y `Transaction`. Hay una relación uno-a-muchos: una categoría puede tener múltiples transacciones."
- **Voz:** "Como usamos Prisma 7, implementamos un **Driver Adapter** para PostgreSQL, lo cual mejora la compatibilidad y el rendimiento en entornos modernos."

## 4. El Endpoint de Balance - Lógica de Negocio (4:00 - 5:30)
- **Visual:** Ir a la función `getBalance` en `src/controllers/transactions.controller.ts`.
- **Voz:** "Llegamos a un punto clave de la rúbrica: el cálculo del balance. Noten que esta lógica vive en el **Controller** y no en el Repositorio."
- **Voz:** "El Repositorio simplemente nos entrega los datos crudos. Es aquí, en el Controller, donde filtramos los montos por tipo (ingreso o egreso) y realizamos la resta para obtener el balance final. Esto asegura que la lógica de negocio esté centralizada y sea fácil de testear."

## 5. Validaciones y Errores (5:30 - 6:30)
- **Visual:** Mostrar un Schema en `src/schemas/` y el helper en `src/lib/prisma-errors.ts`.
- **Voz:** "Usamos **Zod** para validar que, por ejemplo, el monto de una transacción sea siempre positivo. Además, implementamos un manejador de errores de Prisma centralizado que traduce códigos técnicos (como P2002) en mensajes claros y códigos de estado HTTP adecuados como 400, 404 o 409."

## 6. Demostración de la API (6:30 - 9:00)
- **Visual:** Abrir Bruno o una terminal para hacer `curl`.
- **Acción 1:** Crear una categoría (POST `/categories`).
- **Acción 2:** Crear un ingreso y un egreso (POST `/transactions`).
- **Acción 3:** Consultar el balance (GET `/transactions/balance`).
- **Voz:** "Como pueden ver, la API responde rápidamente y los cálculos reflejan la realidad de los datos guardados en nuestra base de datos PostgreSQL corriendo en Docker."

## 7. Conclusión (9:00 - 10:00)
- **Visual:** Mostrar el `README.md`.
- **Voz:** "El proyecto incluye instrucciones claras para levantarlo con Docker Compose y un historial de commits descriptivo en GitHub. Con esto, Cashi tiene una base sólida y profesional para su aplicación móvil. ¡Muchas gracias!"

---
**Recordatorio:** Asegúrate de tener Docker Desktop abierto y el servidor corriendo (`yarn dev`) antes de empezar a grabar.
