import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from './firebase'
import { mentorWriteClient } from './sanityClient'

function dataUrlToBlob(dataUrl) {
  const [meta, content] = dataUrl.split(',')
  const mime = meta.match(/data:(.*);base64/)?.[1] || 'image/png'
  const bytes = Uint8Array.from(atob(content), (char) => char.charCodeAt(0))

  return new Blob([bytes], { type: mime })
}

function getSignaturePosition(page) {
  const { width } = page.getSize()

  return {
    x: Math.max(48, width - 250),
    y: 72,
    width: 170,
    height: 70,
  }
}

export async function signMouDocument({ document, signatureDataUrl, consultant }) {
  if (!import.meta.env.VITE_SANITY_WRITE_TOKEN) {
    throw new Error('Missing VITE_SANITY_WRITE_TOKEN. Add a Sanity write token to update signed documents.')
  }

  if (!document?.pdfUrl) {
    throw new Error('Original PDF is missing.')
  }

  if (!signatureDataUrl) {
    throw new Error('Signature image is missing.')
  }

  const signedAt = new Date()
  const signedAtIso = signedAt.toISOString()
  const consultantName = consultant?.name || consultant?.fullName || consultant?.email || 'Consultant'
  const consultantId = consultant?.consultantUserId || consultant?.uid || consultant?.sanityExpertId || ''

  const pdfBytes = await fetch(document.pdfUrl).then((response) => {
    if (!response.ok) throw new Error('Unable to load the original PDF.')
    return response.arrayBuffer()
  })

  const pdfDoc = await PDFDocument.load(pdfBytes)
  const pages = pdfDoc.getPages()
  const lastPage = pages[pages.length - 1]
  const signatureImage = await pdfDoc.embedPng(signatureDataUrl)
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const signatureBox = getSignaturePosition(lastPage)

  lastPage.drawRectangle({
    x: signatureBox.x - 12,
    y: signatureBox.y - 18,
    width: signatureBox.width + 24,
    height: signatureBox.height + 70,
    borderColor: rgb(0.26, 0.3, 0.87),
    borderWidth: 1,
    color: rgb(0.98, 0.99, 1),
  })
  lastPage.drawText('Electronically signed by:', {
    x: signatureBox.x,
    y: signatureBox.y + signatureBox.height + 34,
    size: 9,
    font: boldFont,
    color: rgb(0.1, 0.12, 0.18),
  })
  lastPage.drawText(consultantName, {
    x: signatureBox.x,
    y: signatureBox.y + signatureBox.height + 20,
    size: 9,
    font,
    color: rgb(0.1, 0.12, 0.18),
  })
  lastPage.drawImage(signatureImage, signatureBox)
  lastPage.drawText(`Date: ${signedAt.toLocaleDateString('en-GB')}`, {
    x: signatureBox.x,
    y: signatureBox.y - 2,
    size: 8,
    font,
    color: rgb(0.22, 0.24, 0.3),
  })
  lastPage.drawText(`Time: ${signedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`, {
    x: signatureBox.x + 88,
    y: signatureBox.y - 2,
    size: 8,
    font,
    color: rgb(0.22, 0.24, 0.3),
  })

  const signedPdfBytes = await pdfDoc.save()
  const safeDocumentId = document._id.replace(/[^a-zA-Z0-9-]/g, '-')
  const timestamp = signedAt.getTime()
  const signedPdfRef = ref(storage, `mou-documents/${safeDocumentId}/signed-${timestamp}.pdf`)
  const signatureRef = ref(storage, `mou-documents/${safeDocumentId}/signature-${timestamp}.png`)

  await uploadBytes(signatureRef, dataUrlToBlob(signatureDataUrl), {
    contentType: 'image/png',
  })
  await uploadBytes(signedPdfRef, new Blob([signedPdfBytes], { type: 'application/pdf' }), {
    contentType: 'application/pdf',
  })

  const [signatureImageUrl, signedPdfUrl] = await Promise.all([
    getDownloadURL(signatureRef),
    getDownloadURL(signedPdfRef),
  ])

  const auditEntry = {
    _type: 'object',
    _key: `${safeDocumentId}-${timestamp}`,
    consultantId,
    consultantName,
    documentId: document._id,
    signedAt: signedAtIso,
    documentVersion: document.version || '1.0',
    signatureImageUrl,
  }

  await mentorWriteClient
    .patch(document._id)
    .set({
      status: 'signed',
      signedPdf: signedPdfUrl,
      signedAt: signedAtIso,
    })
    .setIfMissing({ auditTrail: [] })
    .append('auditTrail', [auditEntry])
    .commit()

  return {
    signedAt: signedAtIso,
    signedPdfUrl,
    signatureImageUrl,
    auditEntry,
  }
}
