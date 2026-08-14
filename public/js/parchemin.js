async function waitForFonts() {
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch (e) {
      // ignore, on continue meme si la detection echoue
    }
  }
}

async function capturePageToCanvas(pageEl, scale) {
  return html2canvas(pageEl, {
    scale,
    useCORS: true,
    backgroundColor: '#ffffff',
    windowWidth: pageEl.scrollWidth,
    windowHeight: pageEl.scrollHeight,
  });
}

async function downloadParchemin(filenameBase) {
  const btn = document.getElementById('download-btn');
  const originalLabel = btn.textContent;
  const container = document.getElementById('parchemin-content');
  const pages = container.querySelectorAll('.parchemin-page');

  if (!pages.length) return;

  btn.disabled = true;
  btn.textContent = 'Generation en cours...';

  try {
    await waitForFonts();

    // Echelle plus basse sur petit ecran / mobile pour eviter de saturer
    // la memoire du navigateur (canvas trop grand = plantage sur telephone).
    const scale = window.innerWidth < 600 ? 1.5 : 2;

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    for (let i = 0; i < pages.length; i++) {
      const canvas = await capturePageToCanvas(pages[i], scale);
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    }

    pdf.save(`parchemin-${filenameBase || 'famille-tepomo'}.pdf`);
  } catch (err) {
    console.error(err);
    alert("Une erreur est survenue lors de la generation du PDF. Reessaie, ou utilise le bouton Partager pour envoyer le lien du parchemin.");
  } finally {
    btn.disabled = false;
    btn.textContent = originalLabel;
  }
}

async function shareParchemin(url, title) {
  const btn = document.getElementById('share-btn');
  const originalLabel = btn.textContent;

  if (navigator.share) {
    try {
      await navigator.share({ title, text: title, url });
    } catch (err) {
      // l'utilisateur a annule le partage, rien a faire
    }
    return;
  }

  try {
    await navigator.clipboard.writeText(url);
    btn.textContent = 'Lien copie !';
    setTimeout(() => {
      btn.textContent = originalLabel;
    }, 2000);
  } catch (err) {
    window.prompt('Copie ce lien pour le partager :', url);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('parchemin-content');
  const downloadBtn = document.getElementById('download-btn');
  const shareBtn = document.getElementById('share-btn');

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const nameBase = (container.dataset.shareTitle || 'parchemin').replace(/[^a-zA-Z0-9]+/g, '-');
      downloadParchemin(nameBase);
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      shareParchemin(container.dataset.shareUrl, container.dataset.shareTitle);
    });
  }
});
