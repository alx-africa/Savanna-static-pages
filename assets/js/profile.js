(() => {
  "use strict";

  const storageKey = "savanna-profile";
  let currentLanguage = "en";
  const translations = {
    "Skip to main content": "ወደ ዋናው ገጽ ይለፉ",
    "Savanna home": "የSavanna መነሻ ገጽ",
    "MY PROFILE": "የእኔ የግል መረጃ (ፕሮፋይል)",
    "Your profile, your path": "የእርስዎ መረጃ፣ የእርስዎ ምርጫ",
    "Keep your information private while you build skills and find work that fits you.":
      "ሚስጥርዎ ተጠብቆ ክህሎትዎን ያዳብሩ፤ ለእርስዎ የሚስማማ ሥራም ያግኙ።",
    "IDENTITY STATUS": "የማንነት ማረጋገጫ",
    "Your account is verified": "መለያዎ ተረጋግጧል",
    "You joined with a partner referral. No kebele ID or passport is required.":
      "በአጋር ድርጅት በኩል ስለተመዘገቡ የቀበሌ መታወቂያ ወይም ፓስፖርት አያስፈልግዎትም።",
    "✓ Partner referral · AAAPD": "✓ በአጋር ድርጅት የተመዘገበ · AAAPD",
    "Add another document (optional)": "ሌላ ማስረጃ ያያይዙ (ከፈለጉ ብቻ)",
    "Stored on this device until you choose to share it.":
      "ለሌላ አካል እስካላጋሩት ድረስ በስልክዎ ወይም በኮምፒውተርዎ ላይ ብቻ ይቀመጣል።",
    "Your progress saves on this device.": "የሞሉት መረጃ በዚሁ መሣሪያ ላይ ይቀመጣል።",
    "STEP 1 OF 3": "ደረጃ 1 ከ 3",
    "Tell us about you": "ስለ እርስዎ ይንገሩን",
    "Profile 33%": "መረጃዎ 33% ተሞልቷል",
    Name: "ሙሉ ስም",
    "City or region": "ከተማ ወይም ክልል",
    "Short introduction": "ስለ እርስዎ አጭር መግለጫ",
    "You can type or use the microphone. You will review words before saving.":
      "በጽሑፍ መጻፍ ወይም በድምፅ መናገር ይችላሉ። ከመቀመጡ በፊት ጽሑፉን አይተው ማስተካከል ይችላሉ።",
    "Skills and strengths": "ያሉዎት ክህሎቶች እና ችሎታዎች",
    "For example: customer service, sewing, bookkeeping, or repair.":
      "ለምሳሌ፦ ደንበኛ ማስተናገድ፣ ልብስ ስፌት፣ ሂሳብ መመዝገብ ወይም ጥገና።",
    "Project or work history": "ከዚህ በፊት የሰሩት ሥራ ወይም ልምድ",
    "Save profile": "መረጃውን ያስቀምጡ",
    "PRIVATE SUPPORT": "ሚስጥራዊ የድጋፍ ጥያቄ",
    "What support would help you learn?": "ለመማር ምን ዓይነት እገዛ ያስፈልግዎታል?",
    "This request is completely confidential, requires zero medical proof, and is used solely to match you with the right support.":
      "ይህ ጥያቄ ሙሉ በሙሉ በሚስጥር ይያዛል። ምንም የሕክምና ማስረጃ አይጠይቅም፤ የሚያስፈልግዎትን እገዛ ለማዘጋጀት ብቻ ይጠቅማል።",
    "Learning coach": "የትምህርት አጋዥ (አሰልጣኝ)",
    "Technology or device help": "የስልክ፣ የኮምፒውተር ወይም የቴክኖሎጂ እገዛ",
    "Connectivity support": "የኢንተርኔት ወይም የስልክ ካርድ ድጋፍ",
    "Flexible schedule": "እንደ ሁኔታው የሚስተካከል የትምህርት ሰዓት",
    "Save private request": "የድጋፍ ጥያቄውን ያስቀምጡ",
    "Choose any support you need": "የሚያስፈልግዎትን እገዛ ይምረጡ",
    "CAREER GATEWAY": "የሥራ እድሎች",
    "Find work that fits": "ለእርስዎ የሚስማማ ሥራ ያግኙ",
    "Private matching": "ሚስጥራዊ የሥራ ማገናኘት",
    "Choose support you need privately. Employers only see the skills and accommodations they can provide.":
      "የሚያስፈልግዎትን እገዛ በሚስጥር ይምረጡ። አሠሪዎች የሚያዩት ችሎታዎትን እና እነሱ ሊያሟሉ የሚችሉትን የሥራ ቦታ ድጋፍ ብቻ ነው።",
    "Support I need at work": "በሥራ ቦታ የሚያስፈልገኝ እገዛ",
    "Flexible hours": "የሚመች / የሚስተካከል የሥራ ሰዓት",
    "Remote or low-travel work": "ከቤት የሚሰራ ወይም ብዙ መንገድ የሌለው ሥራ",
    "Screen-reader friendly tools":
      "ለዓይነ ስውራን ማንበቢያ (Screen Reader) የሚመቹ መሣሪያዎች",
    "Customer support assistant": "የደንበኞች አገልግሎት ባለሙያ",
    "Blue Nile Cooperative · Addis Ababa / remote":
      "ብሉ ናይል ሕብረት ሥራ · አዲስ አበባ / ከቤት የሚሰራ",
    "Digital records assistant": "የዲጂታል መዝገብ አያያዝ ረዳት",
    "Open Hands Ethiopia · Remote": "ኦፕን ሃንድስ ኢትዮጵያ · ከቤት የሚሰራ",
    "Accessible tools": "ለአካል ጉዳተኞች ምቹ የሆኑ መሣሪያዎች",
    Apply: "ያመልክቱ",
    "FOR EMPLOYERS": "ለአሠሪዎች",
    "List workplace accommodations": "በሥራ ቦታ ያዘጋጇቸውን ድጋፎች ይዘርዝሩ",
    "Role title": "የሥራ መደቡ መጠሪያ",
    Organisation: "የድርጅቱ ስም",
    "Accommodations available": "የተዘጋጁ የሥራ ቦታ ድጋፎች",
    "Physical access": "ለእንቅስቃሴ ምቹ የሆነ የሥራ ቦታ (ለምሳሌ፦ ለዊልቸር)",
    "Assistive technology": "አጋዥ የቴክኖሎጂ መሣሪያዎች",
    "Flexible scheduling": "የሚስተካከል የሥራ ሰዓት",
    "Save job details": "የሥራ ዝርዝሩን ያስቀምጡ",
    "Share only when you choose": "መረጃዎን የሚያጋሩት እርስዎ ሲፈቅዱ ብቻ ነው",
    "Would you like an AAAPD partner to help register or update your profile?":
      "የAAAPD ባለሙያ መረጃዎን እንዲሞሉልዎት ወይም እንዲያስተካክሉልዎት ይፈልጋሉ?",
    "Yes, I consent to AAAPD partner support": "አዎ፣ የAAAPD ባለሙያ እንዲያግዘኝ እፈቅዳለሁ",
    "Save & resume by SMS": "ያስቀምጡ እና በአጭር የጽሑፍ መልእክት (SMS) ይቀጥሉ",
    "YOUR CHOICE": "የእርስዎ ምርጫ",
    "Read this page aloud": "ይህን ገጽ በድምፅ አሰማኝ",
    "🔊 Read this page aloud": "🔊 ይህን ገጽ በድምፅ አሰማኝ",
    "Use simple view": "ቀላል የገጽ እይታን ይጠቀሙ",
    "Use standard view": "መደበኛ የገጽ እይታን ይጠቀሙ",
    "Review your words": "በድምፅ የተጻፈውን ያረጋግጡ",
    "Check the transcription. Edit it or record again before adding it to your profile.":
      "በድምፅ የተጻፈውን ጽሑፍ ይመልከቱ። ወደ መረጃዎ ከመጨመርዎ በፊት ማስተካከል ወይም እንደገና በድምፅ መቅዳት ይችላሉ።",
    "Transcribed text": "በድምፅ የተጻፈው ጽሑፍ",
    Cancel: "ይቅር",
    "Record again": "እንደገና በድምፅ ይቅዱ",
    "Use this text": "ይህን ጽሑፍ ይጠቀሙ",
    "Why would you be a good fit?": "ለዚህ ሥራ ለምን ተስማሚ ነዎት?",
    "Save application": "ማመልከቻውን ያስቀምጡ",
    "Dictate short introduction using voice": "አጭር መግለጫዎን በድምፅ ይናገሩ",
    "Dictate skills and strengths using voice": "ክህሎትዎን እና ችሎታዎን በድምፅ ይናገሩ",
    "Dictate project or work history using voice": "የሥራ ልምድዎን በድምፅ ይናገሩ",
    "Dictate application answer using voice": "የማመልከቻ መልስዎን በድምፅ ይናገሩ",
  };
  const englishByAmharic = Object.fromEntries(
    Object.entries(translations).map(([english, amharic]) => [
      amharic,
      english,
    ]),
  );

  function translatePage(language) {
    const dictionary = language === "am" ? translations : englishByAmharic;
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const trimmed = node.nodeValue.trim();
      if (dictionary[trimmed])
        node.nodeValue = node.nodeValue.replace(trimmed, dictionary[trimmed]);
    });
    document.querySelectorAll("[aria-label]").forEach((element) => {
      const translated = dictionary[element.getAttribute("aria-label")];
      if (translated) element.setAttribute("aria-label", translated);
    });
  }
  const save = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* local-only enhancement */
    }
  };
  const load = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key) || "null");
    } catch {
      return null;
    }
  };
  const status = (message) => {
    document.getElementById("save-status").textContent =
      currentLanguage === "am" && translations[message]
        ? translations[message]
        : message;
  };

  function setupLanguage() {
    const button = document.getElementById("language-toggle");
    button.addEventListener("click", () => {
      const amharic = document.documentElement.lang !== "am";
      currentLanguage = amharic ? "am" : "en";
      document.documentElement.lang = amharic ? "am" : "en";
      button.setAttribute("aria-pressed", String(amharic));
      button.textContent = amharic ? "English / አማ" : "አማ / English";
      translatePage(currentLanguage);
    });
  }

  function setupReadAloud() {
    document.getElementById("read-aloud").addEventListener("click", () => {
      const text = document
        .getElementById("main-content")
        .textContent.replace(/\s+/g, " ")
        .trim();
      const isAmharic = document.documentElement.lang === "am";
      if (isAmharic && !/[\u1200-\u137F]/.test(text)) {
        status(
          "Amharic text is not available to read yet. Choose Amharic and try again.",
        );
        return;
      }
      status(isAmharic ? "Generating Amharic audio…" : "Generating audio…");
      fetch("/api/gemini-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: isAmharic ? "am-ET" : "en-US" }),
      })
        .then(async (response) => {
          const result = await response.json();
          if (!response.ok)
            throw new Error(result.error || "Gemini audio request failed.");
          return result;
        })
        .then(({ audio, mimeType }) => {
          const bytes = Uint8Array.from(atob(audio), (character) =>
            character.charCodeAt(0),
          );
          const player = new Audio(
            URL.createObjectURL(
              new Blob([bytes], { type: mimeType || "audio/wav" }),
            ),
          );
          player.onended = () => URL.revokeObjectURL(player.src);
          return player.play();
        })
        .then(() =>
          status(isAmharic ? "Amharic audio is playing." : "Audio is playing."),
        )
        .catch((error) => status(error.message));
    });
  }

  function setupVoice() {
    let activeTarget = null;
    let recognition = null;
    const review = document.getElementById("voice-review");
    const text = document.getElementById("voice-text");
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const start = (target) => {
      activeTarget = target;
      if (!SpeechRecognition) {
        status("Voice input is not supported here. You can type instead.");
        target.focus();
        return;
      }
      recognition = new SpeechRecognition();
      recognition.lang =
        document.documentElement.lang === "am" ? "am-ET" : "en-US";
      recognition.interimResults = false;
      recognition.onstart = () => status("Listening… speak now.");
      recognition.onerror = () =>
        status(
          "Voice input could not be completed. Please try again or type instead.",
        );
      recognition.onresult = (event) => {
        text.value = event.results[0][0].transcript;
        review.showModal();
        status("Review your transcription before using it.");
      };
      recognition.start();
    };
    document.querySelectorAll("[data-voice-target]").forEach((button) => {
      button.addEventListener("click", () =>
        start(document.getElementById(button.dataset.voiceTarget)),
      );
    });
    document.getElementById("record-again").addEventListener("click", () => {
      review.close();
      if (activeTarget) start(activeTarget);
    });
    document.getElementById("use-voice-text").addEventListener("click", () => {
      if (activeTarget) activeTarget.value = text.value;
      review.close();
      status("Voice text added. Save the form when ready.");
    });
  }

  function setupProfile() {
    const form = document.getElementById("profile-form");
    const saved = load(storageKey);
    if (saved)
      Object.keys(saved).forEach((key) => {
        const field = form.elements[key];
        if (field) field.value = saved[key];
      });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      save(storageKey, data);
      status("Profile saved on this device.");
    });
    document.getElementById("save-support").addEventListener("click", () => {
      save(
        "savanna-support",
        [...document.querySelectorAll('input[name="support"]:checked')].map(
          (input) => input.value,
        ),
      );
      status("Your private support request is saved on this device.");
    });
  }

  function setupJobs() {
    const jobs = [...document.querySelectorAll(".job-card")];
    document.querySelectorAll(".job-support").forEach((input) =>
      input.addEventListener("change", () => {
        const selected = [
          ...document.querySelectorAll(".job-support:checked"),
        ].map((item) => item.value);
        jobs.forEach((job) => {
          job.hidden =
            selected.length > 0 &&
            !selected.some((value) =>
              job.dataset.support.split(" ").includes(value),
            );
        });
      }),
    );
    const dialog = document.getElementById("application-dialog");
    const result = document.getElementById("application-result");
    document.querySelectorAll(".apply-button").forEach((button) =>
      button.addEventListener("click", () => {
        document.getElementById("application-job").textContent =
          `Applying for ${button.dataset.job}`;
        dialog.dataset.job = button.dataset.job;
        dialog.showModal();
      }),
    );
    document
      .getElementById("close-application")
      .addEventListener("click", () => dialog.close());
    document
      .getElementById("application-form")
      .addEventListener("submit", (event) => {
        event.preventDefault();
        save("savanna-application", {
          job: dialog.dataset.job,
          answer: document.getElementById("application-answer").value,
        });
        result.textContent = "Application saved privately on this device.";
        setTimeout(() => dialog.close(), 900);
      });
  }

  function setupEmployerAndConsent() {
    document
      .getElementById("employer-form")
      .addEventListener("submit", (event) => {
        event.preventDefault();
        const form = event.target;
        save("savanna-employer-job", {
          role: form.role.value,
          organisation: form.employer.value,
          accommodations: [
            ...form.querySelectorAll('[name="accommodation"]:checked'),
          ].map((item) => item.value),
        });
        document.getElementById("employer-result").textContent =
          "Job details saved locally. You can share them when ready.";
      });
    document.getElementById("sms-resume").addEventListener("click", () => {
      const result = document.getElementById("sms-result");
      if (!document.getElementById("partner-consent").checked) {
        result.textContent =
          "Please give consent before requesting a resume link.";
        return;
      }
      result.textContent =
        "A secure resume link would be sent after you confirm your phone number. No link was sent in this offline demo.";
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    document
      .getElementById("literacy-toggle")
      .addEventListener("click", (event) => {
        const simple = document.body.classList.toggle("simple-view");
        event.currentTarget.setAttribute("aria-pressed", String(simple));
        const englishLabel = simple ? "Use standard view" : "Use simple view";
        event.currentTarget.textContent =
          currentLanguage === "am" ? translations[englishLabel] : englishLabel;
      });
    setupLanguage();
    setupReadAloud();
    setupVoice();
    setupProfile();
    setupJobs();
    setupEmployerAndConsent();
  });
})();
