# Supabase Database Setup Guide

Este proyecto utiliza **Supabase** como base de datos PostgreSQL con autenticación integrada y Row Level Security (RLS) para multi-tenancy.

## 🚀 Pasos de Configuración

### 1. Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Guarda las credenciales que te proporciona Supabase:
   - **Project URL** (formato: `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (llave pública para el cliente)

### 2. Configurar Variables de Entorno

1. Crea un archivo `.env.local` en la raíz del proyecto:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edita `.env.local` y agrega tus credenciales de Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
   ```

### 3. Ejecutar el Schema SQL

1. Abre tu proyecto en Supabase Dashboard
2. Ve a **SQL Editor** en el menú lateral
3. Haz clic en **New Query**
4. Copia todo el contenido del archivo `supabase/schema.sql`
5. Pégalo en el editor SQL
6. Haz clic en **Run** para ejecutar el script

Esto creará todas las tablas, índices, políticas RLS, y triggers necesarios.

### 4. Verificar la Instalación

Después de ejecutar el schema, verifica que se hayan creado las siguientes tablas en la sección **Table Editor**:

- ✅ `profiles` - Profesionales/Usuarios
- ✅ `patients` - Pacientes
- ✅ `services` - Servicios
- ✅ `appointments` - Citas
- ✅ `sales` - Ventas/Facturación
- ✅ `activity_log` - Registro de actividad

### 5. Iniciar la Aplicación

```bash
npm run dev
# o
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`

---

## 📊 Estructura de la Base de Datos

### Tabla: profiles
Información de los profesionales (usuarios del sistema).

**Campos principales:**
- `id` - UUID del usuario (sincronizado con Supabase Auth)
- `email` - Email del profesional
- `full_name` - Nombre completo
- `professional_title` - Título profesional (ej: "Psicólogo Clínico")
- `business_name` - Nombre del consultorio/práctica

### Tabla: patients
Pacientes de cada profesional.

**Campos principales:**
- `professional_id` - Referencia al profesional dueño
- `full_name` - Nombre completo del paciente
- `email`, `phone` - Datos de contacto
- `status` - Estado: active, inactive, archived
- `notes` - Notas del profesional

### Tabla: services
Catálogo de servicios que ofrece cada profesional.

**Campos principales:**
- `professional_id` - Referencia al profesional dueño
- `name` - Nombre del servicio
- `category` - Categoría
- `duration_minutes` - Duración en minutos
- `price` - Precio en Pesos Argentinos
- `is_active` - Estado activo/inactivo

### Tabla: appointments
Agenda de citas.

**Campos principales:**
- `professional_id`, `patient_id`, `service_id` - Referencias
- `appointment_date`, `start_time`, `end_time` - Horario
- `status` - scheduled, completed, cancelled, no_show, rescheduled
- `is_video_call` - Indica si es videollamada

### Tabla: sales
Registro de servicios completados y facturación.

**Campos principales:**
- `professional_id`, `patient_id`, `service_id` - Referencias
- `service_name` - Snapshot del nombre del servicio
- `amount` - Monto en Pesos Argentinos
- `payment_status` - pending, paid, cancelled, refunded
- `payment_method` - Método de pago

### Tabla: activity_log
Historial de actividades importantes.

**Campos principales:**
- `activity_type` - Tipo de actividad
- `title` - Título de la actividad
- `description` - Descripción detallada

---

## 🔒 Seguridad Multi-Tenant

El sistema utiliza **Row Level Security (RLS)** de PostgreSQL para garantizar que:

- ✅ Cada profesional **solo puede ver y modificar sus propios datos**
- ✅ Los pacientes de un profesional **no son visibles** para otros profesionales
- ✅ Las políticas RLS se aplican **automáticamente** a todas las consultas
- ✅ No es posible acceder a datos de otro profesional, ni siquiera manipulando URLs

### Cómo Funciona

Todas las tablas tienen políticas RLS que verifican:
```sql
professional_id = auth.uid()
```

Esto asegura que solo se retornen/modifiquen registros donde el `professional_id` coincida con el ID del usuario autenticado.

---

## 📡 API Helpers

El proyecto incluye funciones helper organizadas por entidad:

### `lib/api/patients.ts`
- `getPatients(professionalId)` - Obtener todos los pacientes
- `createPatient(patient)` - Crear nuevo paciente
- `updatePatient(id, updates)` - Actualizar paciente
- `deletePatient(id)` - Eliminar paciente
- `searchPatients(professionalId, query)` - Buscar pacientes

### `lib/api/services.ts`
- `getServices(professionalId)` - Obtener servicios activos
- `createService(service)` - Crear nuevo servicio
- `updateService(id, updates)` - Actualizar servicio
- `deleteService(id)` - Desactivar servicio

### `lib/api/appointments.ts`
- `getTodayAppointments(professionalId)` - Citas de hoy
- `getUpcomingAppointments(professionalId)` - Próximas citas
- `createAppointment(appointment)` - Crear cita
- `completeAppointment(id)` - Marcar como completada
- `cancelAppointment(id, reason)` - Cancelar cita

### `lib/api/sales.ts`
- `getCurrentMonthSales(professionalId)` - Ventas del mes
- `getBillingStats(professionalId)` - Estadísticas de facturación
- `createSale(sale)` - Registrar venta
- `markSaleAsPaid(id, method)` - Marcar como pagada

### `lib/api/activity.ts`
- `getRecentActivity(professionalId)` - Actividad reciente
- `logPatientCreated(...)` - Registrar nuevo paciente
- `logPaymentReceived(...)` - Registrar pago recibido

---

## 🔑 Autenticación

El sistema usa **Supabase Auth** con el contexto React `AuthProvider`.

### Uso en componentes:

```typescript
'use client'

import { useAuth } from '@/lib/auth-context'

export default function MyComponent() {
  const { user, profile, loading, signIn, signOut } = useAuth()

  if (loading) return <div>Cargando...</div>
  if (!user) return <div>No autenticado</div>

  return (
    <div>
      <h1>Hola, {profile?.full_name}</h1>
      <button onClick={() => signOut()}>Cerrar sesión</button>
    </div>
  )
}
```

### Métodos disponibles:

- `signIn(email, password)` - Iniciar sesión
- `signUp(email, password, fullName)` - Registrarse
- `signOut()` - Cerrar sesión
- `user` - Usuario autenticado de Supabase
- `profile` - Perfil del profesional desde la tabla `profiles`
- `loading` - Estado de carga

---

## 🧪 Testing Multi-Tenancy

Para verificar que la separación de datos funciona correctamente:

1. **Crear Usuario A**
   - Registrarse con email: `profesional-a@example.com`
   - Crear 3 pacientes
   - Crear 2 servicios

2. **Crear Usuario B**
   - Registrarse con email: `profesional-b@example.com`
   - Crear 3 pacientes diferentes
   - Crear 2 servicios diferentes

3. **Verificar Aislamiento**
   - Login como Usuario A → Solo debe ver sus 3 pacientes
   - Login como Usuario B → Solo debe ver sus 3 pacientes
   - Ningún usuario debe ver datos del otro

4. **Intentar Acceso No Autorizado**
   - Login como Usuario A
   - Intentar acceder manualmente a un ID de paciente del Usuario B
   - Debe retornar error o vacío (RLS bloqueará el acceso)

---

## 💾 Respaldo y Migración

### Backup Manual
En Supabase Dashboard → Database → Backups

### Exportar Datos
```bash
# Usando Supabase CLI
supabase db dump -f backup.sql
```

### Restaurar
```bash
supabase db reset
psql -d postgres -f backup.sql
```

---

## 📚 Recursos Adicionales

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js + Supabase](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)

---

## ⚠️ Notas Importantes

1. **No compartas tu ANON_KEY públicamente** - Aunque es segura para el cliente, no la expongas en repositorios públicos
2. **Nunca uses SERVICE_ROLE_KEY en el frontend** - Solo en server-side o backend
3. **Las políticas RLS son tu primera línea de defensa** - Asegúrate de que funcionen correctamente
4. **Realiza backups regulares** - Especialmente antes de cambios importantes en el schema

---

## 🐛 Troubleshooting

### Error: "relation does not exist"
**Solución:** El schema no se ejecutó correctamente. Vuelve a ejecutar `supabase/schema.sql`

### Error: "new row violates row-level security policy"
**Solución:** Verifica que estés usando el `professional_id` correcto del usuario autenticado

### Los datos no se muestran
**Solución:** Verifica que las políticas RLS permitan SELECT para el usuario autenticado

### Error de autenticación
**Solución:** Verifica que las variables de entorno estén configuradas correctamente y reinicia el servidor
