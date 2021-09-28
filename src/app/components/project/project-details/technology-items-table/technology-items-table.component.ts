import { Component, OnInit, Input } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { ProjectDetailsTable } from '@cpdm-model/ProjectDetailsTable';

@Component({
  selector: 'app-technology-items-table',
  templateUrl: './technology-items-table.component.html',
  styleUrls: ['.././project-details.component.scss']
})
export class TechnologyItemsTableComponent implements OnInit {
  @Input() TechnicalStandardItems: ProjectDetailsTable[];
  @Input() complianceItems: ProjectDetailsTable[];
  @Input() TechnologyItemsSortedData: ProjectDetailsTable[];
  constructor() { }

  sortData(sort: Sort) {
    const data = this.TechnicalStandardItems.slice();
    if (!sort.active || sort.direction === '') {
      this.TechnologyItemsSortedData = data;
      return;
    }

    this.TechnologyItemsSortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name': return compare(a.name, b.name, isAsc);
        case 'progressScore': return compare(a.progressScore, b.progressScore, isAsc);
        default: return 0;
      }
    });
  }

  ngOnInit() {
  }

}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
