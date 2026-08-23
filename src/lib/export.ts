export function exportDataAsJSON(data: any, filename = "allerscan-health-export.json") {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportScanHistoryAsCSV(scans: any[], filename = "allerscan-scan-history.csv") {
  if (!scans || !scans.length) return;

  const headers = ["ID", "Barcode", "Product Name", "Safety Status", "Scan Date"];
  const rows = scans.map((s) => [
    `"${s.id}"`,
    `"${s.barcode || ''}"`,
    `"${(s.product?.name || 'Unknown Product').replace(/"/g, '""')}"`,
    `"${s.safetyStatus || 'SAFE'}"`,
    `"${new Date(s.createdAt).toLocaleString()}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
