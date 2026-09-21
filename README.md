# BVG API Gateway

API Gateway del backend BVG.

Actúa como punto de entrada de la arquitectura de microservicios y centraliza el acceso a los servicios de usuarios, autenticación y tareas.

## Arquitectura

El backend está compuesto por tres aplicaciones independientes:

- API Gateway
- Users/Auth Service
- Tasks Service

La comunicación se realiza de la siguiente manera:

```text
                    Cliente / Postman
                           |
                           v
                   API Gateway :3000
                     /          \
                    /            \
                   v              v
        Users/Auth :3001      Tasks :3002
              |                    |
              v                    v
        bvg_users_db          bvg_tasks_db
```

El cliente utiliza el API Gateway como punto de entrada, evitando la necesidad de comunicarse directamente con cada microservicio.

## Tecnologías

- Node.js
- NestJS
- TypeScript
- Axios
- @nestjs/axios
- @nestjs/config
- JWT para autenticación

## Responsabilidades

El API Gateway se encarga de:

- Recibir las solicitudes del cliente.
- Redirigir solicitudes hacia Users/Auth.
- Redirigir solicitudes hacia Tasks.
- Validar la autenticación de los usuarios.
- Aplicar autorización basada en roles y permisos.
- Propagar la información necesaria entre servicios.
- Centralizar el acceso a los microservicios.
- Gestionar errores de comunicación con servicios dependientes.

## Autenticación

El inicio de sesión se realiza a través del Gateway:

```text
Cliente
   |
   | POST /auth/login
   v
API Gateway
   |
   v
Users/Auth Service
   |
   v
JWT
```

Para acceder a rutas protegidas, el cliente debe enviar el token mediante:

```text
Authorization: Bearer <token>
```

El Gateway consulta Users/Auth para validar el usuario autenticado.

## Autorización

Además de comprobar la autenticación el Gateway implementa autorización basada en permisos.

Entre los permisos utilizados se encuentran:

- `USERS_READ`
- `USERS_UPDATE`
- `USERS_STATUS`
- `TASKS_READ`
- `TASKS_CREATE`
- `TASKS_UPDATE`
- `TASKS_ASSIGN`

Antes de permitir determinadas operaciones, el Gateway consulta los permisos asociados al rol del usuario en Users/Auth.

De esta forma el microservicio Tasks puede concentrarse en su lógica de negocio sin acceder directamente a la base de datos de usuarios.

## Integración con Users/Auth

El Gateway permite acceder a operaciones relacionadas con:

- Registro
- Login
- Perfil autenticado
- Usuarios
- Roles
- Permisos

Users/Auth se ejecuta por defecto en:

```text
http://localhost:3001
```

## Integración con Tasks

El Gateway expone las operaciones necesarias para:

- Crear tareas
- Listar tareas
- Consultar tareas
- Actualizar tareas
- Cambiar estados
- Asignar tareas
- Gestionar ítems
- Gestionar plantillas
- Crear tareas desde plantillas
- Gestionar sectores

Tasks Service se ejecuta por defecto en:

```text
http://localhost:3002
```

## Manejo de errores de comunicación

El Gateway centraliza el manejo de errores producidos durante la comunicación con Tasks Service.

Cuando Tasks Service no se encuentra disponible, el Gateway responde:

```text
503 Service Unavailable
```

Esto permite distinguir una indisponibilidad temporal del microservicio de un error interno del Gateway.

También se contempla una respuesta:

```text
502 Bad Gateway
```

para errores producidos durante la comunicación con el servicio dependiente.

## Instalación

Instalar las dependencias:

```bash
npm install
```

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto.

Ejemplo:

```env
PORT=3000
USERS_SERVICE_URL=http://localhost:3001
TASKS_SERVICE_URL=http://localhost:3002
```

## Ejecutar el Gateway

Modo desarrollo:

```bash
npm run start:dev
```

Por defecto, el Gateway se ejecuta en:

```text
http://localhost:3000
```

## Orden recomendado para ejecutar el backend

Para probar el sistema completo se recomienda iniciar:

```text
1. Users/Auth Service  → puerto 3001
2. Tasks Service       → puerto 3002
3. API Gateway         → puerto 3000
```

Luego las solicitudes del cliente pueden realizarse a través de:

```text
http://localhost:3000
```

## Endpoints principales

### Auth

```text
POST /auth/register
POST /auth/login
GET  /auth/profile
```

### Users

```text
GET   /users
GET   /users/:id
PATCH /users/:id
PATCH /users/:id/status
```

### Roles

```text
POST  /roles
GET   /roles
GET   /roles/:id
PATCH /roles/users/:userId
```

### Tasks

```text
GET   /tasks
GET   /tasks/:id
GET   /tasks/assigned/:userId
POST  /tasks
PATCH /tasks/:id
PATCH /tasks/:id/status
PATCH /tasks/:id/assign
```

### Task Items

```text
POST  /tasks/:id/items
PATCH /tasks/:taskId/items/:itemId/complete
```

### Task Templates

```text
POST /tasks/templates
GET  /tasks/templates/:id
POST /tasks/templates/:templateId/items
POST /tasks/templates/:templateId/create-task
```

### Sectors

```text
POST /sectors
```

## Validación de integración

Durante las pruebas de integración se verificó:

- Comunicación Gateway → Users/Auth.
- Login mediante el Gateway.
- Validación de JWT.
- Consulta de permisos mediante Users/Auth.
- Comunicación Gateway → Tasks.
- Acceso permitido según permisos.
- Acceso denegado ante permisos insuficientes.
- Operaciones de consulta y modificación sobre Tasks.
- Respuesta `503 Service Unavailable` ante la caída de Tasks Service.
- Recuperación de la comunicación al restablecer Tasks Service.

## Repositorios relacionados

Este Gateway trabaja en conjunto con:

- `bvg-user-service`
- `bvg-tasks-service`

Cada microservicio se mantiene como un proyecto independiente.

## Autora

Florencia Llosa

Proyecto - Prácticas Profesionalizantes III
