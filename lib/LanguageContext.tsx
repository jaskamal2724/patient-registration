"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "hi";

export const translations = {
  en: {
    // Header & Brand
    appSubtitle: "Care, just a tap away.",
    patientPortal: "Patient Portal",
    doctorLogin: "Dr. Login",
    location: "Location",
    clickForGoogleMapLocation: "Get Google Map location",
    googleMapLocation: "Google Map Location",
    clickToKnowGoogleMapLocation: "Open Google Map Location",
    clinicAddress: "610, Sector 10A, Gurugram, Haryana 122001",
    installApp: "Install App",
    open: "Open",
    closed: "Closed",
    exit: "Back",
    doctorName: "Doctor Sarvesh OPD",
    langNameEn: "English",
    langNameHi: "हिंदी",

    // Landing Page
    bookAppointmentTitle: "Book your appointment",
    bookAppointmentSubtitle: "Get your digital token and track your queue live.",
    bookSlotBtn: "Book Now",
    tokenBadge: "Token",
    liveBadge: "Live",
    digitalToken: "Digital Token",
    liveQueue: "Live Queue",
    easyRegister: "Easy Register",

    // Doctor Login Modal
    doctorLoginTitle: "Doctor Login",
    doctorLoginSubtitle: "Enter your credentials to access the dashboard.",
    emailAddress: "Email address",
    password: "Password",
    accessDashboard: "Access Dashboard",
    cancel: "Cancel",
    invalidCredentials: "Invalid credentials. Try again.",

    // Search Card
    liveTokenStatus: "Live Token Status",
    checkTokenTitle: "Check Your Token Number",
    checkTokenSubtitle: "Already registered? Forgot your token number? Just search with your mobile number.",
    enterMobilePlaceholder: "Enter mobile number",
    inConsultation: "In Consultation",
    inConsultationMsg: "🎉 It's your turn right now! Please enter doctor's cabin.",
    waiting: "Waiting",
    nextInLineMsg: "⚡ You are next in line! Please wait nearby.",
    aheadInQueueOneMsg: "⌛ 1 person ahead of you in queue.",
    aheadInQueueManyMsg: "⌛ {count} people ahead of you in queue.",
    completed: "Completed",
    completedMsg: "✅ Your consultation is completed.",
    skipped: "Skipped",
    skippedMsg: "⚠️ Your token was skipped. Please inform receptionist.",
    viewTicket: "View Ticket",
    noPatientFound: "No registered patient found with phone",
    checkNumberOrBook: "Please check the number or book an appointment below.",

    // Smart Arrival Guidance
    reachClinicNow: "Reach Clinic Now",
    leaveHomeNow: "Leave Home Shortly",
    relaxAtHome: "Relax at Home",
    reachClinicNowMsg: "Your turn is coming up very soon. Please wait in the clinic lobby.",
    leaveHomeNowMsg: "Start heading to the clinic. Aim to arrive 10-15 mins before your turn.",
    relaxAtHomeMsg: "You have plenty of time. You can stay home and check live queue.",

    // Form / Booking Step
    patientRegistration: "Patient Registration",
    fillDetailsBelow: "Fill in patient details to generate an instant OPD token.",
    backToHome: "Back",
    fullNameLabel: "Full Name",
    fullNamePlaceholder: "Enter patient's full name",
    ageLabel: "Age (Years)",
    agePlaceholder: "e.g. 28",
    genderLabel: "Gender",
    male: "Male",
    female: "Female",
    other: "Other",
    mobileNumberLabel: "Mobile Number",
    mobilePlaceholder: "10-digit mobile number",
    cityVillageLabel: "City / Village",
    cityVillagePlaceholder: "e.g. Rampur, Delhi",
    reasonLabel: "Reason for Visit / Problem",
    reasonPlaceholder: "e.g. Fever, Cough, Regular Checkup",
    selectTimeSlot: "Select OPD Time Slot",
    submitting: "Generating ...",
    getOPDToken: "Get Token Number",
    validationError: "Please enter a valid 10-digit mobile number and fill all required fields.",
    fullSlotText: "FULL",

    // Doctor Status & Queue
    doctorSeeingTitle: "Doctor Is Seeing",
    doctorWillVisitTitle: "Doctor will visit shortly",
    doctorNotStartedMsg: "The doctor has not started seeing patients yet. You will be able to see the live token number once the doctor starts the session.",
    doctorWillVisitDateTitle: "Doctor will visit on {date}",
    doctorSeeingWalkinTitle: "Doctor is seeing walk-in patients",
    doctorSeeingWalkinMsg: "Online appointment queue is finished. Doctor is currently seeing walk-in patients.",
    registrationOpenSoonTitle: "Registration will open soon",
    registrationOpenSoonMsg: "Today's OPD session has concluded. Registration for the next session will open soon.",
    checkingOpdStatus: "Checking OPD Status...",
    verifyingScheduleMsg: "Loading doctor schedule and live queue...",
    statusLoadErrorTitle: "Unable to load clinic status",
    statusLoadErrorMsg: "Please check your connection and try again.",
    retry: "Try again",
    expectedTimeLabel: "Expected time",
    doctorLateTitle: "Doctor Running Late Alert",
    doctorLateDesc: "Doctor is running {delay} late today. Appointment slot timings remain unchanged, but consultations may experience an estimated {delay} delay.",
    delayApplied: "Doctor running late",
    priorityQueueNotice: "Priority will be given to senior citizen, person with disability, small kids, so there might be few min. delay.",

    // Success / Ticket View
    registrationSuccessful: "You're registered successfully!",
    tokenIssuedMsg: "Thank you for your patience. Please keep this token for your appointment.",
    yourToken: "Your Token Number",
    slotToken: "Slot Token",
    patientName: "Patient Name",
    ageGender: "Age / Gender",
    contactNumber: "Phone",
    assignedDoctor: "Doctor",
    estimatedTime: "Estimated Time",
    patientsAhead: "Patients Ahead",
    currentLiveToken: "Current Live Token",
    status: "Status",
    downloadTokenCard: "Download / Take Screenshot",
    downloadingToken: "Preparing Image...",
    bookAnother: "Book Another Token",
    shareOnWhatsApp: "Share on WhatsApp",
    queueTrackingTip: "Keep this token for your reference",
    scanToPayTitle: "Scan & Pay via UPI",
    scanToPaySubtitle: "Scan using Google Pay, PhonePe, Paytm or any UPI app",
    viewQrCodeBtn: "View QR Code",
    copyUpiIdBtn: "Copy UPI ID",
    upiIdCopied: "Copied!",
    savePaymentScreenshotNotice: "Please complete the payment and save a screenshot for future reference and clinic verification.",
    paymentFlexibilityNotice: "Payment is flexible: You can pay online now via UPI or pay cash / UPI at the clinic reception counter.",
    paymentAtCounterNote: "Pay online now or at reception desk",
    alreadyRegisteredPrompt: "Already registered for today?",
    checkLiveQueueOrToken: "Track live queue or check your token status",
    appointmentConfirmedTitle: "Appointment Confirmed!",
    generatingTokenSubtitle: "Generating your OPD token...",
    viewTokenNow: "View Token",

    // Live Queue & Turn Milestones
    nextPatientInLine: "Next in Line",
    noPatientWaiting: "No patients waiting in queue",
    estimatedWaitTimeLabel: "Estimated Wait Time",
    approxMins: "~{count} mins",
    doctorIsFree: "Doctor is ready for consultation",
    milestoneDoctorReady: "Doctor is ready! Please enter the cabin.",
    milestoneNextUp: "You are next! Please wait right outside doctor's cabin.",
    milestone1Ahead: "Only 1 patient ahead. Please stay right outside cabin.",
    milestone5Ahead: "5 patients ahead: Please reach clinic waiting lobby now.",
    milestone10Ahead: "10 patients ahead: Please start heading towards the clinic.",
    milestone15Ahead: "15 patients ahead: Approx 45 mins wait. Prepare to leave.",
    milestone20Ahead: "20 patients ahead: Plenty of time. Monitor live queue.",
    milestone25Ahead: "25+ patients ahead: Relax at home and check status periodically.",

    // Closed Window Step
    opdClosedTitle: "OPD Registration Currently Closed",
    opdClosedSubtitle: "Online tokens are currently unavailable. Please check the registration timings below.",
    nextWindowOpens: "Next registration window opens at:",
    registrationTimings: "Registration Timings",
    morningSlot: "Morning Slot",
    eveningSlot: "Evening Slot",
    walkinGuidanceTitle: "📍 Walk-in Guidance:",
    walkinGuidanceText: "Please contact on this number regarding walk in appointment: 9810807381",
    getDirectionsGoogleMaps: "Get Directions on Google Maps",
    thankYouPatience: "Thank you for your patience and understanding",
    securityNotice: "Your details are secure and used only for this appointment.",
    privacyNotice: "Your health and privacy are important to us.",

    // Appointments Full View
    appointmentsFullTitle: "Appointments are Full",
    appointmentsFullSubtitle: "All appointment slots for today are booked.",
    priorityNotice: "Priority will be given to people who have taken an appointment.",
    whatYouCanDo: "What you can do now",
    visitClinicWalkin: "Visit the clinic (Walk-in)",
    comeDirectlyMsg: "Come directly and wait for your turn.",
    viewCurrentQueue: "View Current Live Queue",
    walkinNote: "Priority will be given to patients with prior appointment bookings.",
    // Logiquel Branding Card
    builtByLogiquel: "Built by Logiquel",
    logiquelHeadline: "We build digital solutions for modern businesses.",
    logiquelDesc: "From web & mobile apps to AI & automation, Logiquel helps companies build scalable, future-ready products.",
    webAppsPill1: "Web",
    webAppsPill2: "Applications",
    mobileAppsPill1: "Mobile",
    mobileAppsPill2: "Apps",
    aiAutomationPill1: "AI &",
    aiAutomationPill2: "Automation",
    customSoftwarePill1: "Custom",
    customSoftwarePill2: "Software",
    letsBuildSomethingGreat: "Let's Build Something Great",
    yourIdeaOurTech: "Your idea. Our technology.",
    getInTouch: "Get in Touch",

    // PWA Install
    installPwaBtn: "Install App",
    installAppTitle: "Install DocCare App",
    installAppSubtitle: "Add DocCare to your phone or desktop home screen for fast 1-tap access.",
    iosSafariNotice: "⚠️ This must be done in Safari. Other browsers don't support Add to Home Screen on iOS.",
    iosStep1Prefix: "Tap the",
    iosStep1Bold: "Share",
    iosStep1Suffix: "button in Safari navigation bar.",
    iosStep2Prefix: "Scroll down and select",
    iosStep2Bold: "Add to Home Screen",
    iosStep2Suffix: ".",
    iosStep3Prefix: "Tap",
    iosStep3Bold: "Add",
    iosStep3Suffix: "at the top-right corner to finish.",
    androidStep1Prefix: "Tap your browser menu",
    androidStep1Suffix: "(top right 3 dots).",
    androidStep2Prefix: "Select",
    androidStep2Bold: "Install app",
    androidStep2Middle: "or",
    androidStep2Bold2: "Add to Home screen",
    androidStep2Suffix: ".",
    gotIt: "Got it",

    // Bottom Navigation
    navHome: "Home",
    navBookNow: "Book Now",
    navWhatWeTreat: "What We Treat",
    navShop: "Shop",
    navLocation: "Location",
    navCheckStatus: "Live Status",

    // Home Next Step Tile (Wireframe)
    bookedMySlotTitle: "I have booked my slot, now what?",
    beforeLeavingHome: "Before leaving home, see how many people are before you, or forgot your token number:",
    addressSectionLabel: "Address:",
    clinicFullAddress: "House No. 610, Sector-10A, Near Main Market, Gurugram, Haryana 122001",
    helpQueryLabel: "For Any Help / Query Call on this Number:",
    callTejaswiBhaiya: "Call: +91 9810807381",

    // Lunch break
    lunchBreak: "Lunch Break",

    // Shop Page
    shopTitle: "Doc Care Wellness Shop",
    shopSubtitle: "Authentic medicines, healthcare essentials & doctor-curated wellness products.",
    comingSoon: "Coming Soon",
    comingSoonDesc: "We are curating high-quality healthcare products, supplements, and wellness essentials for you. Stay tuned!",
    backToHomeBtn: "Back to Home",

    // Location Page
    locationPageTitle: "Clinic Location",
    locationPageSubtitle: "Visit Dr. Sarvesh OPD in Gurugram. Easy to reach with ample parking.",
    verifiedClinic: "Verified Clinic",
    openInGoogleMaps: "Open in Google Maps",
    copyAddress: "Copy Address",
    addressCopied: "Address copied to clipboard!",
    opdTimings: "OPD Timings",
    locationMorningTime: "Morning: 09:30 AM - 01:30 PM",
    locationEveningTime: "Evening: 05:30 PM - 08:30 PM",
    daysOpen: "Monday to Saturday",
    landmarkDirections: "Landmark & Directions",
    landmarkDesc: "Located in Sector 10A, near Main Market, Gurugram. Direct road access with easy parking outside.",
    bookVisitCTA: "Visiting the clinic today?",
    bookVisitCTASub: "Book your digital token in advance to skip the waiting line.",

    // Treated Conditions Modal
    viewTreatedConditionsBtn: "What We Treat",
    treatedConditionsModalTitle: "Treatment & Care For Following Problems",
    treatedConditionsModalSubtitle: "Specialized consultation & treatment available for these medical conditions",
    tabAll: "All (61)",
    tabGeneral: "General (40)",
    tabWomen: "For Women (7)",
    tabChildren: "For Children (14)",
    searchConditionsPlaceholder: "Search disease or problem...",
    noConditionsFound: "No matching condition found.",
    totalConditionsCount: "61 treated conditions listed",
    closeModal: "Close",

    // Walk-in Portal
    walkinPortal: "Walk-in OPD Portal",
    walkinBadge: "Walk-in Registration",
    walkinTitle: "Direct Clinic Walk-in Registration",
    walkinSubtitle: "Generate an instant walk-in token directly at the clinic counter.",
    getWalkinToken: "Register",
    walkinTokenNotice: "Walk-in patients will be called after apponitment patient",
    walkinWaitLobbyMsg: "Please relax in the clinic waiting lobby.",
    searchWalkinTokenTitle: "Forgot Your Walk-in Token?",
    searchWalkinTokenSubtitle: "Enter your 10-digit mobile number to retrieve your walk-in token.",
    walkinQueueTrackingTip: "Keep this walk-in token for reception reference",
    areYouDisabled: "Are you disabled / person with disability?",
    areYouDisabledDesc: "Priority will be given to senior citizen , person with disability , and children below 10 years of age",
    yes: "Yes",
    no: "No",
    pwdBadge: "PwD (Priority)",
    walkinClosedTitle: "Walkin Registration Closed",
    walkinClosedMsg: "Walk-in registration is currently closed by the doctor. Please check with reception or try again later.",

    // Doctor Dashboard & Front-Desk
    doctorPanel: "Doctor & Reception Panel",
    onlineQueue: "Online Queue",
    walkinQueue: "Walk-in Queue",
    settingsTab: "Settings",
    currentlyConsulting: "Currently Consulting",
    callNextPatient: "Call Next Patient",
    markDone: "Mark Done",
    changeSlot: "Change Slot",
    skipPatient: "Skip",
    rescheduleSlot: "Reschedule Slot",
    onlineOpen: "Online: Open",
    onlineClose: "Online: Close",
    walkinOpen: "Walk-in: Open",
    walkinClose: "Walk-in: Close",
    lateStatus: "Late Status",
    onTime: "On Time (0m)",
    searchPatientPlaceholder: "Search patient by name, mobile, or token...",
    waitingCountText: "waiting",
    foundCountText: "Found",
    completedPatientsTitle: "Completed Patients Today",
    noCompletedPatients: "No completed patients recorded for today yet.",
    viewCompletedList: "View List",
    consultTimer: "Consult Timer",
    overtime: "Overtime",
    signOut: "Sign Out",
    generalPhysician: "General Physician",

    // Patient Portal Enhancements
    nextInQueue: "Next in Line",
    currentlySeeing: "Currently Seeing",
    doctorFree: "Doctor is Free (No active consultation)",
    estimatedWaitTime: "Est. wait time",
    approxWaitMins: "approx. {mins} mins",
    turnMilestone25: "25 patients ahead. Please be prepared.",
    turnMilestone20: "20 patients ahead. You may start planning to visit.",
    turnMilestone15: "15 patients ahead. Please start heading towards the clinic.",
    turnMilestone10: "10 patients ahead. Please reach the clinic waiting lobby.",
    turnMilestone5: "5 patients ahead! Please be present in the clinic waiting area.",
    turnMilestone1: "You are NEXT in line! Please wait right outside the consultation room.",

    // Browser Push Notifications
    enableNotifications: "Enable Notifications",
    notificationsEnabled: "Alerts Active",
    enableTurnAlerts: "Get Turn & Delay Alerts",
    notificationPromptMsg: "Get native phone & browser notifications when your turn approaches or if doctor is running late.",
    notificationsEnabledToast: "Notifications enabled! You will receive live alerts for your turn and doctor delays.",
    notificationToggleOn: "Alerts ON",
    notificationToggleOff: "Alerts OFF",
    notificationBlocked: "Alerts Blocked",
    notificationBlockedHelp: "Notifications are blocked in your browser settings. Please click the site settings / lock icon in your browser address bar to allow notifications.",
  },
  hi: {
    // Header & Brand
    appSubtitle: "देखभाल, बस एक टैप दूर।",
    patientPortal: "मरीज पोर्टल",
    doctorLogin: "डॉक्टर लॉगिन",
    location: "स्थान",
    clickForGoogleMapLocation: "गूगल मैप लोकेशन देखें",
    googleMapLocation: "गूगल मैप लोकेशन",
    clickToKnowGoogleMapLocation: "गूगल मैप लोकेशन जानने के लिए क्लिक करें",
    clinicAddress: "610, सेक्टर 10A, गुरुग्राम, हरियाणा 122001",
    installApp: "ऐप इंस्टॉल करें",
    open: "खुला है",
    closed: "बंद है",
    exit: "वापस जाएं",
    doctorName: "डॉ. सर्वेश ओपीडी",
    langNameEn: "English",
    langNameHi: "हिंदी",

    // Landing Page
    bookAppointmentTitle: "अपना अपॉइंटमेंट\nबुक करें",
    bookAppointmentSubtitle: "अपना डिजिटल टोकन प्राप्त करें और लाइव कतार ट्रैक करें।",
    bookSlotBtn: "अपना अपॉइंटमेंट बुक करें",
    tokenBadge: "टोकन",
    liveBadge: "लाइव",
    digitalToken: "डिजिटल टोकन",
    liveQueue: "लाइव कतार",
    easyRegister: "आसान पंजीकरण",

    // Doctor Login Modal
    doctorLoginTitle: "डॉक्टर लॉगिन",
    doctorLoginSubtitle: "डैशबोर्ड तक पहुंचने के लिए अपनी साख दर्ज करें।",
    emailAddress: "ईमेल पता",
    password: "पासवर्ड",
    accessDashboard: "डैशबोर्ड खोलें",
    cancel: "रद्द करें",
    invalidCredentials: "अमान्य विवरण। पुन: प्रयास करें।",

    // Search Card
    liveTokenStatus: "लाइव टोकन स्थिति",
    checkTokenTitle: "अपना टोकन नंबर जांचें",
    checkTokenSubtitle: "पहले से पंजीकृत हैं? टोकन नंबर भूल गए? बस अपने मोबाइल नंबर से खोजें।",
    enterMobilePlaceholder: "अपना 10 अंकों का मोबाइल नंबर दर्ज करें",
    inConsultation: "परामर्श जारी",
    inConsultationMsg: "🎉 अभी आपकी बारी है! कृपया डॉक्टर के केबिन में जाएं।",
    waiting: "प्रतीक्षारत",
    nextInLineMsg: "⚡ अगली बारी आपकी है! कृपया पास में ही रहें।",
    aheadInQueueOneMsg: "⌛ कतार में आपसे आगे 1 मरीज है।",
    aheadInQueueManyMsg: "⌛ कतार में आपसे आगे {count} मरीज हैं।",
    completed: "पूर्ण",
    completedMsg: "✅ आपका परामर्श पूरा हो चुका है।",
    skipped: "छूट गया",
    skippedMsg: "⚠️ आपका टोकन छूट गया था। कृपया रिसेप्शनिस्ट को सूचित करें।",
    viewTicket: "टिकट देखें",
    noPatientFound: "इस मोबाइल नंबर के साथ कोई पंजीकृत मरीज नहीं मिला:",
    checkNumberOrBook: "कृपया नंबर जांचें या नीचे नया अपॉइंटमेंट बुक करें।",

    // Smart Arrival Guidance
    reachClinicNow: "तुरंत क्लिनिक पहुंचें",
    leaveHomeNow: "घर से निकलने का समय",
    relaxAtHome: "घर पर आराम करें",
    reachClinicNowMsg: "आपकी बारी बहुत जल्द आने वाली है। कृपया क्लिनिक लॉबी में प्रतीक्षा करें।",
    leaveHomeNowMsg: "क्लिनिक के लिए निकलें। अपनी बारी से 10-15 मिनट पहले पहुंचने का प्रयास करें।",
    relaxAtHomeMsg: "आपके पास पर्याप्त समय है। आप घर पर रहकर लाइव कतार देख सकते हैं।",

    // Form / Booking Step
    patientRegistration: "मरीज पंजीकरण",
    fillDetailsBelow: "तुरंत ओपीडी टोकन प्राप्त करने के लिए मरीज का विवरण भरें।",
    backToHome: "वापस जाएं",
    fullNameLabel: "पूरा नाम",
    fullNamePlaceholder: "मरीज का पूरा नाम दर्ज करें",
    ageLabel: "उम्र (वर्ष)",
    agePlaceholder: "जैसे 28",
    genderLabel: "लिंग",
    male: "पुरुष",
    female: "महिला",
    other: "अन्य",
    mobileNumberLabel: "मोबाइल नंबर",
    mobilePlaceholder: "10 अंकों का मोबाइल नंबर",
    cityVillageLabel: "शहर / गांव",
    cityVillagePlaceholder: "जैसे रामपुर, दिल्ली",
    reasonLabel: "समस्या / मिलने का कारण",
    reasonPlaceholder: "जैसे बुखार, खांसी, नियमित जांच",
    selectTimeSlot: "ओपीडी समय स्लॉट चुनें",
    submitting: "टोकन बन रहा है...",
    getOPDToken: "टोकन नंबर प्राप्त करें",
    validationError: "कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें और सभी आवश्यक फ़ील्ड भरें।",
    fullSlotText: "भर चुका है",

    // Doctor Status & Queue
    doctorSeeingTitle: "वर्तमान में देख रहे हैं",
    doctorWillVisitTitle: "डॉक्टर जल्द ही उपलब्ध होंगे",
    doctorNotStartedMsg: "डॉक्टर ने अभी मरीजों को देखना शुरू नहीं किया है। डॉक्टर के सत्र शुरू करते ही आप लाइव टोकन नंबर देख सकेंगे।",
    doctorWillVisitDateTitle: "डॉक्टर {date} को उपलब्ध होंगे",
    doctorSeeingWalkinTitle: "डॉक्टर वॉक-इन मरीजों को देख रहे हैं",
    doctorSeeingWalkinMsg: "ऑनलाइन अपॉइंटमेंट कतार पूरी हो चुकी है। डॉक्टर वर्तमान में वॉक-इन मरीजों को देख रहे हैं।",
    registrationOpenSoonTitle: "पंजीकरण जल्द ही शुरू होगा",
    registrationOpenSoonMsg: "आज का ओपीडी सत्र समाप्त हो गया है। अगले सत्र के लिए पंजीकरण जल्द ही खुलेगा।",
    checkingOpdStatus: "ओपीडी स्थिति की जांच जारी...",
    verifyingScheduleMsg: "डॉक्टर का समय और लाइव कतार लोड हो रही है...",
    statusLoadErrorTitle: "क्लिनिक की स्थिति लोड नहीं हो सकी",
    statusLoadErrorMsg: "कृपया अपना इंटरनेट कनेक्शन जांचें और फिर कोशिश करें।",
    retry: "फिर कोशिश करें",
    expectedTimeLabel: "अनुमानित समय",
    doctorLateTitle: "डॉक्टर देरी से आने की सूचना (अलर्ट)",
    doctorLateDesc: "डॉक्टर आज {delay} की देरी से चल रहे हैं। अपॉइंटमेंट स्लॉट का समय वही रहेगा, लेकिन परामर्श में लगभग {delay} का विलंब हो सकता है।",
    delayApplied: "डॉक्टर देरी से",
    priorityQueueNotice: "वरिष्ठ नागरिकों, दिव्यांगजनों एवं छोटे बच्चों को प्राथमिकता दी जाएगी, इसलिए कुछ मिनट का विलंब हो सकता है।",

    // Success / Ticket View
    registrationSuccessful: "आपका पंजीकरण सफल रहा!",
    tokenIssuedMsg: "आपके सहयोग के लिए धन्यवाद। कृपया अपॉइंटमेंट के लिए यह टोकन अपने पास रखें।",
    yourToken: "आपका टोकन नंबर",
    slotToken: "स्लॉट टोकन",
    patientName: "मरीज का नाम",
    ageGender: "उम्र / लिंग",
    contactNumber: "फोन नंबर",
    assignedDoctor: "डॉक्टर",
    estimatedTime: "अनुमानित समय",
    patientsAhead: "आपसे आगे मरीज",
    currentLiveToken: "वर्तमान लाइव टोकन",
    status: "स्थिति",
    downloadTokenCard: "डाउनलोड करें / स्क्रीनशॉट लें",
    downloadingToken: "इमेज तैयार हो रही है...",
    bookAnother: "अन्य टोकन बुक करें",
    shareOnWhatsApp: "व्हाट्सएप पर शेयर करें",
    queueTrackingTip: "अपने संदर्भ के लिए यह टोकन सुरक्षित रखें",
    scanToPayTitle: "स्कैन करें और UPI से भुगतान करें",
    scanToPaySubtitle: "Google Pay, PhonePe, Paytm या किसी भी UPI ऐप से स्कैन करें",
    viewQrCodeBtn: "QR कोड देखें",
    copyUpiIdBtn: "UPI ID कॉपी करें",
    upiIdCopied: "कॉपी हो गया!",
    savePaymentScreenshotNotice: "कृपया भुगतान पूरा करें और भविष्य के संदर्भ एवं क्लिनिक सत्यापन के लिए स्क्रीनशॉट सुरक्षित रखें।",
    paymentFlexibilityNotice: "भुगतान लचीला है: आप अभी UPI द्वारा ऑनलाइन भुगतान कर सकते हैं या क्लिनिक रिसेप्शन काउंटर पर नकद / UPI दे सकते हैं।",
    paymentAtCounterNote: "ऑनलाइन या रिसेप्शन काउंटर पर भुगतान करें",
    alreadyRegisteredPrompt: "क्या आपने पहले ही पंजीकरण कर लिया है?",
    checkLiveQueueOrToken: "लाइव कतार देखें या अपना टोकन नंबर जांचें",
    appointmentConfirmedTitle: "अपॉइंटमेंट कन्फर्म हो गया!",
    generatingTokenSubtitle: "आपका ओपीडी टोकन तैयार किया जा रहा है...",
    viewTokenNow: "टोकन देखें",

    // Live Queue & Turn Milestones
    nextPatientInLine: "अगला नंबर (Next)",
    noPatientWaiting: "कतार में कोई प्रतीक्षा नहीं कर रहा",
    estimatedWaitTimeLabel: "अनुमानित प्रतीक्षा समय",
    approxMins: "~{count} मिनट",
    doctorIsFree: "डॉक्टर परामर्श के लिए तैयार हैं",
    milestoneDoctorReady: "डॉक्टर तैयार हैं! कृपया केबिन में प्रवेश करें।",
    milestoneNextUp: "अगला नंबर आपका है! कृपया डॉक्टर के केबिन के बाहर तैयार रहें।",
    milestone1Ahead: "केवल 1 मरीज आगे है। कृपया केबिन के बाहर रहें।",
    milestone5Ahead: "5 मरीज आगे हैं: कृपया तुरंत क्लिनिक प्रतीक्षालय पहुंचें।",
    milestone10Ahead: "10 मरीज आगे हैं: कृपया क्लिनिक के लिए निकलना शुरू करें।",
    milestone15Ahead: "15 मरीज आगे हैं: लगभग 45 मिनट शेष। निकलने की तैयारी करें।",
    milestone20Ahead: "20 मरीज आगे हैं: पर्याप्त समय है। लाइव कतार देखते रहें।",
    milestone25Ahead: "25+ मरीज आगे हैं: घर पर आराम करें और समय-समय पर टोकन स्थिति देखें।",

    // Closed Window Step
    opdClosedTitle: "ओपीडी पंजीकरण वर्तमान में बंद है",
    opdClosedSubtitle: "ऑनलाइन टोकन अभी उपलब्ध नहीं हैं। कृपया नीचे दिए गए पंजीकरण समय की जांच करें।",
    nextWindowOpens: "अगला पंजीकरण समय शुरू होगा:",
    registrationTimings: "पंजीकरण समय",
    morningSlot: "सुबह का समय",
    eveningSlot: "शाम का समय",
    walkinGuidanceTitle: "📍 वॉक-इन मार्गदर्शन:",
    walkinGuidanceText: "वॉक-इन अपॉइंटमेंट के लिए कृपया इस नंबर पर संपर्क करें: 9810807381",
    getDirectionsGoogleMaps: "गूगल मैप्स पर रास्ता देखें",
    thankYouPatience: "आपके धैर्य और सहयोग के लिए धन्यवाद।\nहम आपकी सेवा के लिए तत्पर हैं।",
    securityNotice: "आपका विवरण सुरक्षित है और केवल इस अपॉइंटमेंट के लिए उपयोग किया जाता है।",
    privacyNotice: "आपका स्वास्थ्य और गोपनीयता हमारे लिए अत्यंत महत्वपूर्ण है।",

    // Appointments Full View
    appointmentsFullTitle: "आज के अपॉइंटमेंट स्लॉट भर चुके हैं",
    appointmentsFullSubtitle: "आज के सभी अपॉइंटमेंट स्लॉट बुक हो चुके हैं। आप सीधे क्लिनिक आ सकते हैं (वॉक-इन), लेकिन आपको थोड़ा इंतजार करना पड़ सकता है।",
    priorityNotice: "अपॉइंटमेंट लेने वाले मरीजों को प्राथमिकता दी जाएगी।",
    whatYouCanDo: "आप क्या कर सकते हैं",
    visitClinicWalkin: "सीधे क्लिनिक आएं (वॉक-इन)",
    comeDirectlyMsg: "सीधे आएं और अपनी बारी का इंतजार करें।",
    viewCurrentQueue: "वर्तमान लाइव कतार देखें",
    walkinNote: "पहले से अपॉइंटमेंट लेने वाले मरीजों को प्राथमिकता दी जाएगी।",

    // Logiquel Branding Card
    builtByLogiquel: "Logiquel द्वारा निर्मित",
    logiquelHeadline: "हम आधुनिक व्यवसायों के लिए डिजिटल समाधान बनाते हैं।",
    logiquelDesc: "वेब और मोबाइल ऐप्स से लेकर एआई और ऑटोमेशन तक, Logiquel कंपनियों को आधुनिक डिजिटल उत्पाद बनाने में मदद करता है।",
    webAppsPill1: "वेब",
    webAppsPill2: "एप्लीकेशन",
    mobileAppsPill1: "मोबाइल",
    mobileAppsPill2: "ऐप्स",
    aiAutomationPill1: "एआई और",
    aiAutomationPill2: "ऑटोमेशन",
    customSoftwarePill1: "कस्टम",
    customSoftwarePill2: "सॉफ्टवेयर",
    letsBuildSomethingGreat: "आइए कुछ नया और बेहतरीन बनाएं",
    yourIdeaOurTech: "आपका विचार। हमारी तकनीक।",
    getInTouch: "संपर्क करें",

    // PWA Install
    installPwaBtn: "ऐप इंस्टॉल करें",
    installAppTitle: "डॉककेयर ऐप इंस्टॉल करें",
    installAppSubtitle: "1-टैप में तुरंत उपयोग के लिए डॉककेयर को अपनी होम स्क्रीन पर जोड़ें।",
    iosSafariNotice: "⚠️ यह केवल Safari ब्राउज़र में किया जाना चाहिए।",
    iosStep1Prefix: "Safari नेविगेशन बार में",
    iosStep1Bold: "Share",
    iosStep1Suffix: "बटन पर टैप करें।",
    iosStep2Prefix: "नीचे स्क्रॉल करें और",
    iosStep2Bold: "Add to Home Screen",
    iosStep2Suffix: "चुनें।",
    iosStep3Prefix: "ऊपर दाईं ओर",
    iosStep3Bold: "Add (जोड़ें)",
    iosStep3Suffix: "पर टैप करके पूरा करें।",
    androidStep1Prefix: "ब्राउज़र मेनू",
    androidStep1Suffix: "(ऊपर दाईं ओर 3 डॉट्स) पर टैप करें।",
    androidStep2Prefix: "मेनू से",
    androidStep2Bold: "Install app",
    androidStep2Middle: "या",
    androidStep2Bold2: "Add to Home screen",
    androidStep2Suffix: "चुनें।",
    gotIt: "समझ गया",

    // Bottom Navigation
    navHome: "होम",
    navBookNow: "बुक करें",
    navWhatWeTreat: "इलाज",
    navShop: "शॉप",
    navLocation: "स्थान",
    navCheckStatus: "लाइव स्टेटस",

    // Home Next Step Tile (Wireframe)
    bookedMySlotTitle: "मैंने अपना स्लॉट बुक कर लिया, अब क्या?",
    beforeLeavingHome: "घर से निकलने से पहले देखें कि आपसे आगे कितने मरीज हैं, या अपना टोकन नंबर भूल गए हैं:",
    addressSectionLabel: "पता:",
    clinicFullAddress: "मकान नं. 610, सेक्टर-10A, मुख्य मार्केट के पास, गुरुग्राम, हरियाणा 122001",
    helpQueryLabel: "किसी भी सहायता या प्रश्न के लिए इस नंबर पर कॉल करें:",
    callTejaswiBhaiya: "संपर्क करें: +91 9810807381",

    // Lunch break
    lunchBreak: "लंच ब्रेक",

    // Shop Page
    shopTitle: "डॉक केयर वेलनेस शॉप",
    shopSubtitle: "शुद्ध दवाएं, स्वास्थ्य संबंधी उत्पाद एवं डॉक्टर द्वारा प्रमाणित वेलनेस उत्पाद।",
    comingSoon: "जल्द आ रहा है",
    comingSoonDesc: "हम आपके लिए उच्च गुणवत्ता वाले स्वास्थ्य उत्पाद एवं आवश्यक दवाएं ला रहे हैं। कृपया प्रतीक्षा करें!",
    backToHomeBtn: "होम पर वापस जाएं",

    // Location Page
    locationPageTitle: "क्लिनिक लोकेशन",
    locationPageSubtitle: "डॉ. सर्वेश ओपीडी, गुरुग्राम। पहुंचना आसान और पर्याप्त पार्किंग उपलब्ध।",
    verifiedClinic: "सत्यापित क्लिनिक",
    openInGoogleMaps: "गूगल मैप्स में खोलें",
    copyAddress: "पता कॉपी करें",
    addressCopied: "पता कॉपी हो गया!",
    opdTimings: "ओपीडी समय",
    locationMorningTime: "सुबह: 09:30 AM - 01:30 PM",
    locationEveningTime: "शाम: 05:30 PM - 08:30 PM",
    daysOpen: "सोमवार से शनिवार",
    landmarkDirections: "लैंडमार्क व दिशा-निर्देश",
    landmarkDesc: "सेक्टर 10A, मुख्य मार्केट के पास, गुरुग्राम। क्लिनिक के बाहर आसान पार्किंग सुविधा।",
    bookVisitCTA: "आज क्लिनिक आ रहे हैं?",
    bookVisitCTASub: "कतार से बचने के लिए अपना डिजिटल टोकन पहले से बुक करें।",

    // Treated Conditions Modal
    viewTreatedConditionsBtn: "इलाज योग्य समस्याएं",
    treatedConditionsModalTitle: "अब पाये निदान निम्न समस्याओं से...",
    treatedConditionsModalSubtitle: "निम्नलिखित स्वास्थ्य समस्याओं के लिए विशेष परामर्श एवं उपचार उपलब्ध है",
    tabAll: "सभी समस्याएं (61)",
    tabGeneral: "मुख्य समस्याएं (40)",
    tabWomen: "महिलाओं के लिए (7)",
    tabChildren: "बच्चों के लिए (14)",
    searchConditionsPlaceholder: "बीमारी या समस्या खोजें...",
    noConditionsFound: "कोई संबंधित समस्या नहीं मिली।",
    totalConditionsCount: "61 बीमारियों/समस्याओं की सूची",
    closeModal: "बंद करें",

    // Walk-in Portal
    walkinPortal: "वॉक-इन ओपीडी पोर्टल",
    walkinBadge: "वॉक-इन पंजीकरण",
    walkinTitle: "सीधे क्लिनिक\nवॉक-इन पंजीकरण",
    walkinSubtitle: "क्लिनिक काउंटर पर तुरंत अपना वॉक-इन डिजिटल टोकन प्राप्त करें।",
    getWalkinToken: "वॉक-इन टोकन प्राप्त करें",
    walkinTokenNotice: "क्लिनिक स्टाफ द्वारा आपका वॉक-इन टोकन क्रमानुसार पुकारा जाएगा।",
    walkinWaitLobbyMsg: "कृपया क्लिनिक प्रतीक्षालय में बैठें। आपका टोकन नंबर आने पर आपको बुलाया जाएगा।",
    searchWalkinTokenTitle: "अपना वॉक-इन टोकन जांचें",
    searchWalkinTokenSubtitle: "अपना 10 अंकों का मोबाइल नंबर दर्ज करके अपना टोकन नंबर देखें।",
    walkinQueueTrackingTip: "रिसेप्शन संदर्भ के लिए यह वॉक-इन टोकन सुरक्षित रखें",
    areYouDisabled: "क्या आप दिव्यांग / विशेष योग्यजन हैं?",
    areYouDisabledDesc: "वरिष्ठ नागरिकों, दिव्यांगजनों एवं 10 वर्ष से कम उम्र के बच्चों को प्राथमिकता दी जाएगी।",
    yes: "हाँ",
    no: "नहीं",
    pwdBadge: "दिव्यांग (प्राथमिकता)",
    walkinClosedTitle: "वॉक-इन पंजीकरण बंद है",
    walkinClosedMsg: "डॉक्टर द्वारा वॉक-इन पंजीकरण फिलहाल बंद किया गया है। कृपया काउंटर या रिसेप्शन पर संपर्क करें।",

    // Doctor Dashboard & Front-Desk
    doctorPanel: "डॉक्टर एवं रिसेप्शन पैनल",
    onlineQueue: "ऑनलाइन कतार",
    walkinQueue: "वॉक-इन कतार",
    settingsTab: "सेटिंग्स",
    currentlyConsulting: "वर्तमान में परामर्श ले रहे मरीज",
    callNextPatient: "अगला मरीज बुलाएं",
    markDone: "सम्पन्न (Done)",
    changeSlot: "स्लॉट बदलें",
    skipPatient: "छोड़ें (Skip)",
    rescheduleSlot: "नया स्लॉट दें",
    onlineOpen: "ऑनलाइन: चालू",
    onlineClose: "ऑनलाइन: बंद",
    walkinOpen: "वॉक-इन: चालू",
    walkinClose: "वॉक-इन: बंद",
    lateStatus: "देरी की स्थिति",
    onTime: "समय पर (0 मिनट)",
    searchPatientPlaceholder: "नाम, मोबाइल नंबर या टोकन से खोजें...",
    waitingCountText: "प्रतीक्षारत",
    foundCountText: "मिले",
    completedPatientsTitle: "आज देखे गए सभी मरीज",
    noCompletedPatients: "आज अभी तक कोई मरीज पूरा नहीं हुआ है।",
    viewCompletedList: "सूची देखें",
    consultTimer: "परामर्श टाइमर",
    overtime: "अतिरिक्त समय",
    signOut: "लॉगआउट",
    generalPhysician: "जनरल फिजिशियन",

    // Patient Portal Enhancements
    nextInQueue: "कतार में अगला",
    currentlySeeing: "वर्तमान में देखा जा रहा है",
    doctorFree: "डॉक्टर उपलब्ध हैं (कोई सक्रिय परामर्श नहीं)",
    estimatedWaitTime: "अनुमानित प्रतीक्षा समय",
    approxWaitMins: "लगभग {mins} मिनट",
    turnMilestone25: "आपसे आगे 25 मरीज हैं। कृपया तैयार रहें।",
    turnMilestone20: "आपसे आगे 20 मरीज हैं। क्लिनिक जाने की तैयारी शुरू कर सकते हैं।",
    turnMilestone15: "आपसे आगे 15 मरीज हैं। कृपया क्लिनिक के लिए निकलें।",
    turnMilestone10: "आपसे आगे 10 मरीज हैं। कृपया क्लिनिक प्रतीक्षालय में पहुँचें।",
    turnMilestone5: "आपसे आगे केवल 5 मरीज हैं! कृपया क्लिनिक में ही उपस्थित रहें।",
    turnMilestone1: "आपकी बारी अगली है! कृपया डॉक्टर के कक्ष के बाहर प्रतीक्षा करें।",

    // Browser Push Notifications
    enableNotifications: "नोटिफिकेशन चालू करें",
    notificationsEnabled: "अलर्ट सक्रिय है",
    enableTurnAlerts: "बारी एवं देरी अलर्ट प्राप्त करें",
    notificationPromptMsg: "अपनी बारी आने पर या डॉक्टर की देरी होने पर सीधे मोबाइल/ब्राउज़र पर नोटिफिकेशन पाएं।",
    notificationsEnabledToast: "नोटिफिकेशन चालू हो गए हैं! आपकी बारी और डॉक्टर देरी के लाइव अलर्ट मिलेंगे।",
    notificationToggleOn: "अलर्ट चालू",
    notificationToggleOff: "अलर्ट बंद",
    notificationBlocked: "अलर्ट बंद (ब्लॉक)",
    notificationBlockedHelp: "ब्राउज़र में नोटिफिकेशन ब्लॉक हैं। कृपया एड्रेस बार में लॉक/सेटिंग्स आइकन पर क्लिक करके अनुमति दें।",
  }
};

export type TranslationKey = keyof typeof translations.en;

// Dictionary for transliteration and dynamic database field translations
const HINDI_MAP: Record<string, string> = {
  // Titles & Doctor terms
  "dr.": "डॉ.",
  "dr": "डॉ.",
  "doctor": "डॉक्टर",
  "sarvesh": "सर्वेश",
  "tiwari": "तिवारी",
  "sharma": "शर्मा",
  "verma": "वर्मा",
  "gupta": "गुप्ता",
  "singh": "सिंह",
  "kumar": "कुमार",
  "patel": "पटेल",
  "yadav": "यादव",
  "mishra": "मिश्रा",
  "pandey": "पांडे",
  
  // OPD & Session
  "opd": "ओपीडी",
  "session": "सत्र",
  "morning": "सुबह",
  "evening": "शाम",
  "afternoon": "दोपहर",
  "night": "रात",
  "registration": "पंजीकरण",
  "clinic": "क्लिनिक",
  "consultation": "परामर्श",
  "appointment": "अपॉइंटमेंट",
  "appointments": "अपॉइंटमेंट",
  "general": "सामान्य",
  
  // Genders
  "male": "पुरुष",
  "female": "महिला",
  "other": "अन्य",

  // Statuses
  "waiting": "प्रतीक्षारत",
  "in-progress": "परामर्श जारी",
  "done": "पूर्ण",
  "skipped": "छूट गया",

  // Reasons
  "fever": "बुखार",
  "cough": "खांसी",
  "cold": "सर्दी-जुकाम",
  "headache": "सिरदर्द",
  "stomach pain": "पेट दर्द",
  "stomach ache": "पेट दर्द",
  "body pain": "बदन दर्द",
  "regular checkup": "नियमित जांच",
  "checkup": "जांच",
  "follow up": "फॉलो अप",
  "follow-up": "फॉलो अप",
  "bp": "रक्तचाप (BP)",
  "diabetes": "शुगर",
  "sugar": "शुगर",
  "weakness": "कमजोरी",
  "infection": "संक्रमण",
  "chest pain": "सीने में दर्द",
  "back pain": "पीठ दर्द",
  "skin problem": "त्वचा की समस्या",
  "allergy": "एलर्जी",
  "no delay": "कोई देरी नहीं",
  "google map": "गूगल मैप",
  "google maps": "गूगल मैप्स",
  "location": "स्थान"
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  tDynamic: (text: string | null | undefined) => string;
  tDelay: (delayMinutes: number) => string;
  tGender: (gender: string | null | undefined) => string;
  tStatus: (status: string | null | undefined) => string;
  tTimeSlot: (slot: string | null | undefined, delayMinutes?: number) => string;
  tTime12Hour: (timeStr: string | null | undefined) => string;
  tWaitTime: (waitMinutes: number) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: TranslationKey) => translations.en[key] || key,
  tDynamic: (text) => text || "",
  tDelay: (m) => `${m} mins`,
  tGender: (g) => g || "",
  tStatus: (s) => s || "",
  tTimeSlot: (s) => s || "",
  tTime12Hour: (t) => t || "",
  tWaitTime: (m) =>
    m < 60
      ? `~${m} mins`
      : m % 60 === 0
        ? `~${m / 60} hours`
        : `~${Math.floor(m / 60)} hr ${m % 60} mins`,
});

export const LANGUAGE_STORAGE_KEY = "mediqueue_lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
      if (savedLang === "en" || savedLang === "hi") {
        setLanguageState(savedLang);
        document.documentElement.lang = savedLang;
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "hi" : "en");
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    let str = translations[language]?.[key] || translations.en[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      });
    }
    return str;
  };

  const tDynamic = (text: string | null | undefined): string => {
    if (!text) return "";
    if (language === "en") return text;

    let clean = text.trim();
    const lower = clean.toLowerCase();

    // Direct match in dictionary
    if (HINDI_MAP[lower]) {
      return HINDI_MAP[lower];
    }

    // Pattern: "[Doctor Name]'s OPD Session"
    if (clean.includes("'s OPD Session") || clean.includes("'s OPD session")) {
      const docName = clean.replace(/'s OPD Session/i, "").trim();
      return `${tDynamic(docName)} का ओपीडी सत्र`;
    }

    // Pattern: "Doctor [Name] OPD"
    if (/^(Dr\.?|Doctor)\s+([A-Za-z]+)\s+OPD$/i.test(clean)) {
      const match = clean.match(/^(Dr\.?|Doctor)\s+([A-Za-z]+)\s+OPD$/i);
      if (match) {
        const title = match[1].toLowerCase().startsWith("dr") ? "डॉ." : "डॉक्टर";
        const nameKey = match[2].toLowerCase();
        const translatedName = HINDI_MAP[nameKey] || match[2];
        return `${title} ${translatedName} ओपीडी`;
      }
    }

    // Pattern: "Dr. [Name] [LastName]"
    if (/^(Dr\.?|Doctor)\s+([A-Za-z\s]+)$/i.test(clean)) {
      const parts = clean.split(/\s+/);
      const translatedParts = parts.map((p) => {
        const pLower = p.toLowerCase();
        return HINDI_MAP[pLower] || p;
      });
      return translatedParts.join(" ");
    }

    // Pattern: "Registration closed at 10:00 AM for today's OPD session (YYYY-MM-DD)"
    if (clean.includes("Registration closed at 10:00 AM for today's OPD session")) {
      const dateMatch = clean.match(/\((.*?)\)/);
      const dateStr = dateMatch ? ` (${dateMatch[1]})` : "";
      return `आज के ओपीडी सत्र${dateStr} के लिए पंजीकरण सुबह 10:00 बजे बंद हो गया।`;
    }

    // Pattern: "Registration for YYYY-MM-DD session is closed"
    if (clean.includes("session is closed")) {
      const dateMatch = clean.match(/Registration for (.*?) session is closed/i);
      const dateStr = dateMatch ? dateMatch[1] : "";
      return `${dateStr} सत्र के लिए पंजीकरण बंद है।`;
    }

    // Word by word fallback replacement for mixed sentences
    let result = clean;
    Object.keys(HINDI_MAP).forEach((key) => {
      const reg = new RegExp(`\\b${key}\\b`, "gi");
      result = result.replace(reg, HINDI_MAP[key]);
    });

    return result;
  };

  const tDelay = (delayMinutes: number): string => {
    if (delayMinutes <= 0) return language === "hi" ? "कोई देरी नहीं" : "No Delay";
    if (delayMinutes < 60) {
      return language === "hi" ? `${delayMinutes} मिनट` : `${delayMinutes} mins`;
    }
    const hours = delayMinutes / 60;
    if (Number.isInteger(hours)) {
      if (language === "hi") {
        return hours === 1 ? "1 घंटा" : `${hours} घंटे`;
      }
      return `${hours} hour${hours > 1 ? "s" : ""}`;
    }
    const formatted = hours.toFixed(1);
    return language === "hi" ? `${formatted} घंटे` : `${formatted} hours`;
  };

  const tGender = (gender: string | null | undefined): string => {
    if (!gender) return "";
    if (language === "en") return gender;
    const lower = gender.toLowerCase();
    if (lower === "male") return "पुरुष";
    if (lower === "female") return "महिला";
    if (lower === "other") return "अन्य";
    return gender;
  };

  const tStatus = (status: string | null | undefined): string => {
    if (!status) return "";
    if (language === "en") {
      if (status === "in-progress") return "In Consultation";
      if (status === "waiting") return "Waiting";
      if (status === "done") return "Completed";
      if (status === "skipped") return "Skipped";
      return status;
    }
    if (status === "in-progress") return "परामर्श जारी";
    if (status === "waiting") return "प्रतीक्षारत";
    if (status === "done") return "पूर्ण";
    if (status === "skipped") return "छूट गया";
    return status;
  };

  const tTime12Hour = (timeStr: string | null | undefined): string => {
    if (!timeStr) return language === "hi" ? "सुबह 10:00" : "10:00 AM";
    const clean = timeStr.trim();
    let isPM = clean.toLowerCase().includes("pm");
    let isAM = clean.toLowerCase().includes("am");
    const timeWithoutPeriod = clean.replace(/(am|pm)/i, "").trim();
    const parts = timeWithoutPeriod.split(":");
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10) || 0;

    if (isNaN(hours)) return clean;

    if (!isAM && !isPM) {
      isPM = hours >= 12;
      isAM = hours < 12;
    }

    const hour24 = isPM && hours < 12 ? hours + 12 : isAM && hours === 12 ? 0 : hours;
    const period12 = hour24 >= 12 ? "PM" : "AM";
    let displayHour = hour24 % 12;
    if (displayHour === 0) displayHour = 12;
    const minStr = minutes > 0 ? `:${String(minutes).padStart(2, "0")}` : ":00";
    const hourStr = String(displayHour);

    if (language === "hi") {
      const timeOfDay = hour24 < 12 ? "सुबह" : hour24 >= 16 ? "शाम" : "दोपहर";
      return `${timeOfDay} ${hourStr}${minStr}`;
    }

    return `${hourStr}${minStr} ${period12}`;
  };

  const tTimeSlot = (slot: string | null | undefined, _delayMinutes: number = 0): string => {
    if (!slot) return "";
    if (language === "en") return slot;

    // Convert e.g. "09:00 AM - 10:00 AM" or "09:00 AM – 10:00 AM" to Hindi representation
    const parts = slot.split(/\s*[-–]\s*/);
    if (parts.length === 2) {
      return `${tTime12Hour(parts[0])} – ${tTime12Hour(parts[1])}`;
    }
    return slot;
  };

  const tWaitTime = (waitMinutes: number): string => {
    if (waitMinutes <= 0) {
      return language === "hi" ? "~0 मिनट" : "~0 mins";
    }
    if (waitMinutes < 60) {
      return language === "hi" ? `~${waitMinutes} मिनट` : `~${waitMinutes} mins`;
    }
    const hours = Math.floor(waitMinutes / 60);
    const remMinutes = waitMinutes % 60;

    if (remMinutes === 0) {
      if (language === "hi") {
        return hours === 1 ? "~1 घंटा" : `~${hours} घंटे`;
      }
      return hours === 1 ? "~1 hour" : `~${hours} hours`;
    }

    if (language === "hi") {
      const hrWord = hours === 1 ? "घंटा" : "घंटे";
      return `~${hours} ${hrWord} ${remMinutes} मिनट`;
    }
    return `~${hours} hr ${remMinutes} mins`;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        tDynamic,
        tDelay,
        tGender,
        tStatus,
        tTimeSlot,
        tTime12Hour,
        tWaitTime,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
