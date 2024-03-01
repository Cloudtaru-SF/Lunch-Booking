import { LightningElement, wire, api } from 'lwc';
import Id from "@salesforce/user/Id";
import getStatusBooking from '@salesforce/apex/LB_LunchBookingController.getBookingStatus';
import getRetrieveLunchData from '@salesforce/apex/LB_LunchBookingController.retrieveLunchData';
import lunchBookingImage from '@salesforce/resourceUrl/LunchBookingImage';
import { NavigationMixin } from 'lightning/navigation';
import FORM_FACTOR from '@salesforce/client/formFactor';
const columns = [
    { label: 'Name', fieldName: 'Name' },
    { label: 'Meal Type', fieldName: 'Meal_Type__c'},
    { label: 'Booking Type', fieldName: 'Booking_Type__c' },
    {
        label: 'Booking Date', fieldName: 'Booking_Date__c', type: 'date',
        typeAttributes: {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        }
    },
    { label: 'Status', fieldName: 'Status__c' },
    {
        type: "button", label: 'QRCode', typeAttributes: {
            label: 'QRCode',
            name: 'qrcode',
            title: 'QRCode',
            disabled: false,
            value: 'view',
            iconPosition: 'left',
            iconName: 'utility:preview',
            variant: 'Brand'
        }
    }

];
export default class LB_bookingStatus extends NavigationMixin(LightningElement) {

    userId = Id;
    wiredStatus;
    data;
    error;
    columns;
    imgUrl;
    testImage = false;
    activeTabContent = 'Ordered';
    initialRecords;
    showSpinner = false;
    lbImage = lunchBookingImage;
    connectedCallback() {
        if (FORM_FACTOR == "Small") {
            this.columns = columns.map(ele=>{
                ele['initialWidth'] = 150;
                return ele;
            })
        }else {
            this.columns = columns;
        }
        this.lunchBookingDatatable();
    }


    getStatusBookingData(rowId) {
        getStatusBooking({ dataId: rowId })
            .then((result) => {
                //this.showSpinner = true;
                console.log('result-----80---------', result);
                if (result[0].QRCode__c) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(result[0].QRCode__c, 'text/html');
                    console.log('doc-->', doc);
                    const imgElement = doc.querySelector('img');
                    console.log('imgElement---' + imgElement);
                    if (imgElement) {
                        this.imgUrl = imgElement.getAttribute('src');
                        console.log('this.imgUrl----', this.imgUrl);
                    }
                }
            }).catch((error) => {
                console.log('error---------', error);
            })
    }


    callRowAction(event) {
        const recId = event.detail.row.Id;
        //this.showSpinner=true;
        console.log(' this.showSpinner--------', this.showSpinner);
        console.log('recId---------', recId);
        const actionName = event.detail.action.name;
        if (actionName === 'qrcode') {
            window.scrollTo(0, 0);
            this.testImage = true;
            this.getStatusBookingData(recId);
            //this.showSpinner = false;
        }
    }
    handleClick(event) {
        let name = event.currentTarget.name;
        if (name === 'close') {
            this.testImage = false;
            console.log('this.testImage----------', this.testImage);
        }
    }
    tabChangeHandler(event) {
        let name = event.currentTarget.name;

        if (name === 'ordered') {
            this.activeTabContent = event.target.value;
            console.log('this.activeTabContent------------>', this.activeTabContent);
            this.lunchBookingDatatable();
        } else if (name === 'consumed') {
            this.activeTabContent = event.target.value;
            console.log('this.activeTabContent------------>', this.activeTabContent);
            this.lunchBookingDatatable();
        } else if (name === 'onhold') {
            this.activeTabContent = event.target.value;
            console.log('this.activeTabContent------------>', this.activeTabContent);
            this.lunchBookingDatatable();
        }
    }

    number = 0;

    @api lunchBookingDatatable() {
        console.log('this.activeTabContent-----------', this.activeTabContent);
        console.log('this. this.data-----------', this.data);
        
        this.data = [];
        this.number=this.number+1;
        console.log('-------number----',this.number);
        console.log(' this.data-----------', this.data);
        getRetrieveLunchData({ status: this.activeTabContent,num:this.number })
                .then((result) => {
                    console.log('result----118---------', result);
                    this.data = result;
                    this.initialRecords = this.data;
                    console.log(' this.data---------', this.data);
                })
                .catch((error) => {
                    console.log('error-----------', error)
                })
    }


    handleSearch(event) {
        const searchKey = event.target.value.toLowerCase();
        console.log('searchKey-----------', searchKey);

        if (searchKey) {
            this.data = this.initialRecords;
            console.log(' this.datas------', this.data);
            console.log(' this.this.initialRecords------', this.initialRecords);
            if (this.data) {
                let searchRecords = [];

                for (let record of this.data) {
                    let valuesArray = Object.values(record);

                    for (let val of valuesArray) {
                        console.log('val is ' + val);
                        let strVal = String(val);

                        if (strVal) {

                            if (strVal.toLowerCase().includes(searchKey)) {
                                searchRecords.push(record);
                                break;
                            }
                        }
                    }
                }

                console.log('Matched Accounts are ' + JSON.stringify(searchRecords));
                this.data = searchRecords;
                console.log(' this.data-----------', this.data);
            }
        } else {
            this.data = this.initialRecords;
        }
    }
  
    handleFormFactor() {
        if (FORM_FACTOR === "Large") {
            this.deviceType = "Desktop/Laptop";
        } else if (FORM_FACTOR === "Medium") {
            this.deviceType = "Tablet";
        } else if (FORM_FACTOR === "Small") {
            this.deviceType = "Mobile";
        }
    }

}