import { SessionPlanFormData } from "@/types/sessionPlan";

/**
 * Export Session Plan as PDF
 * Uses html2canvas to capture the preview component and jspdf to generate PDF
 */
export async function exportSessionPlanAsPDF(
  planData: SessionPlanFormData,
  tutorName: string = "Your Name"
): Promise<void> {
  try {
    // Dynamically import to avoid build issues
    const { jsPDF } = await import("jspdf");
    const html2canvas = (await import("html2canvas")).default;

    // Get or create preview element
    let previewElement = document.getElementById("session-plan-preview");

    if (!previewElement) {
      console.error("Preview element not found. Make sure SessionPlanPreview is rendered with id='session-plan-preview'");
      return;
    }

    // Capture the preview as image
    const canvas = await html2canvas(previewElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Create PDF
    const pdf = new jsPDF({
      orientation: imgHeight > imgWidth ? "portrait" : "portrait",
      unit: "mm",
      format: "a4",
    });

    let heightLeft = imgHeight;
    let position = 0;

    // Add image to PDF (handle multiple pages if needed)
    while (heightLeft >= 0) {
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= 297; // A4 height in mm
      if (heightLeft >= 0) {
        pdf.addPage();
        position = heightLeft - imgHeight;
      }
    }

    // Generate filename
    const filename = `${planData.title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;

    // Download PDF
    pdf.save(filename);
  } catch (error) {
    console.error("Error exporting session plan as PDF:", error);
    throw new Error("Failed to export session plan as PDF");
  }
}

/**
 * Export Session Plan as JSON
 * Useful for saving and re-importing plans
 */
export function exportSessionPlanAsJSON(
  planData: SessionPlanFormData,
  filename?: string
): void {
  const jsonString = JSON.stringify(planData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || `${planData.title.replace(/\s+/g, "_")}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export Session Plan as CSV (for materials checklist)
 */
export function exportSessionPlanMaterialsAsCSV(
  planData: SessionPlanFormData,
  filename?: string
): void {
  let csv = "Material Name,Quantity,Unit,Notes\n";

  planData.materials.forEach((material) => {
    const name = `"${material.name.replace(/"/g, '""')}"`;
    const quantity = material.quantity;
    const unit = material.unit || "";
    const notes = `"${(material.notes || "").replace(/"/g, '""')}"`;

    csv += `${name},${quantity},${unit},${notes}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || `${planData.title.replace(/\s+/g, "_")}_materials.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Print Session Plan
 * Opens browser print dialog
 */
export function printSessionPlan(): void {
  window.print();
}
