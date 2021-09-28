import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-holding-status',
  templateUrl: './holding-status.component.html',
  styleUrls: ['./holding-status.component.scss']
})
export class HoldingStatusComponent {
  @Input() statusIcon: string;
  @Input() status: string;
  @Input() message = '';
  @Input() className: string;
}
