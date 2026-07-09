const WORKBOOK_FILE = "UK Major Construction Projects GTM Workbook - July 2026.xlsx";

const SHEETS = {
  projects: "Project Pipeline",
  contacts: "Target Contacts",
  contractors: "Contractor JV Map"
};

const state = {
  projects: [],
  contacts: [],
  contractors: [],
  activeTab: "projects",
  search: "",
  sector: "",
  region: "",
  priority: "",
  sort: {
    projects: { key: "", direction: "asc" },
    contacts: { key: "", direction: "asc" },
    contractors: { key: "", direction: "asc" }
  }
};

const visibleColumns = {
  projects: [
    "Priority",
    "Project",
    "Sector",
    "Region",
    "Owner / Client",
    "Estimated value",
    "Stage as of Jul 2026",
    "Delivery window",
    "Tier 1 contractor / JV / consortium"
  ],
  contacts: [
    "Project",
    "Research area",
    "Owner / Client",
    "Known owners / delivery leads",
    "LinkedIn / public profile if available"
  ],
  contractors: [
    "Project",
    "Research area",
    "Owner / Client",
    "Tier 1 contractor / JV / consortium",
    "JV / partners aligned"
  ]
};

document.addEventListener("DOMContentLoaded", async () => {
  wireEvents();
  await loadWorkbook();
  hydrateFilters();
  renderAll();
});

function wireEvents() {
  document.querySelectorAll(".tab").forEach(button => {
    button.addEventListener("click", () => {
      state.activeTab = button.dataset.tab;

      document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(section => section.classList.remove("active"));

      button.classList.add("active");
      document.getElementById(state.activeTab).
