const PDFUtil = require('./pdfUtil.js'); 
const { PDFDocument } = require('pdf-lib');
require('dotenv').config();

Parse.Cloud.define('generatePdf', async (request) => {
    try {
        const { id } = request.params;

        const templateBaseUrl = process.env.TEMPLATE_BASE_URL
        const url = `${templateBaseUrl}/pdf/template/screening?id=${id}`;

        console.log(url);
        const pdfUtilInstance = new PDFUtil()
        const pdfRes = await pdfUtilInstance.genPDFviaPageUrl(url);
        const pdf = await PDFDocument.load(pdfRes.data);
        pdf.setTitle('Disability Detect 2024');

        const pdfBytes = await pdf.save();

        const response = {
            headers: {
                'Content-Disposition': 'attachment; filename="disability_detect_2024.pdf"',
                'Content-Type': 'application/pdf'
            },
            body: pdfBytes.toString('base64'),
        };

        return response;

    } catch (error) {
        console.log(error);
        throw new Parse.Error(500, 'PDF generation failed.');
    }
});
