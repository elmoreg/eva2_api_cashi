# Guión para el Video — Backend Cashi API 🎥

> **Duración estimada:** 8 a 10 minutos  
> **Antes de grabar:** Docker Desktop corriendo, servidor activo con `yarn dev`, y Bruno (o Insomnia) listo con las peticiones preparadas.

---

## 1. Introducción (0:00 – 1:00)

**Visual:** Mostrar la raíz del proyecto en el editor (VS Code o similar).

**Voz:**
> "Hola, mi nombre es [Tu Nombre]. Les voy a presentar el backend de **Cashi**, una API REST de finanzas personales construida con Node.js, Hono, TypeScript, Prisma 7 y PostgreSQL corriendo en Docker."
>
> "El objetivo de esta API es permitir a los usuarios registrarse, autenticarse, y luego registrar sus ingresos y egresos, organizarlos por categorías, subir comprobantes y consultar su balance en tiempo real."

---

## 2. Arquitectura N-Layer (1:00 – 3:30)

**Visual:** Expandir la carpeta `src/` en el explorador de archivos.

**Voz:**
> "El proyecto sigue una arquitectura de **N capas**, separando responsabilidades de forma clara. Vean la carpeta `src/`."

Recorrer cada carpeta mostrando el archivo correspondiente:

### `src/routes/` → Punto de entrada HTTP
> "Las **rutas** definen los endpoints y los conectan con los controladores. Son sólo mapeo, sin lógica."

### `src/controllers/` → Coordinación y validación
> "Los **controladores** son el cerebro de cada request. Reciben la petición, validan los datos con Zod, delegan al repositorio y devuelven la respuesta HTTP. Nada de SQL aquí."

### `src/repositories/` → Única capa que toca la base de datos
> "Los **repositorios** son la única capa que habla con Prisma. Si mañana cambiamos de PostgreSQL a MySQL, sólo tocamos esta capa. El resto de la aplicación ni se entera."

### `src/schemas/` → Contratos de validación con Zod
> "Los **schemas** con Zod definen exactamente qué forma deben tener los datos. Son la fuente de verdad para la validación."

### `src/lib/` → Utilidades globales
> "En `lib/` tenemos tres piezas clave: el singleton de Prisma, el middleware de autenticación JWT y el manejador centralizado de errores de base de datos."

**Voz:**
> "Esta separación es fundamental para la mantenibilidad. Cada capa tiene una sola razón para cambiar."

---

## 3. Modelo de Datos — Prisma 7 (3:30 – 5:00)

**Visual:** Abrir `prisma/schema.prisma`.

**Voz:**
> "Nuestro modelo de datos tiene tres entidades. Abro `schema.prisma`."

Señalar en el archivo:

```prisma
model User {
  id           Int           @id @default(autoincrement())
  email        String        @unique
  passwordHash String
  transactions Transaction[]
}

model Category {
  id           Int           @id @default(autoincrement())
  name         String        @unique
  transactions Transaction[]
}

model Transaction {
  id          Int      @id @default(autoincrement())
  amount      Float
  type        String   // "income" or "expense"
  description String?
  date        DateTime
  receiptUrl  String?
  latitude    Float?
  longitude   Float?
  categoryId  Int
  userId      Int
}
```

> "Tenemos **User**, **Category** y **Transaction**. Noten que Transaction tiene relaciones con ambos: cada transacción pertenece a un usuario y a una categoría. Esto garantiza que los datos de un usuario son completamente privados."
>
> "Una particularidad importante: como usamos **Prisma 7**, el cliente se genera con un **Driver Adapter** de PostgreSQL. Esto reemplaza al modo binario tradicional y mejora la compatibilidad y el rendimiento."

**Visual:** Señalar `src/lib/prisma.ts`.

> "Acá está la configuración. Usamos un `Pool` de conexiones de `pg`, lo envolvemos en `PrismaPg` y se lo pasamos al `PrismaClient`. Con esto obtenemos un singleton reutilizable en toda la aplicación."

---

## 4. Autenticación — JWT y bcryptjs (5:00 – 6:30)

**Visual:** Abrir `src/controllers/auth.controller.ts`.

**Voz:**
> "La autenticación es el punto de entrada obligatorio para usar la API. Veamos el controlador de auth."

### Registro — señalar función `register`
> "En el **registro**, primero validamos el body con Zod. Si pasa, verificamos que el email no esté en uso. Luego hasheamos la contraseña con `bcryptjs` usando 10 rondas de salt, creamos el usuario y devolvemos un **JWT válido por 7 días**."

### Login — señalar función `login`
> "En el **login**, validamos, buscamos al usuario por email, comparamos la contraseña con `bcrypt.compare` y si todo es correcto, devolvemos un nuevo token JWT."

**Visual:** Abrir `src/lib/auth.middleware.ts`.

> "Todas las rutas de categorías y transacciones pasan por este **middleware**. Extrae el token del header `Authorization: Bearer`, lo verifica con `jwt.verify` y guarda los datos del usuario en el contexto de Hono con `c.set('user', decoded)`. Si el token es inválido o falta, la respuesta es un 401 inmediato."

---

## 5. Validación con Zod y Errores de BD (6:30 – 7:30)

**Visual:** Abrir `src/schemas/transactions.schema.ts`.

**Voz:**
> "Toda entrada pasa por un schema Zod antes de tocar la base de datos. Por ejemplo, en transacciones:"

Señalar en el archivo:
```ts
export const createTransactionSchema = z.object({
  amount: z.number().positive(),   // monto siempre positivo
  type: z.enum(['income', 'expense']),
  date: z.string().datetime(),
  categoryId: z.number().positive(),
  // ...campos opcionales
})
```

> "El campo `amount` siempre debe ser positivo. `type` sólo acepta los valores `income` o `expense`. Si algo falla, Zod nos devuelve los errores detallados y el controlador responde con 400 sin llegar al repositorio."

**Visual:** Abrir `src/lib/prisma-errors.ts`.

> "Para los errores de base de datos, tenemos un helper centralizado `parsePrismaError`. Traduce los códigos técnicos de Prisma en respuestas HTTP limpias: P2002 es un conflicto de unicidad, devuelve 409. P2003 es una referencia inválida, devuelve 422. P2025 es un registro no encontrado, devuelve 404. El usuario nunca ve un stack trace, sólo un mensaje claro."

---

## 6. Lógica de Negocio — El Balance y la Seguridad por Usuario (7:30 – 8:30)

**Visual:** Abrir `src/controllers/transactions.controller.ts`, ir a la función `getBalance`.

**Voz:**
> "Llegamos a uno de los puntos clave de la rúbrica: el cálculo del **balance**."

Señalar el código:
```ts
export const getBalance = async (c: Context) => {
  const user = c.get('user')
  const transactions = await transactionsRepository.findAll(user.userId)

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0)

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0)

  return c.json({ totalIncome, totalExpense, balance: totalIncome - totalExpense })
}
```

> "El repositorio nos entrega los datos crudos del usuario autenticado. Es en el **controlador** donde hacemos la lógica de negocio: filtramos por `income` y `expense`, acumulamos con `reduce` y calculamos la diferencia. Esta lógica está en la capa correcta: el controlador."
>
> "Noten también la seguridad por dueño. En `getTransactionById` y en `delete`, verificamos que `transaction.userId === user.userId`. Si no coincide, respondemos con un **403 Forbidden**. Un usuario nunca puede ver ni modificar los datos de otro."

---

## 7. Demostración de la API en vivo (8:30 – 10:00)

**Visual:** Cambiar a Bruno (o Insomnia / Postman).

> "Ahora veamos todo en acción."

### Paso 1 — Registrar usuario
```
POST http://localhost:3000/auth/register
Body: { "email": "demo@cashi.com", "password": "Demo1234" }
```
> "Recibimos un token JWT. Lo copio."

### Paso 2 — Crear una categoría (con JWT)
```
POST http://localhost:3000/categories
Authorization: Bearer <token>
Body: { "name": "Alimentación" }
```
> "Ahora con el token en el header, creo la categoría. Anoto el `id` que devuelve."

### Paso 3 — Registrar un ingreso
```
POST http://localhost:3000/transactions
Authorization: Bearer <token>
Body: {
  "amount": 50000,
  "type": "income",
  "description": "Salario",
  "date": "2026-06-15T12:00:00Z",
  "categoryId": 1
}
```

### Paso 4 — Registrar un egreso
```
POST http://localhost:3000/transactions
Body: { "amount": 12500, "type": "expense", "description": "Supermercado", "date": "...", "categoryId": 1 }
```

### Paso 5 — Consultar el balance
```
GET http://localhost:3000/transactions/balance
Authorization: Bearer <token>
```
> "La respuesta muestra `totalIncome: 50000`, `totalExpense: 12500` y `balance: 37500`. Los números cuadran con lo que registramos."

### Paso 6 (opcional) — Mostrar error de validación
```
POST /transactions → Body con amount: -100
```
> "Si enviamos un monto negativo, Zod lo rechaza inmediatamente con un 400 y un mensaje descriptivo. La base de datos nunca lo recibe."

---

## 8. Conclusión (10:00 – 10:30)

**Visual:** Mostrar el `README.md`.

**Voz:**
> "El proyecto incluye un README con instrucciones para levantarlo con Docker Compose y un historial de commits descriptivo en GitHub. Con esta arquitectura N-Layer, validaciones Zod, autenticación JWT y errores centralizados, Cashi tiene una base sólida, segura y fácil de extender. ¡Muchas gracias!"

---

## ✅ Checklist antes de grabar

- [ ] `docker compose up -d` → PostgreSQL corriendo
- [ ] `yarn dev` → Servidor en `localhost:3000`
- [ ] Bruno / Insomnia con las peticiones ya cargadas
- [ ] Token JWT copiado y listo para los headers
- [ ] Editor con las 5 carpetas de `src/` visibles en el explorador
