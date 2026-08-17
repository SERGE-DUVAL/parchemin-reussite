async function waitForFonts() {
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch (e) {
      // ignore, on continue meme si la detection echoue
    }
  }
}

// Taille physique exacte d'une page A4 a 96dpi (210mm x 297mm). On force
// html2canvas a capturer a cette taille fixe, plutot que de se baser sur les
// dimensions mesurees de l'element (scrollWidth/scrollHeight), qui peuvent
// etre faussees par le filigrane qui deborde volontairement du cadre (pour
// couvrir les coins une fois pivote) ou reduites sur mobile a cause de
// max-width:100% — les deux faisaient sortir un PDF deforme ou tronque.
const A4_WIDTH_PX = Math.round((210 / 25.4) * 96);
const A4_HEIGHT_PX = Math.round((297 / 25.4) * 96);

async function capturePageToCanvas(pageEl, scale) {
  const originalInlineStyle = pageEl.getAttribute('style');

  // html2canvas ne supporte pas correctement la propriete CSS aspect-ratio :
  // sans intervention, la hauteur de .parchemin-page (qui en derive) peut etre
  // mal calculee pendant la capture, ce qui laisse des zones vides dans le PDF
  // au lieu de remplir toute la page A4. On fixe donc temporairement des
  // dimensions en pixels avant de capturer, puis on restaure le style
  // d'origine juste apres (le rendu a l'ecran n'est pas affecte).
  pageEl.style.width = `${A4_WIDTH_PX}px`;
  pageEl.style.height = `${A4_HEIGHT_PX}px`;
  pageEl.style.maxWidth = 'none';
  pageEl.style.aspectRatio = 'auto';

  await new Promise((resolve) => requestAnimationFrame(resolve));

  try {
    return await html2canvas(pageEl, {
      scale,
      useCORS: true,
      backgroundColor: '#f7efd9',
      width: A4_WIDTH_PX,
      height: A4_HEIGHT_PX,
      windowWidth: A4_WIDTH_PX,
      windowHeight: A4_HEIGHT_PX,
    });
  } finally {
    if (originalInlineStyle === null) {
      pageEl.removeAttribute('style');
    } else {
      pageEl.setAttribute('style', originalInlineStyle);
    }
  }
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

    // Echelle adaptée selon la taille de l'écran pour éviter les crashs mémoire
    // Sur mobile très petit, on utilise une échelle encore plus basse
    const isMobile = window.innerWidth < 600;
    const isSmallMobile = window.innerWidth < 400;
    let scale = isSmallMobile ? 1 : (isMobile ? 1.5 : 2);

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    for (let i = 0; i < pages.length; i++) {
      try {
        const canvas = await capturePageToCanvas(pages[i], scale);
        const imgData = canvas.toDataURL('image/jpeg', 0.85);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
        
        // Libérer la mémoire du canvas après chaque page
        canvas.width = 0;
        canvas.height = 0;
      } catch (pageErr) {
        console.error('Erreur page ' + i, pageErr);
        if (scale > 1) {
          // Fallback: réessayer avec une échelle plus basse
          scale = scale * 0.7;
          const canvas = await capturePageToCanvas(pages[i], scale);
          const imgData = canvas.toDataURL('image/jpeg', 0.8);
          if (i > 0) pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
          canvas.width = 0;
          canvas.height = 0;
        } else {
          throw pageErr;
        }
      }
    }

    pdf.save(`parchemin-${filenameBase || 'famille-tepomo'}.pdf`);
  } catch (err) {
    console.error(err);
    alert("Une erreur est survenue lors de la generation du PDF. Sur mobile, utilise le bouton Partager pour envoyer le lien du parchemin.");
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
