const express = require('express');
const cors = require('cors');
const PDFUtil = require('./pdf/pdfUtil.js');
const { PDFDocument } = require('pdf-lib');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5500;

// This line includes the body-parser functionality (express.json()) in Express 4.x and above
app.use(express.json());
app.use(cors())

app.get('/generate-pdf', async (req, res) => {
  try {
    const { id } = req.query;
    const templateBaseUrl = process.env.TEMPLATE_BASE_URL;
    const url = `${templateBaseUrl}/pdf/template/screening?id=${id}`;
    console.log(url);

    try {
      const pdfUtilInstance = new PDFUtil();
      const pdfRes = await pdfUtilInstance.genPDFviaPageUrl(url);

      const pdf = await PDFDocument.load(pdfRes.data);
      pdf.setTitle('Disability Detect 2024');

      const pdfBytes = await pdf.save();

      console.log(pdfBytes)

      res.setHeader('Content-Disposition', 'attachment; filename="disability_detect_2024.pdf"')
      res.setHeader('Content-Type', 'application/pdf');
      res.end(pdfBytes);

    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).send('PDF generation failed.');
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
