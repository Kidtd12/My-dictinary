document.addEventListener("DOMContentLoaded", () => {
  const translateBtn = document.getElementById("translateBtn");
  const inputText = document.getElementById("inputText");
  const targetLang = document.getElementById("targetLang");
  const translatedText = document.getElementById("translatedText");
  const spinner = document.getElementById("spinner");
  const btnText = document.getElementById("btnText");
  const toggleDark = document.getElementById("toggleDark");
  const voiceBtn = document.getElementById("voiceBtn");

  

  // Theme handler
  function setDarkMode(mode) {
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  toggleDark.onclick = () => {
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark ? "light" : "dark");
  };

  // Set theme on load
  const savedTheme = localStorage.getItem("theme") || "light";
  setDarkMode(savedTheme);

  // Translation handler
  translateBtn.onclick = async () => {
    const text = inputText.value.trim().toLowerCase();
    const lang = targetLang.value;

    if (!text) return;

    spinner.classList.remove("hidden");
    btnText.textContent = "Translating...";
    translatedText.textContent = "";

    if (lang === "gez") {
      // Ge'ez translation from dictionary
      try {
       const res = await fetch("data/dictionary.json");

        if (!res.ok) throw new Error("Failed to load dictionary");
        const dict = await res.json();
        const words = text.split(" ");
        const translated = words.map(w => dict[w] ? dict[w] : `(no match: ${w})`);

        translatedText.textContent = translated.join(" ");
      } catch (err) {
        translatedText.textContent = "❌ Error loading Ge'ez dictionary.";
        console.error(err);
      } finally {
        spinner.classList.add("hidden");
        btnText.textContent = "Translate";
      }
      return;
    }

    // Online translation (MyMemory)
    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${lang}`);
      const data = await res.json();
      translatedText.textContent = data.responseData.translatedText || "Translation not found.";
    } catch (err) {
      translatedText.textContent = "❌ Failed to fetch translation.";
    } finally {
      spinner.classList.add("hidden");
      btnText.textContent = "Translate";
    }
  };

  // Voice input
  voiceBtn.onclick = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech Recognition not supported!");
      return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (e) => {
      inputText.value = e.results[0][0].transcript;
    };

    recognition.onerror = (e) => {
      alert("Voice error: " + e.error);
    };

    recognition.start();
  };
});






function showLoading() {
  translatedText.innerHTML = `<div class="text-center text-sm animate-pulse text-indigo-400">Translating...</div>`;
}







function speakResult() {
  const result = document.getElementById("translatedText").innerText;
  if (!result) return alert("⚠️ No translation to speak!");

  const utterance = new SpeechSynthesisUtterance(result);
  utterance.lang = 'gez'; // Try 'gez', fallback will be English if unsupported

  // Try setting a Ge'ez-compatible voice if available
  const voices = speechSynthesis.getVoices();
  const gezVoice = voices.find(v => v.lang.toLowerCase().includes("gez"));
  if (gezVoice) utterance.voice = gezVoice;

  speechSynthesis.cancel(); // Cancel previous speech
  speechSynthesis.speak(utterance);
}








const apiKey = 'YOUR_API_KEY'; // replace with your Google key

async function translateToOromo(text) {
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      q: text,
      target: 'om',
      source: 'en',
      format: 'text'
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const data = await res.json();
  return data.data.translations[0].translatedText;
}




