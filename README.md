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
git clone https://github.com/cirocarrilloest/backend_barberia.git
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
npm install express mysql2 cors morgan chalk dotenv jsonwebtoken bcryptjs joi clear
npm install -D nodemon
```

### Verificar instalacion

```bash
npm list --depth=0
```

### Ejecutar seed

```bash
node seed.js
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

## Endpoints de autentificacion(/auth)

### Registro de usuario

1. Registro exitoso

   `POST: http://localhost:3000/api/auth/registro`

   ejemplo:

   ```bash
   {
    "nombre": "lucas andres gomez",
    "email":"lucas@gmail.com",
    "pass":"123456",
    "telefono": "3217777777"
   }
   ```

   resultado:

   ```bash
   {
    "ok": true,
    "message": "Usuario registrado exitosamente",
    "user": {
        "id": 20,
        "nombre": "lucas andres gomez",
        "email": "lucas@gmail.com",
        "rol": "cliente",
        "telefono": "3217777777"
    }
   }
   ```

2. Registro duplicado

   `POST: http://localhost:3000/api/auth/registro`

   ejemplo:

   ```bash
   {
    "nombre": "lucas andres gomez",
    "email":"lucas@gmail.com",
    "pass":"234567",
    "telefono": "3217777777"
   }
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
    "email": "cliente@test.com",
    "pass":"123456"
   }
   ```

   resultado:

   ```bash
   {
    "ok": true,
    "message": "Ingreso exitoso",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTksImVtYWlsIjoiY2xpZW50ZUB0ZXN0LmNvbSIsInJvbCI6ImNsaWVudGUiLCJpYXQiOjE3Nzc1MDM1OTQsImV4cCI6MTc3NzUwNzE5NH0.ZoFTmeZfzPHpZvjgcY8uLvxTmoR7wqjvSrQCqUdNZoI",
    "user": {
        "id": 19,
        "nombre": "Cliente VIP",
        "email": "cliente@test.com",
        "rol": "cliente"
    }
   }
   ```

4. Login incorrecto

   `POST: http://localhost:3000/api/auth/ingreso`

   ejemplo:

   ```bash
   {
    "email": "cliente@test.com",
    "pass":"12345"
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
        "id": 19,
        "nombre": "Cliente VIP",
        "email": "cliente@test.com",
        "rol": "cliente",
        "telefono": "3007778888"
    }
   }
   ```

8. Cerrar acceso con token

   `GET: http://localhost:3000/api/auth/logout`

   resultado:

   ```bash
    {
    "ok": true,
    "message": "Sesión cerrada exitosamente"
   }
   ```

9. Actualizar perfil con token

   `PUT: http://localhost:3000/api/auth/perfil`

   ejemplo:

   ```bash
   {
    "telefono": "3013453765"
   }
   ```

   resultado:

   ```bash
    {
    "ok": true,
    "message": "Perfil actualizado exitosamente",
    "usuario": {
        "id": 19,
        "nombre": "Cliente VIP",
        "email": "cliente@test.com",
        "rol": "cliente",
        "telefono": "3013453765"
    }
   }
   ```

10. Cambiar contraseña con token

`POST: http://localhost:3000/api/auth/perfil`

ejemplo:

```bash
{
"pass_actual": "123456",
"pass_nueva": "234567"
}
```

resultado:

```bash
{
"ok": true,
"message": "Contraseña actualizada exitosamente"
}
```

11. Error en cambio de contraseña con token

`POST: http://localhost:3000/api/auth/perfil`

ejemplo:

```bash
{
"pass_actual": "2345678",
"pass_nueva": "123456"
}
```

resultado:

```bash
{
 "ok": false,
 "message": "La contraseña actual es incorrecta"
}
```

12. Eliminar cuenta con token

`DELETE: http://localhost:3000/api/auth/cuenta`

resultado:

```bash
{
    "ok": true,
    "message": "Cuenta eliminada exitosamente"
}
```

13. ver perfil del barbero con token

`GET: http://localhost:3000/api/usuarios/barberos/#/perfil`

el # se cambia por 13 en este ejemplo

resultado:

```bash
{
    "ok": true,
    "barbero": {
        "id": 13,
        "nombre": "Carlos López",
        "email": "carlos@barberia.com",
        "telefono": "3003334444",
        "estadisticas": {
            "total_citas": 35,
            "citas_completadas": "10",
            "citas_canceladas": "5"
        },
        "servicios_frecuentes": [
            {
                "id": 12,
                "nombre": "Corte infantil",
                "precio": "12000.00",
                "duracion": 25,
                "veces_realizado": 2
            },
            {
                "id": 13,
                "nombre": "Peinado",
                "precio": "18000.00",
                "duracion": 30,
                "veces_realizado": 2
            },
            {
                "id": 7,
                "nombre": "Corte de cabello",
                "precio": "15000.00",
                "duracion": 30,
                "veces_realizado": 1
            },
            {
                "id": 8,
                "nombre": "Barba",
                "precio": "10000.00",
                "duracion": 20,
                "veces_realizado": 1
            },
            {
                "id": 9,
                "nombre": "Corte + Barba",
                "precio": "22000.00",
                "duracion": 50,
                "veces_realizado": 1
            }
        ]
      }
}
```

## Endpoints de servicios (/servicios)

14. listar servicios con token

`GET: http://localhost:3000/api/servicios/`

resultado:

```bash
{
    "ok": true,
    "servicios": [
        {
            "id": 8,
            "nombre": "Barba",
            "descripcion": "Arreglo y perfilado de barba",
            "duracion": 20,
            "precio": "10000.00",
            "activo": 1,
            "created_at": "2026-04-29T10:01:14.000Z",
            "updated_at": "2026-04-29T10:01:14.000Z"
        },
        {
            "id": 9,
            "nombre": "Corte + Barba",
            "descripcion": "Combo completo de corte y barba",
            "duracion": 50,
            "precio": "22000.00",
            "activo": 1,
            "created_at": "2026-04-29T10:01:14.000Z",
            "updated_at": "2026-04-29T10:01:14.000Z"
        },
        {
            "id": 7,
            "nombre": "Corte de cabello",
            "descripcion": "Corte tradicional o moderno",
            "duracion": 30,
            "precio": "15000.00",
            "activo": 1,
            "created_at": "2026-04-29T10:01:14.000Z",
            "updated_at": "2026-04-29T10:01:14.000Z"
        },
        {
            "id": 12,
            "nombre": "Corte infantil",
            "descripcion": "Corte para niños menores de 12 años",
            "duracion": 25,
            "precio": "12000.00",
            "activo": 1,
            "created_at": "2026-04-29T10:01:14.000Z",
            "updated_at": "2026-04-29T10:01:14.000Z"
        },
        {
            "id": 11,
            "nombre": "Lavado de cabello",
            "descripcion": "Lavado con productos especiales",
            "duracion": 15,
            "precio": "8000.00",
            "activo": 1,
            "created_at": "2026-04-29T10:01:14.000Z",
            "updated_at": "2026-04-29T10:01:14.000Z"
        },
        {
            "id": 13,
            "nombre": "Peinado",
            "descripcion": "Peinado para ocasiones especiales",
            "duracion": 30,
            "precio": "18000.00",
            "activo": 1,
            "created_at": "2026-04-29T10:01:14.000Z",
            "updated_at": "2026-04-29T10:01:14.000Z"
        },
        {
            "id": 10,
            "nombre": "Tinte",
            "descripcion": "Aplicación de tinte para cabello",
            "duracion": 60,
            "precio": "35000.00",
            "activo": 1,
            "created_at": "2026-04-29T10:01:14.000Z",
            "updated_at": "2026-04-29T10:01:14.000Z"
        },
        {
            "id": 14,
            "nombre": "Tratamiento capilar",
            "descripcion": "Tratamiento de hidratación profunda",
            "duracion": 45,
            "precio": "25000.00",
            "activo": 1,
            "created_at": "2026-04-29T10:01:14.000Z",
            "updated_at": "2026-04-29T10:01:14.000Z"
        }
    ]
}
```

15. ver servicio por ID con token

`GET: http://localhost:3000/api/servicios/12`

resultado:

```bash
{
    "ok": true,
    "servicio": {
        "id": 12,
        "nombre": "Corte infantil",
        "descripcion": "Corte para niños menores de 12 años",
        "duracion": 25,
        "precio": "12000.00",
        "activo": 1,
        "created_at": "2026-04-29T10:01:14.000Z",
        "updated_at": "2026-04-29T10:01:14.000Z"
    }
   }
```

16. ver barberos que trabajado en un tipo de servicio por ID con token

`GET: http://localhost:3000/api/servicios/12`

resultado:

```bash
{
    "ok": true,
    "servicio": {
        "id": 13,
        "nombre": "Peinado"
    },
    "barberos": [
        {
            "id": 13,
            "nombre": "Carlos López",
            "email": "carlos@barberia.com",
            "telefono": "3003334444",
            "veces_realizado": 2
        },
        {
            "id": 14,
            "nombre": "Miguel Ángel",
            "email": "miguel@barberia.com",
            "telefono": "3005556666",
            "veces_realizado": 2
        },
        {
            "id": 12,
            "nombre": "Juan Pérez",
            "email": "juan@barberia.com",
            "telefono": "3001112222",
            "veces_realizado": 1
        }
    ]
}
```

17. Agregar servicio con token admin

`POST: http://localhost:3000/api/servicios/`

ejemplo:

```bash
{
    "nombre": "Corte Regular",
    "descripcion": "Corte con con maquina y terminacion en tijera",
    "duracion": 35,
    "precio": 15000,
    "activo": true
}
```

resultado:

```bash
{
    "ok": true,
    "message": "Servicio creado exitosamente",
    "servicio": {
        "id": 15,
        "nombre": "Corte Regular",
        "descripcion": "Corte con con maquina y terminacion en tijera",
        "duracion": 35,
        "precio": "15000.00",
        "activo": 1,
        "created_at": "2026-04-29T23:39:53.000Z",
        "updated_at": "2026-04-29T23:39:53.000Z"
    }
}
```

18. actualizar servicio con token admin

`PUT: http://localhost:3000/api/servicios/15`

ejemplo:

```bash
{
    "duracion": 35,
    "precio": 18000,
    "activo": true
}
```

resultado:

```bash
{
    "ok": true,
    "message": "Servicio actualizado exitosamente",
    "servicio": {
        "id": 15,
        "nombre": "Corte Regular",
        "descripcion": "Corte con con maquina y terminacion en tijera",
        "duracion": 35,
        "precio": "18000.00",
        "activo": 1,
        "created_at": "2026-04-29T23:39:53.000Z",
        "updated_at": "2026-04-29T23:43:07.000Z"
    }
}
```

19. Activar o Desactivar servicio con token admin

`PATCH: http://localhost:3000/api/servicios/#/toggle-activo`

el # lo cambiamos por 14 para el ejemplo

resultado activado:

```bash
{
    "ok": true,
    "message": "Servicio desactivado exitosamente",
    "servicio": {
        "id": 14,
        "nombre": "Tratamiento capilar",
        "descripcion": "Tratamiento de hidratación profunda",
        "duracion": 45,
        "precio": "25000.00",
        "activo": 0,
        "created_at": "2026-04-29T10:01:14.000Z",
        "updated_at": "2026-04-29T23:47:19.000Z"
    }
}
```

resultado desactivado:

```bash
{
    "ok": true,
    "message": "Servicio activado exitosamente",
    "servicio": {
        "id": 14,
        "nombre": "Tratamiento capilar",
        "descripcion": "Tratamiento de hidratación profunda",
        "duracion": 45,
        "precio": "25000.00",
        "activo": 1,
        "created_at": "2026-04-29T10:01:14.000Z",
        "updated_at": "2026-04-29T23:48:52.000Z"
    }
}
```

20. eliminar servicio con token admin

`DELETE: http://localhost:3000/api/servicios/15`

resultado:

```bash
{
    "ok": true,
    "message": "Servicio eliminado exitosamente"
}
```

## Endpoints de citas(/citas)

21. agendar nueva cita con token admin o cliente

`POST: http://localhost:3000/api/citas/`

ejemplo:

```bash
{
  "barbero_id": 14,
  "servicio_id": 12,
  "fecha": "2025-05-03",
  "hora": "12:00"
}
```

resultado:

```bash
{
    "ok": true,
    "message": "Cita agendada exitosamente",
    "cita": {
        "id": 71,
        "cliente_id": 21,
        "barbero_id": 14,
        "servicio_id": 12,
        "fecha": "2025-05-03T05:00:00.000Z",
        "hora": "12:00:00",
        "estado": "pendiente",
        "notas": null,
        "created_at": "2026-04-29T23:56:18.000Z",
        "updated_at": "2026-04-29T23:56:18.000Z",
        "cliente_nombre": "lucas andres gomez",
        "cliente_email": "lucas@gmail.com",
        "barbero_nombre": "Miguel Ángel",
        "servicio_nombre": "Corte infantil",
        "duracion": 25,
        "precio": "12000.00"
    }
}
```

22. ver mis citas con token

`GET: http://localhost:3000/api/citas/mis-citas`

resultado:

```bash
{
    "ok": true,
    "citas": [
        {
            "id": 71,
            "cliente_id": 21,
            "barbero_id": 14,
            "servicio_id": 12,
            "fecha": "2025-05-03T05:00:00.000Z",
            "hora": "12:00:00",
            "estado": "pendiente",
            "notas": null,
            "created_at": "2026-04-29T23:56:18.000Z",
            "updated_at": "2026-04-29T23:56:18.000Z",
            "barbero_nombre": "Miguel Ángel",
            "servicio_nombre": "Corte infantil",
            "duracion": 25,
            "precio": "12000.00"
        }
    ]
}
```

23. ver proximas citas con token cliente

`GET: http://localhost:3000/api/citas/proximas`

resultado:

```bash
{
    "ok": true,
    "citas": [],
    "total": 0
}
```

24. ver historial de citas con token cliente

`GET: http://localhost:3000/api/citas/historial?limite=10`

resultado:

```bash
{
    "ok": true,
    "citas": [
        {
            "id": 71,
            "cliente_id": 21,
            "barbero_id": 14,
            "servicio_id": 12,
            "fecha": "2025-05-03T05:00:00.000Z",
            "hora": "12:00:00",
            "estado": "pendiente",
            "notas": null,
            "created_at": "2026-04-29T23:56:18.000Z",
            "updated_at": "2026-04-29T23:56:18.000Z",
            "barbero_nombre": "Miguel Ángel",
            "servicio_nombre": "Corte infantil",
            "duracion": 25,
            "precio": "12000.00"
        }
    ],
    "total": 1,
    "limite": 10
}
```

25. ver disponibilidad con token cliente admin

`GET: http://localhost:3000/api/citas/barbero/#/horarios-disponibles?fecha=2026-05-01`

el # es 13 para el barbero y la fecha es cmabiable

resultado:

```bash
   {
    "ok": true,
    "barbero_id": "13",
    "fecha": "2026-05-01",
    "horarios_disponibles": [
        "10:00",
        "10:30",
        "11:00",
        "11:30",
        "12:00",
        "12:30",
        "13:00",
        "13:30",
        "14:00",
        "14:30",
        "15:00",
        "15:30",
        "16:00",
        "16:30",
        "17:00",
        "17:30",
        "18:00",
        "18:30"
      ],
      "total_disponibles": 18
   }
```

26. horarios disponibles de barbero con token cliente admin

`GET: http://localhost:3000/api/citas/barbero/13/horarios-disponibles?fecha=2026-04-29`

el # es 13 para el barbero y la fecha es cmabiable

resultado:

```bash
{
    "ok": true,
    "barbero_id": "13",
    "fecha": "2026-04-29",
    "horarios_disponibles": [
        "10:00",
        "10:30",
        "11:30",
        "12:00",
        "12:30",
        "13:00",
        "13:30",
        "14:00",
        "14:30",
        "15:00",
        "15:30",
        "16:00",
        "16:30",
        "17:00",
        "17:30",
        "18:00",
        "18:30"
    ],
    "total_disponibles": 17
}
```

27. ver cita por ID con token cliente admin

`GET: http://localhost:3000/api/citas/#`

el # es 71 para el barbero y la fecha es cmabiable

resultado:

```bash
{
    "ok": true,
    "cita": {
        "id": 71,
        "cliente_id": 21,
        "barbero_id": 14,
        "servicio_id": 12,
        "fecha": "2025-05-03T05:00:00.000Z",
        "hora": "12:00:00",
        "estado": "pendiente",
        "notas": null,
        "created_at": "2026-04-29T23:56:18.000Z",
        "updated_at": "2026-04-29T23:56:18.000Z",
        "cliente_nombre": "lucas andres gomez",
        "cliente_email": "lucas@gmail.com",
        "barbero_nombre": "Miguel Ángel",
        "servicio_nombre": "Corte infantil",
        "duracion": 25,
        "precio": "12000.00"
    }
}
```

28. reagendar cita con token admin o cliente

`POST: http://localhost:3000/api/citas/71/reagendar`

ejemplo:

```bash
{
  "fecha": "2026-04-30",
  "hora": "14:00"
}
```

resultado:

```bash
{
    "ok": true,
    "message": "Cita reagendada exitosamente",
    "cita": {
        "id": 71,
        "cliente_id": 21,
        "barbero_id": 14,
        "servicio_id": 12,
        "fecha": "2026-04-30T05:00:00.000Z",
        "hora": "14:00:00",
        "estado": "pendiente",
        "notas": null,
        "created_at": "2026-04-29T23:56:18.000Z",
        "updated_at": "2026-04-30T00:57:17.000Z",
        "cliente_nombre": "lucas andres gomez",
        "cliente_email": "lucas@gmail.com",
        "barbero_nombre": "Miguel Ángel",
        "servicio_nombre": "Corte infantil",
        "duracion": 25,
        "precio": "12000.00"
    }
}
```

29. eliminar cita con token admin o cliente

`DELETE: http://localhost:3000/api/citas/#`

el # es 71 para el ejemplo

resultado:

```bash
{
    "ok": true,
    "message": "Cita cancelada exitosamente",
    "cita": {
        "id": 71,
        "cliente_id": 21,
        "barbero_id": 14,
        "servicio_id": 12,
        "fecha": "2026-04-30T05:00:00.000Z",
        "hora": "14:00:00",
        "estado": "cancelada",
        "notas": null,
        "created_at": "2026-04-29T23:56:18.000Z",
        "updated_at": "2026-04-30T00:59:13.000Z",
        "cliente_nombre": "lucas andres gomez",
        "cliente_email": "lucas@gmail.com",
        "barbero_nombre": "Miguel Ángel",
        "servicio_nombre": "Corte infantil",
        "duracion": 25,
        "precio": "12000.00"
    }
}
```

## Endpoints para barbero y admin

30. agenda del dia con token admin o cliente

`GET: http://localhost:3000/api/citas/agenda-dia`

resultado:

```bash
{
    "ok": true,
    "fecha": "2026-04-30",
    "citas": [],
    "total_citas": 0
}
```

31. resumen de cita con token admin o cliente

`GET: http://localhost:3000/api/citas/resumen?fecha_inicio=2026-04-01&fecha_fin=2026-04-30`

resultado:

```bash
{
    "ok": true,
    "resumen": [
        {
            "estado": "pendiente",
            "total": 2,
            "ingreso_potencial": "70000.00"
        }
    ]
}
```

32. confirmar cita con token admin o cliente

`PATCH: http://localhost:3000/api/citas/#/confirmar`

el # es 57 para el ejemplo

resultado:

```bash
{
    "ok": true,
    "message": "Estado de la cita actualizado",
    "cita": {
        "id": 57,
        "cliente_id": 19,
        "barbero_id": 13,
        "servicio_id": 10,
        "fecha": "2026-04-29T05:00:00.000Z",
        "hora": "11:00:00",
        "estado": "confirmada",
        "notas": "Prefiero que sea por la mañana",
        "created_at": "2026-04-29T10:19:26.000Z",
        "updated_at": "2026-04-30T01:16:48.000Z",
        "cliente_nombre": "Cliente VIP",
        "cliente_email": "cliente@test.com",
        "barbero_nombre": "Carlos López",
        "servicio_nombre": "Tinte",
        "duracion": 60,
        "precio": "35000.00"
    }
}
```

33. finalizar cita con token admin o cliente

`PATCH: http://localhost:3000/api/citas/#/finalizar`

el # es 57 para el ejemplo

resultado:

```bash
{
    "ok": true,
    "message": "Cita finalizada exitosamente",
    "cita": {
        "id": 57,
        "cliente_id": 19,
        "barbero_id": 13,
        "servicio_id": 10,
        "fecha": "2026-04-29T05:00:00.000Z",
        "hora": "11:00:00",
        "estado": "completada",
        "notas": "Prefiero que sea por la mañana",
        "created_at": "2026-04-29T10:19:26.000Z",
        "updated_at": "2026-04-30T01:21:47.000Z",
        "cliente_nombre": "Cliente VIP",
        "cliente_email": "cliente@test.com",
        "barbero_nombre": "Carlos López",
        "servicio_nombre": "Tinte",
        "duracion": 60,
        "precio": "35000.00"
    }
}
```

34. agenda semanal con token admin o cliente

`GET: http://localhost:3000/api/citas/barbero/#/semana?fecha_inicio=2026-04-26`

el # es 13 para el ejemplo

resultado:

```bash
{
    "ok": true,
    "agenda": {
        "2026-04-29": [
            {
                "id": 57,
                "cliente_id": 19,
                "barbero_id": 13,
                "servicio_id": 10,
                "fecha": "2026-04-29T05:00:00.000Z",
                "hora": "11:00:00",
                "estado": "confirmada",
                "notas": "Prefiero que sea por la mañana",
                "created_at": "2026-04-29T10:19:26.000Z",
                "updated_at": "2026-04-30T01:22:15.000Z",
                "cliente_nombre": "Cliente VIP",
                "cliente_email": "cliente@test.com",
                "telefono": "3013453765",
                "servicio_nombre": "Tinte",
                "duracion": 60,
                "precio": "35000.00"
            },
            {
                "id": 58,
                "cliente_id": 19,
                "barbero_id": 13,
                "servicio_id": 10,
                "fecha": "2026-04-29T05:00:00.000Z",
                "hora": "19:00:00",
                "estado": "pendiente",
                "notas": "Prefiero que sea por la mañana",
                "created_at": "2026-04-29T10:20:03.000Z",
                "updated_at": "2026-04-29T10:20:03.000Z",
                "cliente_nombre": "Cliente VIP",
                "cliente_email": "cliente@test.com",
                "telefono": "3013453765",
                "servicio_nombre": "Tinte",
                "duracion": 60,
                "precio": "35000.00"
            }
        ],
        "2026-05-02": [
            {
                "id": 70,
                "cliente_id": 19,
                "barbero_id": 13,
                "servicio_id": 11,
                "fecha": "2026-05-02T05:00:00.000Z",
                "hora": "10:00:00",
                "estado": "pendiente",
                "notas": null,
                "created_at": "2026-04-29T22:25:32.000Z",
                "updated_at": "2026-04-29T22:25:32.000Z",
                "cliente_nombre": "Cliente VIP",
                "cliente_email": "cliente@test.com",
                "telefono": "3013453765",
                "servicio_nombre": "Lavado de cabello",
                "duracion": 15,
                "precio": "8000.00"
            }
        ]
    },
    "fecha_inicio": "2026-04-26",
    "fecha_fin": "2026-05-02",
    "total_citas": 3
}
```

## Endpoints para administradores

35. ver todas las citas con token admin

`GET: http://localhost:3000/api/citas/todas`

resultado:

```bash
{
    "ok": true,
    "citas": [
        {
            "id": 70,
            "cliente_id": 19,
            "barbero_id": 13,
            "servicio_id": 11,
            "fecha": "2026-05-02T05:00:00.000Z",
            "hora": "10:00:00",
            "estado": "pendiente",
            "notas": null,
            "created_at": "2026-04-29T22:25:32.000Z",
            "updated_at": "2026-04-29T22:25:32.000Z",
            "cliente_nombre": "Cliente VIP",
            "cliente_email": "cliente@test.com",
            "barbero_nombre": "Carlos López",
            "servicio_nombre": "Lavado de cabello",
            "duracion": 15,
            "precio": "8000.00"
        }
    ]
}
```

36. Dashboard estadisticas con token admin

`GET: http://localhost:3000/api/citas/dashboard`

resultado:

```bash
{
    "ok": true,
    "dashboard": {
        "citas_hoy": 2,
        "citas_pendientes": 2,
        "ingresos_mes": "0.00",
        "clientes_totales": 6,
        "barberos_activos": 3,
        "tasa_ocupacion": "8.3"
    }
}
```

37. reporte de ingresos mes con token admin

`GET: http://localhost:3000/api/citas/reporte/ingresos?periodo=mes&fecha_inicio=2026-04-01&fecha_fin=2026-04-30`

resultado:

```bash
{
    "ok": true,
    "periodo": "mes",
    "fecha_inicio": "2026-04-01",
    "fecha_fin": "2026-04-30",
    "reporte": [
        {
            "periodo": "2026-04",
            "total_citas": 1,
            "ingreso_total": "35000.00",
            "ticket_promedio": "35000.000000",
            "citas_canceladas": "0",
            "citas_completadas": "0"
        }
    ]
}
```

38. servicios mas utilizados con token admin

`GET: http://localhost:3000/api/citas/reporte/servicios-top?fecha_inicio=2026-04-01&fecha_fin=2026-04-30&limite=5`

resultado:

```bash
{
    "ok": true,
    "servicios": [
        {
            "id": 10,
            "nombre": "Tinte",
            "precio": "35000.00",
            "duracion": 60,
            "total_citas": 2,
            "ingreso_generado": "70000.00"
        }
    ]
}
```

39. cliente mas frecuentes con token admin

`GET: http://localhost:3000/api/citas/reporte/clientes-top?fecha_inicio=2026-04-01&fecha_fin=2026-04-30&limite=10`

resultado:

```bash
{
    "ok": true,
    "clientes": []
}
```

40. distribucion horaria de citas con token admin

`GET: http://localhost:3000/api/citas/distribucion-horaria?fecha_inicio=2026-04-01&fecha_fin=2026-04-30`

resultado:

```bash
{
    "ok": true,
    "distribucion": [
        {
            "hora": 11,
            "total_citas": 1,
            "completadas": "0",
            "canceladas": "0"
        },
        {
            "hora": 14,
            "total_citas": 1,
            "completadas": "0",
            "canceladas": "1"
        },
        {
            "hora": 19,
            "total_citas": 1,
            "completadas": "0",
            "canceladas": "0"
        }
    ]
}
```

41. tasa de cancelacion por barbero con token admin

`GET: http://localhost:3000/api/citas/reporte/tasa-cancelacion?fecha_inicio=2026-04-01&fecha_fin=2026-04-30`

resultado:

```bash
{
    "ok": true,
    "reporte": [
        {
            "id": 14,
            "nombre": "Miguel Ángel",
            "total_citas": 1,
            "canceladas": "1",
            "tasa_cancelacion": "100.00"
        },
        {
            "id": 13,
            "nombre": "Carlos López",
            "total_citas": 2,
            "canceladas": "0",
            "tasa_cancelacion": "0.00"
        }
    ]
}
```

## Endpoints de usuarios(admin)

42. listar todos los usuarios con token admin

`GET: http://localhost:3000/api/usuarios`

resultado:

```bash
{
    "ok": true,
    "usuarios": [
        {
            "id": 21,
            "nombre": "lucas andres gomez",
            "email": "lucas@gmail.com",
            "rol": "cliente",
            "telefono": "3217777777",
            "created_at": "2026-04-29T23:26:19.000Z"
        }
    ]
}
```

43. listar usuario por ID con token admin

`GET: http://localhost:3000/api/usuarios/#`

el # es 15 para el ejemplo

resultado:

```bash
{
    "ok": true,
    "usuario": {
        "id": 15,
        "nombre": "Ana García",
        "email": "ana@test.com",
        "rol": "cliente",
        "telefono": "3009990000"
    }
}
```

44. listar barberos con token admin

`GET: http://localhost:3000/api/usuarios/barberos/listar`

resultado:

```bash
{
    "ok": true,
    "barberos": [
        {
            "id": 12,
            "nombre": "Juan Pérez",
            "email": "juan@barberia.com",
            "telefono": "3001112222"
        },
        {
            "id": 13,
            "nombre": "Carlos López",
            "email": "carlos@barberia.com",
            "telefono": "3003334444"
        },
        {
            "id": 14,
            "nombre": "Miguel Ángel",
            "email": "miguel@barberia.com",
            "telefono": "3005556666"
        }
    ]
}
```

45. listar barberos con token

`GET: http://localhost:3000/api/usuarios/barberos/listar`

resultado:

```bash
{
    "ok": true,
    "barberos": [
        {
            "id": 12,
            "nombre": "Juan Pérez",
            "email": "juan@barberia.com",
            "telefono": "3001112222"
        },
        {
            "id": 13,
            "nombre": "Carlos López",
            "email": "carlos@barberia.com",
            "telefono": "3003334444"
        },
        {
            "id": 14,
            "nombre": "Miguel Ángel",
            "email": "miguel@barberia.com",
            "telefono": "3005556666"
        }
    ]
}
```

46. Crear usuario con token admin

`POST: http://localhost:3000/api/usuarios`

ejemplo:

```bash
{
    "nombre": "Nuevo Barbero",
    "email": "nuevo@barberia.com",
    "pass": "123456",
    "rol": "barbero",
    "telefono": "3009998888"
}
```

resultado:

```bash
{
    "ok": true,
    "message": "Usuario creado exitosamente",
    "usuario": {
        "id": 22,
        "nombre": "Nuevo Barbero",
        "email": "nuevo@barberia.com",
        "rol": "barbero",
        "telefono": "3009998888"
    }
}
```

47. actualizar usuario con token admin

`POST: http://localhost:3000/api/usuarios/#`

el # para el ejemplo es 22

ejemplo:

```bash
{
    "nombre": "Nombre Actualizado",
    "rol": "admin",
    "telefono":"3101000000"
}
```

resultado:

```bash
{
    "ok": true,
    "message": "Usuario actualizado exitosamente",
    "usuario": {
        "id": 22,
        "nombre": "Nombre Actualizado",
        "email": "nuevo@barberia.com",
        "rol": "admin",
        "telefono": "3101000000"
    }
}
```

48. asignar rol al usuario con token admin

`PATCH: http://localhost:3000/api/usuarios/#/rol`

el # para el ejemplo es 22

ejemplo:

```bash
{
    "rol": "cliente"
}
```

resultado:

```bash
{
    "ok": true,
    "message": "Rol asignado exitosamente",
    "usuario": {
        "id": 22,
        "nombre": "Nombre Actualizado",
        "email": "nuevo@barberia.com",
        "rol": "cliente",
        "telefono": "3101000000"
    }
}
```

49. eliminar usuario con token admin

`DELETE: http://localhost:3000/api/usuarios/#`

el # para el ejemplo es 22

resultado:

```bash
{
    "ok": true,
    "message": "Usuario eliminado exitosamente"
}
```

50. ver citas de usuario por estado con token admin

`GET: http://localhost:3000/api/usuarios/#/citas?estado=cancelada`

el # para el ejemplo es 21

resultado:

```bash
{
    "ok": true,
    "usuario": {
        "id": 21,
        "nombre": "lucas andres gomez"
    },
    "citas": [
        {
            "id": 71,
            "cliente_id": 21,
            "barbero_id": 14,
            "servicio_id": 12,
            "fecha": "2026-04-30T05:00:00.000Z",
            "hora": "14:00:00",
            "estado": "cancelada",
            "notas": null,
            "created_at": "2026-04-29T23:56:18.000Z",
            "updated_at": "2026-04-30T00:59:13.000Z",
            "barbero_nombre": "Miguel Ángel",
            "servicio_nombre": "Corte infantil",
            "duracion": 25,
            "precio": "12000.00"
        }
    ],
    "total": 1
}
```

51. configurar horario de barbero con token admin

`POST: http://localhost:3000/api/usuarios/barberos/#/horario`

el # para el ejemplo es 13

ejemplo:

```bash
{
  "dia_semana": "jueves",
  "hora_inicio": "08:00",
  "hora_fin": "17:00"
}
```

resultado:

```bash
{
    "ok": true,
    "message": "Horario configurado exitosamente"
}
```

52. ver barbero con token admin

`GET: http://localhost:3000/api/usuarios/barberos/#/horario`

el # para el ejemplo es 13

resultado:

```bash
{
    "ok": true,
    "horarios": [
        {
            "id": 12,
            "barbero_id": 13,
            "dia_semana": "lunes",
            "hora_inicio": "10:00:00",
            "hora_fin": "19:00:00",
            "activo": 1
        },
        {
            "id": 13,
            "barbero_id": 13,
            "dia_semana": "martes",
            "hora_inicio": "10:00:00",
            "hora_fin": "19:00:00",
            "activo": 1
        },
        {
            "id": 14,
            "barbero_id": 13,
            "dia_semana": "miercoles",
            "hora_inicio": "10:00:00",
            "hora_fin": "19:00:00",
            "activo": 1
        },
        {
            "id": 15,
            "barbero_id": 13,
            "dia_semana": "jueves",
            "hora_inicio": "08:00:00",
            "hora_fin": "17:00:00",
            "activo": 1
        },
        {
            "id": 16,
            "barbero_id": 13,
            "dia_semana": "viernes",
            "hora_inicio": "10:00:00",
            "hora_fin": "19:00:00",
            "activo": 1
        },
        {
            "id": 17,
            "barbero_id": 13,
            "dia_semana": "sabado",
            "hora_inicio": "10:00:00",
            "hora_fin": "15:00:00",
            "activo": 1
        }
    ]
}
```

53. eliminar barbero con token admin

`DELETE: http://localhost:3000/api/usuarios/barberos/#/horario/lunes`

el # para el ejemplo es 13

resultado:

```bash
{
    "ok": true,
    "message": "Horario eliminado exitosamente"
}
```
