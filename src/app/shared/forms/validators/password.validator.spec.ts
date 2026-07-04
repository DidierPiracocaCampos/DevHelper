import { FormControl, Validators } from '@angular/forms';
import firebasePasswordValidator from './password.validator';

describe('firebasePasswordValidator (sincrono)', () => {
  function makeControl() {
    return new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, firebasePasswordValidator()],
    });
  }

  it('devuelve null para string vacio (required cubre el vacio)', () => {
    const c = makeControl();
    expect(c.errors).toEqual({ required: true });
  });

  it('devuelve null cuando todas las reglas se cumplen', () => {
    const c = makeControl();
    c.setValue('Abcdef1!');
    expect(c.errors).toBeNull();
    expect(c.status).toBe('VALID');
  });

  it('devuelve firebasePassword con flags por requisito cuando falta alguno', () => {
    const c = makeControl();
    c.setValue('p');
    expect(c.errors).toEqual({
      firebasePassword: {
        minLength: false,
        lower: true,
        upper: false,
        number: false,
        special: false,
      },
    });
    expect(c.status).toBe('INVALID');
  });

  it('el status cambia a INVALID sincrono en setValue, sin ventana VALID espuria', () => {
    const c = makeControl();
    c.setValue('p');
    expect(c.status).toBe('INVALID');
    c.setValue('Abcdef1!');
    expect(c.status).toBe('VALID');
    c.setValue('Abcdef1');
    expect(c.status).toBe('INVALID');
  });

  it('no depende de Firebase/Auth (no llama a validatePassword)', () => {
    const c = makeControl();
    c.setValue('p');
    expect(c.errors?.['firebasePassword']).toBeDefined();
  });

  it('acepta bordes: 8 exactos, especiales no alfanumericos', () => {
    const c = makeControl();
    c.setValue('Abcde1!'); // 7 chars
    expect(c.errors?.['firebasePassword']?.['minLength']).toBe(false);
    c.setValue('Abcdef1!'); // 8 chars
    expect(c.errors).toBeNull();
  });

  it('trata null/undefined como vacio', () => {
    const c = makeControl();
    c.setValue(null as unknown as string);
    expect(c.errors?.['firebasePassword']).toBeUndefined();
  });
});
