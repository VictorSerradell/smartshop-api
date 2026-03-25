# 🚀 SmartShop API — Guía de Setup Completa

## 1. Clonar / Inicializar el proyecto

```bash
# Opción A — Clonar desde GitHub (cuando lo subas)
git clone https://github.com/TU_USUARIO/smartshop-api.git
cd smartshop-api

# Opción B — Inicializar desde cero en local
mkdir smartshop-api && cd smartshop-api
git init
git branch -M main
```

---

## 2. Instalar dependencias

```bash
npm install
```

---

## 3. Configurar variables de entorno

```bash
cp .env.example .env
# Edita .env con tus valores reales:
# - JWT_SECRET y JWT_REFRESH_SECRET: cadenas largas y aleatorias
# - OPENAI_API_KEY: tu clave de OpenAI
```

---

## 4. Levantar la base de datos con Docker

```bash
# Arrancar PostgreSQL en segundo plano
docker-compose up -d postgres

# Verificar que está corriendo
docker ps
```

---

## 5. Migraciones y seed

```bash
# Crear la migración inicial
npx prisma migrate dev --name init

# Cargar datos de prueba
npm run db:seed

# (Opcional) Abrir Prisma Studio para ver los datos
npm run db:studio
```

---

## 6. Arrancar el servidor

```bash
# Desarrollo (con hot-reload)
npm run dev

# Producción
npm start
```

La API estará disponible en:
- API → http://localhost:3000/api
- Swagger → http://localhost:3000/api-docs
- Health → http://localhost:3000/health

---

## 7. Probar la API con curl

```bash
# Registrar usuario
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"password123"}'

# Guardar el token (reemplaza TU_TOKEN)
export TOKEN="TU_ACCESS_TOKEN_AQUI"

# Listar productos
curl http://localhost:3000/api/products

# Ver recomendaciones IA
curl http://localhost:3000/api/recommendations \
  -H "Authorization: Bearer $TOKEN"

# Añadir al carrito (reemplaza PRODUCT_ID)
curl -X POST http://localhost:3000/api/cart/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":"PRODUCT_ID","quantity":2}'

# Crear orden desde el carrito
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer $TOKEN"
```

---

## 8. Flujo Git completo

```bash
# Estado actual
git status

# Añadir todos los archivos
git add .

# Primer commit
git commit -m "feat: initial SmartShop API setup"

# Conectar con GitHub (crea el repo en github.com primero)
git remote add origin https://github.com/TU_USUARIO/smartshop-api.git

# Subir a GitHub
git push -u origin main

# ── Flujo de trabajo diario ────────────────────────────────────────────────

# Crear rama para una feature nueva
git checkout -b feat/payment-integration

# Hacer cambios, luego:
git add .
git commit -m "feat: add Stripe payment integration"
git push origin feat/payment-integration

# Mergear a main cuando esté lista
git checkout main
git merge feat/payment-integration
git push origin main

# Etiquetar una versión
git tag -a v1.0.0 -m "Release v1.0.0 — MVP with AI recommendations"
git push origin v1.0.0

# ── Mensajes de commit recomendados (Conventional Commits) ─────────────────
# feat:     nueva funcionalidad
# fix:      corrección de bug
# docs:     cambios en documentación
# refactor: refactorización sin cambio de funcionalidad
# test:     añadir o modificar tests
# chore:    tareas de mantenimiento (deps, config)
```

---

## 9. Tests con Jest

```bash
# Ejecutar todos los tests (sin base de datos real, usa mocks)
npm test

# Modo watch — re-ejecuta al guardar cambios
npm run test:watch

# Ver cobertura de código
npm run test:coverage
```

### Estructura de tests

```
tests/
├── setup.js          # Mock global de Prisma + env vars de test
├── auth.test.js      # Register, login, refresh, validaciones
├── products.test.js  # CRUD, roles ADMIN/CUSTOMER, Zod errors
├── cart.test.js      # Get cart, add/remove items, qty increment
├── orders.test.js    # Crear orden, carrito vacío, get by id
└── schemas.test.js   # Tests unitarios de todos los schemas Zod
```

### Salida esperada

```
 PASS  tests/schemas.test.js
 PASS  tests/auth.test.js
 PASS  tests/products.test.js
 PASS  tests/cart.test.js
 PASS  tests/orders.test.js

Test Suites: 5 passed, 5 total
Tests:       32 passed, 32 total
```

---

## 10. Deploy con Docker (producción)

```bash
# Build completo (API + PostgreSQL)
docker-compose up --build -d

# Ver logs en tiempo real
docker-compose logs -f api

# Detener todo
docker-compose down

# Detener y borrar volúmenes (¡borra la DB!)
docker-compose down -v
```

---

## Estructura final del proyecto

```
smartshop-api/
├── prisma/
│   ├── schema.prisma       # Modelos de datos
│   └── seed.js             # Datos iniciales
├── src/
│   ├── config/
│   │   ├── prisma.js       # Cliente de base de datos
│   │   └── swagger.js      # Configuración Swagger
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── product.controller.js
│   ├── middlewares/
│   │   └── auth.middleware.js  # JWT verify + roles
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   ├── cart.routes.js
│   │   ├── order.routes.js
│   │   └── recommendation.routes.js
│   ├── services/
│   │   └── recommendation.service.js  # OpenAI integration
│   ├── app.js              # Express setup
│   └── server.js           # Entry point
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
└── package.json
```
