# 📖 Historias de Usuario y Funcionalidades - Sistema de Gestión de Clientes

**Proyecto:** Sistema de Gestión de Clientes Profesionales  
**Versión:** 1.0  
**Fecha:** Enero 2026  
**Tipo:** Aplicación Web SaaS Multi-tenant

---

## 📑 Tabla de Contenidos

1. [Actores del Sistema](#actores-del-sistema)
2. [Módulos del Sistema](#módulos-del-sistema)
3. [Historias de Usuario por Módulo](#historias-de-usuario-por-módulo)
4. [Reglas de Negocio y Restricciones](#reglas-de-negocio-y-restricciones)
5. [Validaciones y Controles](#validaciones-y-controles)
6. [Seguridad y Permisos](#seguridad-y-permisos)

---

## 👥 Actores del Sistema

### Profesional (Usuario Principal)
- **Descripción:** Psicólogos, nutricionistas, médicos, coaches, etc.
- **Necesidad:** Gestionar clientes, citas, servicios y facturación
- **Acceso:** Autenticación con email/password
- **Datos propios:** Aislamiento total (multi-tenancy)

---

## 🧩 Módulos del Sistema

El sistema está compuesto por **7 módulos principales**:

1. **Autenticación y Perfil**
2. **Dashboard**
3. **Gestión de Pacientes**
4. **Gestión de Servicios**
5. **Calendario y Citas**
6. **Reportes y Facturación**
7. **Configuración**

---

## 📝 Historias de Usuario por Módulo

### 1. AUTENTICACIÓN Y PERFIL

#### HU-AUTH-01: Registro de Usuario
**Como** profesional nuevo  
**Quiero** crear una cuenta en el sistema  
**Para** comenzar a gestionar mis pacientes

**Criterios de Aceptación:**
- ✅ Formulario con email, contraseña y nombre completo
- ✅ Validación de email único
- ✅ Contraseña mínimo 6 caracteres
- ✅ Creación automática de perfil al registrarse
- ✅ Redirección al dashboard después del registro

**Restricciones:**
- Email debe ser válido y único en el sistema
- La contraseña no se almacena en texto plano

---

#### HU-AUTH-02: Inicio de Sesión
**Como** profesional registrado  
**Quiero** iniciar sesión con mis credenciales  
**Para** acceder a mi información

**Criterios de Aceptación:**
- ✅ Formulario con email y contraseña
- ✅ Validación de credenciales
- ✅ Mensaje de error claro si falla
- ✅ Redirección al dashboard si es exitoso
- ✅ Sesión persistente en el navegador

**Restricciones:**
- Solo usuarios registrados pueden acceder
- Sesiones con expiración automática

---

#### HU-AUTH-03: Gestión de Perfil
**Como** profesional  
**Quiero** actualizar mi información personal  
**Para** mantener mis datos actualizados

**Criterios de Aceptación:**
- ✅ Ver nombre completo, email, teléfono
- ✅ Editar título profesional
- ✅ Editar nombre del consultorio
- ✅ Actualización instantánea
- ✅ Confirmación de cambios guardados

**Campos del Perfil:**
- Nombre completo (obligatorio)
- Email (obligatorio, único)
- Título profesional (opcional)
- Teléfono (opcional)
- Nombre del consultorio (opcional)
- Avatar URL (opcional)

---

### 2. DASHBOARD

#### HU-DASH-01: Visualizar Resumen de Actividad
**Como** profesional  
**Quiero** ver un resumen de mi actividad  
**Para** tener una visión general del negocio

**Criterios de Aceptación:**
- ✅ Mostrar facturación del mes actual
- ✅ Mostrar facturación del día
- ✅ Mostrar total de pagos pendientes
- ✅ Mostrar cantidad de sesiones del día
- ✅ Actualización automática de datos

**Métricas Mostradas:**
- **Facturación del Mes:** Total en ARS con formato de moneda
- **Facturación del Día:** Total de sesiones de hoy + cantidad
- **Pagos Pendientes:** Total pendiente + cantidad de servicios

---

#### HU-DASH-02: Ver Citas del Día
**Como** profesional  
**Quiero** ver las citas programadas para hoy  
**Para** saber qué pacientes voy a atender

**Criterios de Aceptación:**
- ✅ Lista de citas ordenadas por hora
- ✅ Mostrar nombre del paciente
- ✅ Mostrar hora de inicio
- ✅ Mostrar servicio/tipo de consulta
- ✅ Mostrar duración
- ✅ Mensaje si no hay citas

**Información Mostrada:**
- Hora de inicio (HH:MM)
- Duración en minutos
- Nombre del paciente
- Iniciales del paciente
- Tipo de servicio

---

#### HU-DASH-03: Ver Actividad Reciente
**Como** profesional  
**Quiero** ver las últimas acciones realizadas  
**Para** hacer seguimiento de mi trabajo

**Criterios de Aceptación:**
- ✅ Últimas 5 actividades registradas
- ✅ Mostrar tipo de actividad
- ✅ Mostrar descripción
- ✅ Mostrar fecha
- ✅ Íconos diferenciados por tipo

**Tipos de Actividad:**
- Paciente creado
- Paciente actualizado
- Cita creada
- Cita completada
- Cita cancelada
- Pago recibido
- Nota agregada

---

### 3. GESTIÓN DE PACIENTES

#### HU-PAT-01: Ver Lista de Pacientes
**Como** profesional  
**Quiero** ver todos mis pacientes  
**Para** tener un registro organizado

**Criterios de Aceptación:**
- ✅ Vista de tabla con todos los pacientes activos
- ✅ Ordenamiento por fecha de creación (más reciente primero)
- ✅ Mostrar nombre, DNI, email, teléfono
- ✅ Mostrar estado (activo/inactivo)
- ✅ Indicador de última sesión
- ✅ Contador total de pacientes

**Información Mostrada:**
| Campo | Descripción |
|-------|-------------|
| Nombre | Nombre completo del paciente |
| DNI | Documento único |
| Contacto | Email y/o teléfono |
| Estado | Badge visual (activo/inactivo/archivado) |
| Última sesión | Fecha de la última cita |
| Acciones | Menú con opciones |

---

#### HU-PAT-02: Buscar Pacientes
**Como** profesional  
**Quiero** buscar pacientes por nombre, email o teléfono  
**Para** encontrarlos rápidamente

**Criterios de Aceptación:**
- ✅ Barra de búsqueda visible
- ✅ Búsqueda en tiempo real (debounce)
- ✅ Buscar en nombre, email y teléfono
- ✅ Resultados filtrados instantáneamente
- ✅ Mensaje si no hay resultados

**Restricciones:**
- Búsqueda insensible a mayúsculas/minúsculas
- Solo busca en pacientes del profesional actual
- No busca en pacientes archivados

---

#### HU-PAT-03: Crear Nuevo Paciente
**Como** profesional  
**Quiero** registrar un nuevo paciente  
**Para** comenzar a gestionar sus citas

**Criterios de Aceptación:**
- ✅ Modal con formulario de creación
- ✅ Campos: nombre completo*, DNI*, fecha de nacimiento, email, teléfono, notas
- ✅ Validación de campos obligatorios
- ✅ DNI único en el sistema
- ✅ Fecha de nacimiento no puede ser futura
- ✅ Toast de confirmación
- ✅ Redirección a detalle del paciente

**Campos del Formulario:**
| Campo | Tipo | Obligatorio | Validación |
|-------|------|-------------|------------|
| Nombre Completo | Texto | ✅ Sí | Requerido |
| DNI | Texto | ✅ Sí | Único en sistema |
| Fecha de Nacimiento | Fecha | ❌ No | No futura |
| Email | Email | ❌ No | Formato válido |
| Teléfono | Texto | ❌ No | - |
| Notas | Texto largo | ❌ No | - |

**Restricciones:**
- ✅ El DNI debe ser único en todo el sistema
- ✅ No se permiten DNIs duplicados
- ✅ Error claro si DNI ya existe: "Ya existe un paciente con este DNI en el sistema"

---

#### HU-PAT-04: Ver Detalle de Paciente
**Como** profesional  
**Quiero** ver toda la información de un paciente  
**Para** tener su historial completo

**Criterios de Aceptación:**
- ✅ Información personal completa
- ✅ Últimas 10 citas
- ✅ Últimos 10 pagos/servicios
- ✅ Edad calculada automáticamente
- ✅ Timeline de actividad
- ✅ Notas del profesional

**Secciones:**
1. **Información Personal:**
   - Nombre completo
   - DNI
   - Edad (calculada)
   - Email
   - Teléfono
   - Notas

2. **Citas:**
   - Últimas 10 citas ordenadas por fecha
   - Estado de cada cita
   - Servicio realizado
   - Fecha y hora

3. **Facturación:**
   - Últimos 10 servicios/pagos
   - Estado de pago
   - Monto
   - Fecha

---

#### HU-PAT-05: Editar Paciente
**Como** profesional  
**Quiero** actualizar la información de un paciente  
**Para** mantener sus datos correctos

**Criterios de Aceptación:**
- ✅ Modal con datos pre-cargados
- ✅ Todos los campos editables
- ✅ Validación de DNI único (excepto el mismo paciente)
- ✅ Confirmación de guardado
- ✅ Actualización inmediata en la UI

**Restricciones:**
- El DNI debe seguir siendo único
- No se puede cambiar el DNI a uno que ya existe
- Mensaje claro si DNI duplicado

---

#### HU-PAT-06: Eliminar Paciente
**Como** profesional  
**Quiero** eliminar un paciente  
**Para** limpiar mi base de datos

**Criterios de Aceptación:**
- ✅ Botón de eliminar visible
- ✅ Diálogo de confirmación obligatorio
- ✅ Advertencia sobre datos asociados
- ✅ Eliminación en cascada (citas, pagos, actividad)
- ✅ Redirección a lista de pacientes
- ✅ Toast de confirmación

**Advertencias:**
- "Esta acción no se puede deshacer"
- "Esto eliminará permanentemente a [Nombre] y todos sus datos asociados (citas, sesiones, pagos, etc.)"

---

### 4. GESTIÓN DE SERVICIOS

#### HU-SRV-01: Ver Lista de Servicios
**Como** profesional  
**Quiero** ver todos los servicios que ofrezco  
**Para** gestionarlos

**Criterios de Aceptación:**
- ✅ Lista con todos los servicios
- ✅ Filtro por activo/inactivo
- ✅ Mostrar nombre, categoría, duración, precio
- ✅ Indicador visual de color
- ✅ Estado activo/inactivo

---

#### HU-SRV-02: Crear Servicio
**Como** profesional  
**Quiero** registrar un nuevo servicio  
**Para** ofrecerlo a mis pacientes

**Criterios de Aceptación:**
- ✅ Formulario con campos obligatorios
- ✅ Nombre del servicio*
- ✅ Categoría*
- ✅ Duración en minutos*
- ✅ Precio en ARS*
- ✅ Descripción (opcional)
- ✅ Color para UI
- ✅ Estado activo por defecto

**Campos:**
| Campo | Obligatorio | Tipo |
|-------|-------------|------|
| Nombre | ✅ Sí | Texto |
| Categoría | ✅ Sí | Texto |
| Duración | ✅ Sí | Número (minutos) |
| Precio | ✅ Sí | Decimal (ARS) |
| Descripción | ❌ No | Texto largo |
| Color | ❌ No | Selector |
| Activo | ✅ Sí | Boolean |

---

#### HU-SRV-03: Editar/Eliminar Servicio
**Como** profesional  
**Quiero** modificar o eliminar servicios  
**Para** mantener mi catálogo actualizado

**Criterios de Aceptación:**
- ✅ Editar todos los campos
- ✅ Marcar como inactivo
- ✅ Eliminar con restricción (no se puede si tiene citas)
- ✅ Confirmación antes de eliminar

---

### 5. CALENDARIO Y CITAS

#### HU-CAL-01: Ver Calendario Mensual
**Como** profesional  
**Quiero** ver un calendario con mis citas  
**Para** visualizar mi agenda

**Criterios de Aceptación:**
- ✅ Vista mensual con todos los días
- ✅ Citas mostradas en su día correspondiente
- ✅ Colores por tipo de servicio
- ✅ Navegación mes anterior/siguiente
- ✅ Hoy resaltado
- ✅ Cantidad de citas por día

---

#### HU-CAL-02: Crear Cita desde Paciente
**Como** profesional  
**Quiero** agendar una cita para un paciente  
**Para** organizar mis consultas

**Criterios de Aceptación:**
- ✅ Modal de creación
- ✅ Paciente pre-seleccionado
- ✅ Selector de servicio
- ✅ Selector de fecha
- ✅ Selector de hora inicio
- ✅ Cálculo automático de hora fin
- ✅ Modalidad: presencial/videollamada
- ✅ Ubicación/link (opcional)
- ✅ Notas (opcional)

**Campos:**
- Paciente* (pre-seleccionado)
- Servicio* (determina duración y precio)
- Fecha* (no pasada)
- Hora inicio*
- Hora fin (calculada automáticamente)
- Es videollamada (checkbox)
- Ubicación/Link
- Notas

**Validaciones:**
- La fecha no puede ser pasada
- La hora inicio debe ser futura (si es hoy)
- No permitir solapamiento de horarios

---

#### HU-CAL-03: Ver Detalle de Cita
**Como** profesional  
**Quiero** ver los detalles de una cita  
**Para** confirmar la información

**Criterios de Aceptación:**
- ✅ Toda la información de la cita
- ✅ Datos del paciente
- ✅ Datos del servicio
- ✅ Horario completo
- ✅ Estado actual
- ✅ Opciones de acción

---

#### HU-CAL-04: Cambiar Estado de Cita
**Como** profesional  
**Quiero** marcar citas como completadas o canceladas  
**Para** llevar control

**Criterios de Aceptación:**
- ✅ Marcar como completada
- ✅ Cancelar cita (con razón opcional)
- ✅ Marcar "no asistió"
- ✅ Reagendar
- ✅ Actualización de estado inmediata
- ✅ Registro en actividad

**Estados Posibles:**
- `scheduled` - Programada (default)
- `completed` - Completada
- `cancelled` - Cancelada
- `no_show` - No asistió
- `rescheduled` - Reagendada

---

#### HU-CAL-05: Registrar Sesión/Pago
**Como** profesional  
**Quiero** registrar que una sesión fue realizada y pagada  
**Para** llevar control financiero

**Criterios de Aceptación:**
- ✅ Modal desde detalle de paciente
- ✅ Crear venta/sesión
- ✅ Asociar a servicio
- ✅ Monto (editable)
- ✅ Estado de pago (efectivo, pendiente)
- ✅ Método de pago
- ✅ Fecha del servicio
- ✅ Asociar a cita (opcional)

**Campos:**
| Campo | Obligatorio | Descripción |
|-------|-------------|-------------|
| Paciente | ✅ Sí | Pre-seleccionado |
| Servicio | ✅ Sí | Define monto inicial |
| Fecha | ✅ Sí | Fecha del servicio |
| Monto | ✅ Sí | En ARS, editable |
| Estado Pago | ✅ Sí | pending/paid |
| Método Pago | ❌ No | Efectivo, tarjeta, etc. |
| Notas | ❌ No | Observaciones |

---

### 6. REPORTES Y FACTURACIÓN

#### HU-REP-01: Ver Reporte de Facturación
**Como** profesional  
**Quiero** ver reportes de facturación  
**Para** analizar ingresos

**Criterios de Aceptación:**
- ✅ Filtro por rango de fechas
- ✅ Total facturado en el período
- ✅ Total cobrado
- ✅ Total pendiente
- ✅ Cantidad de sesiones
- ✅ Desglose por servicio
- ✅ Gráfico de evolución

**Métricas:**
- Total facturado
- Total cobrado
- Total pendiente
- Promedio por sesión
- Sesiones completadas
- Pacientes atendidos

---

#### HU-REP-02: Ver Pagos Pendientes
**Como** profesional  
**Quiero** ver todos los pagos pendientes  
**Para** hacer seguimiento de cobros

**Criterios de Aceptación:**
- ✅ Lista de servicios no pagados
- ✅ Ordenados por fecha (antiguos primero)
- ✅ Mostrar paciente, servicio, monto, fecha
- ✅ Opción de marcar como pagado
- ✅ Total de pendientes

---

#### HU-REP-03: Marcar Pago como Cobrado
**Como** profesional  
**Quiero** marcar un pago como recibido  
**Para** actualizar mi facturación

**Criterios de Aceptación:**
- ✅ Botón/acción rápida
- ✅ Seleccionar método de pago
- ✅ Fecha de pago (hoy por defecto)
- ✅ Confirmación visual
- ✅ Actualización de totales
- ✅ Registro en actividad

---

### 7. CONFIGURACIÓN

#### HU-CONF-01: Acceder a Configuración
**Como** profesional  
**Quiero** acceder a la sección de configuración  
**Para** personalizar el sistema según mis necesidades

**Criterios de Aceptación:**
- ✅ Enlace visible en la barra lateral o menú
- ✅ Página dedicada de configuración
- ✅ Organización por secciones/tabs
- ✅ Breadcrumbs de navegación
- ✅ Acceso exclusivo para usuario autenticado

**Secciones de Configuración:**
1. Perfil Profesional
2. Preferencias del Sistema
3. Seguridad y Privacidad
4. Notificaciones
5. Integraciones (futuro)

---

#### HU-CONF-02: Editar Perfil Profesional
**Como** profesional  
**Quiero** actualizar mi información profesional  
**Para** personalizar mi presencia en el sistema

**Criterios de Aceptación:**
- ✅ Formulario con datos pre-cargados
- ✅ Campos editables: nombre completo, título profesional, teléfono
- ✅ Editar nombre del consultorio/negocio
- ✅ Campo para biografía o descripción (opcional)
- ✅ Email visible pero no editable (requiere proceso especial)
- ✅ Botón "Guardar cambios"
- ✅ Confirmación de guardado exitoso
- ✅ Validación de campos obligatorios

**Campos del Perfil:**
| Campo | Tipo | Obligatorio | Editable |
|-------|------|-------------|----------|
| Nombre Completo | Texto | ✅ Sí | ✅ Sí |
| Email | Email | ✅ Sí | ❌ No (solo lectura) |
| Título Profesional | Texto | ❌ No | ✅ Sí |
| Teléfono | Texto | ❌ No | ✅ Sí |
| Nombre del Consultorio | Texto | ❌ No | ✅ Sí |
| Biografía | Texto largo | ❌ No | ✅ Sí |
| Avatar URL | URL | ❌ No | ✅ Sí |

---

#### HU-CONF-03: Cargar Foto de Perfil
**Como** profesional  
**Quiero** subir una foto de perfil  
**Para** personalizar mi identidad visual

**Criterios de Aceptación:**
- ✅ Selector de archivo con preview
- ✅ Aceptar formatos: JPG, PNG, WEBP
- ✅ Tamaño máximo: 2MB
- ✅ Recorte automático a formato cuadrado
- ✅ Vista previa antes de guardar
- ✅ Opción de eliminar foto actual
- ✅ Avatar con iniciales como fallback

**Restricciones:**
- Tamaño máximo de archivo: 2MB
- Formatos permitidos: .jpg, .jpeg, .png, .webp
- Dimensiones mínimas: 200x200px
- Recorte: 1:1 (cuadrado)

---

#### HU-CONF-04: Cambiar Contraseña
**Como** profesional  
**Quiero** cambiar mi contraseña  
**Para** mantener mi cuenta segura

**Criterios de Aceptación:**
- ✅ Formulario dedicado de cambio de contraseña
- ✅ Campo: contraseña actual
- ✅ Campo: nueva contraseña
- ✅ Campo: confirmar nueva contraseña
- ✅ Validación de contraseña actual correcta
- ✅ Validación de fortaleza de nueva contraseña
- ✅ Confirmación de que ambas contraseñas coinciden
- ✅ Mensaje de éxito después del cambio
- ✅ Cierre de sesión opcional después del cambio

**Validaciones:**
- Contraseña actual debe ser correcta
- Nueva contraseña mínimo 6 caracteres
- Nueva contraseña debe ser diferente a la actual
- Confirmación debe coincidir exactamente
- Mostrar indicador de fortaleza (débil/media/fuerte)

---

#### HU-CONF-05: Configurar Preferencias de Sistema
**Como** profesional  
**Quiero** configurar preferencias del sistema  
**Para** adaptar la interfaz a mis necesidades

**Criterios de Aceptación:**
- ✅ Selector de tema (claro/oscuro/automático)
- ✅ Selector de idioma (español por defecto)
- ✅ Selector de zona horaria
- ✅ Formato de fecha (DD/MM/YYYY o MM/DD/YYYY)
- ✅ Formato de moneda (ARS por defecto)
- ✅ Cambios aplicados instantáneamente
- ✅ Persistencia de preferencias en localStorage

**Preferencias Disponibles:**
| Preferencia | Opciones | Por Defecto |
|-------------|----------|-------------|
| Tema | Claro / Oscuro / Auto | Auto |
| Idioma | Español / English | Español |
| Zona Horaria | UTC-3 (Argentina) | UTC-3 |
| Formato Fecha | DD/MM/YYYY / MM/DD/YYYY | DD/MM/YYYY |
| Moneda | ARS / USD | ARS |

---

#### HU-CONF-06: Configurar Notificaciones
**Como** profesional  
**Quiero** configurar mis preferencias de notificaciones  
**Para** recibir solo alertas relevantes

**Criterios de Aceptación:**
- ✅ Lista de tipos de notificaciones con toggle on/off
- ✅ Email: cita creada (sí/no)
- ✅ Email: cita próxima (recordatorio)
- ✅ Email: pago recibido
- ✅ Email: paciente nuevo
- ✅ Push: recordatorios de citas (si aplicable)
- ✅ Configuración de anticipación de recordatorios
- ✅ Guardado automático de preferencias

**Tipos de Notificaciones:**
1. **Email - Citas:**
   - Cita creada
   - Cita cancelada
   - Recordatorio de cita (1 día antes / 2 horas antes)

2. **Email - Pacientes:**
   - Nuevo paciente registrado
   - Paciente editado

3. **Email - Pagos:**
   - Pago recibido
   - Pago pendiente (semanal)

4. **Notificaciones Push:** (futuro)
   - Recordatorios de citas
   - Alertas importantes

---

#### HU-CONF-07: Ver Información de la Cuenta
**Como** profesional  
**Quiero** ver información sobre mi cuenta  
**Para** conocer el estado de mi suscripción

**Criterios de Aceptación:**
- ✅ Fecha de creación de cuenta
- ✅ Plan actual (Gratis/Premium/Enterprise)
- ✅ Estadísticas de uso:
  - Total de pacientes
  - Total de citas realizadas
  - Total facturado (histórico)
- ✅ Almacenamiento utilizado (si aplicable)
- ✅ Límites del plan actual
- ✅ Solo lectura (informativo)

**Información Mostrada:**
- Email de la cuenta
- Fecha de registro
- Plan actual
- Pacientes activos / Límite
- Citas mensuales / Límite
- Almacenamiento usado / Disponible

---

#### HU-CONF-08: Exportar Datos
**Como** profesional  
**Quiero** exportar mis datos  
**Para** tener un respaldo o migrar a otro sistema

**Criterios de Aceptación:**
- ✅ Botón "Exportar datos"
- ✅ Seleccionar qué exportar:
  - Pacientes
  - Citas
  - Servicios
  - Ventas/Pagos
  - Todo
- ✅ Formato de exportación: CSV y/o JSON
- ✅ Descarga automática del archivo
- ✅ Registro de actividad de exportación
- ✅ Advertencia sobre datos sensibles

**Formatos Disponibles:**
- CSV (Excel compatible)
- JSON (formato estructurado)

**Restricciones:**
- Solo datos propios del profesional
- Incluye datos históricos completos
- Nombres de archivos con timestamp

---

#### HU-CONF-09: Eliminar Cuenta
**Como** profesional  
**Quiero** eliminar permanentemente mi cuenta  
**Para** dejar de usar el servicio

**Criterios de Aceptación:**
- ✅ Opción "Eliminar cuenta" en zona peligrosa
- ✅ Advertencia clara y destacada
- ✅ Confirmación con contraseña
- ✅ Checkbox de confirmación: "Entiendo que esto es permanente"
- ✅ Listar qué se eliminará:
  - Perfil profesional
  - Todos los pacientes
  - Todas las citas
  - Todos los pagos/sesiones
  - Todo el historial
- ✅ Opción de exportar datos antes de eliminar
- ✅ Eliminación completa e irreversible
- ✅ Email de confirmación de eliminación

**Proceso de Eliminación:**
1. Usuario hace clic en "Eliminar cuenta"
2. Modal de advertencia con lista de datos a eliminar
3. Checkbox: "Entiendo que esta acción es permanente"
4. Input: ingresar contraseña para confirmar
5. Botón final: "Eliminar mi cuenta permanentemente"
6. Eliminación en cascada de todos los datos
7. Cierre de sesión automático
8. Redirección a página de despedida
9. Email de confirmación enviado

**Advertencias:**
- ⚠️ "Esta acción no se puede deshacer"
- ⚠️ "Se eliminarán TODOS tus datos permanentemente"
- ⚠️ "Esto incluye X pacientes, Y citas y Z pagos"
- 💡 "Te recomendamos exportar tus datos antes de continuar"

---

#### HU-CONF-10: Configurar Horario Laboral
**Como** profesional  
**Quiero** definir mi horario de trabajo  
**Para** que el sistema me ayude a agendar citas en horarios disponibles

**Criterios de Aceptación:**
- ✅ Vista semanal (Lunes a Domingo)
- ✅ Toggle para cada día (trabajar/no trabajar)
- ✅ Para cada día activo:
  - Hora de inicio
  - Hora de fin
  - Opción de múltiples bloques (mañana/tarde)
- ✅ Opción de descansos/bloqueos
- ✅ Aplicar mismo horario a múltiples días
- ✅ Guardado automático
- ✅ Validación de horarios lógicos

**Configuración por Día:**
- Activo/Inactivo
- Bloque 1: 09:00 - 13:00
- Bloque 2: 15:00 - 20:00
- Descansos entre bloques

**Validaciones:**
- Hora fin debe ser posterior a hora inicio
- No permitir bloques superpuestos
- Horarios en formato 24h o 12h según preferencia

---

#### HU-CONF-11: Gestionar Días No Disponibles
**Como** profesional  
**Quiero** marcar días específicos como no disponibles  
**Para** bloquear fechas de vacaciones o feriados

**Criterios de Aceptación:**
- ✅ Lista de fechas bloqueadas
- ✅ Agregar nueva fecha bloqueada
- ✅ Selector de fecha individual o rango
- ✅ Motivo/descripción del bloqueo (opcional)
- ✅ Tipo de bloqueo:
  - Todo el día
  - Bloque horario específico
- ✅ Eliminar bloqueos futuros
- ✅ Vista de calendario con días bloqueados resaltados

**Tipos de Bloqueos:**
- Vacaciones (rango de fechas)
- Feriados
- Eventos personales
- Capacitaciones
- Bloqueo por horas específicas



## 🔒 Reglas de Negocio y Restricciones

### Seguridad y Aislamiento de Datos

#### RN-SEG-01: Multi-tenancy Estricto
- ✅ Cada profesional solo ve sus propios datos
- ✅ Row Level Security (RLS) en todas las tablas
- ✅ Filtro automático por `professional_id`
- ✅ Imposible acceder a datos de otro profesional

#### RN-SEG-02: Autenticación Obligatoria
- ✅ Todas las rutas protegidas requieren autenticación
- ✅ Redirección a `/login` si no autenticado
- ✅ Token de sesión en cookies seguras
- ✅ Logout limpia la sesión completamente

---

### Pacientes

#### RN-PAT-01: DNI Único
- ✅ **CRÍTICO:** El DNI debe ser único en TODO el sistema
- ✅ No se pueden crear dos pacientes con el mismo DNI
- ✅ Validación en frontend y backend
- ✅ Constraint UNIQUE en base de datos
- ✅ Error claro: "Ya existe un paciente con este DNI en el sistema"

#### RN-PAT-02: DNI Obligatorio
- ✅ **CRÍTICO:** El DNI es un campo obligatorio
- ✅ No se puede crear paciente sin DNI
- ✅ No se puede editar paciente dejando DNI vacío
- ✅ Validación HTML5 con `required`
- ✅ Constraint NOT NULL en base de datos

#### RN-PAT-03: Nombre Completo Obligatorio
- ✅ Campo requerido en creación y edición
- ✅ Validación en formulario

#### RN-PAT-04: Estado de Paciente
- ✅ Estados permitidos: `active`, `inactive`, `archived`
- ✅ Por defecto: `active`
- ✅ Los pacientes archivados no aparecen en lista principal

#### RN-PAT-05: Eliminación en Cascada
- ✅ Al eliminar paciente, se eliminan:
  - Todas sus citas
  - Todos sus pagos/sesiones
  - Todo su registro de actividad
- ✅ Confirmación obligatoria antes de eliminar
- ✅ Advertencia clara sobre pérdida de datos

---

### Servicios

#### RN-SRV-01: Precio en Pesos Argentinos
- ✅ Todos los precios en ARS
- ✅ Formato con 2 decimales
- ✅ Separador de miles para visualización

#### RN-SRV-02: Duración en Minutos
- ✅ Duración debe ser número entero positivo
- ✅ Usada para calcular hora fin de citas

#### RN-SRV-03: No Eliminar con Citas
- ✅ No se puede eliminar servicio con citas asociadas
- ✅ Opción: marcar como inactivo en su lugar
- ✅ Constraint ON DELETE RESTRICT en BD

---

### Citas

#### RN-CAL-01: No Citas en el Pasado
- ✅ No se pueden crear citas con fecha/hora pasada
- ✅ Validación en selector de fecha
- ✅ Fecha máxima = hoy para fechas anteriores

#### RN-CAL-02: Hora Fin Automática
- ✅ Hora fin = hora inicio + duración del servicio
- ✅ Calculada automáticamente
- ✅ No editable manualmente

#### RN-CAL-03: Estados de Cita
- ✅ Flujo normal: scheduled → completed
- ✅ Flujo cancelación: scheduled → cancelled
- ✅ No asistencia: scheduled → no_show
- ✅ No se puede completar una cita cancelada

#### RN-CAL-04: Cita Asociada a Servicio
- ✅ Toda cita debe tener un servicio
- ✅ El servicio no se puede eliminar si tiene citas
- ✅ Constraint ON DELETE RESTRICT

---

### Facturación y Pagos

#### RN-FAC-01: Estados de Pago
- ✅ Estados: `pending`, `paid`, `cancelled`, `refunded`
- ✅ Por defecto: `pending`
- ✅ Solo `paid` cuenta para totales cobrados

#### RN-FAC-02: Monto en ARS
- ✅ Formato decimal (10,2)
- ✅ Siempre valores positivos
- ✅ Formato con separador de miles

#### RN-FAC-03: Fecha de Servicio
- ✅ Puede ser diferente a fecha de pago
- ✅ Usada para reportes por período

#### RN-FAC-04: Snapshot de Servicio
- ✅ Se guarda nombre del servicio en la venta
- ✅ Si se modifica el servicio, no afecta ventas pasadas
- ✅ Historial inmutable

---

### Actividad

#### RN-ACT-01: Registro Automático
- ✅ Se registra automáticamente en:
  - Creación de paciente
  - Actualización de paciente
  - Creación de cita
  - Completar cita
  - Cancelar cita
  - Pago recibido

#### RN-ACT-02: Limitación de Registros
- ✅ Dashboard muestra últimas 5 actividades
- ✅ Ordenadas por fecha descendente
- ✅ No se pueden eliminar manualmente

---

## ✅ Validaciones y Controles

### Validaciones de Formularios

#### Email
- ✅ Formato válido (regex)
- ✅ Único en registro de profesionales
- ✅ Input type="email"

#### Fecha de Nacimiento
- ✅ No puede ser futura
- ✅ Atributo `max` en input date
- ✅ Cálculo de edad automático

#### Teléfono
- ✅ Sin validación estricta (formato libre)
- ✅ Opcional

#### DNI
- ✅ **OBLIGATORIO**
- ✅ **ÚNICO en todo el sistema**
- ✅ Validación en tiempo real
- ✅ Error inmediato si duplicado

#### Monto
- ✅ Solo números positivos
- ✅ Formato decimal
- ✅ Input type="number" con step="0.01"

#### Duración
- ✅ Solo números enteros positivos
- ✅ Input type="number" con min="1"

---

### Validaciones de Negocio

#### Solapamiento de Citas
- ⚠️ **No implementado actualmente**
- 📋 **Pendiente:** Validar que no haya citas superpuestas

#### Horario Laboral
- ⚠️ **No implementado actualmente**
- 📋 **Pendiente:** Definir horarios disponibles

#### Confirmación de Citas
- ⚠️ **No implementado actualmente**
- 📋 **Pendiente:** Sistema de recordatorios

---

## 🔐 Seguridad y Permisos

### Autenticación
- ✅ Basada en Supabase Auth
- ✅ Tokens JWT
- ✅ Sesiones persistentes
- ✅ Logout seguro

### Row Level Security (RLS)

Todas las tablas tienen políticas RLS:

#### Profiles
```sql
-- Ver propio perfil
ON profiles FOR SELECT USING (auth.uid() = id)
-- Actualizar propio perfil  
ON profiles FOR UPDATE USING (auth.uid() = id)
```

#### Patients
```sql
-- CRUD completo solo para pacientes propios
ON patients USING (professional_id = auth.uid())
```

#### Services
```sql
-- CRUD completo solo para servicios propios
ON services USING (professional_id = auth.uid())
```

#### Appointments
```sql
-- CRUD completo solo para citas propias
ON appointments USING (professional_id = auth.uid())
```

#### Sales
```sql
-- CRUD completo solo para ventas propias
ON sales USING (professional_id = auth.uid())
```

#### Activity Log
```sql
-- Ver y crear solo actividad propia
ON activity_log FOR SELECT USING (professional_id = auth.uid())
ON activity_log FOR INSERT WITH CHECK (professional_id = auth.uid())
```

---

### Variables de Entorno

#### Requeridas
```env
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
```

#### Nunca Exponer
- ❌ SERVICE_ROLE_KEY (solo backend)
- ❌ Database passwords
- ❌ JWT secrets

---

## 📊 Resumen de Funcionalidades

| Módulo | Funcionalidades | Estado |
|--------|----------------|--------|
| **Autenticación** | Registro, Login, Perfil | ✅ Completo |
| **Dashboard** | Stats, Citas Hoy, Actividad | ✅ Completo |
| **Pacientes** | CRUD, Búsqueda, Detalle | ✅ Completo |
| **Servicios** | CRUD, Categorías | ✅ Completo |
| **Calendario** | Vista mensual, CRUD citas | ✅ Completo |
| **Facturación** | Sesiones, Pagos, Reportes | ✅ Completo |

---

## 🎯 Restricciones Críticas del Sistema

### ⚠️ RESTRICCIONES OBLIGATORIAS

1. **DNI Único y Obligatorio**
   - El DNI debe ser único en TODO el sistema
   - No se puede crear paciente sin DNI
   - Error claro si DNI duplicado

2. **Aislamiento de Datos**
   - Cada profesional SOLO ve sus datos
   - Imposible acceder a datos de otros
   - RLS obligatorio en todas las tablas

3. **Autenticación**
   - Solo usuarios autenticados pueden acceder
   - Redirección automática a login
   - Sesiones seguras

4. **Relaciones de Datos**
   - No eliminar servicios con citas
   - Eliminación en cascada de pacientes
   - Integridad referencial

5. **Formato de Datos**
   - Precios en ARS (decimal 10,2)
   - Fechas en formato ISO
   - Estados predefinidos (enums)

---

**Documento Versión:** 1.0  
**Última Actualización:** Enero 2026  
**Mantenido por:** Equipo de Desarrollo
