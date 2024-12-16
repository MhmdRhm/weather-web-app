if (window.location.pathname === "/cpanel") {
    const shouldUpdateChk = document.getElementById("shouldUpdateChk");
    const updateLinks = document.querySelectorAll(".updateLink");

    shouldUpdateChk.onchange = (event) => {
        if (event.target.checked) {
            updateLinks.forEach(link => {
                link.setAttribute("data-cityname", link.getAttribute("href"));
                link.removeAttribute("href");
                link.style.cursor = "not-allowed";
            });
        } else {
            updateLinks.forEach(link => {
                link.setAttribute("href", link.getAttribute("data-cityname"));
                link.style.cursor = "pointer";
            });
        }
        fetch("/automaticUpdate", {
            method: "POST",
            headers: { 'Content-Type': "application/json" },
            body: JSON.stringify({ shouldUpdate: event.target.checked })
        }).then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    console.log("Success");
                }
            });
    }

}

