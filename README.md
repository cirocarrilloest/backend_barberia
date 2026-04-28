# API de Autenticación Node.js

## 📌 Descripción

API REST desarrollada con Node.js, Express y MySQL que permite registrar e iniciar sesión de usuarios usando JWT que se evalua con postman para la seguridad del ingreso el ususario con clave cifrada

## 🚀 Tecnologías

- Node.js
- Express
- MySQL
- JWT
- bcryptjs
- Joi
- dotenv
- cors
- morgan
- charl
- clear

## Instalación de dependencias

### clonar repositorio

```bash
git clone https://github.com/cirocarrilloest/MI-PROYECTO_NODE.git
cd MI-PROYECTO_NODE
```

### Inicializar el proyecto:

```bash
npm init -y
```

### .env configuracion

```bash
cp .env.example .env
```

### Dependencias principales

```bash
npm install express bcryptjs jsonwebtoken dotenv cors mysql2 joi morgan chalk clear
npm install -D nodemon
```

### Ejecutar aplicación

```bash
npm run dev
```

# Estrucutra del poyecto

```
MI-PROYECTO_NODE/
└── src/
    ├── config/
    ├── controllers/
    ├── middlewares/
    ├── models/
    ├── routes/
    ├── services/
    ├── utils/
    └── app.js
```

# Documentacion Endpoints con postman

base URL backend: `http://localhost:3000`

### Registro

1. Registro exitoso

   `POST: http://localhost:3000/api/auth/registro`

   ejemplo:

   ```bash
   {
   "nombre": "antonio",
   "email": "antonio@gmail.com",
   "pass": "123456"}
   ```

   resultado:

   ```bash
    {
    "ok": true,
    "message": "Usuario registrado exitosamente",
    "user": {
        "id": 1,
        "nombre": "antonio",
        "email": "antonio@gmail.com",
        "rol": "user"
        }
    }
   ```

2. Registro duplicado

   `POST: http://localhost:3000/api/auth/registro`

   ejemplo:

   ```bash
   {
   "nombre": "antonio",
   "email": "antonio@gmail.com",
   "pass": "123456"}
   ```

   resultado:

   ```bash
    {
    "ok": false,
    "message": "el email ya esta registrado"
    }
   ```

### ingreso

3. Login correcto

   `POST: http://localhost:3000/api/auth/ingreso`

   ejemplo:

   ```bash
   {
   "email": "antonio@gmail.com",
   "pass": "123456"
    }
   ```

   resultado:

   ```bash
    {
    "ok": true,
    "message": "Ingreso exitoso",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhbnRvbmlvQGdtYWlsLmNvbSIsInJvbCI6InVzZXIiLCJpYXQiOjE3NzU4MTE2OTksImV4cCI6MTc3NTgxNTI5OX0.d1-7c4OZLyt-dQHhiUmbNkqNlgnj4Cb4g8k4qdfhAy4",
    "user": {
        "id": 1,
        "nombre": "antonio",
        "email": "antonio@gmail.com",
        "rol": "user"
    }
    }
   ```

4. Login incorrecto

   `POST: http://localhost:3000/api/auth/ingreso`

   ejemplo:

   ```bash
   {
   "email": "antonio@gmail.com",
   "pass": "453456"
    }
   ```

   resultado:

   ```bash
    {
    "ok": false,
    "message": "Credenciales inválidas"
    }
   ```

### acceso

5. Acceso sin token

   `GET: http://localhost:3000/api/auth/perfil`

   resultado:

   ```bash
    {
    "ok": false,
    "message": "no se proporcionó token de autenticación"
    }
   ```

6. Acceso con token inválido

   `GET: http://localhost:3000/api/auth/perfil`

   resultado:

   ```bash
   {
    "ok": false,
    "message": "token invalido o expirado"
    }
   ```

7. Acceso con token válido

   `GET: http://localhost:3000/api/auth/perfil`

   resultado:

   ```bash
    {
    "ok": true,
    "usuario": {
        "id": 1,
        "nombre": "antonio",
        "email": "antonio@gmail.com",
        "rol": "user"
    }
    }
   ```
