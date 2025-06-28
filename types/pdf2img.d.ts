declare module 'pdf2img' {
  interface Pdf2ImgOptions {
    type: string;
    quality: number;
    outputdir: string;
    outputname: string;
  }

  interface Pdf2Img {
    setOptions(options: Pdf2ImgOptions): void;
    convert(buffer: Buffer, callback: (err: any, info: any) => void, options?: any): void;
  }

  const pdf2img: Pdf2Img;
  export default pdf2img;
} 