document.querySelectorAll(".details-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const method = btn.getAttribute("data-method");
        openDetailsModal(method);
    });
});

function openDetailsModal(method) {
    const modal = document.getElementById("details-modal");
    const body = document.getElementById("modal-body");
    const title = document.getElementById("modal-title");

    const details = resultDetails[method];

    if (!details || !details.params || !details.image) {
        body.innerHTML = "<p>Aucune donnée disponible pour cette méthode.</p>";
    } else {
        title.textContent = `Détails – ${method.toUpperCase()}`;
        body.innerHTML = `
            <p><strong>J0 :</strong> ${details.params.J0}</p>
            <p><strong>Jph :</strong> ${details.params.Jph}</p>
            <p><strong>Rs :</strong> ${details.params.Rs}</p>
            <p><strong>Rsh :</strong> ${details.params.Rsh}</p>
            <p><strong>n :</strong> ${details.params.n}</p>
            <img src="data:image/png;base64,${details.image}" alt="Courbe ${method}" style="width:100%; margin-top:15px; border-radius:8px;">
        `;
    }

    modal.classList.remove("hidden");
}

document.getElementById("modal-close").addEventListener("click", () => {
    document.getElementById("details-modal").classList.add("hidden");
});
