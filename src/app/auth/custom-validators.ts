import { ValidatorFn, AbstractControl, Validator, NG_VALIDATORS, FormGroup, FormControl } from '@angular/forms';

export class CustomValidators {

  static userNameValidator(): ValidatorFn {
        return (control: AbstractControl): {[key: string]: any} | null => {
          if (!(control.dirty || control.touched)) {
            return null;
          }
          const userName = control.value;
          const r1 = /^(?:[a-z0-9_.]{4,20})$/i; // username is 4-20 characters long
          let result: boolean;
          result = r1.test(userName);
          if (!result) {
            return {userNameValid: {message: 'Password is 4-20 characters (a-z A-Z 0-9 _ .) long.'}};
          }
          const r2 = /^(?![_.][a-z0-9]*)(?:[a-z0-9_.]{4,20})$/i; // no _ or . at the beginning
          result = r2.test(userName);
          if (!result) {
            return {userNameValid: {message: 'Password no _ or . at the beginning'}};
          }
          const r3 = /^(?![a-z0-9_.]*[_.]{2})(?:[a-z0-9_.]{4,20})$/i; // no __ or _. or ._ or .. inside
          result = r3.test(userName);
          if (!result) {
            return {userNameValid: {message: 'Password no __ or _. or ._ or .. inside'}};
          }
          const reverseName = userName.split('').reverse().join('');
          const r4 = r2; // no _ or . at the end
          result = r4.test(reverseName);
          if (!result) {
            return {userNameValid: {message: 'Password no _ or . at the end'}};
          }
          return null;
        };
      }

    }
