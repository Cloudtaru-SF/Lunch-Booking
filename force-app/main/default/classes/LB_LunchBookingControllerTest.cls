@isTest
public class LB_LunchBookingControllerTest {
    
    @isTest
    public static void lunchBookingTestMethod(){
        
        Profile testProfile = [SELECT Id FROM Profile WHERE Name='Standard User']; 
        User testUser = new User(Alias = 'standt', Email='standarduser@testorg.com', 
            EmailEncodingKey='UTF-8', LastName='Testing', LanguageLocaleKey='en_US', 
            LocaleSidKey='en_US', ProfileId = testProfile.Id, 
            TimeZoneSidKey='America/Los_Angeles', UserName='standarduserlunch@testorg.com');
        insert testUser;
        
		Contact testContact=new Contact(LastName='Lunch User', Email='standarduser@testorg.com');
        insert testContact;
        
        LB_Order_Time__c testLBOrderTime= new LB_Order_Time__c(Name='Test Data',LunchEndTime__c='00:00',
            LunchStartTime__c='23:00',PreBookingEndTime__c='15:30',SpotBookEndTime__c='14:00',SpotBookStartTime__c='11:00');
        insert testLBOrderTime;
        
        Lunch_Order__c testLunchBookingRecord=LB_LunchBookingController.createLunchOrder(testUser.Id,'Veg','Pre-Ordered');
        System.assertEquals(testLunchBookingRecord.Booking_Type__c,'Pre-Ordered','Lunch Order Booking Type should be Pre-Ordered');

        Lunch_Order__c testLunchBookingRecord1=LB_LunchBookingController.createLunchOrder(testUser.Id,'Veg','Spot Booking');
        System.assertEquals(testLunchBookingRecord1.Booking_Type__c,'Spot Booking','Lunch Order Booking Type should be Spot Booking');
        //Lunch_Order__c testLunchBookingRecord2=LB_LunchBookingController.createLunchOrder(testUser.Id,'Veg','Pre-Ordered');

        List<Lunch_Order__c> testLunchOrderList=LB_LunchBookingController.getStatusOfLunchBooking(testUser.Id);
        System.assertEquals(testLunchOrderList.size(),2,'2 Lunch orders should be booked');

        List<Lunch_Order__c> testLunchOrderList2=LB_LunchBookingController.getBookingStatus(testLunchBookingRecord.Id);
        System.assertEquals(testLunchOrderList2[0].Status__c,'Ordered','Lunch order status should be Ordered');

        Lunch_Order__c testLunchBookingRecord2=LB_LunchBookingController.changeBookingStatus(testLunchBookingRecord1.Name);
        System.assertEquals(testLunchBookingRecord2.Status__c,'Consumed','Lunch order status should be Consumed');
        
        LB_Order_Time__c testLunchOrderTime=LB_LunchBookingController.getLunchTimings();
        System.assertEquals(testLunchOrderTime.PreBookingEndTime__c,'15:30','Lunch Order Timings are created');
        
        testLunchOrderTime.PreBookingEndTime__c='16:00';
        LB_Order_Time__c testLunchOrderTime1=LB_LunchBookingController.updateLunchTimings(testLunchOrderTime);
        System.assertEquals(testLunchOrderTime1.PreBookingEndTime__c,'16:00','Lunch Order Timings are updated');
        
        List<Lunch_Order__c> testLunchOrderList3=LB_LunchBookingController.getListOfAllOrders();
        System.assertEquals(testLunchOrderList3.size(),2,'2 Lunch orders should be ordered');
        
        List<Lunch_Order__c> testLunchOrderList4=LB_LunchBookingController.retrieveLunchData('Ordered',1);
        System.assertEquals(testLunchOrderList4[0].Status__c,'Ordered','Lunch order status should be Ordered');
        
        List<Lunch_Order__c> testLunchOrderList5=LB_LunchBookingController.getTodayOrdersWithStatus('Consumed');
        System.assertEquals(testLunchOrderList5[0].Status__c,'Consumed','Lunch order status should be consumed');
        
    }
}