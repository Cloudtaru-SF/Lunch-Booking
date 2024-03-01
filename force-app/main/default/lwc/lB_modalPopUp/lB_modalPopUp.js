import { LightningElement,api } from 'lwc';
import FORM_FACTOR from '@salesforce/client/formFactor';
export default class LB_modalPopUp extends LightningElement {

     @api sectionClass;
    @api containerClass = 'modal-override slds-modal__container';
    @api containerClass2 = 'modal-override2 slds-p-top_none slds-p-bottom_none slds-modal__container';
    @api footerClass = 'slds-modal__footer footer-override';
    connectedCallback() {

        if (FORM_FACTOR === 'Large') {
            this.desktop = true;
            if (this.sectionClass) {
                this.sectionClass += ' slds-modal slds-fade-in-open ';
            } else {
                this.sectionClass = 'slds-modal slds-fade-in-open';
            }
        }
        else if (FORM_FACTOR === 'Small') {
            this.mobile = true;
            if (this.sectionClass) {
                this.sectionClass += ' slds-modal slds-fade-in-open ';
            } else {
                this.sectionClass = 'slds-modal slds-fade-in-open';
            }
        }
    }

}