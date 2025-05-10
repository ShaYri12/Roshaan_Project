import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Function to generate PDF from report
export const generateReportPDF = async (reportRef, reportData, theme) => {
  if (!reportRef.current) {
    throw new Error("Report reference not available");
  }

  // Create a new PDF document
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;

  // Step 1: Add PDF Header
  pdf.setFontSize(22);
  pdf.setTextColor(40, 40, 40);
  pdf.text(`Emissions Report ${reportData.year}`, pageWidth / 2, 20, {
    align: "center",
  });

  // Add subtitle with CO2 text
  pdf.setFontSize(16);
  pdf.text(`Annual CO2 Emissions Report`, pageWidth / 2, 30, {
    align: "center",
  });

  // Add generation date
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(
    `Generated on: ${new Date().toLocaleDateString()}`,
    pageWidth / 2,
    38,
    {
      align: "center",
    }
  );

  let currentY = 45;

  // Step 2: Capture and add Total Emissions section
  await captureAndAddSection(
    pdf,
    reportRef.current.querySelector(".card-body.text-center.py-4"),
    theme,
    margin,
    pageWidth,
    currentY
  );
  currentY += (pageWidth - margin * 2) * 0.75 + 15; // Approximate height + margin

  // Step 3: Capture and add Monthly Distribution section
  const monthlySection = reportRef.current.querySelector(
    ".card-body:has(.fas.fa-chart-line)"
  );
  if (monthlySection) {
    if (currentY + 100 > pageHeight) {
      pdf.addPage();
      currentY = margin;
    }

    await captureAndAddSection(
      pdf,
      monthlySection,
      theme,
      margin,
      pageWidth,
      currentY
    );
    currentY += (pageWidth - margin * 2) * 0.6 + 15; // Approximate height + margin
  }

  // Step 4: Capture and add Emissions by Category section
  const categorySection = reportRef.current.querySelector(
    ".card-body:has(.fas.fa-chart-pie)"
  );
  if (categorySection) {
    if (currentY + 100 > pageHeight) {
      pdf.addPage();
      currentY = margin;
    }

    await captureAndAddSection(
      pdf,
      categorySection,
      theme,
      margin,
      pageWidth,
      currentY
    );
    currentY += (pageWidth - margin * 2) * 0.6 + 15; // Approximate height + margin
  }

  // Step 5: Capture and add Summary section
  const summarySection = reportRef.current.querySelector(
    ".card-body:has(.fas.fa-list-alt)"
  );
  if (summarySection) {
    if (currentY + 100 > pageHeight) {
      pdf.addPage();
      currentY = margin;
    }

    await captureAndAddSection(
      pdf,
      summarySection,
      theme,
      margin,
      pageWidth,
      currentY
    );
  }

  // Add page numbers
  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, {
      align: "center",
    });
  }

  return pdf;
};

// Helper function to capture and add a section to PDF
const captureAndAddSection = async (
  pdf,
  sectionElement,
  theme,
  margin,
  pageWidth,
  yPosition
) => {
  if (!sectionElement) return;

  const sectionCanvas = await html2canvas(sectionElement, {
    scale: 2,
    logging: false,
    useCORS: true,
    allowTaint: true,
    backgroundColor: theme === "dark" ? "#1a1d20" : "#ffffff",
  });

  const imgWidth = pageWidth - margin * 2;
  const imgHeight = (sectionCanvas.height * imgWidth) / sectionCanvas.width;

  pdf.addImage(
    sectionCanvas.toDataURL("image/png"),
    "PNG",
    margin,
    yPosition,
    imgWidth,
    imgHeight,
    "",
    "FAST"
  );

  return imgHeight;
};
