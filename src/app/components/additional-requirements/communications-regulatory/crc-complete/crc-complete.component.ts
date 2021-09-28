import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommunicationsRegulatoryModel } from '@cpdm-model/additional-requirements/communications-regulatory/communicationsRegulatory.model';
import { CommunicationsRegulatoryService } from '@cpdm-service/additional-requirements/communications-regulatory/communications-regulatory.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-crc-complete',
  templateUrl: './crc-complete.component.html',
  styleUrls: ['./crc-complete.component.scss']
})
export class CrcCompleteComponent implements OnInit {
  crcStatus = {
    notApplicable: {
      icon: 'notApplicable',
      status: `Communication Regulatory Compliance is 'Not Applicable'`,
      message: `The Assessment Questionnaire indicates that the Communications Regulatory Compliance policy
                is ‘Not Applicable’ for this project. <br>Please direct all questions to 
                <a href="mailto:comm-reg-legal@clsco.com">comm-reg-legal@clsco.com</a>.`
    },
    endOfProcess: {
      icon: 'notApplicable',
      status: `Communication Regulatory Compliance is 'Not Applicable'`,
      message: `The Regulatory Compliance Team (RCT) ended the process after reviewing the Assessment Questionnaire.
                <br>Please direct all questions to 
                <a href="mailto:comm-reg-legal@clsco.com">comm-reg-legal@clsco.com</a>.`
    },
    completed: {
      icon: 'complete',
      status: 'The Communications Regulatory Compliance process is complete',
      message: `Thank you for working with the Regulatory Compliance Team to assess communications
                regulatory obligations applicable to your offer. We have reviewed all of the information provided,
                and our conclusions are available for download in this tool.`
    }
  }

  unsubscribe$: Subject<boolean> = new Subject<boolean>();
  crcId = '';
  crcData: CommunicationsRegulatoryModel;

  constructor(private activatedRoute: ActivatedRoute,
              private crcService: CommunicationsRegulatoryService) { }

  ngOnInit() {
    this.crcId = this.activatedRoute.snapshot.parent.params.id;
    this.getCrcDataSub();
  }

  /**
   * @description Get CRC details data from subject
   */
  private getCrcDataSub() {
    this.crcService.getCrcDataSub.pipe(takeUntil(this.unsubscribe$)).subscribe((res) => {
      if (res) {
        this.crcData = res;
      }
    });
  }

  /**
   * @description Cleaning up resources
   */
   ngOnDestroy() {
    this.unsubscribe$.next(true);
    this.unsubscribe$.unsubscribe();
  }
}
