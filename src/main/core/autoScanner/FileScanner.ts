import * as path from "path";
import * as glob from "glob";

export class FileScanner {
  public find(pattern, options): Promise<any[]> {
    return new Promise((resolve, reject) => {
      glob(pattern, options, function (err, files) {
        if (err) {
          return reject(err);
        }
        return resolve(files);
      });
    });
  }

  public load(file: string): any {
    return require(path.resolve(file))
  }
}