import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { CardButton } from "../../../shared/components/card-button/card-button";
import { CardBase } from "../../../shared/components/card-base/card-base";
import { ItemList } from '../../../shared/components/item-list/item-list';
import { ListButton } from "../../../shared/components/list-button/list-button";
import { InputGeneric } from "../../../shared/forms/components/input-generic/input-generic";
import { PasswordInput } from "../../../auth/components/password-input/password-input";
import { PasswordRepository } from '../../service/passwords.repository';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PasswordI } from '../../domain/password.interface';
import { Button } from "../../../shared/components/button/button";
import { PassKeyService } from '../../../shared/service/pass-key';
import { ErrorMessage } from '../../../shared/forms/components/input-base/error-message';
import { toSignal } from '@angular/core/rxjs-interop';
import { from } from 'rxjs';

@Component({
  selector: 'password-list',
  imports: [CardButton, CardBase, ItemList, ListButton, InputGeneric, PasswordInput, ReactiveFormsModule, Button, ErrorMessage],
  templateUrl: './password-list.html',
  styleUrl: './password-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PasswordList {
  private _repo = inject(PasswordRepository);
  private _srvPassKey = inject(PassKeyService);
  private _formBuilder = inject(FormBuilder).nonNullable;

  readonly collection = this._repo.getAllResource();
  readonly notPasskey = toSignal(from(this._srvPassKey.shouldRegisterPasskey()));

  modalForm = viewChild<ElementRef<HTMLDialogElement>>('form');
  modalDelete = viewChild<ElementRef<HTMLDialogElement>>('deleteModal');
  deleteStatus = signal<{ password?: PasswordI, loanding: boolean }>({ loanding: false });
  addStatus = signal<{ isEdit?: boolean, loanding: boolean }>({ loanding: false });

  add() {
    /*
    const f = this._form;
    if (f.invalid) {
      f.markAllAsDirty();
      return
    }
    const { password, ...args } = f.value;
    
    const pass = { ...args, password: this._repo.encrypt(cryptoKey, password!) };
    this.addStatus.update(v => {
      v.loanding = true;
      return v;
    });
    this._repo.create(value).subscribe({
      next: (value) => {
        this.modalForm()?.nativeElement.close();
        this.collection.reload();
        this._form.reset();
        this._form.markAsUntouched();
        this.addStatus.set({ loanding: false });
      },
      error: (err) => {
        this.addStatus.set({ loanding: false });
      },
      complete: () => {
      },
    });*/
  }

  /* TODO: Implementar openEdit()  */
  openEdit(item: PasswordI) {
    this.addStatus.update(v => {
      v.isEdit = true;
      return v;
    });
    this.modalForm()?.nativeElement.showModal();
  }

  /* TODO: Manejo de errores  */
  async openAdd() {
    if (await this._srvPassKey.shouldRegisterPasskey()) {
      this._form.get('secure')?.disable();
    } else {
      this._form.get('secure')?.setValue(true);
    }
    this.addStatus.update(v => {
      v.isEdit = false;
      return v;
    });
    this.modalForm()?.nativeElement.showModal();
  }

  cancelForm() {
    this.modalForm()?.nativeElement.close();
    this.addStatus.set({ loanding: false });
    this._form.reset();
    this._form.get('name')?.markAsUntouched();
    this._form.get('password')?.markAsUntouched();
    this._form.get('secure')?.markAsUntouched();
    this._form.get('name')?.markAsPristine();
    this._form.get('password')?.markAsPristine();
    this._form.get('secure')?.markAsPristine();
  }

  questionDelete(item: PasswordI) {
    this.deleteStatus.update((v) => {
      v.password = item;
      return v;
    });
    this.modalDelete()?.nativeElement.showModal();
  }

  /* TODO: Agregar authenticacion con passKey  */
  delete() {
    const id = this.deleteStatus().password?.id;
    if (!id) return;
    this.deleteStatus.update((v) => {
      v.loanding = true;
      return v;
    });

    this._repo.delete(id).subscribe({
      next: () => {
        this.modalDelete()?.nativeElement.close();
        this.collection.reload();
        this.deleteStatus.set({ loanding: false });
      }
    })
  }


  protected _form = this._formBuilder.group({
    name: this._formBuilder.control<string>('', [Validators.required]),
    password: this._formBuilder.control<string>('', [Validators.required]),
    secure: this._formBuilder.control<boolean>(false),
  });

  async copyPassword(item: PasswordI) {
    const autenticated = await this._srvPassKey.authenticate();
    if (autenticated) {
      console.log('password')
    }
  }

  isVaultUnlocked = this._srvPassKey.isUnlocked;

}