import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'show-owners-custom-tooltip',
  templateUrl: './show-owners-custom-tooltip.component.html',
  styleUrls: ['./show-owners-custom-tooltip.component.scss']
})
export class ShowOwnersCustomTooltipComponent implements OnInit {

  constructor() { }

  @Input() owners: any = [];

  @Input() numberOfOwnersToBeShown = 2;

  get getShowMoreCount() {
    return this.owners.length - this.numberOfOwnersToBeShown;
  }

  get getOwnersNameWithBreak() {
  let getAllOwnersName = '';
  for (let i = this.numberOfOwnersToBeShown; i < this.owners.length; i++) {
    if (i !== this.owners.length) {
      getAllOwnersName += `${this.owners[i].name} \n`;
    } else {
      getAllOwnersName += `${this.owners[i].name}`;
    }
  }
  return getAllOwnersName;
  }

  ngOnInit() {
  }

}
