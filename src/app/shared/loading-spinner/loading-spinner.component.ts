import {Component} from '@angular/core';

@Component({
  selector: 'app-loading-spiner',
  template: '<div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>',
  styleUrls: ['loading-spinner.component.css']
})
export class LoadingSpinnerComponent {
}
