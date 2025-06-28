declare module 'pdf2pic' {
  interface ConvertOptions {
    density?: number;
    saveFilename?: string;
    savePath?: string;
    format?: string;
    width?: number;
  }

  interface ConvertResult {
    path: string;
    name: string;
    size: number;
    page: number;
  }

  export function fromPath(pdfPath: string, options?: ConvertOptions): {
    (page: number): Promise<ConvertResult>;
  };
} 