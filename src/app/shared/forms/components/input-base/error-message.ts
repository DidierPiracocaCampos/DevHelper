import { Directive, inject, input, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[errorMessage]'
})
export class ErrorMessage {
  template = inject(TemplateRef<any>);
  error = input.required<string>({ alias: 'errorMessage' });
  visible = input<boolean>(false);
}
