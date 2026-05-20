import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

const cMapUrl = `${import.meta.env.BASE_URL}cmaps/`;

export { pdfjsLib, cMapUrl };
