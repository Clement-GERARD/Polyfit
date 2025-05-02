document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById("fileInput");
    fileInput.addEventListener("change", function () {
        document.getElementById("result-section").style.display = "none";
    });
});
