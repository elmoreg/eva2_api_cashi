# Guión Video de Defensa — Cashi API (Evaluación 3) 🎥

> **Duración máxima:** 5 minutos  
> **Antes de grabar:** Tener la URL de Render abierta en el navegador y Bruno/Insomnia listo.

---

## 0. Intro (0:00 – 0:20)

**Visual:** Mostrar la URL de producción en el navegador respondiendo.

**Voz:**
> "Hola, soy [Tu Nombre]. Este es el backend de **Cashi**, una API REST de finanzas personales desplegada en Render.com. La URL pública es `https://cashi-api.onrender.com`. Voy a defender las decisiones técnicas del proyecto."

---

## 1. Elección de Tecnologías (0:20 – 1:30)

**Visual:** Mostrar `package.json` con las dependencias.

### ¿Por qué Hono y no Express?
> "Elegimos **Hono** porque está construido sobre las Web APIs estándar del navegador — Request y Response. Es extremadamente liviano, tiene tipado TypeScript de primera clase y un rendimiento superior a Express. Express fue diseñado en 2010; Hono está pensado para el ecosistema moderno."

### ¿Por qué Prisma y no SQL crudo?
> "**Prisma** nos da type-safety total: si escribimos una consulta incorrecta, TypeScript nos lo dice en compilación, no en producción con datos reales. El `schema.prisma` es la fuente de verdad del modelo de datos. Podemos cambiar de base de datos modificando una sola línea."

### ¿Por qué PostgreSQL?
> "**PostgreSQL** es la base de datos relacional open-source más robusta del mercado. Soporta transacciones ACID — crítico para datos financieros — y tiene soporte nativo en todas las plataformas cloud. Era la opción obvia para una app de finanzas."

### ¿Por qué bcryptjs y no SHA-256?
> "**SHA-256 es demasiado rápido** — un atacante puede probar miles de millones de hashes por segundo en GPU. **bcrypt** es deliberadamente lento gracias a sus rondas de salt configurables. Además incorpora el salt en el hash, haciendo imposibles los ataques con rainbow tables. Para contraseñas, la lentitud es una característica, no un bug."

---

## 2. Estructura de Carpetas (1:30 – 2:30)

**Visual:** Expandir `src/` en el editor, recorrer cada carpeta.

**Voz:**
> "El proyecto sigue arquitectura N-Layer. Cada carpeta tiene una sola responsabilidad:"

- **`routes/`** → "Solo mapea URLs a controladores. Cero lógica."
- **`controllers/`** → "Recibe el request, valida con Zod, llama al repositorio, devuelve la respuesta HTTP."
- **`repositories/`** → "Única capa que toca Prisma. Si cambiamos de base de datos, solo tocamos aquí."
- **`schemas/`** → "Definiciones Zod. Son el contrato: qué forma deben tener los datos."
- **`lib/`** → "Utilidades globales: el singleton de Prisma, el middleware JWT y el handler de errores de BD."

> "Esta separación tiene sentido porque cada capa tiene una sola razón para cambiar. Si modificamos la validación, tocamos `schemas/`. Si cambiamos la base de datos, tocamos `repositories/`. El resto no se ve afectado."

---

## 3. Decisiones de Arquitectura (2:30 – 3:45)

### ¿Por qué JWT y no sessions?

**Visual:** Abrir `src/lib/auth.middleware.ts`.

> "Nuestra API está diseñada para consumirse desde una app móvil. Las **sessions** requieren estado en el servidor — un Redis o una tabla de sesiones. **JWT** es stateless: el servidor no guarda nada. El token viaja en el header `Authorization: Bearer` de cada request y se verifica criptográficamente. Para APIs consumidas desde móvil, JWT elimina la necesidad de infraestructura adicional de sesiones."

### ¿Por qué el ownership check está en el controller y no en el repository?

**Visual:** Señalar la verificación en `src/controllers/transactions.controller.ts`:
```typescript
if (existing.userId !== user.userId) 
  return c.json({ error: 'No autorizado' }, 403)
```

> "El **repositorio** es acceso a datos puro. La pregunta '¿tiene este usuario permiso sobre este recurso?' es lógica de **dominio** — una decisión de negocio. Si la ponemos en el repositorio, estamos filtrando por política de acceso en la capa de datos, violando la separación de responsabilidades. Si mañana cambiamos la regla de negocio, lo cambiamos en el controller, no en el repositorio."

---

## 4. Demo en Vivo (3:45 – 4:45)

**Visual:** Cambiar a Bruno/Insomnia con la URL de producción.

```
1. POST https://cashi-api.onrender.com/auth/register
   → Recibo un JWT ✅

2. POST /categories  (Authorization: Bearer <token>)
   Body: { "name": "Alimentación" }
   → Categoría creada con id ✅

3. POST /transactions  (Authorization: Bearer <token>)
   Body: { "amount": 50000, "type": "income", "description": "Salario",
           "date": "2026-06-15T12:00:00Z", "categoryId": 1 }
   → Transacción creada ✅

4. GET /transactions/balance  (Authorization: Bearer <token>)
   → { "totalIncome": 50000, "totalExpense": 0, "balance": 50000 } ✅
```

> "Todo el flujo funciona en producción. La base de datos es PostgreSQL gestionada por Render, las migraciones se aplicaron durante el build y el JWT es válido por 7 días."

---

## 5. Cierre (4:45 – 5:00)

**Visual:** Mostrar el repositorio en GitHub.

> "El repositorio está en GitHub con los cambios de despliegue incorporados. Cada `git push` a `main` dispara un deploy automático en Render. Gracias."

---

## ✅ Checklist antes de grabar

- [ ] URL de Render respondiendo (`https://cashi-api.onrender.com/`)
- [ ] Bruno/Insomnia con las 4 peticiones de la demo cargadas y apuntando a la URL de producción
- [ ] Token JWT copiado y en el header Authorization
- [ ] Editor con `src/` expandido mostrando las 5 carpetas
- [ ] `package.json` visible en otra pestaña del editor
