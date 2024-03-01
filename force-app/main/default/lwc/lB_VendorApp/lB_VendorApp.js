import { LightningElement,track,wire } from 'lwc';
import changeBookingStatus from '@salesforce/apex/LB_LunchBookingController.changeBookingStatus';
import getListOfAllOrders from '@salesforce/apex/LB_LunchBookingController.getListOfAllOrders';
import { getBarcodeScanner } from 'lightning/mobileCapabilities';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import FORM_FACTOR from '@salesforce/client/formFactor';
import LBIMAGES from "@salesforce/resourceUrl/LBImages";
import getTodayOrdersWithStatus from '@salesforce/apex/LB_LunchBookingController.getTodayOrdersWithStatus';

const columns = [
    { label:'Name', fieldName: 'Name', type: 'text'},
    { label: 'Type', fieldName: 'Booking_Type__c', type: 'text' },
    { label: 'Meal', fieldName: 'Meal_Type__c', type: 'text', },
    { label: 'Status', fieldName: 'Status__c', type: 'text', },
    { label: 'Order Date', fieldName: 'Booking_Date__c', type: 'date', typeAttributes:{timeZone:'UTC', year:'numeric', month:'numeric', day:'numeric'}},
];

export default class LB_VendorApp extends LightningElement {

    loading=true;
    loadingAnim='';
    myScanner;

    scanButtonDisabled = false;

    scannedBarcode = '';
    mobile=false;

    //paginator
    columnsDataTable = columns;
    data;
    @track showBox = true;
    @track showPag= true;
    @track totalRecords;

    veg;
    nonveg;

    buttnOrderVarient='brand';
    buttnConsumedVarient='Neutral';

    todayData=[];

    // When component is initialized, detect whether to enable Scan button

    connectedCallback() {

        console.log('devide FORM_FACTOR is: ',FORM_FACTOR);

        this.mobile=FORM_FACTOR=='Small'?true:false;

        this.getOrdersList();

        this.myScanner = getBarcodeScanner();

        if (this.myScanner == null || !this.myScanner.isAvailable()) {

            this.scanButtonDisabled = true;

        }

        this.nonveg=LBIMAGES+'/images/no-chicken.png';
        this.veg=LBIMAGES+'/images/salad.png';
        console.log('LBIMAGES-->',this.nonveg);

        this.loadingAnim=LBIMAGES+'/images/LunchAnimation.gif';

        // Simulate page load delay
        setTimeout(() => {
            this.loading = false; // Hide modal after page load
        }, 2000); // Adjust the delay time as needed

        this.getTodaysDataWithStatus();

    }

    handleBeginScanClick(event) {

        // Reset scannedBarcode to empty string before starting new scan

        this.scannedBarcode = '';

        // Make sure BarcodeScanner is available before trying to use it

        // Note: We _also_ disable the Scan button if there’s no BarcodeScanner

        if (this.myScanner != null && this.myScanner.isAvailable()) {

            const scanningOptions = {

                barcodeTypes: [this.myScanner.barcodeTypes.QR]

            };

            this.myScanner

                .beginCapture(scanningOptions)

                .then((result) => {

                    console.log(result);

                    // next work - with the barcode scan value:

                    this.scannedBarcode = decodeURIComponent(result.value);

                })

                .catch((error) => {

                    console.error(error);

                    // Handle unexpected errors here

                })

                .finally(() => {

                    console.log('#finally');

                    // Clean up by ending capture,

                    // whether we completed successfully or had an error

                    this.myScanner.endCapture();

                });

        } else {

            // BarcodeScanner is not available

            // Not running on hardware with a camera, or some other context issue

            console.log(

                'Scan Barcode button should be disabled and unclickable.'
            );

            console.log('Somehow it got clicked: ');

            console.log(event);

            // Let user know they need to use a mobile phone with a camera

        }

    }

    handleConsumedClick(){

        console.log('this.scannedBarcode--->',this.scannedBarcode);
        

        changeBookingStatus({Name:this.scannedBarcode})
        .then(result=>{
            console.log('Order consumed---',result);
            this.showToast('Success', 'Order Consumed', 'success');
            this.scannedBarcode='';
        })
        .catch(error=>{
            console.log('error updating the status-->',error);
            this.showToast('Error', error.body.message, 'error');
        });

    }

    // @wire(getListOfAllOrders)
    // getListOfAllOrders({error,data}){
    //     if(data){
    //         let recs = [];
    //         for(let i=0; i<data.length; i++){
    //             let opp = {};
    //             opp.rowNumber = ''+(i+1);
    //             opp.oppLink = '/'+data[i].Id;
    //             opp = Object.assign(opp, data[i]);
    //             recs.push(opp);
    //         }
    //         this.opps = recs;
    //         this.showTable = true;
    //     }else{
    //         this.error = error;
    //     }       
    // }

    getOrdersList(){
        getListOfAllOrders()
        .then(result=>{
            console.log('getListOfAllOrders-->',result);
            this.data = result;
            console.log(JSON.stringify(this.data));
           this.totalRecords = result.length;
           this.data = result.map((ele,index) => {
            if (ele.Meal_Type__c) {
                let icon = ele.Meal_Type__c=='Veg'?this.veg:this.nonveg;
                return {...ele,icon:icon,Number: index + 1};
            }
        });
        })
        .catch(error=>{
            console.log('getListOfAllOrders - error-->',error);
        })
    }

        //Capture the event fired from the paginator component
        handlePaginatorChange(event){
            this.recordsToDisplay = event.detail;
            console.log('records to display-->',this.recordsToDisplay);
            this.rowNumberOffset = this.recordsToDisplay[0].rowNumber-1;

        }
    


    showToast(title, message, variant) {
        const event = new ShowToastEvent({
          title: title,
          message: message,
          variant: variant
        });
        this.dispatchEvent(event);
    }

    handleDataButtons(event){
        console.log('handleDataButtons-->',event.target.name);
        if(event.target.name=='Orders'){
            this.buttnOrderVarient='brand';
            this.buttnConsumedVarient='Neutral';
            this.getTodaysDataWithStatus('Ordered');
        }else if(event.target.name=='Consumed'){
            this.buttnOrderVarient='Neutral';
            this.buttnConsumedVarient='brand';
            this.getTodaysDataWithStatus('Consumed');
        }
    }

    getTodaysDataWithStatus(status='Ordered'){

        getTodayOrdersWithStatus({status:status})
        .then(result=>{
            console.log('ordered data->',result);
            if(result==null){
                //this.showToast('Error','No records Found..!', 'error');
                this.todayData=[];
            }else{
                this.todayData = result.map((ele,index) => {
                    if (ele.Meal_Type__c) {
                        let icon = ele.Meal_Type__c=='Veg'?this.veg:this.nonveg;
                        return {...ele,icon:icon,Number: index + 1};
                    }
                })
            }

        })
        .catch(error=>{
            console.log('error with today data=>',error);
        })
    }

    handleSort(){
        // Sort by name in ascending order
        const sortedByNameAsc = this.todayData.sort(this.sortBy('Name', 1));
        console.log(sortedByNameAsc);
    }

    sortBy(field, reverse, primer) {
        const key = primer
            ? function(x) {
                  return primer(x[field]);
              }
            : function(x) {
                  return x[field];
              };

        return function(a, b) {
            a = key(a);
            b = key(b);
            return reverse * ((a > b) - (b > a));
        };
    }

    sortedBy = 'Name'
    sortDirection='asc';

    /****sorting logic */
    sortHandler(event){
        const divName = event.currentTarget.dataset.name;
        console.log('Div name:', divName);
        this.sortedBy = divName;
        this.sortDirection=this.sortDirection=='desc'?'asc':'desc';
        this.todayData = [...this.sortBy(this.todayData)];
        this.todayData = this.todayData.map((ele,index) => {
                ele.Number=index+1;
                return {...ele};
            })
        
        console.log('after sorting-->',this.todayData);
    }

    sortBy(data){
        const cloneData = [...data]
        cloneData.sort((a,b)=>{
            if(a[this.sortedBy] === b[this.sortedBy]){
                return 0
            }
            return this.sortDirection === 'desc' ? 
            a[this.sortedBy] > b[this.sortedBy] ? -1:1 :
            a[this.sortedBy] < b[this.sortedBy] ? -1:1
        })
        return cloneData
    }
}