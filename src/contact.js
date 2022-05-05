export function contact() {
    document.getElementById("contact").addEventListener("click", () => {
        toggelContactModal();
    })
}

function toggelContactModal() {
    if (document.getElementById("cardcontainer").style.display == "flex") {
        document.getElementById("cardcontainer").style.display = "none";
        console.log("close");
    } else {
        document.getElementById("cardcontainer").style.display = "flex";
        console.log("open");
    }
}