import { useState, useRef, useEffect } from "react";

const LANGUAGES = {
  en: { name: "English", welcome: "Hi! I am FraudGuard AI 🛡️\n\nI can help you with:\n• UPI fraud detection & prevention\n• Transaction disputes\n• Cybercrime reporting\n• Safety tips\n• Helpline numbers\n\nWhat do you need help with today?" },
  hi: { name: "हिंदी", welcome: "नमस्ते! मैं FraudGuard AI हूं 🛡️\n\nमैं इनमें मदद कर सकता हूं:\n• UPI धोखाधड़ी से बचाव\n• लेनदेन विवाद\n• साइबर अपराध रिपोर्टिंग\n• सुरक्षा टिप्स\n• हेल्पलाइन नंबर\n\nआज आपको किस चीज़ में मदद चाहिए?" },
  gu: { name: "ગુજરાતી", welcome: "નમસ્તે! હું FraudGuard AI છું 🛡️\n\nહું આમાં મદદ કરી શકું:\n• UPI છેતરપિંડીથી બચાવ\n• વ્યવહાર વિવાદ\n• સાઇબર ક્રાઇમ રિપોર્ટિંગ\n• સુરક્ષા ટિપ્સ\n• હેલ્પલાઇન નંબર\n\nઆજે તમને શેમાં મદદ જોઈએ છે?" },
};

const quickQuestions = {
  en: ["What is UPI fraud?", "Safety tips", "Money not received", "I was scammed", "Helplines", "QR code scam", "Fake call received", "OTP fraud"],
  hi: ["UPI धोखाधड़ी क्या है?", "सुरक्षा टिप्स", "पैसे नहीं मिले", "मेरे साथ धोखा हुआ", "हेल्पलाइन", "QR कोड स्कैम", "नकली कॉल आई", "OTP धोखाधड़ी"],
  gu: ["UPI છેતરપિંડી શું છે?", "સુરક્ષા ટિપ્સ", "પૈસા ન મળ્યા", "મારી સાથે છેતરપિંડી થઈ", "હેલ્પલાઇન", "QR કોડ સ્કૅમ", "નકલી કૉલ આવ્યો", "OTP છેતરપિંડી"],
};

const getResponse = (text, lang) => {
  const t = text.toLowerCase();

  const responses = {
    en: {
      what_is_fraud: `🚨 What is UPI Fraud?\n\nUPI fraud is when criminals use deception to steal money from your UPI account. India loses crores of rupees daily to UPI fraud.\n\n📌 Most Common Types:\n\n1️⃣ Fake Customer Care\nFraudsters pose as bank/UPI app support and ask for OTP or PIN to "verify" your account.\n\n2️⃣ QR Code Scam\nThey send a QR code saying "scan to receive money" — but scanning actually SENDS money!\n\n3️⃣ Phishing Links\nFake websites that look exactly like your bank app, designed to steal login credentials.\n\n4️⃣ Social Engineering\nPretending to be a friend in trouble who needs urgent money transfer.\n\n5️⃣ Lucky Draw / Lottery\nYou "won" a prize but need to pay a small fee first — classic advance fee fraud.\n\n6️⃣ Part-time Job Scam\nPromise of easy money for simple tasks, then ask you to invest first.\n\n⚠️ Remember: Banks and UPI apps NEVER ask for OTP, PIN or password!\n\n📞 If victimized: Call 1930 immediately!`,

      safety_tips: `🛡️ Complete UPI Safety Guide\n\n✅ ALWAYS DO:\n• Verify receiver name shown after entering UPI ID\n• Enable transaction notifications\n• Use app lock / fingerprint for UPI apps\n• Send ₹1 first to unknown UPI IDs to verify\n• Check URL carefully before entering any credentials\n• Keep your UPI app updated\n• Use strong, unique UPI PIN\n• Report suspicious activity immediately\n\n❌ NEVER DO:\n• Share OTP with anyone — not even bank employees\n• Share UPI PIN with anyone\n• Scan QR codes to "receive" money\n• Click on links in SMS/WhatsApp to pay\n• Download screen sharing apps if asked by caller\n• Pay "registration fee" for jobs or prizes\n• Transfer money to "safe account" if someone calls\n\n🔴 Red Flags:\n• Urgency / pressure to act fast\n• Too good to be true offers\n• Unknown callers claiming to be bank staff\n• Requests to install remote access apps\n\n📞 Report fraud: 1930 | cybercrime.gov.in`,

      money_not_received: `💸 Money Deducted But Not Received?\n\nDon't panic! This is common and usually resolves automatically.\n\n📋 Step-by-Step Guide:\n\n⏰ STEP 1: Wait 48-72 Hours\nMost failed transactions auto-reverse within 48 hours. The money is usually in transit, not lost.\n\n📱 STEP 2: Check Transaction Status\n• Open your UPI app\n• Go to Transaction History\n• Find the transaction\n• Check if status shows "Pending" or "Failed"\n\n📋 STEP 3: Note Important Details\n• UTR / Reference Number (e.g. 426123456789)\n• Transaction date and time\n• Exact amount\n• Receiver's UPI ID\n• Your bank account number\n\n🏦 STEP 4: Contact Your Bank (if not resolved in 48 hrs)\n• Call your bank helpline\n• Give them the UTR number\n• Ask to raise a dispute\n• Get a complaint reference number\n• Banks must resolve in 5 business days (RBI rule)\n\n💻 STEP 5: NPCI Complaint\n• Visit: npci.org.in\n• Go to: Dispute Redressal Mechanism\n• Submit UTR number and details\n• NPCI helpline: 1800-120-1740\n\n⚖️ STEP 6: If still unresolved (after 30 days)\n• File complaint with Banking Ombudsman\n• Visit: bankingombudsman.rbi.org.in\n• This is FREE and legally binding\n\n💡 Tip: Keep all screenshots as evidence!`,

      scammed: `🚨 YOU WERE SCAMMED — ACT IMMEDIATELY!\n\nEvery minute matters. The faster you act, the better chance of recovery.\n\n⚡ IMMEDIATE ACTIONS (First 1 hour):\n\n📞 1. Call 1930 RIGHT NOW\nThis is the National Cybercrime Helpline. They can flag the fraudulent account and sometimes freeze it before money is withdrawn.\n\n🔒 2. Block Your Account\n• Login to net banking → Block UPI / Debit card\n• Or call your bank helpline immediately\n• Ask them to put a hold on recent transactions\n\n🔑 3. Change All Credentials\n• Change UPI PIN\n• Change net banking password\n• Change UPI app login password\n\n📱 4. Collect All Evidence\n• Screenshot the transaction\n• Screenshot any messages/chats\n• Note fraudster's UPI ID / phone number\n• Save any emails received\n\n💻 5. File Online Complaint\n• Go to: cybercrime.gov.in\n• Click: Report Cyber Crime\n• Select: Financial Fraud\n• Fill all details with evidence\n• You'll get a complaint number — SAVE IT\n\n🚔 6. File Police FIR\n• Visit nearest police station\n• Bring all screenshots and evidence\n• File under IT Act Section 66C and 66D\n• Insist on written FIR, not just complaint\n\n🏦 7. Contact Bank Fraud Department\n• Visit branch with written complaint\n• Ask them to flag transaction as fraudulent\n• Submit FIR copy to bank\n\n⏰ Recovery chances:\n• Within 1 hour: High\n• Within 24 hours: Medium\n• After 48 hours: Low but possible\n\n📞 Helplines:\n• Cybercrime: 1930\n• NPCI: 1800-120-1740\n• RBI: 14448`,

      helplines: `📞 All Important Helplines & Portals\n\n🆘 EMERGENCY:\n• National Cybercrime: 1930\n  (Available 24/7, handles all cyber fraud)\n\n🏦 BANKING:\n• RBI Helpline: 14448\n• Banking Ombudsman: bankingombudsman.rbi.org.in\n• NPCI: 1800-120-1740\n  (For UPI transaction disputes)\n\n👮 POLICE:\n• Cyber Crime Cell: cybercrime.gov.in\n• Emergency: 112\n• Women Helpline: 1091\n\n📱 UPI APP HELPLINES:\n• PhonePe: 080-68727374\n• Google Pay: 1-800-419-0157\n• Paytm: 0120-4456456\n• BHIM: 1800-120-1740\n\n🌐 IMPORTANT WEBSITES:\n• cybercrime.gov.in (File complaints)\n• npci.org.in (UPI disputes)\n• rbi.org.in (Banking complaints)\n• sachet.rbi.org.in (Unauthorized schemes)\n\n💡 Tip: Save 1930 in your contacts right now!`,

      qr_scam: `📱 QR Code Scam — How It Works & How to Stay Safe\n\n🔴 How Scammers Use QR Codes:\n\nScammers send you a QR code claiming:\n• "Scan this to receive your refund"\n• "Scan this to claim your prize"\n• "Scan this to verify your account"\n\n⚠️ The Truth: QR codes in UPI are always used to SEND money, never to RECEIVE money!\n\nWhen you scan their QR code and enter your PIN, money goes FROM your account TO theirs.\n\n🛡️ Real Case Examples:\n• OLX seller scams: Buyer sends QR saying "payment confirmation" — you scan and lose money\n• Refund scams: Fake company sends QR for "refund processing"\n• Job scams: "Security deposit" via QR code\n\n✅ Golden Rules:\n1. You NEVER need to scan a QR to RECEIVE money\n2. If someone asks you to scan to get money — it's a SCAM\n3. Always verify: is this QR from a trusted merchant?\n4. Never enter your PIN unless you are BUYING something\n5. Check receiver name before confirming payment\n\n📞 Got scammed via QR? Call 1930 immediately!`,

      fake_call: `📞 Received a Suspicious Call? Here's What to Do\n\n🚨 Common Fake Call Scripts:\n\n"Your KYC is expired, account will be blocked"\n"You won ₹50 lakhs in our lucky draw"\n"I'm from bank, your account shows suspicious activity"\n"Your UPI has been hacked, give OTP to secure it"\n"Income Tax department — pay fine or face arrest"\n"Your delivery is held, pay customs duty"\n\n🔴 How to Identify Fake Calls:\n• Ask for their employee ID and call back on official number\n• Banks NEVER ask for OTP, PIN or password on call\n• Government agencies don't demand immediate payment on call\n• Urgency and threats are manipulation tactics\n• Poor grammar or accent inconsistencies\n\n✅ What To Do:\n1. Don't share any OTP, PIN or personal details\n2. Hang up immediately if you feel pressured\n3. Call back on official bank number (on back of card)\n4. Don't install any app they suggest (AnyDesk, TeamViewer etc.)\n5. Report the number at cybercrime.gov.in\n\n⚠️ If you already shared OTP:\n• Immediately call your bank to block account\n• Call 1930 to report fraud\n• Change all passwords and PINs`,

      otp_fraud: `🔐 OTP Fraud — Complete Guide\n\n❓ What is OTP Fraud?\nOne-Time Password (OTP) fraud is when criminals trick you into sharing the OTP sent to your phone, then use it to authorize fraudulent transactions.\n\n📌 How It Happens:\n\n1️⃣ The Setup\nFraudster calls pretending to be bank/UPI support and says there's an "urgent issue" with your account.\n\n2️⃣ Creating Trust\nThey correctly mention your name, last 4 digits of account — data bought from data breaches.\n\n3️⃣ The Request\n"We're sending an OTP to verify your identity. Please share it with me to resolve the issue."\n\n4️⃣ The Theft\nOnce you share OTP, they approve a transaction from your account.\n\n🛡️ How OTP Works (Real):\n• OTP is generated when a transaction is initiated\n• Sharing OTP = approving that transaction\n• Banks NEVER need your OTP — they generated it!\n• OTP messages always say "Don't share with anyone"\n\n✅ Rules:\n• NEVER share OTP — not even with bank employees\n• Read the OTP SMS carefully before using it\n• If OTP arrives without your initiation — someone is trying to transact\n• Immediately call bank if you receive unexpected OTPs\n\n📞 If you shared OTP: Call 1930 + Call your bank immediately!`,

      default: `🤖 I'm here to help!\n\nI can answer questions about:\n\n🔍 Fraud Types:\n• "What is UPI fraud?"\n• "What is QR code scam?"\n• "What is OTP fraud?"\n• "Fake call received"\n\n🛡️ Prevention:\n• "Safety tips"\n• "How to secure my UPI?"\n\n💸 Transaction Issues:\n• "Money deducted not received"\n• "Transaction pending"\n\n🆘 Emergency Help:\n• "I was scammed"\n• "Helplines"\n\nPlease type your question or tap a quick question below! 👇`,
    },

    hi: {
      what_is_fraud: `🚨 UPI धोखाधड़ी क्या है?\n\nUPI धोखाधड़ी तब होती है जब अपराधी आपके UPI खाते से पैसे चुराने के लिए धोखे का इस्तेमाल करते हैं।\n\n📌 सबसे सामान्य प्रकार:\n\n1️⃣ नकली कस्टमर केयर\nधोखेबाज बैंक/UPI ऐप सपोर्ट के रूप में पेश आते हैं और OTP या PIN मांगते हैं।\n\n2️⃣ QR कोड स्कैम\nवे QR कोड भेजते हैं "पैसे प्राप्त करने के लिए स्कैन करें" — लेकिन स्कैन करने से पैसे जाते हैं!\n\n3️⃣ फ़िशिंग लिंक\nनकली वेबसाइट जो बिल्कुल आपके बैंक जैसी दिखती है।\n\n4️⃣ नौकरी घोटाला\nआसान पैसों का वादा, फिर पहले निवेश करने को कहते हैं।\n\n5️⃣ लकी ड्रॉ / लॉटरी\n"आपने पुरस्कार जीता" लेकिन पहले छोटी फीस चाहिए।\n\n⚠️ याद रखें: बैंक कभी भी OTP, PIN या पासवर्ड नहीं मांगते!\n\n📞 पीड़ित होने पर: तुरंत 1930 पर कॉल करें!`,

      safety_tips: `🛡️ UPI सुरक्षा गाइड\n\n✅ हमेशा करें:\n• UPI ID दर्ज करने के बाद receiver का नाम जांचें\n• लेनदेन सूचनाएं चालू रखें\n• UPI ऐप पर app lock / fingerprint लगाएं\n• अज्ञात UPI ID को पहले ₹1 भेजकर सत्यापित करें\n• UPI ऐप को अपडेट रखें\n• मजबूत और अनोखा UPI PIN रखें\n\n❌ कभी न करें:\n• किसी के साथ OTP साझा न करें\n• UPI PIN किसी को न बताएं\n• "पैसे प्राप्त करने" के लिए QR कोड स्कैन न करें\n• SMS/WhatsApp के लिंक पर क्लिक करके भुगतान न करें\n• अगर कोई कहे तो screen sharing ऐप डाउनलोड न करें\n\n🔴 खतरे के संकेत:\n• जल्दी करने का दबाव\n• बहुत अच्छे ऑफर\n• अनजान कॉलर जो बैंक कर्मचारी बताए\n\n📞 धोखाधड़ी रिपोर्ट करें: 1930 | cybercrime.gov.in`,

      money_not_received: `💸 पैसे कटे पर नहीं मिले?\n\nघबराएं नहीं! यह आम समस्या है और आमतौर पर अपने आप ठीक हो जाती है।\n\n📋 चरण-दर-चरण गाइड:\n\n⏰ चरण 1: 48-72 घंटे प्रतीक्षा करें\nअधिकांश विफल लेनदेन 48 घंटों के भीतर स्वतः वापस आ जाते हैं।\n\n📱 चरण 2: लेनदेन स्थिति जांचें\n• UPI ऐप खोलें\n• Transaction History में जाएं\n• "Pending" या "Failed" स्थिति देखें\n\n📋 चरण 3: महत्वपूर्ण जानकारी नोट करें\n• UTR / Reference Number\n• लेनदेन की तारीख और समय\n• सटीक राशि\n• प्राप्तकर्ता का UPI ID\n\n🏦 चरण 4: बैंक से संपर्क करें (48 घंटे बाद)\n• बैंक हेल्पलाइन पर कॉल करें\n• UTR नंबर दें\n• विवाद दर्ज करवाएं\n• बैंक को 5 कार्य दिवसों में हल करना होगा (RBI नियम)\n\n💻 चरण 5: NPCI शिकायत\n• npci.org.in पर जाएं\n• UTR नंबर के साथ शिकायत दर्ज करें\n• NPCI हेल्पलाइन: 1800-120-1740\n\n⚖️ चरण 6: 30 दिन बाद भी हल न हो\n• Banking Ombudsman को शिकायत करें\n• bankingombudsman.rbi.org.in`,

      scammed: `🚨 धोखा हुआ — तुरंत कार्रवाई करें!\n\nहर मिनट महत्वपूर्ण है। जितनी जल्दी कार्रवाई करेंगे, पैसे वापस मिलने की संभावना उतनी अधिक।\n\n⚡ तत्काल कार्रवाई (पहले 1 घंटे में):\n\n📞 1. अभी 1930 पर कॉल करें\nराष्ट्रीय साइबर अपराध हेल्पलाइन। वे धोखाधड़ी वाले खाते को फ्रीज कर सकते हैं।\n\n🔒 2. अपना खाता ब्लॉक करें\n• Net banking से UPI / Debit card ब्लॉक करें\n• या बैंक हेल्पलाइन पर तुरंत कॉल करें\n\n🔑 3. सभी पासवर्ड बदलें\n• UPI PIN बदलें\n• Net banking पासवर्ड बदलें\n\n💻 4. ऑनलाइन शिकायत दर्ज करें\n• cybercrime.gov.in पर जाएं\n• Financial Fraud चुनें\n• सभी विवरण और स्क्रीनशॉट जमा करें\n\n🚔 5. पुलिस FIR दर्ज करें\n• नजदीकी थाने में जाएं\n• IT Act Section 66C और 66D के तहत FIR करें\n\n📞 हेल्पलाइन:\n• साइबर अपराध: 1930\n• NPCI: 1800-120-1740\n• RBI: 14448`,

      helplines: `📞 सभी महत्वपूर्ण हेल्पलाइन\n\n🆘 आपातकालीन:\n• राष्ट्रीय साइबर अपराध: 1930 (24/7)\n\n🏦 बैंकिंग:\n• RBI हेल्पलाइन: 14448\n• NPCI: 1800-120-1740\n• Banking Ombudsman: bankingombudsman.rbi.org.in\n\n👮 पुलिस:\n• साइबर क्राइम: cybercrime.gov.in\n• आपातकाल: 112\n\n📱 UPI ऐप हेल्पलाइन:\n• PhonePe: 080-68727374\n• Google Pay: 1-800-419-0157\n• Paytm: 0120-4456456\n• BHIM: 1800-120-1740\n\n🌐 महत्वपूर्ण वेबसाइट:\n• cybercrime.gov.in\n• npci.org.in\n• bankingombudsman.rbi.org.in\n\n💡 अभी 1930 को अपने contacts में save करें!`,

      qr_scam: `📱 QR कोड स्कैम\n\n🔴 धोखेबाज QR कोड का उपयोग कैसे करते हैं:\n\nधोखेबाज QR कोड भेजते हैं यह कहकर:\n• "रिफंड पाने के लिए स्कैन करें"\n• "पुरस्कार पाने के लिए स्कैन करें"\n• "खाता सत्यापित करने के लिए स्कैन करें"\n\n⚠️ सच्चाई: UPI में QR कोड हमेशा पैसे भेजने के लिए होता है, प्राप्त करने के लिए नहीं!\n\n✅ सुनहरे नियम:\n1. पैसे प्राप्त करने के लिए कभी QR स्कैन नहीं करना पड़ता\n2. अगर कोई "पैसे मिलेंगे, QR स्कैन करो" कहे — यह धोखा है\n3. भुगतान से पहले receiver का नाम जांचें\n4. PIN केवल तब डालें जब आप कुछ खरीद रहे हों\n\n📞 QR स्कैम का शिकार? तुरंत 1930 पर कॉल करें!`,

      fake_call: `📞 संदिग्ध कॉल आई? क्या करें\n\n🚨 सामान्य नकली कॉल:\n• "आपका KYC समाप्त हो गया, खाता बंद होगा"\n• "आपने ₹50 लाख जीते"\n• "बैंक से बोल रहा हूं, खाते में संदिग्ध गतिविधि"\n• "OTP दो, UPI सुरक्षित करना है"\n• "Income Tax — जुर्माना भरो वरना गिरफ्तारी"\n\n🔴 नकली कॉल कैसे पहचानें:\n• बैंक कभी OTP, PIN नहीं मांगते\n• सरकारी एजेंसी फोन पर तत्काल भुगतान नहीं मांगती\n• जल्दी और धमकी — यह हेरफेर की रणनीति है\n\n✅ क्या करें:\n1. कोई OTP, PIN या व्यक्तिगत जानकारी न दें\n2. दबाव महसूस होने पर तुरंत फोन रखें\n3. बैंक के आधिकारिक नंबर पर वापस कॉल करें\n4. AnyDesk, TeamViewer जैसे ऐप न डाउनलोड करें\n5. cybercrime.gov.in पर नंबर रिपोर्ट करें`,

      otp_fraud: `🔐 OTP धोखाधड़ी — पूरी जानकारी\n\n❓ OTP धोखाधड़ी क्या है?\nजब अपराधी आपको OTP साझा करने के लिए बरगलाते हैं और फिर उसका उपयोग करके लेनदेन को अधिकृत करते हैं।\n\n📌 यह कैसे होता है:\n\n1️⃣ सेटअप\nधोखेबाज बैंक/UPI सपोर्ट बनकर कॉल करता है।\n\n2️⃣ विश्वास बनाना\nवे आपका नाम, खाते के अंतिम 4 अंक सही बताते हैं — यह डेटा ब्रीच से खरीदा होता है।\n\n3️⃣ OTP मांगना\n"पहचान सत्यापित करने के लिए OTP बताइए"\n\n4️⃣ चोरी\nOTP मिलते ही वे आपके खाते से लेनदेन करते हैं।\n\n✅ नियम:\n• OTP कभी साझा न करें — बैंक कर्मचारी को भी नहीं\n• OTP SMS ध्यान से पढ़ें\n• बिना आपकी पहल के OTP आए — तो कोई लेनदेन कर रहा है\n\n📞 OTP साझा किया? तुरंत 1930 + बैंक को कॉल करें!`,

      default: `🤖 मैं मदद के लिए यहाँ हूं!\n\nमैं इन विषयों पर जवाब दे सकता हूं:\n\n🔍 धोखाधड़ी के प्रकार:\n• "UPI धोखाधड़ी क्या है?"\n• "QR कोड स्कैम"\n• "OTP धोखाधड़ी"\n• "नकली कॉल"\n\n🛡️ बचाव:\n• "सुरक्षा टिप्स"\n\n💸 लेनदेन समस्या:\n• "पैसे नहीं मिले"\n\n🆘 आपातकाल:\n• "मेरे साथ धोखा हुआ"\n• "हेल्पलाइन"\n\nकृपया अपना प्रश्न टाइप करें! 👇`,
    },

    gu: {
      what_is_fraud: `🚨 UPI છેતરપિંડી શું છે?\n\nUPI છેતરપિંડી ત્યારે થાય છે જ્યારે ગુનેગારો તમારા UPI ખાતામાંથી પૈસા ચોરવા છળ-કપટ વાપરે છે.\n\n📌 સૌથી સામાન્ય પ્રકારો:\n\n1️⃣ નકલી કસ્ટમર કેર\nઠગ લોકો બૅન્ક/UPI સપોર્ટ તરીકે ઓળખ આપે અને OTP કે PIN માંગે.\n\n2️⃣ QR કોડ સ્કૅમ\n"પૈસા મેળવવા QR સ્કૅન કરો" — પણ સ્કૅન કરવાથી પૈસા જાય છે!\n\n3️⃣ ફિશિંગ લિન્ક\nબૅન્ક જેવી દેખાતી નકલી વેબસાઇટ.\n\n4️⃣ નોકરીનો ઘોટાળો\nસહેલા પૈસાનું વચન, પછી પહેલા રોકાણ કરવા કહે.\n\n5️⃣ લકી ડ્રૉ / લૉટરી\n"તમે ઇનામ જીત્યા" પણ પહેલા નાની ફી ભરો.\n\n⚠️ યાદ રાખો: બૅન્ક ક્યારેય OTP, PIN કે પાસવર્ડ માંગતી નથી!\n\n📞 ભોગ બનો તો: તરત 1930 પર કૉલ કરો!`,

      safety_tips: `🛡️ UPI સુરક્ષા માર્ગદર્શિકા\n\n✅ હંમેશા કરો:\n• UPI ID દાખલ કર્યા પછી receiver નું નામ ચકાસો\n• વ્યવહારની સૂચનાઓ ચાલુ રાખો\n• UPI એપ પર app lock / fingerprint વાપરો\n• અજાણ્યા UPI ID ને પ્રથમ ₹1 મોકલી ચકાસો\n• UPI એપ અપડેટ રાખો\n• મજબૂત UPI PIN રાખો\n\n❌ ક્યારેય ન કરો:\n• OTP કોઈ સાથે શેર ન કરો\n• UPI PIN કોઈને ન જણાવો\n• "પૈસા મળશે" માટે QR સ્કૅન ન કરો\n• SMS/WhatsApp ના link પર ક્લિક કરી ચૂકવણી ન કરો\n• Screen sharing એપ ડાઉનલોડ ન કરો\n\n🔴 ખતરાના સંકેતો:\n• ઉતાવળ અને દબાણ\n• અત્યંત આકર્ષક ઑફર\n• અજાણ્યો કૉલ કરનાર બૅન્ક સ્ટાફ તરીકે ઓળખાવે\n\n📞 છેતરપિંડી રિપોર્ટ: 1930 | cybercrime.gov.in`,

      money_not_received: `💸 પૈસા કપાયા પણ ન મળ્યા?\n\nગભરાશો નહીં! આ સામાન્ય સમસ્યા છે અને સામાન્ય રીતે આપોઆપ ઠીક થઈ જાય છે.\n\n📋 પગલું-દર-પગલું માર્ગદર્શન:\n\n⏰ પગલું 1: 48-72 કલાક રાહ જુઓ\nમોટા ભાગના નિષ્ફળ વ્યવહારો 48 કલાકમાં આપોઆપ પાછા આવે છે.\n\n📱 પગલું 2: વ્યવહારની સ્થિતિ તપાસો\n• UPI એપ ખોલો\n• Transaction History માં જાઓ\n• "Pending" અથવા "Failed" સ્થિતિ જુઓ\n\n📋 પગલું 3: મહત્વની માહિતી નોંધો\n• UTR / Reference Number\n• વ્યવહારની તારીખ અને સમય\n• ચોક્કસ રકમ\n• પ્રાપ્તકર્તાનો UPI ID\n\n🏦 પગલું 4: બૅન્કનો સંપર્ક કરો (48 કલાક પછી)\n• બૅન્ક હેલ્પલાઇન પર કૉલ કરો\n• UTR નંબર આપો\n• વિવાદ નોંધાવો\n\n💻 પગલું 5: NPCI ફરિયાદ\n• npci.org.in પર જાઓ\n• NPCI: 1800-120-1740`,

      scammed: `🚨 છેતરપિંડી થઈ — તરત પગલાં ભરો!\n\nદરેક મિનિટ મહત્વની છે.\n\n⚡ તાત્કાલિક પગલાં (પ્રથમ 1 કલાક):\n\n📞 1. અત્યારે 1930 પર કૉલ કરો\nરાષ્ટ્રીય સાઇબર ક્રાઇમ હેલ્પલાઇન. તેઓ છેતરપિંડી ખાતું freeze કરી શકે.\n\n🔒 2. તમારું ખાતું Block કરો\n• Net banking થી UPI / Debit card block કરો\n• અથવા બૅન્ક હેલ્પલાઇન પર તરત કૉલ કરો\n\n🔑 3. બધા પાસવર્ડ બદલો\n• UPI PIN બદલો\n• Net banking પાસવર્ડ બદલો\n\n💻 4. ઑનલાઇન ફરિયાદ નોંધાવો\n• cybercrime.gov.in પર જાઓ\n• Financial Fraud પસંદ કરો\n• બધી વિગતો અને screenshots સાથે ફરિયાદ કરો\n\n🚔 5. પોલીસ FIR નોંધાવો\n• નજીકના પોલીસ સ્ટેશને જાઓ\n• IT Act Section 66C અને 66D હેઠળ FIR\n\n📞 હેલ્પલાઇન:\n• સાઇબર ક્રાઇમ: 1930\n• NPCI: 1800-120-1740`,

      helplines: `📞 બધી મહત્વની હેલ્પલાઇન\n\n🆘 આપાતકાળ:\n• રાષ્ટ્રીય સાઇબર ક્રાઇમ: 1930 (24/7)\n\n🏦 બૅન્કિંગ:\n• RBI હેલ્પલાઇન: 14448\n• NPCI: 1800-120-1740\n\n👮 પોલીસ:\n• સાઇબર ક્રાઇમ: cybercrime.gov.in\n• આપાતકાળ: 112\n\n📱 UPI એપ હેલ્પલાઇન:\n• PhonePe: 080-68727374\n• Google Pay: 1-800-419-0157\n• Paytm: 0120-4456456\n• BHIM: 1800-120-1740\n\n🌐 મહત્વની વેબસાઇટ:\n• cybercrime.gov.in\n• npci.org.in\n\n💡 અત્યારે 1930 ને contacts માં save કરો!`,

      qr_scam: `📱 QR કોડ સ્કૅમ\n\n🔴 ઠગ QR કોડ કેવી રીતે વાપરે:\n\nઠગ QR કોડ મોકલે:\n• "રિફંડ મેળવવા સ્કૅન કરો"\n• "ઇનામ મેળવવા સ્કૅન કરો"\n• "ખાતું verify કરવા સ્કૅન કરો"\n\n⚠️ સત્ય: UPI માં QR કોડ હંમેશા પૈસા મોકલવા માટે હોય, મેળવવા નહીં!\n\n✅ સુવર્ણ નિયમો:\n1. પૈસા મેળવવા ક્યારેય QR સ્કૅન કરવો પડતો નથી\n2. "પૈસા મળશે, QR સ્કૅન કરો" — આ છેતરપિંડી છે\n3. ચૂકવણી પહેલા receiver નું નામ ચકાસો\n\n📞 QR સ્કૅમ થયો? તરત 1930 પર કૉલ કરો!`,

      fake_call: `📞 શંકાસ્પદ કૉલ આવ્યો? શું કરવું\n\n🚨 સામાન્ય નકલી કૉલ:\n• "તમારું KYC પૂરું થઈ ગયું, ખાતું બંધ થશે"\n• "તમે ₹50 લાખ જીત્યા"\n• "બૅન્કમાંથી બોલું છું, ખાતામાં શંકાસ્પદ ગતિવિધિ"\n• "OTP આપો, UPI સુરક્ષિત કરવું છે"\n\n🔴 નકલી કૉલ કેવી રીતે ઓળખો:\n• બૅન્ક ક્યારેય OTP, PIN નથી માંગતી\n• ઉતાવળ અને ધમકી — આ ચાલ છે\n\n✅ શું કરવું:\n1. OTP, PIN કે અંગત માહિતી ન આપો\n2. દબાણ લાગે તો ફોન મૂકી દો\n3. બૅન્કના સત્તાવાર નંબર પર વાપસ કૉલ કરો\n4. AnyDesk, TeamViewer એપ ડાઉનલોડ ન કરો`,

      otp_fraud: `🔐 OTP છેતરપિંડી\n\n❓ OTP છેતરપિંડી શું છે?\nજ્યારે ગુનેગારો OTP શેર કરાવી ટ્રાન્ઝૅક્શન authorize કરે.\n\n📌 આ કેવી રીતે થાય:\n1. ઠગ બૅન્ક/UPI સપોર્ટ તરીકે કૉલ કરે\n2. તમારું નામ, ખાતાના છેલ્લા 4 અંક સાચા કહે\n3. "ઓળખ verify કરવા OTP કહો"\n4. OTP મળ્યા બાદ ટ્રાન્ઝૅક્શન કરે\n\n✅ નિયમો:\n• OTP ક્યારેય શેર ન કરો — બૅન્ક કર્મચારીને પણ નહીં\n• OTP SMS ધ્યાનથી વાંચો\n• વિના કારણ OTP આવે — કોઈ ટ્રાન્ઝૅક્શન કરી રહ્યું છે\n\n📞 OTP share કર્યો? તરત 1930 + બૅન્ક ને કૉલ કરો!`,

      default: `🤖 હું મદદ માટે અહીં છું!\n\nહું આ વિષયો પર જવાબ આપી શકું:\n\n🔍 છેતરપિંડીના પ્રકારો:\n• "UPI છેતરપિંડી શું છે?"\n• "QR કોડ સ્કૅમ"\n• "OTP છેતરપિંડી"\n• "નકલી કૉલ"\n\n🛡️ બચાવ:\n• "સુરક્ષા ટિપ્સ"\n\n💸 વ્યવહાર સમસ્યા:\n• "પૈસા ન મળ્યા"\n\n🆘 આપાતકાળ:\n• "મારી સાથે છેતરપિંડી થઈ"\n• "હેલ્પલાઇન"\n\nકૃપા કરી તમારો પ્રશ્ન ટાઇપ કરો! 👇`,
    },
  };

  const r = responses[lang];

  if (t.includes('what is') || t.includes('क्या है') || t.includes('શું છે') || t.includes('type') || t.includes('kind') || (t.includes('fraud') && t.length < 30))
    return r.what_is_fraud;
  if (t.includes('safe') || t.includes('tip') || t.includes('सुरक्षित') || t.includes('सुरक्षा') || t.includes('સુરક્ષિત') || t.includes('સુરક્ષા') || t.includes('prevent') || t.includes('protect'))
    return r.safety_tips;
  if (t.includes('deduct') || t.includes('not receiv') || t.includes('pending') || t.includes('कटे') || t.includes('नहीं मिले') || t.includes('કપાયા') || t.includes('ન મળ્યા') || t.includes('stuck'))
    return r.money_not_received;
  if (t.includes('scam') || t.includes('scammed') || t.includes('lost money') || t.includes('धोखा हुआ') || t.includes('छेतरपिंडी थई') || t.includes('victim') || t.includes('stole') || t.includes('stolen'))
    return r.scammed;
  if (t.includes('helpline') || t.includes('number') || t.includes('contact') || t.includes('हेल्पलाइन') || t.includes('હેલ્પ') || t.includes('1930') || t.includes('call'))
    return r.helplines;
  if (t.includes('qr') || t.includes('scan'))
    return r.qr_scam;
  if (t.includes('fake call') || t.includes('नकली कॉल') || t.includes('નકલી') || t.includes('suspicious call') || t.includes('unknown call'))
    return r.fake_call;
  if (t.includes('otp'))
    return r.otp_fraud;

  return r.default;
};

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState("en");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "assistant", text: LANGUAGES[lang].welcome }]);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const changeLang = (newLang) => {
    setLang(newLang);
    setMessages([{ role: "assistant", text: LANGUAGES[newLang].welcome }]);
  };

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      const reply = getResponse(text, lang);
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
      setLoading(false);
    }, 600);
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed", bottom: "24px", right: "24px",
          zIndex: 9999, width: "56px", height: "56px",
          borderRadius: "50%", background: "#2563eb",
          border: "none", cursor: "pointer", fontSize: "24px",
          color: "white", boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {open ? "✕" : "🤖"}
      </button>

      {open && (
        <div style={{
          position: "fixed", bottom: "90px", right: "24px",
          zIndex: 9999, width: "360px", height: "520px",
          background: "#111827", borderRadius: "16px",
          border: "1px solid #374151",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            background: "#1d4ed8", padding: "14px 16px",
            display: "flex", justifyContent: "space-between",
            alignItems: "center", flexShrink: 0,
          }}>
            <div>
              <div style={{ fontWeight: "bold", color: "white", fontSize: "14px" }}>
                🤖 FraudGuard AI
              </div>
              <div style={{ color: "#bfdbfe", fontSize: "11px" }}>
                UPI Fraud Assistant • Available 24/7
              </div>
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              {Object.keys(LANGUAGES).map((code) => (
                <button key={code} onClick={() => changeLang(code)}
                  style={{
                    padding: "3px 8px", borderRadius: "6px",
                    fontSize: "11px", fontWeight: "600", cursor: "pointer",
                    border: "none",
                    background: lang === code ? "white" : "#2563eb",
                    color: lang === code ? "#1d4ed8" : "white",
                  }}>
                  {code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "12px",
            display: "flex", flexDirection: "column", gap: "8px",
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}>
                <div style={{
                  maxWidth: "85%",
                  padding: "10px 14px",
                  borderRadius: msg.role === "user"
                    ? "16px 16px 4px 16px"
                    : "16px 16px 16px 4px",
                  background: msg.role === "user" ? "#2563eb" : "#1f2937",
                  color: msg.role === "user" ? "white" : "#e5e7eb",
                  fontSize: "13px", lineHeight: "1.6",
                  whiteSpace: "pre-line",
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{
                  padding: "10px 14px", borderRadius: "16px",
                  background: "#1f2937", color: "#9ca3af", fontSize: "13px",
                }}>
                  ● ● ●
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick questions */}
          <div style={{
            padding: "8px 10px", display: "flex", gap: "6px",
            overflowX: "auto", flexShrink: 0,
            borderTop: "1px solid #1f2937",
          }}>
            {quickQuestions[lang].map((q, i) => (
              <button key={i} onClick={() => sendMessage(q)}
                style={{
                  flexShrink: 0, background: "#1f2937", color: "#d1d5db",
                  border: "1px solid #374151", padding: "5px 10px",
                  borderRadius: "20px", fontSize: "11px",
                  cursor: "pointer", whiteSpace: "nowrap",
                }}>
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{
            padding: "12px", borderTop: "1px solid #374151",
            display: "flex", gap: "8px", flexShrink: 0,
          }}>
            <input
              type="text" value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder={
                lang === "hi" ? "संदेश लिखें..." :
                lang === "gu" ? "સંદેશ લખો..." :
                "Type your question..."
              }
              style={{
                flex: 1, background: "#1f2937", color: "white",
                border: "1px solid #374151", borderRadius: "8px",
                padding: "8px 12px", fontSize: "13px", outline: "none",
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              style={{
                background: "#2563eb", color: "white", border: "none",
                borderRadius: "8px", padding: "8px 14px",
                cursor: "pointer", fontSize: "16px",
                opacity: loading || !input.trim() ? 0.5 : 1,
              }}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;