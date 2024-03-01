/**
 * @author Cloudtaru
 * @date 09/02/2024
 * @description This Class is controller of lunchBooking LWC component
 */
public with sharing class LB_LunchBookingController {

    /**
   * @author Cloudtaru
   * @date 09/02/2024
   * @description This method is used to createLunchOrder
   */
    @AuraEnabled
    public static Lunch_Order__c createLunchOrder(Id userId, String mealType, String bookingType) {
        // Query user's email
        User user = [SELECT Email FROM User WHERE Id = :userId LIMIT 1];
      System.debug(user);  
      System.debug(user.Email);  
        // Query contact using user's email
       Contact contact = [SELECT Id FROM Contact WHERE Email = :User.Email LIMIT 1];
       System.debug(contact);
       Date DateAccording;
       Datetime DateAccordingTime;
        if (bookingType=='Pre-Ordered') {
            DateAccording= Date.today().addDays(1);
            DateAccordingTime=DateTime.now().addDays(1);
        } else if(bookingType=='Spot Booking') {
            DateAccording = Date.today();
            DateAccordingTime=DateTime.now();
        }
       // Check if a Lunch Order already exists for this contact and today's date
       Date today = Date.today();

       List<Lunch_Order__c> existingOrders = [SELECT Id FROM Lunch_Order__c WHERE Contact__c = :contact.Id AND DAY_ONLY(Booking_Date__c) = :DateAccording  LIMIT 1];
        if (existingOrders.isEmpty()) {
            // Create a new Lunch Order record
            Lunch_Order__c lunchOrder = new Lunch_Order__c();
            lunchOrder.Contact__c = contact.Id;
            lunchOrder.Booking_Date__c = DateAccordingTime;
            lunchOrder.Status__c = 'Ordered';
            lunchOrder.Meal_Type__c = mealType;
            lunchOrder.Booking_Type__c = bookingType;
            
            // Insert the lunch order record
            insert lunchOrder;
            
            return [select QRCode__c,Booking_Date__c,Meal_Type__c,Name,Booking_Type__c from Lunch_Order__c WHERE Id=:lunchOrder.Id];
        }else{
            // Throw an exception or return null to indicate that a lunch order cannot be created
            if(bookingType=='Pre-Ordered'){
              throw new AuraHandledException('A lunch order for tomorrow already exists for you.');
            }
            else{
              throw new AuraHandledException('A lunch order for today already exists for you.');
            }
            
        }
    }
    
    /**
   * @author Cloudtaru
   * @date 09/02/2024
   * @description This method is used to display status of lunch booking
   */
  @AuraEnabled(cacheable=true)
  public static List<Lunch_Order__c> getStatusOfLunchBooking(Id userId){

    User user = [
        SELECT 
         Email 
        FROM User 
        WHERE Id = :userId 
        LIMIT 1
    ];
    System.debug(user.Email);  
      // Query contact using user's email
    Contact contact = [
        SELECT 
         Id 
        FROM Contact 
        WHERE Email = :User.Email 
        LIMIT 1
    ];
    List<Lunch_Order__c> loList = [
      SELECT
        Name,
        Id,
        Booking_Type__c,
        Booking_Date__c,
        Meal_Type__c,
        QRCode__c,
        Status__c
      FROM Lunch_Order__c
      WHERE Contact__r.Id =:contact.Id
    ];
    return loList;
   
  }
   /**
   * @author Cloudtaru
   * @date 13/02/2024
   * @description This method is used to display status of lunch booking datatable
   */
  @AuraEnabled
  public static List<Lunch_Order__c> getBookingStatus(Id dataId){

    List<Lunch_Order__c> loList = [
        SELECT
          Name,
          Id,
          Booking_Type__c,
          Booking_Date__c,
          Meal_Type__c,
          QRCode__c,
          Status__c
        FROM Lunch_Order__c
        WHERE Id=:dataId
      ];
      return loList;

  }

  /**
   * @author Cloudtaru
   * @date 13/02/2024
   * @description This method is used to change the status of lunch booking to Consumed
   */
  @AuraEnabled
  public static Lunch_Order__c changeBookingStatus(string Name){
    Lunch_Order__c[] lunchOrder=[select id,Status__c from Lunch_Order__c where Name=:Name AND Status__c='Ordered' AND Booking_Date__c=TODAY LIMIT 1];
    if(lunchOrder.size()>0 && lunchOrder[0]!=null){
        lunchOrder[0].Status__c='Consumed';
        update lunchOrder[0];

        return lunchOrder[0];
    }else{
        throw new AuraHandledException('Invalid Order');
    }
  }
    /**
   * @author Cloudtaru
   * @date 13/02/2024
   * @description This method is used to get Luch Timings from custom settings
   */
    @AuraEnabled
    public static LB_Order_Time__c getLunchTimings(){

      LB_Order_Time__c otList=[
        SELECT
         Id,
         LunchEndTime__c,
         LunchStartTime__c,
         SpotBookStartTime__c,
         SpotBookEndTime__c,
         PreBookingEndTime__c 
        FROM  LB_Order_Time__c
      ];
      return otList;
    }

     /**
   * @author Cloudtaru
   * @date 15/02/2024
   * @description This method is used to update the lunch timings
   */
   @AuraEnabled
   public static LB_Order_Time__c updateLunchTimings(LB_Order_Time__c ot){
     
    UPDATE ot;
    return ot;  
   }

   @AuraEnabled
    public static List<Lunch_Order__c> getListOfAllOrders() {
      List<Lunch_Order__c> orderList = [SELECT Name, Id, Booking_Type__c, Booking_Date__c, Meal_Type__c, QRCode__c, Status__c FROM Lunch_Order__c];
        return orderList;
    }
    /**
   * @author Cloudtaru
   * @date 15/02/2024
   * @description This method is used to fetch ordered and consumed data in datatable
   */
  @AuraEnabled(cacheable=true)
  public static List<Lunch_Order__c> retrieveLunchData(String status,integer num){

      List<Lunch_Order__c> loList=[
        SELECT
         Id,
         Name,
         Booking_Date__c,
         Booking_Type__c,
         Meal_Type__c,
         QRCode__c,
         Status__c
        FROM  Lunch_Order__c
        WHERE  Status__c=:status ORDER BY Booking_Date__c DESC
      ];

      return loList;
  }

  @AuraEnabled
    public static List<Lunch_Order__c> getTodayOrdersWithStatus(string status) {
      List<Lunch_Order__c> orderList = [SELECT Name, Id, Booking_Type__c, Booking_Date__c, Meal_Type__c, QRCode__c, Status__c FROM Lunch_Order__c WHERE  Booking_Date__c=TODAY AND Status__c=:status];
      if(orderList.size()>0){
        return orderList;
      }
      return null;
        
    }


  }