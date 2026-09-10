export interface StorageDaoI {
  putImage(
    fileName: string,
    imageStringBase64Encoded: string,
    fileType: string,
  ): Promise<string>;
}
