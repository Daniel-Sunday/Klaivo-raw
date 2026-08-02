declare module 'pdf-parse' {
  function pdf(dataBuffer: Buffer, options?: any): Promise<any>;
  export = pdf;
}

declare module 'pdf-parse-fork' {
  function pdf(dataBuffer: Buffer, options?: any): Promise<any>;
  export = pdf;
}

declare module 'better-sqlite3' {
  import DatabaseConstructor from 'better-sqlite3';
  export = DatabaseConstructor;
}
