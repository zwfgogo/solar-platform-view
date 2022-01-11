import html2Canvas from 'html2canvas'
import JsPDF from 'jspdf'

export const A4PageWidth = 595.28

export function exportPDF(dom: HTMLElement, title: string, width?) {
  if (!dom) return Promise.resolve()

  return html2Canvas(dom, {
    scale: 2,
    allowTaint: true
  }).then(function (canvas) {
      let contentWidth = canvas.width
      let contentHeight = canvas.height
      let imgWidth = width || contentWidth
      let imgHeight = imgWidth / contentWidth * contentHeight
      let pageData = canvas.toDataURL('image/png', 1.0)
      let orientation: any = 'p'
      if(imgWidth > imgHeight) {
        orientation = 'l';
      }
      let PDF = new JsPDF(orientation, 'px', [imgWidth, imgHeight])
      PDF.addImage(pageData, 'PNG', 0, 0, imgWidth, imgHeight)
      PDF.save(`${title}.pdf`)
    }
  )
}

export function exportA4PDF(dom: HTMLElement, title: string) {
  if (!dom) return

  html2Canvas(dom, {
    allowTaint: true
  }).then(function (canvas) {
      let contentWidth = canvas.width
      let contentHeight = canvas.height
      let pageHeight = contentWidth / 592.28 * 841.89
      let leftHeight = contentHeight
      let position = 0
      let imgWidth = 595.28
      let imgHeight = 592.28 / contentWidth * contentHeight
      let pageData = canvas.toDataURL('image/jpeg', 1.0)
      let PDF = new JsPDF('', 'pt', 'a4')
      if (leftHeight < pageHeight) {
        PDF.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight)
      } else {
        while (leftHeight > 0) {
          PDF.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
          leftHeight -= pageHeight
          position -= 841.89
          if (leftHeight > 0) {
            PDF.addPage()
          }
        }
      }
      PDF.save(`${title}.pdf`)
    }
  )
}
