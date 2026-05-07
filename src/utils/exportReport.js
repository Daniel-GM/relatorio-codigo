import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'

export async function exportReport(elementId, format, filename) {
  const el = document.getElementById(elementId)
  if (!el) throw new Error(`Element #${elementId} not found`)

  const dataUrl = await toPng(el, {
    pixelRatio: 2,
    cacheBust: true,
  })

  if (format === 'png') {
    const link = document.createElement('a')
    link.download = `${filename}.png`
    link.href = dataUrl
    link.click()
    return
  }

  const img = new Image()
  img.src = dataUrl
  await new Promise((resolve) => { img.onload = resolve })

  const imgW = img.naturalWidth / 2
  const imgH = img.naturalHeight / 2

  const landscape = imgW > imgH
  const pdf = new jsPDF({
    orientation: landscape ? 'landscape' : 'portrait',
    unit: 'px',
    format: [imgW, imgH],
  })

  pdf.addImage(dataUrl, 'PNG', 0, 0, imgW, imgH)
  pdf.save(`${filename}.pdf`)
}
