import { LightningElement } from 'lwc';
//import getCustomMetadataTimes from '@salesforce/apex/LB_LunchBookingController.getCustomMetadataTimes';
import updateLunchTimings from '@salesforce/apex/LB_LunchBookingController.updateLunchTimings';
import getLunchTimings from '@salesforce/apex/LB_LunchBookingController.getLunchTimings';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import LBIMAGES from "@salesforce/resourceUrl/LBImages";
import FORM_FACTOR from '@salesforce/client/formFactor';
export default class LB_luchTimeUpdate extends LightningElement {


  updateTiming = false;
  minLunch;
  maxLunch;
  sbstartTime;
  sbendTime;
  preMaxTime;
  lunchTimingsId;
  breakfastimg;
  gearDecide = true;


  connectedCallback() {

    if (FORM_FACTOR == "Small") {
      this.gearDecide = false;
      console.log('this.gearDecide-------------', this.gearDecide);
    }
    this.breakfastimg = LBIMAGES + '/images/breakfast.png';
    console.log('LBIMAGES--------------->', this.breakfastimg);


  }



  handleClick(event) {
    let name = event.currentTarget.name;
    if (name === 'save') {
      this.updateLunchTimingsInCustomSetting();
      console.log('save----');
    } else if (name === 'cancel') {
      this.updateTiming = false;
    } else if (name === 'close') {
      this.updateTiming = false;
    } else if (name === 'settingicon') {
      this.updateTiming = true;
      console.log('this.updateTiming----------', this.updateTiming);
      this.getCustomSettingData();
    }

  }
  handleChange(event) {
    let name = event.currentTarget.name
    if (name === 'lunchmintime') {
      this.minLunch = event.target.value;
      console.log('this.minLunch-------->', this.minLunch);
    } else if (name === 'prebookingmaxtime') {
      this.preMaxTime = event.target.value;
    } else if (name === 'lunchmaxtime') {
      this.maxLunch = event.target.value;
    } else if (name === 'sbstarttime') {
      this.sbstartTime = event.target.value;
    } else if (name === 'sbendtime') {
      this.sbendTime = event.target.value;
    }
  }

  updateLunchTimingsInCustomSetting() {
    let exParamObj = {
      "Id": this.lunchTimingsId,
      "LunchEndTime__c": this.maxLunch,
      "LunchStartTime__c": this.minLunch,
      "PreBookingEndTime__c": this.preMaxTime,
      "SpotBookEndTime__c": this.sbendTime,
      "SpotBookStartTime__c": this.sbstartTime
    }
    updateLunchTimings({ ot: exParamObj })
      .then((result) => {
        console.log('result------------>', result);
        const evt = new ShowToastEvent({
          title: "Toast Success",
          message: "Lunch Timings Successfully Saved",
          variant: "success",
          mode: "dismissable"
        });
        this.dispatchEvent(evt);
        this.updateTiming = false;
      }).catch((error) => {
        console.log('error------------>', error);
      })
  }
  getCustomSettingData() {
    getLunchTimings()
      .then(result => {
        console.log('timings---------------:', result);
        console.log('result stringified---------------->', JSON.stringify(result));
        this.lunchTimingsId = result.Id;
        this.preMaxTime = result.PreBookingEndTime__c;
        this.sbstartTime = result.SpotBookStartTime__c;
        this.sbendTime = result.SpotBookEndTime__c;
        this.minLunch = result.LunchStartTime__c;
        this.maxLunch = result.LunchEndTime__c;
        console.log('this.lunchTimingsId---------', this.lunchTimingsId);
      })
      .catch(error => {
        console.log('time error->' + error);
      })

  }
}