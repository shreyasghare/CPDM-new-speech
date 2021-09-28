import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MultilevelStepsSideBarModel } from '@cpdm-model/admin/multilevelStepsSideBar.model';

@Component({
  selector: 'stackable-multilevel-steps-sidebar',
  templateUrl: './stackable-multilevel-steps-sidebar.component.html',
  styleUrls: ['./stackable-multilevel-steps-sidebar.component.scss']
})
export class StackableMultilevelStepsSidebarComponent implements OnInit, OnChanges {

  @Input() multilevelSteps: MultilevelStepsSideBarModel;
  @Output() menuSubmenuSelected = new EventEmitter<{}>();
  constructor() { }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges): void {
  }

  menuItemSelected(menu, subMenu) {
    this.menuSubmenuSelected.emit({ menu, subMenu });
  }
}
