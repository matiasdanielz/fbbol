import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-default',
  templateUrl: './page-default.component.html',
  styleUrls: ['./page-default.component.css']
})
export class PageDefaultComponent {
  @Input() pageTitle: string = '';

}
