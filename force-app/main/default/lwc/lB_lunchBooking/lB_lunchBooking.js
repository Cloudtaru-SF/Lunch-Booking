import { LightningElement, wire, track } from 'lwc';
import { getPicklistValuesByRecordType, getObjectInfo } from "lightning/uiObjectInfoApi";
import LUNCH_ORDER__C_OBJECT from "@salesforce/schema/Lunch_Order__c";
import getLunchTimings from '@salesforce/apex/LB_LunchBookingController.getLunchTimings';
import createLunchOrder from '@salesforce/apex/LB_LunchBookingController.createLunchOrder';
import Id from "@salesforce/user/Id";
import LBIMAGES from "@salesforce/resourceUrl/LBImages";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getRetrieveLunchData from '@salesforce/apex/LB_LunchBookingController.retrieveLunchData';
export default class LB_lunchBooking extends LightningElement {


  today = new Date().toISOString().slice(0, 10);
  mealTypeOptions;
  tomorrowISOString = '';
  isPopupTrue = false;
  userId = Id;
  pbeTime;
  bookingType = '';
  dateAccording = '';
  sbsTime;
  sbeTime;
  showBooking = false;
  orderData = [];
  currentTime='';
  lbImage='';
  lunchAnime;

  loading=true;
  loadingAnim='';
  
  connectedCallback() {
    let today = new Date();
    let tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Convert tomorrow's date to ISO string and slice to get YYYY-MM-DD format
    this.tomorrowISOString = tomorrow.toISOString().slice(0, 10);
    console.log('tomorrowISOString-->' + this.tomorrowISOString);
    //this.getCustomTimings();
    this.getCSLunchTimings();
    //this.getDayofweek('');
    this.currentTimein24hrFormat();
    //this.testPre=true;

    //backgroundImage
    this.lbImage=LBIMAGES+'/images/background.png';
    console.log('LBIMAGES-->',this.lbImage);

    this.breakfastimg=LBIMAGES+'/images/breakfast.png';
     console.log('LBIMAGES-->',this.breakfastimg);

     this.lunchAnime=LBIMAGES+'/images/potluck.jpg';
     console.log('LBIMAGES-->',this.lunchAnime);

     this.loadingAnim=LBIMAGES+'/images/LunchAnimation.gif';

        // Simulate page load delay
        setTimeout(() => {
            this.loading = false; // Hide modal after page load
        }, 2000); // Adjust the delay time as needed



  }

  currentTimein24hrFormat(){
    // Get the current date and time
    const now = new Date();

    // Get the hour and minute components
    let hour = now.getHours();
    let minute = now.getMinutes();

    // Add leading zeros if necessary
    hour = hour < 10 ? '0' + hour : hour;
    minute = minute < 10 ? '0' + minute : minute;

    // Combine the hour and minute components
    this.currentTime = `${hour}:${minute}`;

    console.log(this.currentTime); // Output the current time in 24-hour format

  }

  getDayofweek() {
    console.log('booking type-->',this.bookingType);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const options = { weekday: 'long' };
    let weekend=false;

    let dayOfWeek;
    if(this.bookingType=='Pre-Ordered'){
      dayOfWeek = new Intl.DateTimeFormat('en-US', options).format(tomorrow);
      weekend=dayOfWeek=='Saturday' || dayOfWeek=='Sunday' ?false:true;
      console.log("Tomorrow is: " +dayOfWeek);
    }else if(this.bookingType=='Spot Booking'){
      dayOfWeek = new Intl.DateTimeFormat('en-US', options).format(today);
      weekend=dayOfWeek=='Saturday' || dayOfWeek=='Sunday' ?false:true;
      console.log("Today is: " +dayOfWeek);
    } else{
      return null;
    }
    return weekend;
  }

  // Wire adapter to get the object info
  @wire(getObjectInfo, { objectApiName: LUNCH_ORDER__C_OBJECT })
  objectInfo;

  // Wire adapter to get the picklist values
  @wire(getPicklistValuesByRecordType, {
    objectApiName: LUNCH_ORDER__C_OBJECT,
    recordTypeId: "$objectInfo.data.defaultRecordTypeId"
  })
  pickListHandler({ data, error }) {
    if (data) {
      console.log("---mealTypeOptions--->", data);
      this.mealTypeOptions = this.pickListGenerator(
        data.picklistFieldValues.Meal_Type__c
      );
    } else if (error) {
      console.log("--error-->", error);
    }
  }
  pickListGenerator(data) {
    return data.values.map((item) => ({
      label: item.label,
      value: item.value
    }));
  }

  handleChange(event) {
    if (event.target.name === "mealtype") {
      this.newMealType = event.target.value;
      console.log(' this.newMealType------', this.newMealType);
    } else if (event.target.name === "mealdate") {
      this.newDate = event.target.value;
    }
  }


  handleClick(event) {
    let name = event.currentTarget.name;

    if (name === "preorder") {
      this.isPopupTrue = !this.isPopupTrue;
      this.dateAccording = this.tomorrowISOString;
      this.bookingType = 'Pre-Ordered';
    } else if (name === "spot") {
      this.isPopupTrue = !this.isPopupTrue;
      this.dateAccording = this.today;
      this.bookingType = 'Spot Booking';

    } else if (name === "cancel") {
      this.isPopupTrue = !this.isPopupTrue;
    } else if (name === "close") {
      this.isPopupTrue = !this.isPopupTrue;
    } else if (name === 'order') {
      this.handleOrderBooking();
      
     // this.handleOrder();
    } else {

    }
  }

  getCustomTimings() {
    getCustomMetadataTimes()
      .then(result => {
        console.log('timings:', result);
        console.log('result stringified-->', JSON.stringify(result));
        console.log('test---------->', result[0].PreBookingEndTime__c); // Output: "6:00 PM"
        this.pbeTime = result[0].PreBookingEndTime__c
        this.sbsTime = result[0].SpotBookStartTime__c;
        this.sbeTime = result[0].SpotBookEndTime__c;
        console.log(' this.sbsTime-----------', this.sbsTime);
        console.log(' this.sbeTime-----------', this.sbeTime);
        console.log(' this.pbeTime-----------', this.pbeTime);

      })
      .catch(error => {
        console.log('time error->' + error);
      })
  }

  handleOrder() {
    const today = new Date();
    console.log('today-->',today);
  //   const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  //   console.log('time------order---->', time);
  //   // Split the time string into hours, minutes, and seconds
  //   const [hour, minute, second] = time.split(':').map(Number);
  //   // Determine if it's morning or afternoon
  //   const period = hour >= 12 ? 'PM' : 'AM';
  //   // Convert hour from 24-hour to 12-hour format
  //   let hour12 = hour % 12;
  //   hour12 = hour12 || 12; // Convert 0 to 12 for 12 AM
  //   // Create the formatted time string
  //  // const formattedTime = `${hour12}:${minute < 10 ? '0' : ''}${minute}${period}`;
  //   console.log('formattedTime---------', formattedTime);
  //   console.log('this.pbeTime------', this.pbeTime);

    console.log('local time-->',new Date().toLocaleTimeString());
    const formattedTime=new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(today).toString().replace(' ','');
    console.log(new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(today).toString().replace(' ',''));

    const checkTheDay=this.getDayofweek(this.bookingType);

    // console.log('formattedTime <= this.pbeTime-->',formattedTime <= this.pbeTime);
    // console.log(`this.bookingType == 'Pre-Ordered'-->`,this.bookingType == 'Pre-Ordered');
    // console.log('checkTheDay-->',checkTheDay);

    // console.log('formattedTime >= this.sbsTime-->',formattedTime >= this.sbsTime);
    // console.log('formattedTime <= this.sbeTime-->',formattedTime <= this.sbeTime);
    // console.log('this.sbsTime-->',this.sbsTime);
    // console.log('this.sbeTime-->',this.sbeTime);
    // console.log('this.bookingType-->',this.bookingType);
    // console.log('compare-->',this.compareTimes(formattedTime,this.sbsTime));
    // console.log('this.sbsTime--------',this.sbsTime);
    // console.log('this.sbeTime--------',this.sbeTime);
    // console.log('formattedTime-------',formattedTime);

    if (formattedTime <= this.pbeTime && this.bookingType == 'Pre-Ordered' && checkTheDay) {
      console.log('preordered-----------', this.pbeTime + formattedTime);
      createLunchOrder({ userId: this.userId, mealType: this.newMealType, bookingType: this.bookingType })
        .then(result => {
          console.log('Lunch order created: ', result);
          this.orderData = result;
          this.orderData.Booking_Date__c = this.convertToDate(this.orderData.Booking_Date__c);
          this.showBooking = !this.showBooking;

          this.showToast('Success', 'Lunch ordered successfully', 'success');
          this.isPopupTrue = !this.isPopupTrue;
          if (result.QRCode__c) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(result.QRCode__c, 'text/html');
            console.log('doc-->', doc);
            const imgElement = doc.querySelector('img');
            console.log('imgElement---' + imgElement);
            if (imgElement) {
              this.imgUrl = imgElement.getAttribute('src');
            }
          }
          this.bookingType = '';
        })
        .catch(error => {
          console.error('Error creating lunch order: ', error);
          this.isPopupTrue = !this.isPopupTrue;
          //A lunch order for today already exists
          this.showToast('Error', 'Error Exists for Tomorrow..!', 'error');
        });
    } 
    else if (formattedTime >= this.sbsTime && formattedTime <= this.sbeTime && this.bookingType == 'Spot Booking' && checkTheDay) {
      // else if(this.bookingType == 'Spot Booking' && checkTheDay){
      console.log('spot booking');
      createLunchOrder({ userId: this.userId, mealType: this.newMealType, bookingType: this.bookingType })
        .then(result => {
          console.log('Lunch order created: ', result);
          this.orderData = [];
          this.orderData = result;
          this.orderData.Booking_Date__c = this.convertToDate(this.orderData.Booking_Date__c);
          this.showBooking = !this.showBooking;
          
          this.showToast('Success', 'Lunch ordered successfully', 'success');
          this.isPopupTrue = !this.isPopupTrue;
          if (result.QRCode__c) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(result.QRCode__c, 'text/html');
            console.log('doc-->', doc);
            const imgElement = doc.querySelector('img');
            console.log('imgElement---' + imgElement);
            if (imgElement) {
              this.imgUrl = imgElement.getAttribute('src');
            }
          }
          this.bookingType = '';
        })
        .catch(error => {
          console.error('Error creating lunch order: ', error);
          this.isPopupTrue = !this.isPopupTrue;
          //A lunch order for today already exists
          this.showToast('Error', error.body.message, 'error');
        });
    } else {
      console.log('error----------->');
      this.showToast('Error', 'Bookings not allowed at this time...!', 'error');
    }
  }

  getCSLunchTimings(){
    getLunchTimings()
    .then(result=>{
      console.log('getlunchtimings-->',result);
      this.pbeTime=result.PreBookingEndTime__c;
      this.sbsTime= result.SpotBookStartTime__c;
      this.sbeTime=result.SpotBookEndTime__c;
      this.currentTime<this.pbetime?console.log('pbe is greater'):console.log('current is greater');
      this.currentTime>this.sbsTime && this.currentTime<this.sbeTime?console.log('spot true'):console.log('spot false');
    })
    .catch(error=>{
      console.log('error getting cs timings-->',error);
    })
  }

  handleOrderBooking(){
    console.log('pbe is ',this.pbeTime);
      console.log('currentTime is ',this.currentTime);
      const weekday=this.getDayofweek(this.bookingType);
      console.log('weekday-->',weekday);
    if((this.bookingType == 'Pre-Ordered' && this.currentTime<this.pbeTime) || (this.bookingType == 'Spot Booking' && this.currentTime>this.sbsTime && this.currentTime<this.sbeTime) ){
      weekday?this.createLunchOrderCall():this.showToast('Error', 'Trying to book for weekend', 'error');
    }
    else{
      this.showToast('Error', 'Bookings not allowed at this time...!', 'error');
    }
  }

  showToast(title, message, variant) {
    const event = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant
    });
    this.dispatchEvent(event);
  }

  createLunchOrderCall(){
    console.log('bookingType-->',this.bookingType );
    createLunchOrder({ userId: this.userId, mealType: this.newMealType, bookingType: this.bookingType })
        .then(result => {
          console.log('Lunch order created: ', result);
          this.orderData = result;
          this.orderData.Booking_Date__c = this.convertToDate(this.orderData.Booking_Date__c);
          this.showBooking = !this.showBooking;

          this.showToast('Success', 'Lunch ordered successfully', 'success');
          this.isPopupTrue = !this.isPopupTrue;
          if (result.QRCode__c) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(result.QRCode__c, 'text/html');
            console.log('doc-->', doc);
            const imgElement = doc.querySelector('img');
            console.log('imgElement---' + imgElement);
            if (imgElement) {
              this.imgUrl = imgElement.getAttribute('src');
            }
          }
          this.template.querySelector("c-l-b_booking-status").lunchBookingDatatable();
          this.bookingType = '';
        })
        .catch(error => {
          console.error('Error creating lunch order: ', error);
          this.isPopupTrue = !this.isPopupTrue;
          //A lunch order for today already exists
          this.showToast('Error', error.body.message, 'error');
        });
  }


  // Function to convert ISO date/time string to a human-readable format
  convertToReadableDateTime(dateTimeString) {
    const dateTime = new Date(dateTimeString);

    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'UTC' // Ensure the date/time is interpreted as UTC
    };

    return dateTime.toLocaleString('en-US', options);
  }

  convertToDate(inputDate) {
   // const inputDate = "2024-02-10T06:09:48.000Z";
    const date = new Date(inputDate);
    const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;

    console.log(formattedDate); // Output: 02/10/2024
    return formattedDate;
  }

  handleCloseBooking(){
    this.showBooking = !this.showBooking;
  }

  compareTimes(time1, time2) {
    // Parse time strings into Date objects
    var date1 = new Date("2000-01-01 " + time1);
    var date2 = new Date("2000-01-01 " + time2);

    console.log('date1->',date1,'  date2-->',date2);

    // Compare the two times
    if (date1 > date2) {
        return time1 + " is greater than " + time2;
    } else if (date1 < date2) {
        return time2 + " is greater than " + time1;
    } else {
        return "Both times are equal";
    }
  }

}