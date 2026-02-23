---                                                                                                                            
  #: 1                                                                                    
  Issue: Hardcoded user123                                                                
  File: src/app/lucky-draw/page.tsx                                                       
  Details: 6 places — entire lucky draw uses a fake user, real users can't interact       
  ────────────────────────────────────────                                                
  #: 2                                                                                    
  Issue: Admin payment verification missing                                               
  File: src/app/admin/dashboard/page.tsx                                                  
  Details: Admins have no UI to view UTR numbers, screenshots, or approve/reject payments 
  ────────────────────────────────────────                                                
  #: 3                                                                                    
  Issue: Referral payment buttons do nothing                                              
  File: src/components/ReferralPage.tsx:184                                               
  Details: 3 payment buttons (UPI, Card, Net Banking) have zero onClick handlers          
  ────────────────────────────────────────                                                
  #: 4                                                                                    
  Issue: Admin referrals uses mock data                                                   
  File: src/app/admin/referrals/page.tsx:41                                               
  Details: Entire referral table is hardcoded fake data, never calls real API             
  ────────────────────────────────────────                                                
  #: 5                                                                                    
  Issue: Wrong API endpoint                                                               
  File: src/app/admin/referrals/page.tsx:90                                               
  Details: Calls /api/referral (doesn't exist), should be /api/referrals                  
  HIGH (Poor UX / Incomplete)                                                             
  #: 6                                                                                    
  Issue: 11+ alert() calls                                                                
  File: Multiple files                                                                    
  Details: admin/lucky-draw, PrimeMembership, Shop, verify-email — should use Toast       
  ────────────────────────────────────────                                                
  #: 7                                                                                    
  Issue: Referral settings save nothing                                                   
  File: admin/referrals/page.tsx:241                                                      
  Details: "Save Settings" button has no handler — inputs are decorative                  
  ────────────────────────────────────────                                                
  #: 8                                                                                    
  Issue: Payment status stays pending                                                     
  File: api/lucky-draw/bookings/route.ts                                                  
  Details: Stores UTR but no admin endpoint to verify/approve it                          
  MEDIUM (Incomplete features)                                                            
  #: 9                                                                                    
  Issue: Shop image upload                                                                
  File: admin/shop-inventory/page.tsx                                                     
  Details: Only URL input, no actual file upload                                          
  ────────────────────────────────────────                                                
  #: 10                                                                                   
  Issue: Middleware/Auth mismatch                                                         
  File: middleware.ts                                                                     
  Details: Checks access_token cookie but AuthContext uses /api/auth/me                   
  ────────────────────────────────────────                                                
  #: 11                                                                                   
  Issue: Registration resend code                                                         
  File: register/page.tsx:290                                                             
  Details: Shows error text instead of actually calling /api/auth/resend-code             
  ---                                                                                     
  What's Actually Working                                                                 
                                                                                          
  - Auth (Cognito login/register/verify)                                                  
  - Admin product/job/event CRUD                                                          
  - Shop product listing + cart                                                           
  - Email verification flow                                                               
  - Prime membership creation                                                             
  - UPI payment collection (just built)                                                   
  - Notifications API                                                                     
  - Customer dashboard data fetching                                                      
                                                                                          
  ---                                                                                     
  Suggested Fix Order                                                                     
                                                                                          
  1. Fix user123 in lucky draw — 1 line change, massive impact                            
  2. Admin payment verification tab — most critical for the business to operate           
  3. Referral payment — replace decorative buttons with UpiPayment component              
  4. Admin referrals real data — fix API endpoint + remove mock data                      
  5. Replace alert() with Toast — polish                                                  
                                                                                          
  Want me to fix all of these now?                                                        
                                                                                          
✻ Cooked for 1m 47s                      