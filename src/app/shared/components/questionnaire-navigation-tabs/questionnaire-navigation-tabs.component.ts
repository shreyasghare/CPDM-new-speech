import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CuiModalContent, CuiModalService } from '@cisco-ngx/cui-components';

@Component({
  selector: 'questionnaire-navigation-tabs',
  templateUrl: './questionnaire-navigation-tabs.component.html',
  styleUrls: ['./questionnaire-navigation-tabs.component.scss']
})
export class QuestionnaireNavigationTabsComponent implements OnInit {


  @Input() navBarItems = [];

  @Output() navigation: EventEmitter<any> = new EventEmitter<any>();

  data: any;

  constructor(public cuiModalService: CuiModalService) {}

  onNavigationClicked(id: string, mainIndex: number) {
    this.changeActiveTab(mainIndex);
    this.navigation.emit({id, mainIndex});
  }

  changeActiveTab(mainIndex: number) {
    for (const [index, value] of this.navBarItems.entries()) {
      if (index === mainIndex) {
        value.isActive = true;
      } else {
        value.isActive = false;
      }
    }
  }

  ngOnInit() {
  }

}
