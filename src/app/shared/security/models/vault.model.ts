export enum VAULT_STATUS {
    ERROR = 'ERROR',
    LOADING = 'LOADING',
    NO_CREATE = 'NO_CREATE',
    ENCRYPTED = 'ENCRYPTED',
    DESENCRYPTED = 'DESENCRYPTED'
}

export enum VAULT_ERRORS {
    CREATE_UNLOCK_WITH_PIN = 'No se pudo crear la clave de desbloqueo con el PIN. Inténtalo de nuevo más tarde.',
    INCORRECT_PIN_TO_UNLOCK_WITH_PIN = 'El PIN introducido no es correcto.',
    NOT_EXIST_UNLOCK_WITH_PIN = 'No hay un método de desbloqueo con PIN configurado.',
    SALT_IS_MISSING = 'Se produjo un error de seguridad al procesar tu solicitud. Inténtalo de nuevo.',
    CHANGE_PIN_FAILED = 'No se pudo cambiar el PIN. Verifica el PIN actual e inténtalo de nuevo.',
    TOO_MANY_ATTEMPTS = 'Has superado el número de intentos permitidos. Inténtalo más tarde.',
    UNKNOWN_ERROR = 'Ha ocurrido un error inesperado. Inténtalo de nuevo.',
    WEB_AUTHN_NOT_SUPPORTED = 'Tu dispositivo no soporta autenticación con passkey. Usa un navegador compatible.',
    PASSKEY_REGISTRATION_FAILED = 'No se pudo registrar el passkey. Inténtalo de nuevo.',
    PASSKEY_CREATION_FAILED = 'No se pudo crear la clave de desbloqueo con passkey. Inténtalo de nuevo.',
    PASSKEY_UNLOCK_FAILED = 'No se pudo desbloquear el vault con passkey. Inténtalo de nuevo.',
    PASSKEY_USER_VERIFICATION = 'La verificación de usuario falló. Inténtalo de nuevo.',
    MISSING_UNLOCK_KEY_DATA = 'Faltan datos de la clave de desbloqueo. Reconfigura el vault.'
}