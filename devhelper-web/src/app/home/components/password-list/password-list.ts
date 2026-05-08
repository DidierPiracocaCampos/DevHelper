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
import { Button } from "../../../shared/components/ui-button/button";
import { ErrorMessage } from '../../../shared/forms/components/input-base/error-message';

@Component({
  selector: 'password-list',
  imports: [CardButton, CardBase, ItemList, ListButton, InputGeneric, PasswordInput, ReactiveFormsModule, Button, ErrorMessage],
  templateUrl: './password-list.html',
  styleUrl: './password-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PasswordList {
  private _repo = inject(PasswordRepository);
  private _formBuilder = inject(FormBuilder).nonNullable;

  readonly collection = this._repo.getAllResource();

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

  openEdit(item: PasswordI) {
    this.addStatus.update(v => {
      v.isEdit = true;
      return v;
    });
    this.modalForm()?.nativeElement.showModal();
  }

  openAdd() {
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
    this._form.get('name')?.markAsPristine();
    this._form.get('password')?.markAsPristine();
  }

  questionDelete(item: PasswordI) {
    this.deleteStatus.update((v) => {
      v.password = item;
      return v;
    });
    this.modalDelete()?.nativeElement.showModal();
  }

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

}