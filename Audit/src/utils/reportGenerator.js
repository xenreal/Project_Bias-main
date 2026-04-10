import jsPDF from 'jspdf';

/**
 * Generate a professional PDF audit report from the analysis results
 */
export async function generateReport(analysis, fileData, mitigationData) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Helper to add a new page if needed
  const checkPage = (needed = 20) => {
    if (y + needed > 270) {
      doc.addPage();
      y = margin;
    }
  };

  // ---- HEADER ----
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('AI Bias Audit Report', margin, 25);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 34);
  doc.text(`File: ${fileData?.fileName || 'Unknown'}`, pageWidth - margin, 34, {
    align: 'right',
  });

  y = 50;

  // ---- BIAS SCORE ----
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Bias Score', margin, y);
  y += 8;

  const score = analysis.bias_score ?? 0;
  const scoreColor = score <= 30 ? [34, 197, 94] : score <= 60 ? [245, 158, 11] : [239, 68, 68];

  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...scoreColor);
  doc.text(`${score}%`, margin, y + 10);

  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139);
  doc.text(analysis.primary_bias_type || 'Unknown', margin + 35, y + 6);
  y += 22;

  // ---- SUMMARY ----
  if (analysis.summary) {
    checkPage(20);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Summary', margin, y);
    y += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const summaryLines = doc.splitTextToSize(analysis.summary, contentWidth);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 5 + 6;
  }

  // ---- DETAILED FINDINGS ----
  if (analysis.detailed_findings && analysis.detailed_findings.length > 0) {
    checkPage(20);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Detailed Findings', margin, y);
    y += 8;

    analysis.detailed_findings.forEach((finding, i) => {
      checkPage(25);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(
        `${i + 1}. ${finding.category} [${(finding.severity || '').toUpperCase()}]`,
        margin,
        y
      );
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const lines = doc.splitTextToSize(finding.description, contentWidth - 5);
      doc.text(lines, margin + 3, y);
      y += lines.length * 5 + 4;

      if (finding.affected_groups && finding.affected_groups.length > 0) {
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(
          `Affected: ${finding.affected_groups.join(', ')}`,
          margin + 3,
          y
        );
        y += 6;
      }
    });
  }

  // ---- METRICS ----
  if (analysis.metrics) {
    checkPage(20);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Key Metrics', margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);

    // Selection rates
    if (analysis.metrics.selection_rates) {
      doc.setFont('helvetica', 'bold');
      doc.text('Selection Rates:', margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      Object.entries(analysis.metrics.selection_rates).forEach(
        ([group, rate]) => {
          checkPage();
          const rateStr =
            typeof rate === 'number' ? `${(rate * 100).toFixed(1)}%` : String(rate);
          doc.text(`  ${group}: ${rateStr}`, margin + 3, y);
          y += 5;
        }
      );
      y += 3;
    }

    // Demographic breakdown (images)
    if (analysis.metrics.demographic_breakdown) {
      doc.setFont('helvetica', 'bold');
      doc.text('Demographic Breakdown:', margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      Object.entries(analysis.metrics.demographic_breakdown).forEach(
        ([cat, val]) => {
          checkPage();
          doc.text(`  ${cat}: ${val}`, margin + 3, y);
          y += 5;
        }
      );
      y += 3;
    }

    // Proxy variables
    if (
      analysis.metrics.proxy_variables &&
      analysis.metrics.proxy_variables.length > 0
    ) {
      checkPage();
      doc.setFont('helvetica', 'bold');
      doc.text('Proxy Variables:', margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.text(
        `  ${analysis.metrics.proxy_variables.join(', ')}`,
        margin + 3,
        y
      );
      y += 8;
    }
  }

  // ---- RECOMMENDATIONS ----
  if (analysis.recommendations && analysis.recommendations.length > 0) {
    checkPage(20);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Recommendations', margin, y);
    y += 8;

    analysis.recommendations.forEach((rec, i) => {
      checkPage(10);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const lines = doc.splitTextToSize(`${i + 1}. ${rec}`, contentWidth - 5);
      doc.text(lines, margin, y);
      y += lines.length * 5 + 3;
    });
  }

  // ---- FOOTER ----
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Project Bias — AI Audit Report — Page ${i} of ${pageCount}`,
      pageWidth / 2,
      290,
      { align: 'center' }
    );
  }

  // Save
  doc.save(`bias-audit-${fileData?.fileName || 'report'}.pdf`);
}
