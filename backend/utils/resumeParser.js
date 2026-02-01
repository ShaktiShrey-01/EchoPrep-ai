import PDFParser from "pdf2json";

export const extractTextFromPDF = async (buffer) => {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, 1); // 1 = Text content only

        // Handle Errors
        pdfParser.on("pdfParser_dataError", (errData) => {
            console.error("PDF2JSON Error:", errData.parserError);
            reject(new Error("Failed to parse PDF"));
        });

        // Handle Success
        pdfParser.on("pdfParser_dataReady", (pdfData) => {
            // pdf2json returns text in a raw format, we need to return it as a string
            const rawText = pdfParser.getRawTextContent();
            resolve(rawText);
        });

        // Start Parsing
        try {
            pdfParser.parseBuffer(buffer);
        } catch (error) {
            reject(error);
        }
    });
};