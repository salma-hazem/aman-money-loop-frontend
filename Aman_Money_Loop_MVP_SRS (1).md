Aman Money Loop – MVP SRS v1.0 

# **Aman Money Loop** 

### **Software Requirements Specifications — MVP** 

Version 1.0 

Reduced-Scope Internship Build — Money Circles Membership Platform 

**Team** 

|**Name**|**Email**|**Phone**|
|---|---|---|
|[Intern 1]|[email]|[phone]|
|[Intern 2]|[email]|[phone]|
|[Intern 3]|[email]|[phone]|
|[Intern 4]|[email]|[phone]|



1 

Aman Money Loop – MVP SRS v1.0 

## **Table of Contents** 

|Table of Contents.............................................................................................................................................................. 2|
|---|
|Document Purpose and Audience................................................................................................................................ 4|
|Purpose ........................................................................................................................................................................... 4|
|Audience ......................................................................................................................................................................... 4|
|Software Purpose ............................................................................................................................................................. 4|
|Software Scope ................................................................................................................................................................. 4|
|Out of Scope for the MVP .......................................................................................................................................... 5|
|Circle Types ......................................................................................................................................................................... 5|
|1. Replacement Circle ................................................................................................................................................. 5|
|2. New Circle (Growth) ................................................................................................................................................ 5|
|User Roles ........................................................................................................................................................................... 6|
|Requirements .................................................................................................................................................................... 7|
|Functional Requirements .......................................................................................................................................... 7|
|Module 1 — User & Account Management (Login & Authentication) ..................................................... 7|
|Module 2 — Circle Request & Configuration Management ....................................................................... 7|
|Module 3 — Circle Marketplace & Membership Applications ................................................................... 8|
|Module 4 — Verification Management ............................................................................................................ 8|
|Module 5 — Agreement & Payment Management ...................................................................................... 9|
|Module 6 — Onboarding & Member Ledger Activation .............................................................................. 9|
|Non-Functional Requirements ................................................................................................................................ 9|
|System Models ............................................................................................................................................................... 11|
|Member Use Case Model ........................................................................................................................................ 11|
|Organizer / Admin Use Case Model ..................................................................................................................... 12|



2 

Aman Money Loop – MVP SRS v1.0 

|Enriched User Stories ................................................................................................................................................... 13|
|---|
|Section A — Login & Authentication ................................................................................................................... 13|
|User Story #1: Member Sign Up ....................................................................................................................... 13|
|User Story #2: Login ............................................................................................................................................ 14|
|User Story #3: Reset Password ....................................................................................................................... 14|
|Section B — Circle Request Management ........................................................................................................ 15|
|User Story #4: Create and Submit a Circle Request ................................................................................... 15|
|User Story #5: Approve or Reject a Circle Request ..................................................................................... 16|
|Section C — Marketplace & Applications .......................................................................................................... 17|
|User Story #6: View Circle Marketplace and Apply ..................................................................................... 17|
|User Story #7: Accept or Reject an Application ........................................................................................... 18|
|Section D — Verification ......................................................................................................................................... 19|
|User Story #8: Schedule a Verification Round.............................................................................................. 19|
|User Story #9: Complete Verification Checklist ........................................................................................... 20|
|Section E — Agreement & Payment ................................................................................................................... 21|
|User Story #10: Generate and Send a Membership Agreement ............................................................ 21|
|User Story #11: Accept or Decline an Agreement ....................................................................................... 22|
|Section F — Onboarding......................................................................................................................................... 22|
|User Story #12: Upload Documents and Create Member Ledger Record ............................................ 23|



3 

Aman Money Loop – MVP SRS v1.0 

## **Document Purpose and Audience** 

#### **Purpose** 

This Software Requirements Specification defines the functional and non-functional requirements for the Aman Money Loop MVP — a reduced-scope, 2-month intern training build of the Aman money-circle (gam’eya) platform. The MVP covers the core end-to-end journey — registration, circle requesting, marketplace browsing, member verification, agreement management, and onboarding — needed to demonstrate a working circle-membership lifecycle. It deliberately narrows the full product vision described in the parent SRS so that an intern team can design, build, and test it within a twomonth timeline. 

#### **Audience** 

- Intern Development Team (frontend, backend, QA) 

- Internship Supervisor / Mentor 

- Product Owner (scope sign-off) 

## **Software Purpose** 

Aman Money Loop MVP lets a member request or join a digital money circle, get verified, accept a membership agreement, and become an active circle member — giving interns a compact but realistic slice of the full Aman Fellows product to design and build end-to-end in two months. 

## **Software Scope** 

The Aman Money Loop MVP (web application) covers six core modules: 

- User & Account Management (Login & Authentication) 

- Circle Request & Configuration Management 

- Circle Marketplace & Membership Applications 

- Verification Management 

- Agreement & Payment Management 

4 

Aman Money Loop – MVP SRS v1.0 

- Onboarding & Member Ledger Activation 

#### **Out of Scope for the MVP** 

The following items exist in the full Aman Fellows product vision but are intentionally excluded from this MVP to fit the internship timeline. They may be added in a future phase: 

- Aman Prepaid Card (issuance, top-up, card-based pay-in/payout) — the MVP uses simulated bank transfer / e-wallet only. 

- Multi-level approval chains (Regional Approver, Compliance Approver) — the MVP uses a single Admin approval step. 

- Circle Calendar Planning and the Scheduled/Planned circle type. 

- Reporting & Analytics dashboards. 

- Bulk applicant actions and automated multi-stage email sequences beyond basic status notifications. 

## **Circle Types** 

Every circle request in the MVP is classified into one of two categories. The classification drives the 

approval workflow. 

|**Circle Type**|**Step 1**|**Step 2**|**Step 3**|
|---|---|---|---|
|Replacement Circle|Admin identifies a vacated<br>slot in an active circle|Admin approves the<br>replacement|Organizer opens the<br>slot to new<br>members|
|New Circle (Growth)|Circle Organizer creates<br>request + justification|Admin reviews and<br>approves the request|Organizer publishes<br>the circle to the<br>marketplace|



#### **1. Replacement Circle** 

Purpose: Fill a slot vacated by a member who withdrew or defaulted from an active circle. The circle already exists with approved terms; only a single Admin approval is required. 

#### **2. New Circle (Growth)** 

5 

Aman Money Loop – MVP SRS v1.0 

Purpose: Launch a brand-new circle to meet member demand for a new amount or duration tier. Requires a short justification and a single Admin approval before publishing. 

## **User Roles** 

The MVP uses a simplified three-role model. Each role has a distinct set of permissions enforced through role-based access control (RBAC). 

|**Role**|**Type**|**Responsibilities**|
|---|---|---|
|Member (Guest / Registered)|External / Guest|Browses the circle marketplace, applies to join<br>circles, tracks application status, accepts or<br>declines agreements, uploads onboarding<br>documents.|
|Circle Organizer|Internal|Creates circle requests, manages the<br>marketplace listing, manages the membership<br>pipeline, schedules verification, generates<br>membership agreements, manages onboarding.|
|Admin|Internal|Approves or rejects circle requests, manages user<br>accounts, creates the member ledger record, has<br>full system oversight.|



6 

Aman Money Loop – MVP SRS v1.0 

## **Requirements** 

#### **Functional Requirements** 

**Module 1 — User & Account Management (Login & Authentication)** 

|**FR01**|Title: Member Account|
|---|---|
||Description: A member can register for an account storing: First & Last Name, Email,<br>Password, and Phone Number. The system sends an OTP to the provided email to confirm<br>registration. OTPs are single-use only.|
|**FR02**|Title: Organizer / Admin Login|
||Description: Circle Organizers and Admins are registered by the Admin. They receive an email<br>containing a temporary password and must set a permanent password on first login.|
|**FR03**|Title: Secure Password Standards|
||Description: All passwords must be 8–64 characters and include at least one uppercase<br>letter, one lowercase letter, one digit, and one special character.|
|**FR04**|Title: Password Reset|
||Description: Any registered user can reset a forgotten password via a single-use OTP sent to<br>their registered email.|
|**FR05**|Title: Member Profile Page|
||Description: Registered members can view and edit their personal profile information (name,<br>email, phone) at any time.|



**Module 2 — Circle Request & Configuration Management** 

|**FR06**|Title: Circle Request Creation|
|---|---|
||Description: A Circle Organizer can create a circle request specifying: Circle Title, Circle Type<br>(Replacement / New Circle), Contribution Amount, Duration, Number of Slots, and a short<br>justification (for New Circle). The request is saved as Draft until submitted.|
|**FR07**|Title: Single-Step Admin Approval|
||Description: Upon submission, the request is routed to the Admin, who can Approve, Reject,<br>or Request Modification. The Organizer is notified by email of the outcome. Every approval<br>action is time-stamped in an audit log.|
|**FR08**|Title: Circle Registry & Slot Tracking|



7 

Aman Money Loop – MVP SRS v1.0 

||Description: The system maintains a registry of all approved circles, including Circle ID,<br>Approved Slots, Filled Count, and Status (Open / In Recruitment / Filled).|
|---|---|
|**FR09**|Title: Request-to-Marketplace-Listing Linkage<br>Description: Upon request approval, the Organizer can convert the approved request into a<br>live marketplace listing. Cancelling a request updates the linked listing status.|



**Module 3 — Circle Marketplace & Membership Applications** 

|**FR10**|Title: Marketplace — Public Access|
|---|---|
||Description: The circle marketplace is accessible to both registered and unregistered<br>members without login. Registered members benefit from profile auto-fill on the application<br>form.|
|**FR11**|Title: Circle Search|
||Description: Members can search circle listings by amount, duration, and available slots.|
|**FR12**|Title: Organizer Dashboard|
||Description: Organizers can view all circles with status (Open / Closed / Filled), edit listings,<br>close a listing, and access the applicant pipeline for each circle.|
|**FR13**|Title: Membership Application Form|
||Description: Members can apply via a full form (unregistered) or instant apply using their<br>stored profile (registered), collecting Name, Email, Phone, and National ID.|
|**FR14**|Title: Application Stage Management|
||Description: Organizers can move members between pipeline stages: Submitted→<br>Shortlisted→Verification Scheduled→Verification Completed→Agreement Extended→<br>Confirmed / Rejected. The system sends an automated status email at each change.|



**Module 4 — Verification Management** 

|**FR15**|Title: Verification Round Setup|
|---|---|
||Description: For each circle, the Organizer can define one or more verification rounds (e.g.<br>'Document Check', 'Guarantor Verification'), each specifying a Round Name, Format (In-<br>Person / Video / Phone), and Assigned Reviewer.|
|**FR16**|Title: Verification Scheduling|
||Description: The Organizer can schedule a shortlisted member into a defined round,<br>specifying date, time, and location/video link. The system sends a calendar invite to the<br>member and reviewer, and updates the member's pipeline stage.|
|**FR17**|Title: Checklist Scoring|



8 

Aman Money Loop – MVP SRS v1.0 



Description: Each round has a simple checklist of criteria (name + weight). The assigned reviewer rates each criterion 1–5 with optional comments; the system calculates a weighted composite score automatically. The Organizer reviews the consolidated result and makes the final selection decision. 

**Module 5 — Agreement & Payment Management** 

|**FR18**|Title: Membership Agreement Generation|
|---|---|
||Description: Upon Organizer selection, the system generates a membership agreement<br>specifying Member Name, Circle Title, Contribution Schedule, Payout Slot, Start Date, and<br>Expiry Date.|
|**FR19**|Title: Agreement Delivery and Tracking|
||Description: The agreement is sent to the member's email with a secure response link.<br>Status is tracked: Pending, Accepted, Declined, Expired.|
|**FR20**|Title: Member Agreement Response|
||Description: The member accepts or declines the agreement via the secure link. Acceptance<br>triggers onboarding; decline returns the request to 'In Recruitment'.|
|**FR21**|Title: Pay-in / Payout Recording|
||Description: The system allows a member's periodic contribution (pay-in) and circle payout<br>to be recorded via simulated bank transfer or e-wallet, with a digital receipt generated for<br>each transaction.|



**Module 6 — Onboarding & Member Ledger Activation** 

|**FR22**|Title: Onboarding Case Creation|
|---|---|
||Description: Upon agreement acceptance, the system automatically creates an onboarding<br>case assigned to the Organizer, including a configurable pre-activation document checklist.|
|**FR23**|Title: Document Upload & Verification|
||Description: The member uploads required documents (e.g. National ID copy) through a<br>secure portal link. The Organizer reviews each document and marks it Verified or Rejected.|
|**FR24**|Title: Member Ledger Record Creation|
||Description: Once documents are verified, the Admin confirms activation and creates the<br>official Member Ledger record, assigning a Member Ledger ID and marking the linked<br>request as 'Fulfilled'. The circle registry filled-count is updated.|



#### **Non-Functional Requirements** 

9 

Aman Money Loop – MVP SRS v1.0 

|**Measure**|**Details**|
|---|---|
|Architecture|Three-layer architecture: relational database, REST API backend, web<br>frontend.|
|Portability|Accessible via any modern web browser without additional software.|
|Performance|Standard page actions should respond within 2 seconds under normal load.|
|Usability|Simple, intuitive UI suitable for a first-time member; supports English and<br>Arabic (RTL).|
|Security|Encrypted transmission (HTTPS/TLS), hashed passwords, role-based access<br>control (RBAC).|
|Audit & Traceability|All approval actions and status changes are time-stamped and attributed to<br>the responsible user.|



10 



<!-- Start of picture text -->
Aman Money Loop — Member Use Case Model (MVP)<br>«system»Aman Money Loop<br>: ' Open Access (Guest & Registered) 1 ; Authentication j :<br>:| }' BrowseMarketplace Circle qro‘ Cte. 'j :E<br>: ' View Circle a> —~aa ': E:<br>; t Apply to Join ; \ = -S Seen = - = —. :<br>: y, ' eT ass ees eee conc ewe srrrrmesrrrt. TTT TTT SN .<br>: ‘ 4 ' Registered Member On! SS ; ;<br>: ' meric ' ' View / Edit Join Circle with ~~ 4 '<br>‘ y Account j ‘ Profile Profile Auto- C) 1 :<br>:|_o —__e! ' ZT:1:'<br>i: 4 Track Circle &— 1 :<br>' Payment Status 4 E<br>' ms<br>: ‘ View Membership 1 :<br>: t Agreement 1<br>;4: 'i' Make Pay-in os 41' F:'<br>‘ (Bank / E-wallet) RecelvePayout q<br>: Moo ee eee eee eee ee ee eee eee eee eee eee eee eee! ‘<br>cm ee epee remnant<br><!-- End of picture text -->



<!-- Start of picture text -->
Aman Money Loop — Organizer / Admin Use Case Model (MVP)<br>«system»Aman Money Loop<br>: PTT TTT eee ee ee eee :<br>H } Authentication q :<br>H.t' ' 1 : ‘<br>‘ 1<br>' 1 :<br>; Reset Password '<br>: @RRRRRRRENNEEe = a Y enna. :<br>:‘ ' Circle ManaseOrganizer Dashboard |' 1t Membersbin-Dimatine__View Applicanti  Listi |7 71 VerificationJerification—— real Round 44; ::<br>‘ ' r —<—— , t H :<br>=;: (3 _—__a 7 —— ConvertmarketplaceRequestListing— to '1 —7i View Applicant- Details; 11: H{ Schedule Verification_ ;; H;:<br>: 1 1 1 i ZZ 1 :<br>: 1 anage Listing  »_ ——__Approve / Reject ’ 1 oI ' :<br>'':Cirele\nOrganizer $|1(Add / Edit / Close) j41t' Member qpg'q1‘dmin q;'H7;H<br>:Re SS a :<br>: ' Agreement & Datura 1 | Admin On ' 5<br>H: | Generate & Send 14 Approve/ Reject Create Member 1 :<br>: '5 Membership Agreement ;' ; Circle Request Ledger Record }' -:<br>: :H 'H‘ Track Pay-inStatus / Payout i;1 ¢'' Manage Users View Basic-  Reports ’!' : :<br>;:'' 51; §4 '' :4<br>:.:: ' t} :11my§' 1'}! :.::<br>: fits}...JR :<br>—— Actor association ----> «include»/ «extend»<br><!-- End of picture text -->

Aman Money Loop – MVP SRS v1.0 

## **Enriched User Stories** 

#### **Section A — Login & Authentication** 

##### **User Story #1: Member Sign Up** 

|**User Story ID**|US #1|
|---|---|
|**User Story Name**|Member Sign Up|
|**Actors**|Unregistered Member|
|**Description**|As an unregistered member, I would like to create an account so that I can apply<br>to join circles.|
|**Precondition**|The user does not yet have a registered account.|
|**Post Condition**|Account is created. A confirmation OTP email is sent to the provided address.|
|**Acceptance Criteria**|Given I am unregistered, When I fill in my details and click Register, Then the<br>system sends an OTP, and upon entry confirms my account.|



###### **Normal Scenario** 

|**Actor Action**|**System Response**|
|---|---|
|Click Sign Up.|System displays the Sign Up page.|
|Enter personal information.||
|Click Register.|System validates data and sends an OTP to email.|
|Enter OTP.|System verifies OTP, saves account, displays the<br>circle marketplace.|



###### **Exceptional Scenario** 

|**Actor Action**|**System Response**|
|---|---|
|Enter OTP.|OTP invalid or expired.|
||Displays: "Please enter a valid OTP."|



###### **Data Dictionary** 

|**Element**|**Type / Length**|**Validation / Business Rule**|
|---|---|---|



13 

Aman Money Loop – MVP SRS v1.0 

|Email|Text < 128 chars|Valid email format; confirmed via OTP|
|---|---|---|
|Password|8–64 chars|Must include uppercase, lowercase, digit, special character|
|Phone Number|Integer, 11 digits|Valid Egyptian phone number|



##### **User Story #2: Login** 

|**User Story ID**|US #2|
|---|---|
|**User Story Name**|Login|
|**Actors**|Registered Member, Organizer, Admin|
|**Description**|As a registered user, I would like to log in so that I can access my role-specific<br>dashboard.|
|**Precondition**|The user must have a registered account.|
|**Post Condition**|The user is authenticated and redirected to the role-appropriate dashboard.|
|**Acceptance Criteria**|Given I am registered, When I enter valid Email and Password, Then the system<br>authenticates me and shows my dashboard.|



###### **Normal Scenario** 

|**Actor Action**|**System Response**|
|---|---|
|Click Log In.|System displays Sign In page.|
|Enter Email and Password. Click Log In.|System validates credentials and redirects to<br>dashboard.|



###### **Exceptional Scenario** 

|**Actor Action**|**System Response**|
|---|---|
|Enter invalid credentials.|Displays: "This email and password combination is<br>invalid, please try again."|



##### **User Story #3: Reset Password** 

|**User Story ID**|US #3|
|---|---|
|**User Story Name**|Reset Password|



14 

Aman Money Loop – MVP SRS v1.0 

|**Actors**|Any registered user|
|---|---|
|**Description**|As a registered user, I would like to reset my password so that I can regain<br>access to my account.|
|**Precondition**|The user must have a registered account.|
|**Post Condition**|The password is updated and the user can log in with the new password.|
|**Acceptance Criteria**|Given I complete the Forgot Password flow (email→OTP→new password),<br>Then the system updates my password.|



###### **Normal Scenario** 

|**Actor Action**|**System Response**|
|---|---|
|Click Forgot Password. Enter email. Click Submit.|System sends a 6-digit OTP.|
|Enter OTP. Enter new password.|System verifies OTP, saves new password, redirects<br>to login.|



###### **Exceptional Scenario** 

|**Actor Action**|**System Response**|
|---|---|
|Enter an unregistered email.|Displays: "Please enter a valid email."|



#### **Section B — Circle Request Management** 

##### **User Story #4: Create and Submit a Circle Request** 

|**User Story ID**|US #4|
|---|---|
|**User Story Name**|Create and Submit a Circle Request|
|**Actors**|Circle Organizer|
|**Description**|As an Organizer, I would like to create and submit a circle request so that I can<br>get approval to launch a circle.|
|**Precondition**|The Organizer must be logged in.|
|**Post Condition**|A request is created in Draft, then submitted. The Admin receives an email<br>notification.|



15 

Aman Money Loop – MVP SRS v1.0 

**Acceptance Criteria** Given I complete the request form and click Submit, Then the system saves the request and routes it to the Admin. 

###### **Normal Scenario** 

|**Actor Action**|**System Response**|
|---|---|
|Click New Circle Request. Complete required fields.<br>Click Save Draft.|System saves as Draft.|
|Click Submit for Approval.|System validates completeness, sets status to<br>Pending, notifies Admin.|



###### **Exceptional Scenario** 

|**Actor Action**|**System Response**|
|---|---|
|Submit with missing mandatory fields.|System displays: "Please complete all required fields|
||before submitting."|



###### **Data Dictionary** 

|**Element**|**Type / Length**|**Validation / Business Rule**|
|---|---|---|
|Circle Title|Text < 128 chars|Structured text|
|Circle Type|Select|Replacement or New Circle — drives approval routing|
|Number of Slots|Integer ≥ 1|Must be a positive integer|



##### **User Story #5: Approve or Reject a Circle Request** 

|**User Story ID**|US #5|
|---|---|
|**User Story Name**|Approve or Reject a Circle Request|
|**Actors**|Admin|
|**Description**|As an Admin, I would like to approve or reject a circle request so that only vetted<br>circles are published to the marketplace.|
|**Precondition**|The Admin must be logged in and have a request in the approval queue.|
|**Post Condition**|If approved, status becomes 'Approved' and the Organizer is notified. If rejected,<br>the Organizer is notified with the reason.|



16 

Aman Money Loop – MVP SRS v1.0 

**Acceptance Criteria** Given I review a request, When I click Approve or Reject, Then the system updates the status and notifies the Organizer. 

###### **Normal Scenario 1** 

|**Actor Action**|**System Response**|
|---|---|
|Open the request from the queue. Review details.|Status updates to 'Approved'. Organizer notified to|
|Click Approve.|publish the listing.|



###### **Normal Scenario 2** 

|**Actor Action**|**System Response**|
|---|---|
|Click Reject with reason.|Status updates to 'Rejected'. Organizer notified with<br>the reason.|



###### **Exceptional Scenario** 

There are no exceptional scenarios in this user story. 

#### **Section C — Marketplace & Applications** 

##### **User Story #6: View Circle Marketplace and Apply** 

|**User Story ID**|US #6|
|---|---|
|**User Story Name**|View Circle Marketplace and Apply|
|**Actors**|Member (registered or unregistered)|
|**Description**|As a member, I would like to browse the marketplace and apply to a circle so<br>that I can join a savings opportunity that matches my goals.|
|**Precondition**|At least one circle listing must be open.|
|**Post Condition**|Application is submitted and saved; the member receives a confirmation email;<br>the organizer sees it in the pipeline.|
|**Acceptance Criteria**|Given I find a circle I like, When I complete and submit the application form, Then<br>my application is saved and I receive a confirmation email.|



17 

Aman Money Loop – MVP SRS v1.0 

###### **Normal Scenario** 

|**Actor Action**|**System Response**|
|---|---|
|Click Circle Marketplace.|System displays open circle listings.|
|Click a circle title.|System displays full circle details.|
|Click Apply. Complete the form. Click Submit|System validates data, saves application, sends|
|Application.|confirmation email.|



###### **Exceptional Scenario** 

There are no exceptional scenarios in this user story. 

###### **Data Dictionary** 

|**Element**|**Type / Length**|**Validation / Business Rule**|
|---|---|---|
|Full Name|Text < 64 chars|Structured text|
|National ID|Integer, 14 digits|Valid Egyptian national ID format (simulated)|



##### **User Story #7: Accept or Reject an Application** 

|**User Story ID**|US #7|
|---|---|
|**User Story Name**|Accept or Reject an Application|
|**Actors**|Organizer|
|**Description**|As an Organizer, I would like to accept or reject a member's application so that I<br>can manage the circle pipeline.|
|**Precondition**|The Organizer must be logged in and viewing the applicant list.|
|**Post Condition**|The application status updates and the member is notified by email.|
|**Acceptance Criteria**|Given I click Accept or Reject on an application, Then the system updates the<br>status and notifies the member.|



###### **Normal Scenario 1** 

|**Actor Action**|**System Response**|
|---|---|
|Click Accept.|System updates status to 'Shortlisted' and emails<br>the member.|



18 

Aman Money Loop – MVP SRS v1.0 

###### **Normal Scenario 2** 

|**Actor Action**|**System Response**|
|---|---|
|Click Reject.|System updates status to 'Rejected' and emails the<br>member.|



###### **Exceptional Scenario** 

There are no exceptional scenarios in this user story. 

#### **Section D — Verification** 

##### **User Story #8: Schedule a Verification Round** 

|**User Story ID**|US #8|
|---|---|
|**User Story Name**|Schedule a Verification Round|
|**Actors**|Organizer|
|**Description**|As an Organizer, I would like to schedule a verification session for a shortlisted<br>member so that I can confirm their eligibility before extending an agreement.|
|**Precondition**|The member must be in 'Shortlisted' status. At least one verification round must<br>be defined for the circle.|
|**Post Condition**|The session is scheduled; calendar invites are sent; the member's status<br>updates to 'Verification Scheduled'.|
|**Acceptance Criteria**|Given I select a round and a shortlisted member, When I confirm the schedule,<br>Then the system sends invites and updates the member's status.|



###### **Normal Scenario** 

|**Actor Action**|**System Response**|
|---|---|
|Select a shortlisted member. Click Schedule|System displays the round list.|
|Verification.||
|Select a round, reviewer, date, time, location. Click|System saves the schedule and sends calendar|
|Confirm Schedule.|invitations.|



19 

Aman Money Loop – MVP SRS v1.0 

###### **Exceptional Scenario** 

There are no exceptional scenarios in this user story. 

###### **Data Dictionary** 

|**Element**|**Type / Length**|**Validation / Business Rule**|
|---|---|---|
|Round Name|Text < 128 chars|Free text, e.g. 'Document Check'|
|Date & Time|DateTime|Must be a future datetime|



##### **User Story #9: Complete Verification Checklist** 

|**User Story ID**|US #9|
|---|---|
|**User Story Name**|Complete Verification Checklist|
|**Actors**|Organizer, designated Reviewer|
|**Description**|As a reviewer, I would like to complete the checklist for a member after their<br>verification session so that the team has structured data to decide on<br>membership.|
|**Precondition**|The verification session must have taken place. The round's checklist criteria<br>must be defined.|
|**Post Condition**|The checklist is submitted; the system calculates a weighted composite score;<br>once all rounds are scored, status updates to 'Verification Completed'.|
|**Acceptance Criteria**|Given I open my checklist and submit ratings for each criterion, Then the system<br>calculates the score and notifies the Organizer.|



**Normal Scenario** 

|**Actor Action**|**System Response**|
|---|---|
|Open the scheduled verification. Click Submit|System displays the checklist criteria.|
|Checklist.||
|Rate each criterion 1–5. Click Submit.|System saves the checklist, calculates the composite<br>score, and notifies the Organizer.|



###### **Exceptional Scenario** 

|**Actor Action**<br>**System Response**|
|---|



20 

Aman Money Loop – MVP SRS v1.0 

|Submit with unanswered criteria.|System displays: "Please rate all criteria before<br>submitting."|
|---|---|



#### **Section E — Agreement & Payment** 

##### **User Story #10: Generate and Send a Membership Agreement** 

|**User Story ID**|US #10|
|---|---|
|**User Story Name**|Generate and Send a Membership Agreement|
|**Actors**|Organizer|
|**Description**|As an Organizer, I would like to generate and send a membership agreement to a<br>selected member so that I can formally extend a circle slot.|
|**Precondition**|The member must be marked 'Verification Completed — Selected'.|
|**Post Condition**|The agreement is generated, sent to the member's email, and status updates to<br>'Agreement Extended'.|
|**Acceptance Criteria**|Given I generate and send the agreement, Then the system tracks its status in<br>real time.|



###### **Normal Scenario** 

|**Actor Action**|**System Response**|
|---|---|
|Open the selected member's profile. Click Generate<br>Agreement.|System displays the pre-filled agreement template.|
|Complete contribution schedule, slot, dates. Click|System sends the agreement with a secure response|
|Send Agreement.|link and updates status.|



###### **Exceptional Scenario** 

|**Actor Action**|**System Response**|
|---|---|
|Set an expiry date in the past.|System displays: "Agreement expiry date must be a|
||future date."|



21 

Aman Money Loop – MVP SRS v1.0 

##### **User Story #11: Accept or Decline an Agreement** 

|**User Story ID**|US #11|
|---|---|
|**User Story Name**|Accept or Decline an Agreement|
|**Actors**|Member|
|**Description**|As a member with a pending agreement, I would like to accept or decline it so<br>that Operations can proceed accordingly.|
|**Precondition**|The member must have received the agreement link and it must not be expired.|
|**Post Condition**|If accepted: status updates to 'Agreement Accepted' and onboarding is triggered.<br>If declined: status updates to 'Agreement Declined'.|
|**Acceptance Criteria**|Given I click Accept or Decline via the secure link, Then the system records my<br>decision and notifies the Organizer.|



###### **Normal Scenario 1** 

|**Actor Action**|**System Response**|
|---|---|
|Click the agreement link. Click Accept Agreement.|System records acceptance, updates status, creates<br>an onboarding case.|



###### **Normal Scenario 2** 

|**Actor Action**|**System Response**|
|---|---|
|Click Decline Agreement.|System records declination and notifies the<br>Organizer.|



###### **Exceptional Scenario** 

|**Actor Action**|**System Response**|
|---|---|
|Click the link after expiry.|System displays: "This agreement has expired.|
||Please contact Operations for assistance."|



#### **Section F — Onboarding** 

22 

Aman Money Loop – MVP SRS v1.0 

##### **User Story #12: Upload Documents and Create Member Ledger Record** 

|**User Story ID**|US #12|
|---|---|
|**User Story Name**|Upload Documents and Create Member Ledger Record|
|**Actors**|New Member, Organizer, Admin|
|**Description**|As a new member, I would like to upload my required documents, and as an<br>Admin I would like to confirm activation, so that the member becomes an official<br>ledger record.|
|**Precondition**|The member's agreement must be accepted and an onboarding case must exist.|
|**Post Condition**|Documents are uploaded and verified; the Admin creates the Member Ledger<br>record; the request is marked 'Fulfilled'.|
|**Acceptance Criteria**|Given all required documents are uploaded and verified, When the Admin<br>confirms activation, Then the system creates the ledger record.|



###### **Normal Scenario** 

|**Actor Action**|**System Response**|
|---|---|
|Member clicks the secure portal link. Uploads<br>required documents. Clicks Submit.|System saves documents and notifies the Organizer.|
|Organizer reviews and marks each document<br>Verified.|Admin confirms activation and clicks Create Member<br>Ledger Record.|
||System assigns a Member Ledger ID, marks the<br>request 'Fulfilled', and updates the circle registry.|



###### **Exceptional Scenario** 

|**Actor Action**|**System Response**|
|---|---|
|Upload a file exceeding the size limit or invalid|System displays: "This file format or size is not|
|format.|accepted. Please upload a PDF file under 10 MB."|



###### **Data Dictionary** 

|**Element**|**Type / Length**|**Validation / Business Rule**|
|---|---|---|
|Each Required|PDF, < 10 MB|File type and size validated at upload|
|Document|||



23 

Aman Money Loop – MVP SRS v1.0 

24 

