document.addEventListener("DOMContentLoaded", () => {
    const generateButton = document.getElementById("generate-button");
    const messageDisplay = document.getElementById("message");
    const passageDisplay = document.getElementById("passage");
    const shareWhatsApp = document.getElementById("share-whatsapp");
    const copyText = document.getElementById("copy-text");
    const toast = document.getElementById("toast");
    const audioElement = document.getElementById('background-music');

    let blessings = [];
    let isGenerating = false;

    const fetchBlessings = async () => {
        try {
            const response = await fetch("/api/blessings");
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            blessings = data.blessings;
        } catch (error) {
            console.error("Error loading blessings:", error);
            messageDisplay.textContent = "Error loading blessings. Please try again.";
            passageDisplay.textContent = "";
        }
    };

    const shareOnWhatsApp = () => {
        const text = `${messageDisplay.textContent} ${passageDisplay.textContent}`;
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(url);
    };

    const generateBlessing = () => {
        if (isGenerating) return;
        isGenerating = true;
        generateButton.disabled = true;

        try {
            if (blessings.length > 0) {
                const randomIndex = Math.floor(Math.random() * blessings.length);
                const randomBlessing = blessings[randomIndex];

                messageDisplay.textContent = `"${randomBlessing.text}"`;
                passageDisplay.textContent = `- ${randomBlessing.passage || "Unknown"}`;
                passageDisplay.style.visibility = "visible";
                passageDisplay.style.opacity = "1";
                
                audioElement.play();
            }
        } catch (error) {
            console.error("Error generating blessing:", error);
            messageDisplay.textContent = "An error occurred. Please try again.";
            passageDisplay.textContent = "";
        } finally {
            isGenerating = false;
            generateButton.disabled = false;
        }
    };

    const copyToClipboard = () => {
        const text = `${messageDisplay.textContent} ${passageDisplay.textContent}`;
        navigator.clipboard.writeText(text).then(() => {
            toast.classList.add("show");
            setTimeout(() => toast.classList.remove("show"), 3000);
        });
    };

    generateButton.addEventListener("click", generateBlessing);
    shareWhatsApp.addEventListener("click", shareOnWhatsApp);
    copyText.addEventListener("click", copyToClipboard);

    audioElement.addEventListener('ended', () => {
        audioElement.currentTime = 0;
        audioElement.play();
    });

    fetchBlessings();
});