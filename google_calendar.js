// Importa las dependencias necesarias
const { google } = require('googleapis');
require('dotenv').config(); // Carga variables de entorno desde un archivo .env

// Lee las credenciales y el ID del calendario desde las variables de entorno
const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);
const calendarId = process.env.CALENDAR_ID;

// Configura la API de Google Calendar
const SCOPES = 'https://www.googleapis.com/auth/calendar';
const calendar = google.calendar({ version: 'v3' });

// Autentica la aplicación utilizando las credenciales JWT (JSON Web Token)
const auth = new google.auth.JWT(
    CREDENTIALS.client_email,
    null,
    CREDENTIALS.private_key,
    SCOPES
);

// Define la zona horaria de Colombia (-05:00)
const TIMEOFFSET = '-05:00';

// Función para obtener una cadena de fecha y hora para el calendario
const dateTimeForCalendar = () => { // Inicio función

    // Obtiene la fecha y hora actual
    let date = new Date();

    // Extrae los componentes de fecha y hora
    let year = date.getFullYear(); // Obtiene el año actual
    let month = date.getMonth() + 1; // Obtiene el mes actual (¡Nota! Los meses comienzan desde 0)
    if (month < 10) {
        month = `0${month}`; // Agrega un cero inicial si el mes es menor que 10
    }
    let day = date.getDate(); // Obtiene el día del mes actual
    if (day < 10) {
        day = `0${day}`; // Agrega un cero inicial si el día es menor que 10
    }
    let hour = date.getHours(); // Obtiene la hora actual
    if (hour < 10) {
        hour = `0${hour}`; // Agrega un cero inicial si la hora es menor que 10
    }
    let minute = date.getMinutes(); // Obtiene los minutos actuales
    if (minute < 10) {
        minute = `0${minute}`; // Agrega un cero inicial si los minutos son menores que 10
    }

    // Construye la cadena de fecha y hora en formato ISO 8601
    let newDateTime = `${year}-${month}-${day}T${hour}:${minute}:00.000${TIMEOFFSET}`;

    // Convierte la cadena en un objeto Date
    let event = new Date(Date.parse(newDateTime));

    // Calcula la hora de inicio y finalización (1 hora después)
    let startDate = event;
    let endDate = new Date(new Date(startDate).setHours(startDate.getHours() + 1));

    return {
        'start': startDate, // Devuelve la hora de inicio calculada
        'end': endDate // Devuelve la hora de finalización calculada (1 hora después)
    }
}; //Final función

// Función para insertar un nuevo evento en Google Calendar
const insertEvent = async (event) => { //Inicio evento

    try {
        // Intenta insertar un evento en el calendario usando la API de Google Calendar
        let response = await calendar.events.insert({
            auth: auth, // Autenticación previamente configurada
            calendarId: calendarId, // ID del calendario previamente configurado
            resource: event // Datos del evento a insertar
        });

        // Verifica si la inserción fue exitosa
        if (response['status'] == 200 && response['statusText'] === 'OK') {
            return 1; // Éxito: Se insertó el evento correctamente
        } else {
            return 0; // Falla: La inserción del evento no tuvo éxito
        }
    } catch (error) {
        console.log(`Error en insertEvent --> ${error}`); // Registra cualquier error en la consola
        return 0; // Falla: Hubo un error durante la inserción del evento
    }
}; //Final Evento

// // Obtiene la fecha y hora para el evento
// let dateTime = dateTimeForCalendar();

// // Define un nuevo evento para Google Calendar
// let event = { //Inicio Evento
//     'summary': `Este es el resumen.`,
//     'description': `Esta es la descripción.`,
//     'start': {
//         'dateTime': dateTime['start'],
//         'timeZone': 'America/Bogota' // Configura la zona horaria de Bogotá
//     },
//     'end': {
//         'dateTime': dateTime['end'],
//         'timeZone': 'America/Bogota'
//     }
// }; //Final Evento

// // Llama a la función para insertar el evento
// insertEvent(event)
//     .then((res) => {
//         console.log(res); // Imprime la respuesta de la inserción del evento
//     })
//     .catch((err) => {
//         console.log(err); // Imprime cualquier error que ocurra durante la inserción
//     });

// Función para obtener todos los eventos entre dos fechas
const getEvents = async (dateTimeStart, dateTimeEnd) => {//INICIO EVENTO

    try {
        // Intenta obtener una lista de eventos desde Google Calendar dentro del rango de fechas especificado
        let response = await calendar.events.list({
            auth: auth, // Autenticación previamente configurada
            calendarId: calendarId, // ID del calendario previamente configurado
            timeMin: dateTimeStart, // Fecha y hora de inicio del rango
            timeMax: dateTimeEnd, // Fecha y hora de fin del rango
            timeZone: 'America/Bogota' // Configura la zona horaria de Bogotá
        });

        // Obtiene los eventos de la respuesta
        let items = response['data']['items'];
        return items; // Devuelve la lista de eventos encontrados
    } catch (error) {
        console.log(`Error en getEvents --> ${error}`); // Registra cualquier error en la consola
        return 0; // Falla: Hubo un error al intentar obtener los eventos
    }
}; //FINAL EVENTO

// // Define las fechas de inicio y fin para obtener eventos
// let start = '2023-08-10T00:00:00.000Z';
// let end = '2023-10-11T00:00:00.000Z';

// // Llama a la función para obtener eventos en el rango de fechas especificado
// getEvents(start, end)
//     .then((res) => {
//         console.log(res); // Imprime los eventos obtenidos en la consola
//     })
//     .catch((err) => {
//         console.log(err); // Imprime cualquier error que ocurra durante la obtención de eventos en la consola
//     });

// Función para eliminar un evento por su ID
const deleteEvent = async (eventId) => {//INICIO FUNCION
    try {
        // Envía una solicitud para eliminar un evento específico utilizando su ID
        let response = await calendar.events.delete({
            auth: auth,
            calendarId: calendarId,
            eventId: eventId
        });

        // Verifica si la eliminación fue exitosa
        if (response.data === '') {
            return 1; // Éxito: el evento se eliminó correctamente
        } else {
            return 0; // Falla: no se pudo eliminar el evento
        }
    } catch (error) {
        console.log(`Error en deleteEvent --> ${error}`);
        return 0; // Falla: se produjo un error durante la eliminación del evento
    }
};//FINAL FUNCION

// // Define el ID del evento a eliminar
// let eventId = 'pq1idu5to6v1mo5u4dv92dfooo';

// // Llama a la función para eliminar el evento
// deleteEvent(eventId)
//     .then((res) => {
//         console.log(res); // Imprime la respuesta de la eliminación del evento (1 si se eliminó con éxito, 0 si falló)
//     })
//     .catch((err) => {
//         console.log(err); // Imprime cualquier error que ocurra durante la eliminación del evento
//     }); 