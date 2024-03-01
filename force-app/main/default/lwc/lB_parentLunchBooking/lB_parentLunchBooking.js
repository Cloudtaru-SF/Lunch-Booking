import { LightningElement } from 'lwc';

export default class LB_parentLunchBooking extends LightningElement {


    popUp=false;
    handleClick(event){
        this.popUp=true;
    }
}