# Propuesta de FlexGym

## Idea de la app
FlexGym es una aplicación móvil que une el gimnasio físico con la vida diaria del usuario. Permite reservar clases, usar la membresía como tarjeta de acceso digital y seguir planes de entrenamiento híbridos entre lo presencial y lo que se hace en casa.

## Antecedentes y motivo de su importancia
Muchas personas desean llevar una vida saludable, pero enfrentan problemas como la falta de organización, poca continuidad en sus rutinas y dificultad para combinar el gimnasio con su día a día. Esta app busca resolver esos problemas ofreciendo una experiencia práctica, moderna y motivadora.

## Público objetivo
Está dirigida a personas jóvenes y adultas interesadas en fitness, que quieren entrenar de forma más constante y combinar actividades presenciales con contenido desde casa.

## Objetivo
Facilitar la experiencia del usuario al integrar en una sola plataforma el acceso al gimnasio, la reserva de clases y el seguimiento de rutinas híbridas.

## Justificación del diseño
El diseño fue pensado para que sea claro, intuitivo y fácil de usar. Se eligieron pantallas simples, botones grandes y una interfaz visual atractiva para que la app sea accesible y agradable para cualquier usuario.

## Arquitectura
La app podría desarrollarse con:
- Flutter y Dart para la interfaz móvil
- Node.js con NestJS para el backend
- PostgreSQL como base de datos
- Firebase Auth o Supabase Auth para iniciar sesión
- Stripe para pagos
- Firebase Cloud Messaging para notificaciones
- Cloudinary o Amazon S3 para almacenar contenido multimedia

Estas herramientas permiten crear una solución escalable, segura y eficiente.

## Requisitos funcionales necesarios para su correcto funcionamiento
Para que FlexGym funcione correctamente, la app debe incluir los siguientes módulos:

### 1. Registro e inicio de sesión
- registro de usuarios con nombre, correo y contraseña
- recuperación de contraseña
- inicio de sesión seguro
- acceso con Google o Facebook, si se desea agregar

### 2. Gestión de perfiles
- edición de datos personales
- foto de perfil
- metas de fitness
- nivel de actividad o experiencia

### 3. Membresías y acceso al gimnasio
- identificar si el usuario tiene acceso activo
- mostrar estado de membresía
- validar entrada al gimnasio mediante QR o código digital

### 4. Reservas de clases
- mostrar calendario de clases disponibles
- permitir reservar una clase
- cancelar o modificar una reserva
- evitar reservas duplicadas
- mostrar disponibilidad en tiempo real

### 5. Plan híbrido
- mostrar entrenamientos presenciales y en casa
- asignar rutinas según el plan del usuario
- permitir marcar sesiones como completadas
- enviar recordatorios de entrenamiento

### 6. Contenido multimedia
- subir o mostrar videos guiados
- reproducir entrenamientos desde casa
- organizar contenido por categoría o dificultad

### 7. Notificaciones
- recordatorios de clases
- confirmación de reservas
- alertas de cambios de horarios
- mensajes promocionales o de motivación

### 8. Pagos y suscripciones
- pago mensual de membresías premium
- renovación automática de suscripción
- historial de pagos
- gestión de planes empresariales o gimnasios aliados

### 9. Panel administrativo para el gimnasio
- agregar y editar clases
- gestionar usuarios y membresías
- ver reservas realizadas
- administrar planes híbridos
- ver reportes de actividad

### 10. Seguridad y privacidad
- protección de contraseñas
- cifrado de datos sensibles
- control de acceso por roles de usuario y administrador
- cumplimiento básico de privacidad de datos

## Modelo de negocios
La app no dependería de anuncios. Su monetización podría basarse en:
- suscripción mensual Premium
- plan Híbrido Pro
- pagos mensuales de gimnasios aliados
- membresías corporativas

## Funcionalidades principales de la app
FlexGym debe incluir las siguientes funciones para que sea realmente funcional:

| Funcionalidad | Descripción |
|---|---|
| Registro e inicio de sesión | Permite crear cuentas seguras y acceder a la app. |
| Recuperación de contraseña | Ayuda a los usuarios a recuperar el acceso si lo olvidan. |
| Gestión de perfil | Permite editar datos personales, foto y metas de fitness. |
| Acceso digital al gimnasio | Usa membresía o código QR para validar ingreso. |
| Reserva de clases | Permite ver horarios y reservar clases disponibles. |
| Cancelación o modificación | Permite cambiar o cancelar una reserva si es necesario. |
| Visualización de horarios | Muestra la disponibilidad de clases y actividades. |
| Plan híbrido | Integra rutinas presenciales y sesiones en casa. |
| Seguimiento del progreso | Registra avances, metas y hábitos del usuario. |
| Notificaciones | Envía recordatorios y alertas importantes. |
| Pagos y suscripciones | Gestiona pagos mensuales y planes premium. |
| Panel de administración | Permite al gimnasio administrar usuarios, clases y membresías. |

## Estado actual del prototipo (demo interactiva)
Ya existe un prototipo funcional en HTML, CSS y JavaScript (`index.html`, `styles.css`, `script.js`) que se puede abrir directamente en el navegador. No tiene backend real: los datos (reservas, pagos, progreso, recordatorios) se simulan y se guardan en el `localStorage` del navegador, no en una base de datos.

| Módulo | Estado | Detalle |
|---|---|---|
| Registro e inicio de sesión | Simulado | Pide correo (con validación de formato) y contraseña en cada visita; "Crear cuenta" simula el alta. Falta recuperación de contraseña y login con Google/Facebook. |
| Gestión de perfiles | Parcial | Se ve membresía, código de acceso y progreso semanal, y hay botón "Cerrar sesión"; falta edición de nombre, foto y metas de fitness. |
| Membresías y acceso al gimnasio | Implementado | La membresía se activa según los pagos de suscripción y expira a los 30 días si no se renueva; código de acceso digital que rota y expira a los 30 segundos. |
| Reservas de clases | Implementado | Filtro por horario (mañana/tarde/noche), reserva de clases, y una sección "Mis reservas" con estado Pendiente / Clase terminada; evita reservar la misma clase dos veces. |
| Plan híbrido | Parcial | El progreso semanal (3 clases presenciales + 2 en casa) avanza automáticamente al marcar una clase reservada como terminada, y se reinicia cada semana; falta distinguir presencial vs. en casa por separado. |
| Contenido multimedia | Pendiente | Todavía no hay reproducción de videos guiados. |
| Notificaciones | Simulado | Hay un interruptor de "Recordatorios activados/desactivados"; no envía notificaciones push reales (eso requiere backend + Firebase Cloud Messaging). |
| Pagos y suscripciones | Implementado | Suscripciones, pago por clase individual y por entrenador personal, con historial de pagos persistente. Es una simulación de cobro, no está conectado a Stripe ni a un procesador real. |
| Panel administrativo | Pendiente | Aún no existe una vista para que el gimnasio administre clases, usuarios o reportes. |
| Seguridad y privacidad | Pendiente | Al no tener backend, no hay cifrado real de datos ni control de acceso por roles. |

Este prototipo sirve para validar el flujo y la experiencia de usuario. Para llevarlo a producción falta construir el backend (NestJS + PostgreSQL) descrito en la arquitectura y reemplazar `localStorage` por una base de datos con autenticación real.

## Escalabilidad y proyección
La app puede crecer con nuevas funciones como recomendaciones inteligentes, integración con wearables, más clases y contenido personalizado. A futuro podría transformarse en una plataforma completa de bienestar y fitness.

## Rentabilidad con 10,000 usuarios
Si se estiman 2,000 usuarios Premium, 1,000 usuarios Híbrido Pro y 50 gimnasios aliados, los ingresos mensuales podrían rondar los $49,920 USD. Después de descontar costos operativos, la utilidad mensual podría ser cercana a $34,420 USD, lo que demuestra que la idea tiene un gran potencial de negocio.

## Conclusión
FlexGym es una propuesta innovadora, útil y rentable, porque combina tecnología, fitness y una experiencia digital sencilla para el usuario.
