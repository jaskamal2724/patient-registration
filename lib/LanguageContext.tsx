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
    clickToKnowGoogleMapLocation: "Click to know Google Map location",
    clinicAddress: "610, Sector 10A, Gurugram, Haryana 122001",
    installApp: "Install App",
    open: "Open",
    closed: "Closed",
    exit: "Back",
    doctorName: "Doctor Sarvesh OPD",
    langNameEn: "English",
    langNameHi: "हिंदी",

    // Landing Page
    bookAppointmentTitle: "Book your\nappointment",
    bookAppointmentSubtitle: "Get your digital token and track your queue live.",
    bookSlotBtn: "Book your slot",
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
    enterMobilePlaceholder: "Enter your 10-digit mobile number",
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
    submitting: "Generating Token...",
    getOPDToken: "Get Token Number",
    validationError: "Please enter a valid 10-digit mobile number and fill all required fields.",
    fullSlotText: "FULL",

    // Doctor Status & Queue
    doctorSeeingTitle: "Doctor Is Seeing",
    doctorWillVisitTitle: "Doctor will visit shortly",
    doctorNotStartedMsg: "The doctor has not started seeing patients yet. You will be able to see the live token number once the doctor starts the session.",
    doctorWillVisitDateTitle: "Doctor will visit on {date}",
    expectedTimeLabel: "Expected time",
    doctorLateTitle: "Doctor Running Late Update",
    doctorLateDesc: "Doctor is running {delay} late today. All appointment booking slots and patient visit times have been automatically shifted forward by +{delay}.",
    delayApplied: "delay applied",

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
    savePaymentScreenshotNotice: "Please complete the payment and save a screenshot for future reference and clinic verification.",

    // Closed Window Step
    opdClosedTitle: "OPD Registration Currently Closed",
    opdClosedSubtitle: "Online tokens are currently unavailable. Please check the registration timings below.",
    nextWindowOpens: "Next registration window opens at:",
    registrationTimings: "Registration Timings",
    morningSlot: "Morning Slot",
    eveningSlot: "Evening Slot",
    walkinGuidanceTitle: "📍 Walk-in Guidance:",
    walkinGuidanceText: "Please visit the clinic reception desk directly. Walk-in tokens will be issued at the counter subject to availability.",
    getDirectionsGoogleMaps: "Get Directions on Google Maps",
    thankYouPatience: "Thank you for your patience and understanding.\nWe are here to take care of you.",
    securityNotice: "Your details are secure and used only for this appointment.",
    privacyNotice: "Your health and privacy are important to us.",

    // Appointments Full View
    appointmentsFullTitle: "Appointments are Full",
    appointmentsFullSubtitle: "All appointment slots for today are booked. You can still visit the clinic directly (walk-in), but you may have to wait a little.",
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

    // Treated Conditions Modal
    viewTreatedConditionsBtn: "Problems Treated",
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
    walkinTitle: "Direct Clinic\nWalk-in Registration",
    walkinSubtitle: "Generate an instant walk-in token directly at the clinic counter.",
    getWalkinToken: "Get Walk-in Token",
    walkinTokenNotice: "Your walk-in token will be called by clinic staff in order.",
    walkinWaitLobbyMsg: "Please relax in the clinic waiting lobby. Doctor/reception will call your token shortly.",
    searchWalkinTokenTitle: "Forgot Your Walk-in Token?",
    searchWalkinTokenSubtitle: "Enter your 10-digit mobile number to retrieve your walk-in token.",
    walkinQueueTrackingTip: "Keep this walk-in token for reception reference"
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
    bookSlotBtn: "अपना स्लॉट बुक करें",
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
    backToHome: "मुख्य पृष्ठ पर जाएं",
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
    expectedTimeLabel: "अनुमानित समय",
    doctorLateTitle: "डॉक्टर देरी से आने की सूचना",
    doctorLateDesc: "डॉक्टर आज {delay} की देरी से चल रहे हैं। सभी अपॉइंटमेंट स्लॉट और मिलने का समय +{delay} आगे बढ़ा दिया गया है।",
    delayApplied: "देरी लागू",

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
    savePaymentScreenshotNotice: "कृपया भुगतान पूरा करें और भविष्य के संदर्भ एवं क्लिनिक सत्यापन के लिए स्क्रीनशॉट सुरक्षित रखें।",

    // Closed Window Step
    opdClosedTitle: "ओपीडी पंजीकरण वर्तमान में बंद है",
    opdClosedSubtitle: "ऑनलाइन टोकन अभी उपलब्ध नहीं हैं। कृपया नीचे दिए गए पंजीकरण समय की जांच करें।",
    nextWindowOpens: "अगला पंजीकरण समय शुरू होगा:",
    registrationTimings: "पंजीकरण समय",
    morningSlot: "सुबह का समय",
    eveningSlot: "शाम का समय",
    walkinGuidanceTitle: "📍 सीधे आने वाले मरीजों के लिए मार्गदर्शन:",
    walkinGuidanceText: "कृपया सीधे क्लिनिक रिसेप्शन डेस्क पर जाएं। काउंटर पर उपलब्धता के अनुसार वॉक-इन टोकन दिए जाएंगे।",
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
    walkinQueueTrackingTip: "रिसेप्शन संदर्भ के लिए यह वॉक-इन टोकन सुरक्षित रखें"
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
    if (!timeStr) return language === "hi" ? "सुबह 09:00" : "09:00 AM";
    const clean = timeStr.trim();
    let isPM = clean.toLowerCase().includes("pm");
    let isAM = clean.toLowerCase().includes("am");
    let timeWithoutPeriod = clean.replace(/(am|pm)/i, "").trim();
    let parts = timeWithoutPeriod.split(":");
    let hours = parseInt(parts[0], 10);
    let minutes = parseInt(parts[1], 10) || 0;

    if (isNaN(hours)) return clean;

    if (!isAM && !isPM) {
      isPM = hours >= 12;
      isAM = hours < 12;
    }

    const period12 = isPM ? "PM" : "AM";
    let displayHour = hours % 12;
    if (displayHour === 0) displayHour = 12;
    const minStr = minutes > 0 ? `:${String(minutes).padStart(2, "0")}` : ":00";
    const hourStr = String(displayHour).padStart(2, "0");

    if (language === "hi") {
      const timeOfDay = isAM ? "सुबह" : hours >= 16 ? "शाम" : "दोपहर";
      return `${timeOfDay} ${hourStr}${minStr}`;
    }

    return `${hourStr}${minStr} ${period12}`;
  };

  const tTimeSlot = (slot: string | null | undefined, delayMinutes: number = 0): string => {
    if (!slot) return "";
    if (delayMinutes > 0) {
      // Slot shift is handled by shiftSlotLabel
    }
    if (language === "en") return slot;

    // Convert e.g. "09:00 AM - 10:00 AM" or "09:00 AM – 10:00 AM" to Hindi representation
    const parts = slot.split(/\s*[-–]\s*/);
    if (parts.length === 2) {
      return `${tTime12Hour(parts[0])} – ${tTime12Hour(parts[1])}`;
    }
    return slot;
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
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
