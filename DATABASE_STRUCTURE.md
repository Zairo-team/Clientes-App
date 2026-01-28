# 📊 Estructura de Base de Datos - Clientes App

Este documento describe la estructura completa de la base de datos de Supabase para el sistema de gestión de clientes profesionales.

## 📋 Tabla de Contenidos

1. [Perfiles / Profesionales](#1-profiles-profesionales)
2. [Pacientes](#2-patients-pacientes)
3. [Servicios](#3-services-servicios)
4. [Citas](#4-appointments-citas)
5. [Ventas / Sesiones](#5-sales-ventas--sesiones)
6. [Registro de Actividad](#6-activity_log-registro-de-actividad)

---

## 1. `profiles` (Profesionales)

Tabla que almacena información de los profesionales (usuarios del sistema).

### Campos:

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `id` | UUID | ID del usuario (referencia a `auth.users`) | ✅ |
| `email` | TEXT | Correo electrónico único | ✅ |
| `full_name` | TEXT | Nombre completo | ✅ |
| `professional_title` | TEXT | Título profesional (ej: "Psicólogo", "Nutricionista") | ❌ |
| `phone` | TEXT | Teléfono de contacto | ❌ |
| `avatar_url` | TEXT | URL del avatar | ❌ |
| `business_name` | TEXT | Nombre del consultorio/práctica | ❌ |
| `created_at` | TIMESTAMPTZ | Fecha de creación | Auto |
| `updated_at` | TIMESTAMPTZ | Última actualización | Auto |

### Políticas RLS:
- ✅ Los usuarios pueden ver su propio perfil
- ✅ Los usuarios pueden actualizar su propio perfil

---

## 2. `patients` (Pacientes)

Tabla que almacena información de los pacientes de cada profesional.

### Campos:

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `id` | UUID | Identificador único | Auto |
| `professional_id` | UUID | Referencia al profesional | ✅ |
| `full_name` | TEXT | Nombre completo del paciente | ✅ |
| `dni` | TEXT | Documento Nacional de Identidad | ❌ |
| `email` | TEXT | Correo electrónico | ❌ |
| `phone` | TEXT | Teléfono | ❌ |
| `date_of_birth` | DATE | Fecha de nacimiento | ❌ |
| `notes` | TEXT | Notas del profesional | ❌ |
| `status` | TEXT | Estado: `active`, `inactive`, `archived` | Auto |
| `created_at` | TIMESTAMPTZ | Fecha de creación | Auto |
| `updated_at` | TIMESTAMPTZ | Última actualización | Auto |
| `last_session_date` | TIMESTAMPTZ | Fecha de última sesión | Auto |

### Políticas RLS:
- ✅ Los profesionales solo pueden ver, crear, editar y eliminar sus propios pacientes

### Índices:
- `idx_patients_professional` - Por profesional
- `idx_patients_status` - Por profesional y estado

---

## 3. `services` (Servicios)

Tabla que almacena los servicios que ofrece cada profesional.

### Campos:

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `id` | UUID | Identificador único | Auto |
| `professional_id` | UUID | Referencia al profesional | ✅ |
| `name` | TEXT | Nombre del servicio | ✅ |
| `category` | TEXT | Categoría (ej: "Terapia", "Consulta") | ✅ |
| `description` | TEXT | Descripción | ❌ |
| `duration_minutes` | INTEGER | Duración en minutos | ✅ |
| `price` | DECIMAL(10,2) | Precio en ARS | ✅ |
| `color` | TEXT | Color para UI (blue, purple, emerald, etc.) | Default: blue |
| `is_active` | BOOLEAN | Servicio activo | Default: true |
| `created_at` | TIMESTAMPTZ | Fecha de creación | Auto |
| `updated_at` | TIMESTAMPTZ | Última actualización | Auto |

### Políticas RLS:
- ✅ Los profesionales solo pueden gestionar sus propios servicios

---

## 4. `appointments` (Citas)

Tabla que almacena las citas programadas.

### Campos:

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `id` | UUID | Identificador único | Auto |
| `professional_id` | UUID | Referencia al profesional | ✅ |
| `patient_id` | UUID | Referencia al paciente | ✅ |
| `service_id` | UUID | Referencia al servicio | ✅ |
| `appointment_date` | DATE | Fecha de la cita | ✅ |
| `start_time` | TIME | Hora de inicio | ✅ |
| `end_time` | TIME | Hora de fin | ✅ |
| `is_video_call` | BOOLEAN | ¿Es videollamada? | Default: false |
| `location` | TEXT | Ubicación o link | ❌ |
| `status` | TEXT | `scheduled`, `completed`, `cancelled`, `no_show`, `rescheduled` | Default: scheduled |
| `notes` | TEXT | Notas | ❌ |
| `cancellation_reason` | TEXT | Razón de cancelación | ❌ |
| `created_at` | TIMESTAMPTZ | Fecha de creación | Auto |
| `updated_at` | TIMESTAMPTZ | Última actualización | Auto |

### Políticas RLS:
- ✅ Los profesionales solo pueden gestionar sus propias citas

### Índices:
- `idx_appointments_professional` - Por profesional
- `idx_appointments_patient` - Por paciente
- `idx_appointments_date` - Por profesional y fecha
- `idx_appointments_status` - Por profesional y estado

---

## 5. `sales` (Ventas / Sesiones)

Tabla que almacena las sesiones completadas y su información de facturación.

### Campos:

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `id` | UUID | Identificador único | Auto |
| `professional_id` | UUID | Referencia al profesional | ✅ |
| `patient_id` | UUID | Referencia al paciente | ✅ |
| `service_id` | UUID | Referencia al servicio | ✅ |
| `appointment_id` | UUID | Referencia a la cita (opcional) | ❌ |
| `service_name` | TEXT | Nombre del servicio (snapshot) | ✅ |
| `service_date` | DATE | Fecha del servicio | ✅ |
| `amount` | DECIMAL(10,2) | Monto en ARS | ✅ |
| `payment_status` | TEXT | `pending`, `paid`, `cancelled`, `refunded` | Default: pending |
| `payment_method` | TEXT | Método: `cash`, `card`, `transfer`, `mercadopago`, etc. | ❌ |
| `payment_date` | DATE | Fecha de pago | ❌ |
| `notes` | TEXT | Notas | ❌ |
| `created_at` | TIMESTAMPTZ | Fecha de creación | Auto |
| `updated_at` | TIMESTAMPTZ | Última actualización | Auto |

### Políticas RLS:
- ✅ Los profesionales solo pueden gestionar sus propias ventas

### Índices:
- `idx_sales_professional` - Por profesional
- `idx_sales_patient` - Por paciente
- `idx_sales_date` - Por profesional y fecha
- `idx_sales_payment_status` - Por profesional y estado de pago

---

## 6. `activity_log` (Registro de Actividad)

Tabla que registra las actividades importantes del sistema.

### Campos:

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `id` | UUID | Identificador único | Auto |
| `professional_id` | UUID | Referencia al profesional | ✅ |
| `activity_type` | TEXT | Tipo de actividad | ✅ |
| `patient_id` | UUID | Referencia al paciente | ❌ |
| `appointment_id` | UUID | Referencia a la cita | ❌ |
| `sale_id` | UUID | Referencia a la venta | ❌ |
| `title` | TEXT | Título de la actividad | ✅ |
| `description` | TEXT | Descripción | ❌ |
| `created_at` | TIMESTAMPTZ | Fecha de creación | Auto |

### Tipos de Actividad:
- `patient_created` - Paciente creado
- `patient_updated` - Paciente actualizado
- `appointment_created` - Cita creada
- `appointment_completed` - Cita completada
- `appointment_cancelled` - Cita cancelada
- `payment_received` - Pago recibido
- `note_added` - Nota agregada

### Políticas RLS:
- ✅ Los profesionales solo pueden ver y crear sus propias actividades

---

## 🔄 Triggers y Funciones

### Actualización Automática de `updated_at`

Todas las tablas principales tienen un trigger que actualiza automáticamente el campo `updated_at` cuando se modifica un registro.

### Creación Automática de Perfil

Cuando un usuario se registra en el sistema de autenticación de Supabase, automáticamente se crea un perfil asociado en la tabla `profiles`.

---

## 🔒 Seguridad (Row Level Security)

Todas las tablas tienen Row Level Security (RLS) habilitado, asegurando que:

- Cada profesional solo puede acceder a sus propios datos
- No hay acceso cruzado entre profesionales
- La seguridad se aplica a nivel de base de datos, no solo en la aplicación

---

## 📁 Archivos de Schema

- **`supabase/schema.sql`** - Schema completo para nueva instalación
- **`supabase/migrations/add_dni_to_patients.sql`** - Migración para agregar campo DNI

---

**Última actualización:** 27 de Enero, 2026
