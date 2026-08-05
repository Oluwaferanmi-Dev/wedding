You are a senior full-stack engineer.

I want you to build a production-ready wedding invitation QR-code scanning and guest check-in web application.

IMPORTANT:
The attached/reference Figma designs are the source of truth for the visual design and UX.

Do NOT redesign the interface.
Do NOT introduce your own visual style.
Reproduce the Figma design as closely as possible in the actual application, including:

- Layout
- Typography
- Spacing
- Borders
- Border radius
- Colors
- Gold accents
- Card styling
- Bottom navigation
- Icons
- Button sizes
- Status badges
- Responsive behavior
- Empty/error states
- Invitation design

The screenshots represent the intended final product.

==================================================
PRODUCT PURPOSE
==================================================

This is a wedding guest invitation and check-in system.

Each invited guest receives a unique invitation.

Each invitation has:

- Guest name
- Invitation number
- Unique invitation code
- QR code
- Wedding information
- Check-in status

Example:

Guest:
Oluwaseun Adeyemi

Invitation:
Invite #1

Invitation code:
WED-001

The QR code contains the unique invitation code:

WED-001

When a staff member scans the QR code, the application looks up WED-001 and displays:

Oluwaseun Adeyemi
Invite #1
WED-001
Adunola & Babatunde

The staff member can then check the guest in.

==================================================
IMPORTANT DATA PRINCIPLE
==================================================

DO NOT put the guest's name, phone number, or other personal information directly into the QR code.

The QR code should contain only a unique invitation identifier/code.

Example:

WED-001

The application uses that code to retrieve the invitation from the database.

This makes the system easier to manage and prevents sensitive guest information from being exposed inside the QR code.

==================================================
WEDDING INFORMATION
==================================================

Use the following demo wedding information based on the Figma design:

Couple:
Adunola & Babatunde

Date:
Saturday, 14th November 2026

Venue:
Eko Hotels & Suites, Lagos

Use these as seed/demo data, but structure the application so wedding information is not hardcoded throughout the application.

Wedding information should come from the database/configuration.

==================================================
REFERENCE DESIGN
==================================================

The Figma design contains four primary bottom-navigation sections:

1. Scan
2. Guests
3. Summary
4. Invite

The visual style is:

- Warm off-white/cream background
- White cards
- Dark near-black typography
- Elegant serif display typography
- Gold/brown accent color
- Muted gray secondary text
- Thin cream/gold borders
- Minimal shadows
- Rounded cards
- Premium wedding aesthetic

The UI should feel elegant and understated.

Do not replace the design with a generic dashboard.

==================================================
SCREEN 1 — INVITATION
==================================================

Build the Invite screen to match the Figma design.

The screen should display a realistic wedding invitation preview.

Structure:

Invitation Preview

Example of the guest QR code invitation

Then the invitation card.

The invitation should contain:

YOU ARE INVITED TO THE WEDDING OF

Adunola

&

Babatunde

Saturday, 14th November 2026

Eko Hotels & Suites, Lagos

Then:

TOGETHER WITH THEIR FAMILIES INVITE YOU

Then the QR code.

Below the QR code:

Oluwaseun Adeyemi

Invite #1

WED-001

Then:

Present this QR code at the entrance for check-in.
One admission per invitation.

IMPORTANT:

The invitation must be dynamically generated from the guest/invitation data.

If the selected guest changes, the QR code and guest information should change accordingly.

The QR code must be a real scannable QR code.

==================================================
SCREEN 2 — SUMMARY
==================================================

Build the Summary screen exactly according to the Figma design.

Header:

Wedding Check-In

Adunola & Babatunde

Eko Hotels & Suites, Lagos

Statistics cards:

TOTAL INVITATIONS
250

CHECKED IN
181

REMAINING
69

CHECK-IN RATE
72.4%

These numbers must NOT be hardcoded in the final implementation.

Calculate them dynamically from the database.

For example:

total invitations = number of invitations

checked in = number where checked_in = true

remaining = total - checked in

check-in rate =
checked in / total * 100

Then create the Check-In Progress card.

Display:

Check-In Progress
181 / 250

Progress bar

72.4% of guests have arrived

Again, calculate these values dynamically.

Then show:

RECENT CHECK-INS

Display recently checked-in guests ordered by latest check-in time.

Example:

Taiwo Okonkwo
Invite #2
9:23 PM

Yetunde Fashola
Invite #4
6:14 PM

Babajide Oduya
Invite #5
6:22 PM

Kehinde Adegboyega
Invite #7
6:31 PM

Sade Okunade
Invite #10
6:45 PM

These must come from real check-in records.

==================================================
SCREEN 3 — GUEST LIST
==================================================

Build the Guest List screen.

Header:

Guest List

Adunola & Babatunde

Show the current checked-in count.

Example:

6/12 checked in

Then a search input:

Search guests, invite #, or code...

The search should actually work.

Users should be able to search by:

- Guest name
- Invitation number
- Invitation code

Example guest card:

Oluwaseun Adeyemi

Invite #1 · WED-001

Not Checked In

Another:

Taiwo Okonkwo

Invite #2 · WED-002

Checked In

Use the same visual status badges as the Figma design.

Checked In should use the green success treatment.

Not Checked In should use the muted gray treatment.

Guest cards should be clickable.

Clicking a guest should open Guest Details.

==================================================
SCREEN 4 — GUEST DETAILS
==================================================

Build the Guest Details screen.

Top navigation:

Back arrow

Guest Details

Then a card:

Oluwaseun Adeyemi

Invite #1

WEDDING
Adunola & Babatunde

INVITATION CODE
WED-001

STATUS
Not Checked In

Then the primary button:

Check In Guest

The button must perform a real database check-in.

After successful check-in, update the guest status immediately.

The button should then either become:

Checked In

or otherwise reflect the new status according to the Figma design.

==================================================
SCREEN 5 — QR SCANNER
==================================================

This is the most important functional feature.

Implement a REAL QR scanner using the device camera.

When the user enters the Scan tab:

Request camera permission if necessary.

Display the live camera feed.

Provide a clear QR scanning frame.

The scanner should detect QR codes.

When a QR code is detected:

1. Extract the invitation code.
2. Look up the invitation.
3. Verify that it belongs to the current wedding.
4. Determine whether it has already been checked in.
5. Display the appropriate result.

The normal workflow should be:

SCAN
↓
QR DETECTED
↓
LOOK UP INVITATION
↓
VALIDATE INVITATION
↓
SHOW GUEST
↓
STAFF TAPS CHECK IN
↓
GUEST CHECKED IN
↓
RETURN TO SCANNER

The scanner should not automatically check the guest in.

The staff member must explicitly confirm the check-in.

==================================================
VALID QR CODE
==================================================

If the QR code contains:

WED-001

and WED-001 exists:

Display the guest information.

Example:

Invitation Verified

Oluwaseun Adeyemi

Invite #1

WED-001

Adunola & Babatunde

Status:
Not Checked In

Primary action:

Check In Guest

Secondary action:

Scan Another Guest

Follow the visual language of the Figma design.

==================================================
ALREADY CHECKED-IN QR CODE
==================================================

If WED-001 has already been checked in:

DO NOT create another check-in.

Display:

Already Checked In

Oluwaseun Adeyemi

Invite #1

WED-001

This invitation has already been checked in.

Display the previous check-in time.

Example:

Checked in at 7:42 PM

Provide:

Back to Scanner

This must be handled server-side as well as client-side.

Never rely only on frontend state to prevent duplicate check-ins.

==================================================
INVALID QR CODE
==================================================

If the QR code contains an unknown invitation code:

Display an elegant error state.

Example:

Invalid Invitation

This QR code isn't recognized for this wedding.

Button:

Try Again

Return to scanner.

==================================================
CAMERA ERROR STATE
==================================================

Implement the exact Figma "Camera Unavailable" state.

Display:

Camera Unavailable

Camera access is required to scan QR codes. Please allow camera permissions in your browser settings.

Or use the manual entry option to search for a guest.

Button:

Try Again

Also provide a manual-entry fallback.

==================================================
MANUAL ENTRY
==================================================

The user must be able to check an invitation without using the camera.

Provide:

Enter invitation code manually

Example input:

WED-001

Then:

Search

Look up the invitation and display the same guest verification screen used by the QR scanner.

This should be useful when:

- Camera permission is denied
- Camera hardware isn't available
- QR code cannot be scanned
- Staff needs to manually verify an invitation

==================================================
DATABASE
==================================================

Design a proper relational database.

At minimum create:

weddings

guests

invitations

check_ins

Suggested structure:

weddings
---------
id
name
date
venue
created_at
updated_at

guests
------
id
wedding_id
name
phone (optional)
created_at
updated_at

invitations
-----------
id
wedding_id
guest_id
invite_number
invitation_code
qr_payload
created_at
updated_at

check_ins
---------
id
invitation_id
checked_in_at
checked_in_by
created_at

Add appropriate foreign keys and indexes.

The invitation code must be unique.

For example:

WED-001
WED-002
WED-003

etc.

Do not rely on invite_number alone as the QR identifier.

==================================================
CHECK-IN SAFETY
==================================================

The check-in operation must be atomic.

Two devices should not be able to successfully check in the same invitation at exactly the same time.

Enforce uniqueness at the database level.

There should only ever be one active check-in record per invitation.

If an invitation is already checked in, return the existing check-in information instead of creating another record.

==================================================
REAL-TIME DATA
==================================================

The Summary and Guest List should reflect the current database state.

After a successful check-in:

- Guest status updates
- Checked-in count updates
- Remaining count updates
- Check-in rate updates
- Recent check-ins updates

Do not require the user to manually refresh the page if the existing architecture supports real-time updates.

If real-time subscriptions are unnecessary for the chosen architecture, implement reliable refetching/invalidation after mutations.

==================================================
AUTHENTICATION / STAFF ACCESS
==================================================

Inspect the existing project before deciding how authentication should be implemented.

If authentication already exists, use it.

If it does not, create a simple secure staff/admin authentication layer rather than leaving the check-in system publicly writable.

Only authorized staff should be able to:

- Scan invitations
- View guests
- Check guests in
- View summary data

Do not expose unrestricted check-in APIs to unauthenticated users.

==================================================
RESPONSIVE DESIGN
==================================================

The primary target is mobile.

The scanner will likely be used on a phone at the wedding entrance.

Make sure:

- Camera preview works correctly on mobile browsers
- Buttons are easy to tap
- Bottom navigation remains accessible
- Content does not get hidden behind browser UI
- Guest lists scroll correctly
- Cards remain readable
- QR codes remain scannable
- No horizontal overflow occurs

Also support tablet and desktop layouts gracefully.

==================================================
QR CODE GENERATION
==================================================

Use a proper QR code generation library.

The QR code payload should be the unique invitation code.

Example:

WED-001

Do NOT generate a decorative QR code that cannot be reliably scanned.

The QR code must have:

- Sufficient white/quiet space
- High contrast
- Correct error correction
- Adequate size

The QR displayed on the invitation must work with normal phone cameras as well as this application's scanner.

==================================================
QR SCANNER IMPLEMENTATION
==================================================

Use a reliable browser-compatible QR scanning solution.

Before choosing the library:

1. Inspect the existing project.
2. Check its framework and package manager.
3. Prefer an actively maintained solution compatible with the project's environment.
4. Ensure it works on iOS Safari and Android Chrome where possible.

Handle:

- Camera permissions
- Camera denied
- Camera unavailable
- Camera loading
- QR detection
- Invalid QR
- Duplicate scans
- Switching back to scanner
- Cleanup of camera streams when leaving the screen

IMPORTANT:

Stop/release the camera stream when the scanner screen is unmounted or when the user navigates away.

Do not leave the camera running in the background.

==================================================
NAVIGATION
==================================================

Implement the bottom navigation shown in the Figma design:

Scan
Guests
Summary
Invite

Active tab:

Gold accent.

Inactive tabs:

Muted gray.

Use appropriate icons matching the Figma design.

Navigation should preserve state appropriately.

For example:

Scan → Guest verification → Check-in → Scan again

should feel seamless.

==================================================
LOADING STATES
==================================================

Do not leave blank screens while waiting for data.

Implement appropriate loading states for:

- Guest list
- Summary
- Guest details
- QR lookup
- Check-in mutation
- Invitation generation

Keep loading states consistent with the visual design.

==================================================
ERROR STATES
==================================================

Handle errors gracefully.

At minimum:

- Camera permission denied
- Camera unavailable
- Invalid QR
- Invitation not found
- Invitation belongs to another wedding
- Invitation already checked in
- Network error
- Database error
- Failed check-in
- Empty guest list
- Search returns no results

Do not expose raw database errors to users.

==================================================
SEED DATA
==================================================

Create realistic seed data so the application immediately looks like the Figma design.

Use Nigerian/Yoruba names similar to the Figma examples.

At minimum create 12 invitations.

Example:

1. Oluwaseun Adeyemi — WED-001
2. Taiwo Okonkwo — WED-002
3. Funmilayo Abiodun — WED-003
4. Yetunde Fashola — WED-004
5. Babajide Oduya — WED-005
6. Omotunde Salami — WED-006
7. Kehinde Adegboyega — WED-007
8. Adaeze Nwosu — WED-008
9. Rotimi Olawale — WED-009
10. Sade Okunade — WED-010
11. Additional guest
12. Additional guest

Some should be checked in and some should not be checked in so every UI state can be tested.

==================================================
INVITATION NUMBER VS CODE
==================================================

Keep these concepts separate.

Invite number:

Invite #1

Invitation code:

WED-001

The invite number is human-friendly.

The invitation code is the unique machine identifier used by the QR code.

==================================================
PHONE NUMBER
==================================================

The original product requirement mentioned guest name and number.

Interpret "number" as the invitation number/code rather than displaying a guest's phone number by default.

If the guest record contains a phone number, keep it available as optional data, but do not expose it on the primary scan result unless explicitly required.

==================================================
PERFORMANCE
==================================================

The scanning workflow needs to be extremely fast.

Avoid unnecessary database calls.

Do not continuously query the database while the camera is scanning.

Only query when a valid QR code has actually been detected.

Prevent the same QR code from triggering dozens of requests while it remains inside the camera frame.

Debounce/throttle QR detections appropriately.

==================================================
SECURITY
==================================================

Do not trust client-side invitation status.

All important operations must be validated server-side.

Especially:

- Invitation lookup
- Wedding ownership
- Check-in
- Duplicate check-in prevention

Do not allow users to submit arbitrary guest IDs and mark them checked in without authorization.

Validate all user input.

==================================================
CODE QUALITY
==================================================

Before writing code:

1. Inspect the existing repository.
2. Identify the framework.
3. Identify the database.
4. Identify the authentication system.
5. Identify existing UI/component libraries.
6. Identify the package manager.
7. Reuse existing infrastructure where appropriate.

Do not unnecessarily replace the existing stack.

Follow the existing project's conventions.

Create reusable components.

Avoid putting all logic into one giant page/component.

Separate:

- UI
- Database queries
- Server actions/API
- QR generation
- QR scanning
- Check-in logic
- Validation
- Types

Use strong TypeScript typing if the project uses TypeScript.

==================================================
DESIGN FIDELITY
==================================================

The provided Figma screenshots are the source of truth.

Pay special attention to:

- Cream background
- Gold wedding accent
- Serif headings
- Italic gold couple name treatment
- Rounded white cards
- Thin borders
- Muted secondary typography
- Bottom navigation
- Gold active navigation state
- Green checked-in status
- Invitation card proportions
- QR code presentation
- Generous spacing
- Minimal visual noise

Do not replace these with:

- Generic Tailwind dashboard styling
- Blue/purple SaaS colors
- Generic admin templates
- Excessive gradients
- Excessive shadows
- Large unnecessary icons
- Generic Bootstrap-looking components

The finished application should look like the Figma design.

==================================================
TESTING
==================================================

After implementation, thoroughly test the application.

Test:

1. Open Scan.
2. Grant camera permission.
3. Scan WED-001.
4. Verify Oluwaseun Adeyemi appears.
5. Verify Invite #1 appears.
6. Verify WED-001 appears.
7. Check the guest in.
8. Verify the check-in succeeds.
9. Scan WED-001 again.
10. Verify "Already Checked In" appears.
11. Verify a duplicate check-in is NOT created.
12. Scan an invalid QR code.
13. Verify the invalid invitation state.
14. Deny camera permission.
15. Verify Camera Unavailable state.
16. Use manual entry with WED-001.
17. Verify the invitation is found.
18. Search for a guest in Guest List.
19. Open Guest Details.
20. Manually check in an unchecked guest.
21. Verify Summary statistics update.
22. Verify Recent Check-Ins updates.
23. Test on mobile viewport.
24. Test on desktop viewport.
25. Verify navigation works between all four tabs.
26. Verify camera stream is cleaned up when leaving Scan.

Also test duplicate concurrent check-in attempts if the architecture allows it.

==================================================
FINAL REQUIREMENT
==================================================

Do not stop after creating the UI.

This must be a fully functional application.

The final result should allow an event staff member to:

1. Open the application.
2. Scan a guest's QR invitation.
3. Identify the guest.
4. See their invitation number and code.
5. Verify their invitation.
6. Check them in.
7. Prevent them from being checked in twice.
8. Search guests manually.
9. View check-in statistics.
10. View the wedding invitation.

Build the application end-to-end.

First inspect the repository and existing architecture.

Then create an implementation plan.

Then implement the system.

After implementation, run the available tests/build/lint/type checks and fix any issues you encounter.

Do not simply tell me what needs to be built.

Actually build it.