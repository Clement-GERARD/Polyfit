document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.querySelector(".menu-btn");
    const dropdownMenu = document.querySelector(".dropdown-menu");
    const startBtn = document.getElementById("start-btn");
    const stopBtn = document.getElementById("stop-btn");
    const resultsBody = document.getElementById("results-body");

    // Gestion du menu déroulant
    menuBtn.addEventListener("click", () => {
        dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
    });

    // Fermer le menu si on clique ailleurs
    document.addEventListener("click", (event) => {
        if (!menuBtn.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.style.display = "none";
        }
    });

    // Simuler l'affichage des résultats (exemple)
    startBtn.addEventListener("click", () => {
        resultsBody.innerHTML = "";
        const fakeData = [
            { Rs: "2e-5", Rsh: "7e-6", Jo: "5e-6", Jph: "6e-6" },
            { Rs: "3e-5", Rsh: "6e-6", Jo: "4.5e-6", Jph: "5e-6" }
        ];
        
        fakeData.forEach(row => {
            const tr = document.createElement("tr");
            Object.values(row).forEach(value => {
                const td = document.createElement("td");
                td.textContent = value;
                tr.appendChild(td);
            });
            resultsBody.appendChild(tr);
        });
    });

    stopBtn.addEventListener("click", () => {
        resultsBody.innerHTML = "";
    });
});
