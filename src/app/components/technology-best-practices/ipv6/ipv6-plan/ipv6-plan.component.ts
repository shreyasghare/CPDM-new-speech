import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { IPv6Service } from '@cpdm-service/technology-best-practices/ipv6/ipv6.service';
import { IPv6Model } from '@cpdm-model/technology-best-practices/ipv6/ipv6.model';
import { Ipv6RecommendationsModalComponent } from './ipv6-recommendations-modal/ipv6-recommendations-modal.component';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';

@Component({
    selector: 'app-ipv6-plan',
    templateUrl: './ipv6-plan.component.html',
    styleUrls: ['./ipv6-plan.component.scss']
})
export class IPv6PlanComponent implements OnInit {
    IPv6Status: {icon: string, status: string, message: string} = {
        icon: 'language',
        status: 'What is IPv6?',
        message: `<span>IPv6 is the sixth revision to the Internet Protocol and the successor to IPv4. 
        It functions similarly to IPv4 in that it provides the unique, numerical IP addresses necessary for Internet-enabled devices to communicate. 
        IPv6's major difference from (and advantage over) IPv4 is that it uses 128-bit addresses instead of 32-bit addresses.
        IPv6 provides a number of benefits over IPv4, included but not limited to:</span><br><br>
        <ul>
        <li>NAT (Network Address Translation) is no longer needed</li>
        <li>Auto-configuration</li>
        <li>No more private address collisions</li>
        <li>Better multicast routing</li>
        <li>Simpler header format</li>
        <li>Simplified, more efficient routing</li>
        <li>True quality of service (QoS), also called "flow labeling"</li>
        <li>Built-in authentication and privacy support</li>
        <li>Flexible options and extensions</li>
        <li>Easier administration. DHCPv6 will still be used, but SLAAC can also be used as an alternative mechanism.</li>
        </ul><br>
        The IPv6 recommendations provide managers to plan and engineers execute with a list of the IPv6 requirements that apply to their projects and a guided path for fulfilling those requirements. Guidelines, resources, references, and contact information are provided to assist with the process.
        <p>For additional Information please refer to:
            <a  target='_blank'
            href='https://cisco.sharepoint.com/sites/cpdm/TBP/SitePages/IPV%206.aspx'>IPv6</a>
        </p>`
    };
    recommendationsStatus: {icon: string, status: string} = {
        icon: 'submit',
        status: `IPv6 Recommendations`
    };
    recommendationBtnName = 'Begin';
    showRecommendationStatus = false;
    IPv6Details: IPv6Model;
    isReadOnly = false;
    constructor(private dialog: MatDialog,
                private ipv6Service: IPv6Service) { }

    ngOnInit() {
        this.ipv6Service.getIPv6DetailsSubject.subscribe(res => {
            if (res != null) {
                this.IPv6Details = res;
                const { recommendationStatus = null, version: { name }, workflow: { timestamp = null, next = null } } = res;
                this.recommendationsStatus.status = `IPv6 Recommendations ${name}`;
                this.isReadOnly = getNestedKeyValue(timestamp, 'plan') !== null;
                if (recommendationStatus === 'saved') {
                    if (timestamp === null) {
                        this.recommendationBtnName = 'View / Edit';
                    } else if (timestamp.hasOwnProperty('plan')) {
                        this.recommendationBtnName = 'View';
                    }
                }

                this.showRecommendationStatus = next === 'plan' && recommendationStatus === 'saved';
            }
        });
    }

    /**
     * Opens modal for IPv6 Recommendations
     */
    onBegin() {
        const config = {
            data: { version: this.IPv6Details.version.name, IPv6Id: this.IPv6Details._id, isReadOnly: this.isReadOnly },
            height: '100vh',
            width: '100vw',
            panelClass: 'full-screen-modal',
            disableClose: true,
        };
        const dialogRef = this.dialog.open(Ipv6RecommendationsModalComponent, config);

        dialogRef.afterClosed().subscribe((result) => {
            const { success, data } = result;
            if (success) {
                this.IPv6Details = data;
                this.ipv6Service.updateIPv6DetailsSubject(this.IPv6Details);
            }
        });
    }
}
