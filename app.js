const WORKBOOK_FILE = "UK Major Construction Projects GTM Workbook - July 2026.xlsx";

const state = {
  projects: [],
  contacts: [],
  contractors: [],
  search: ""
};

document.addEventListener("DOMContentLoaded", async () => {
  setupTabs();
  setupSearch();
  await loadWorkbook();
});

function setupTabs() {
  document.querySelectorAll(".tab").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(section => section.classList.remove("active"));

      button.classList.add("active");
      document.getElementById(button.dataset.tab).classList.add("active");
    });
  });
}

function setupSearch() {
  const searchBox = document.getElementById("globalSearch");

  searchBox.addEventListener("input", event => {
    state.search = event.target.value.toLowerCase().trim();
    renderAll();
  });
}

async function loadWorkbook() {
  try {
    const response = await fetch(encodeURI(WORKBOOK_FILE));

    if (!response.ok) {
      throw new Error("Workbook file could not be loaded. Check the filename exactly.");
    }

    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });

    state.projects = readSheet(workbook, "Project Pipeline");
    state.contacts = readSheet(workbook, "Target Contacts");
    state.contractors = readSheet(workbook, "Contractor JV Map");

    document.getElementById("projectsCount").textContent = state.projects.length;
    document.getElementById("contactsCount").textContent = state.contacts.length;
    document.getElementById("contractorsCount").textContent = state.contractors.length;

    renderAll();
  } catch (error) {
    console.error(error);

    document.getElementById("projectsTable").innerHTML = `
      <div class="empty">
        <strong>Could not load workbook.</strong>
        <p>${escapeHtml(error.message)}</p>
        <p>Expected file name:</p>
        <code>${escapeHtml(WORKBOOK_FILE)}</code>
      </div>
    `;
  }
}

function readSheet(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    console.warn(`Missing sheet: ${sheetName}`);
    return [];
  }

  return XLSX.utils.sheet_to_json(sheet, { defval: "" }).map(row => {
    const cleanRow = {};

    Object.keys(row).forEach(key => {
      cleanRow[cleanText(key)] = cleanText(row[key]);
    });

    return cleanRow;
  });
}

function cleanText(value) {
  return String(value || "")
    .replace(/\uFEFF/g, "")
    .replace(/â€”/g, "—")
    .replace(/Â£/g, "£")
    .replace(/Â·/g, "·")
    .replace(/â€“/g, "–")
    .replace(/â‚‚/g, "₂")
    .trim();
}

function renderAll() {
  renderTable("projects", state.projects, "projectsTable", [
    "Priority",
    "Project",
    "Sector",
    "Region",
    "Owner / Client",
    "Estimated value",
    "Stage as of Jul 2026",
    "Delivery window",
    "Tier 1 contractor / JV / consortium"
  ]);

  renderTable("contacts", state.contacts, "contactsTable", [
    "Project",
    "Research area",
    "Owner / Client",
    "Known owners / delivery leads",
    "LinkedIn / public profile if available"
  ]);

  renderTable("contractors", state.contractors, "contractorsTable", [
    "Project",
    "Research area",
    "Owner / Client",
    "Tier 1 contractor / JV / consortium",
    "JV / partners aligned"
  ]);
}

function renderTable(type, data, targetId, columns) {
  const filtered = filterData(data);
  const target = document.getElementById(targetId);

  if (!filtered.length) {
    target.innerHTML = `<div class="empty">No matching records found.</div>`;
    return;
  }

  const headerHtml = columns
    .map(column => `<th>${escapeHtml(column)}</th>`)
    .join("");

  const rowHtml = filtered
    .map(row => {
      const cells = columns
        .map(column => {
          const value = row[column] || "";
          return `<td>${formatCell(value)}</td>`;
        })
        .join("");

      return `<tr>${cells}</tr>`;
    })
    .join("");

  target.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>${headerHtml}</tr>
        </thead>
        <tbody>
          ${rowHtml}
        </tbody>
      </table>
    </div>
  `;
}

function filterData(data) {
  if (!state.search) return data;

  return data.filter(row => {
    return Object.values(row)
      .join(" ")
      .toLowerCase()
      .includes(state.search);
  });
}

function formatCell(value) {
  const safe = escapeHtml(value);

  return safe.replace(
    /(https?:\/\/[^\s)]+)/g,
    match => `${match}Open source</a>`
  );
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
