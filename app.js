async function loadCSV(file) {
    const response = await fetch(file);
    const text = await response.text();

    const rows = text.trim().split("\n");
    const headers = rows[0].split(",");

    return rows.slice(1).map(row => {
        const values = row.split(",");
        return headers.reduce((obj, header, index) => {
            obj[header.trim()] = values[index] || "";
            return obj;
        }, {});
    });
}

async function loadAllData() {
    const projects = await loadCSV("ProjectPipeline.csv");

    document.getElementById("projectsCount").innerText = projects.length;

    const container = document.getElementById("results");

    projects.forEach(project => {
        const div = document.createElement("div");

        div.className = "card";

        div.innerHTML = `
            <h3>${project.Project || "Project"}</h3>
            <p>${project["Owner / Client"] || ""}</p>
        `;

        container.appendChild(div);
    });
}

loadAllData();
