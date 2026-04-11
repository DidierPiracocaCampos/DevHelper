import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputBase } from '../../../shared/forms/components/input-base/input-base';

@Component({
  selector: 'auth-email-input',
  imports: [],
  templateUrl: './email-input.html',
  styleUrl: './email-input.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EmailInput),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailInput extends InputBase<string> {


}