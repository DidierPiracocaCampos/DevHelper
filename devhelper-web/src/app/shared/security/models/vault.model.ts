export enum VAULT_STATUS {
    ERROR = 'ERROR',
    LOADING = 'LOANDING',
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
    UNKNOWN_ERROR = 'Ha ocurrido un error inesperado. Inténtalo de nuevo.'
}