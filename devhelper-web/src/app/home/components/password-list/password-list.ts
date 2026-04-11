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

@Component({
  selector: 'password-list',
  imports: [CardButton, CardBase, ItemList, ListButton, InputGeneric, PasswordInput, ReactiveFormsModule, Button],
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
  addIsLoanding = signal(false);
  deleteStatus = signal<{ password?: PasswordI, loanding: boolean }>({ password: undefined, loanding: false });

  add() {
    const f = this.addForm;
    if (f.invalid) {
      f.markAllAsDirty();
      return
    }
    const value = f.value as PasswordI;
    this.addIsLoanding.set(true);
    this._repo.create(value).subscribe({
      next: (value) => {
        this.modalForm()?.nativeElement.close();
        this.collection.reload();
        this.addForm.reset();
        this.addForm.markAsUntouched();
        this.addIsLoanding.set(false);
      },
      error: (err) => {
        this.addIsLoanding.set(false);
      },
      complete: () => {
      },
    });
  }

  cancelAdd() {
    this.modalForm()?.nativeElement.close();
    this.addForm.reset({name: '', password:''});
    this.addForm.get('name')?.markAsUntouched();
    this.addForm.get('password')?.markAsUntouched();
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


  addForm = this._formBuilder.group({
    name: this._formBuilder.control<string>('', [Validators.required]),
    password: this._formBuilder.control<string>('', [Validators.required]),
  });

}
